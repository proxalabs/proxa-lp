# Runs every few minutes. As soon as an issued certificate covers the domain, it attaches
# the domain to the CloudFront distribution; after that it does nothing. If the pending
# certificate times out (Amazon stops checking after 72 hours), it asks for a new one, which
# is checked with the same DNS records.
import os

import boto3

acm = boto3.client("acm", region_name="us-east-1")
cloudfront = boto3.client("cloudfront")

DOMAINS = os.environ["DOMAINS"].split(",")  # first one is the main name
DIST_ID = os.environ["DISTRIBUTION_ID"]


def certificates(statuses):
    pages = acm.get_paginator("list_certificates").paginate(CertificateStatuses=statuses)
    for page in pages:
        for cert in page["CertificateSummaryList"]:
            names = set(cert.get("SubjectAlternativeNameSummaries", [])) | {cert["DomainName"]}
            if set(DOMAINS) <= names:
                yield cert["CertificateArn"]


def handler(event, context):
    current = cloudfront.get_distribution_config(Id=DIST_ID)
    config = current["DistributionConfig"]
    if sorted(config["Aliases"].get("Items", [])) == sorted(DOMAINS):
        return "live"

    issued = next(certificates(["ISSUED"]), None)
    if not issued:
        if next(certificates(["PENDING_VALIDATION"]), None):
            return "waiting for the DNS records"
        acm.request_certificate(DomainName=DOMAINS[0], SubjectAlternativeNames=DOMAINS[1:], ValidationMethod="DNS")
        return "requested a new certificate"

    config["Aliases"] = {"Quantity": len(DOMAINS), "Items": DOMAINS}
    config["ViewerCertificate"] = {
        "ACMCertificateArn": issued,
        "SSLSupportMethod": "sni-only",
        "MinimumProtocolVersion": "TLSv1.2_2021",
        "CertificateSource": "acm",
        "CloudFrontDefaultCertificate": False,
    }
    cloudfront.update_distribution(Id=DIST_ID, IfMatch=current["ETag"], DistributionConfig=config)
    print(f"attached {DOMAINS} with {issued}")
    return "attached the domain"
