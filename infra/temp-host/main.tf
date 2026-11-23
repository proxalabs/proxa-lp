# Hosting for the new site on AWS: one small server that runs the app and its database, with
# CloudFront in front of it for HTTPS and caching. Started as a temporary copy with no domain
# (hence the names); it becomes www.proxalabs.com when go_live = true (see below).
#
# Everything here is its own, separate set of resources (own network, own server), tagged
# Project = proxa-lp-temp. It shares nothing with Forge, Stage or Trace.
#
#   Create / update:  terraform init && terraform apply
#   Put the site on:  ./deploy.sh            (see that file)
#   Remove it all:    terraform destroy
#
# The state file stays in this folder (not in git). Keep it: it is what `destroy` works from.

terraform {
  required_version = ">= 1.6"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
  default_tags {
    tags = {
      Project   = "proxa-lp-temp"
      ManagedBy = "terraform"
    }
  }
}

variable "ssh_cidr" {
  description = "The only address range allowed to SSH into the server, e.g. 203.0.113.7/32"
  type        = string
}

variable "ssh_public_key" {
  description = "Public half of the SSH key used to deploy"
  type        = string
}

# Going live is two steps, so the site never goes down:
#   1. With go_live = false, apply: this requests the HTTPS certificate. Its check records
#      (output cert_dns_records) and nothing else go into the domain's DNS.
#   2. Once the certificate is issued, set go_live = true and apply: CloudFront then answers for
#      the domain and search engines may list it. Only after that do www and the bare domain
#      get pointed at CloudFront in DNS.
variable "go_live" {
  description = "Serve www.proxalabs.com and proxalabs.com (the certificate must be issued first)"
  type        = bool
  default     = false
}

locals {
  name    = "proxa-lp-temp"
  domain  = "www.proxalabs.com"
  apex    = "proxalabs.com"
  aliases = var.go_live ? [local.domain, local.apex] : []
}

# ── Network: one small public network of its own ─────────────────────────────

resource "aws_vpc" "this" {
  cidr_block           = "10.40.0.0/24"
  enable_dns_support   = true
  enable_dns_hostnames = true # the server gets a public DNS name, which CloudFront needs
  tags                 = { Name = local.name }
}

resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id
  tags   = { Name = local.name }
}

resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.this.id
  cidr_block              = "10.40.0.0/26"
  availability_zone       = "us-east-1a"
  map_public_ip_on_launch = true
  tags                    = { Name = "${local.name}-public" }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.this.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.this.id
  }
  tags = { Name = "${local.name}-public" }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

resource "aws_security_group" "web" {
  name        = "${local.name}-web"
  description = "Temporary site host: web from anywhere, SSH from one address"
  vpc_id      = aws_vpc.this.id

  ingress {
    description = "Web"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    description = "SSH for deploys"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.ssh_cidr]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = { Name = "${local.name}-web" }
}

# ── Server ───────────────────────────────────────────────────────────────────

data "aws_ssm_parameter" "ubuntu" {
  name = "/aws/service/canonical/ubuntu/server/24.04/stable/current/amd64/hvm/ebs-gp3/ami-id"
}

resource "aws_key_pair" "deploy" {
  key_name   = "${local.name}-deploy"
  public_key = var.ssh_public_key
}

resource "aws_instance" "web" {
  ami                    = data.aws_ssm_parameter.ubuntu.value
  instance_type          = "t3.medium" # the build needs about 4 GB of memory
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.web.id]
  key_name               = aws_key_pair.deploy.key_name

  # The database and uploads live on this server, so it cannot be deleted by a stray click.
  disable_api_termination = true

  root_block_device {
    volume_type = "gp3"
    volume_size = 20
    encrypted   = true
  }

  metadata_options {
    http_tokens = "required"
  }

  # First boot: extra swap for the build, Docker (for Postgres), Node 22, and the app folder.
  user_data = <<-EOT
    #!/bin/bash
    set -eux
    fallocate -l 4G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    export DEBIAN_FRONTEND=noninteractive
    apt-get update
    apt-get install -y ca-certificates curl rsync docker.io
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt-get install -y nodejs
    systemctl enable --now docker
    mkdir -p /opt/proxa-lp/app
    chown -R ubuntu:ubuntu /opt/proxa-lp
  EOT

  # A newer Ubuntu image or an edit to the script above must not replace a running server.
  lifecycle {
    ignore_changes = [ami, user_data]
  }

  tags = { Name = local.name }
}

# ── Backups: a snapshot of the whole server disk (database and uploads) every night ─────

resource "aws_iam_role" "dlm" {
  name = "${local.name}-dlm"
  assume_role_policy = jsonencode({
    Version   = "2012-10-17"
    Statement = [{ Effect = "Allow", Action = "sts:AssumeRole", Principal = { Service = "dlm.amazonaws.com" } }]
  })
}

resource "aws_iam_role_policy_attachment" "dlm" {
  role       = aws_iam_role.dlm.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSDataLifecycleManagerServiceRole"
}

resource "aws_dlm_lifecycle_policy" "nightly" {
  description        = "${local.name} nightly server snapshots"
  execution_role_arn = aws_iam_role.dlm.arn
  state              = "ENABLED"

  policy_details {
    resource_types = ["INSTANCE"]
    target_tags    = { Name = local.name }

    schedule {
      name      = "nightly-kept-14-days"
      copy_tags = true
      create_rule {
        interval      = 24
        interval_unit = "HOURS"
        times         = ["07:00"] # UTC, about 2-3 am in the US
      }
      retain_rule {
        count = 14
      }
    }
  }
}

# ── HTTPS certificate for the domain ─────────────────────────────────────────

resource "aws_acm_certificate" "site" {
  domain_name               = local.domain
  subject_alternative_names = [local.apex]
  validation_method         = "DNS"
  lifecycle {
    create_before_destroy = true
  }
}

# Waits until the certificate is issued; only needed once the domain is attached.
resource "aws_acm_certificate_validation" "site" {
  count           = var.go_live ? 1 : 0
  certificate_arn = aws_acm_certificate.site.arn
}

# ── CloudFront ───────────────────────────────────────────────────────────────

data "aws_cloudfront_cache_policy" "disabled" {
  name = "Managed-CachingDisabled"
}

# Caches for as long as the site's own Cache-Control header says, keyed on the query string
# (resized images are /_next/image?url=…&w=…).
data "aws_cloudfront_cache_policy" "origin_headers" {
  name = "UseOriginCacheControlHeaders-QueryStrings"
}

data "aws_cloudfront_origin_request_policy" "all_viewer" {
  name = "Managed-AllViewer"
}

# Until the site goes live, search engines are told not to list this copy.
resource "aws_cloudfront_response_headers_policy" "noindex" {
  name = "${local.name}-noindex"
  custom_headers_config {
    items {
      header   = "X-Robots-Tag"
      value    = "noindex, nofollow"
      override = true
    }
  }
}

# The bare domain sends visitors to www, keeping the path and query.
resource "aws_cloudfront_function" "apex_redirect" {
  name    = "${local.name}-apex-redirect"
  runtime = "cloudfront-js-2.0"
  publish = true
  code    = <<-JS
    function handler(event) {
      var req = event.request;
      if (req.headers.host && req.headers.host.value === '${local.apex}') {
        var qs = Object.keys(req.querystring).map(function (k) {
          var v = req.querystring[k];
          return v.multiValue
            ? v.multiValue.map(function (m) { return k + '=' + m.value; }).join('&')
            : k + (v.value === '' ? '' : '=' + v.value);
        }).join('&');
        return {
          statusCode: 301,
          statusDescription: 'Moved Permanently',
          headers: { location: { value: 'https://${local.domain}' + req.uri + (qs ? '?' + qs : '') } },
        };
      }
      return req;
    }
  JS
}

resource "aws_cloudfront_distribution" "this" {
  enabled             = true
  comment             = "Proxa Labs website (proxa-lp)"
  price_class         = "PriceClass_100"
  wait_for_deployment = false
  aliases             = local.aliases

  origin {
    origin_id   = "server"
    domain_name = aws_instance.web.public_dns
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # Pages, the CMS and forms are not cached here: every request goes to the server, so
  # content edits show at once and forms work exactly as they do on the server itself.
  default_cache_behavior {
    target_origin_id           = "server"
    viewer_protocol_policy     = "redirect-to-https"
    allowed_methods            = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods             = ["GET", "HEAD"]
    compress                   = true
    cache_policy_id            = data.aws_cloudfront_cache_policy.disabled.id
    origin_request_policy_id   = data.aws_cloudfront_origin_request_policy.all_viewer.id
    response_headers_policy_id = var.go_live ? null : aws_cloudfront_response_headers_policy.noindex.id

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.apex_redirect.arn
    }
  }

  # Site code, resized images, fonts and brand images are cached at the edge for as long as
  # the site's Cache-Control header allows, which takes most of the load off the server.
  dynamic "ordered_cache_behavior" {
    for_each = ["/_next/static/*", "/_next/image*", "/fonts/*", "/assets/*"]
    content {
      path_pattern               = ordered_cache_behavior.value
      target_origin_id           = "server"
      viewer_protocol_policy     = "redirect-to-https"
      allowed_methods            = ["GET", "HEAD"]
      cached_methods             = ["GET", "HEAD"]
      compress                   = true
      cache_policy_id            = data.aws_cloudfront_cache_policy.origin_headers.id
      response_headers_policy_id = var.go_live ? null : aws_cloudfront_response_headers_policy.noindex.id
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = var.go_live ? null : true
    acm_certificate_arn            = var.go_live ? aws_acm_certificate_validation.site[0].certificate_arn : null
    ssl_support_method             = var.go_live ? "sni-only" : null
    minimum_protocol_version       = var.go_live ? "TLSv1.2_2021" : null
  }

  tags = { Name = local.name }
}

output "server_ip" {
  value = aws_instance.web.public_ip
}

output "site_url" {
  value = "https://${aws_cloudfront_distribution.this.domain_name}"
}

output "cloudfront_domain" {
  value = aws_cloudfront_distribution.this.domain_name
}

# The records that prove to Amazon we own the domain, so it can issue the HTTPS certificate.
output "cert_dns_records" {
  value = [for o in aws_acm_certificate.site.domain_validation_options : {
    for_domain = o.domain_name
    type       = o.resource_record_type
    name       = o.resource_record_name
    value      = o.resource_record_value
  }]
}

output "cert_status" {
  value = aws_acm_certificate.site.status
}
