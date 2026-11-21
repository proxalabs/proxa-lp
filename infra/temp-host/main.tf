# Temporary hosting for the new site on AWS, with no domain: one small server that runs the
# app and its database, with a CloudFront address in front of it for HTTPS.
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

locals {
  name = "proxa-lp-temp"
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

# ── HTTPS address (no domain needed) ─────────────────────────────────────────

data "aws_cloudfront_cache_policy" "disabled" {
  name = "Managed-CachingDisabled"
}

data "aws_cloudfront_origin_request_policy" "all_viewer" {
  name = "Managed-AllViewer"
}

# This is a temporary copy of the site, so search engines are told not to list it.
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

resource "aws_cloudfront_distribution" "this" {
  enabled             = true
  comment             = "Temporary host for the new site (proxa-lp)"
  price_class         = "PriceClass_100"
  wait_for_deployment = false

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

  # Nothing is cached here: every request goes to the server, so the CMS and forms work
  # exactly as they do on the server itself.
  default_cache_behavior {
    target_origin_id           = "server"
    viewer_protocol_policy     = "redirect-to-https"
    allowed_methods            = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods             = ["GET", "HEAD"]
    compress                   = true
    cache_policy_id            = data.aws_cloudfront_cache_policy.disabled.id
    origin_request_policy_id   = data.aws_cloudfront_origin_request_policy.all_viewer.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.noindex.id
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = { Name = local.name }
}

output "server_ip" {
  value = aws_instance.web.public_ip
}

output "site_url" {
  value = "https://${aws_cloudfront_distribution.this.domain_name}"
}
