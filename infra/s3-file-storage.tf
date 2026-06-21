resource "aws_s3_bucket" "file_share_storage" {
  bucket = "file-share-storage-${var.environment}"

  force_destroy = true

  tags = {
    Project     = "file-share"
    Environment = var.environment
  }
}

resource "aws_s3_bucket_public_access_block" "file_share_storage" {
  bucket = aws_s3_bucket.file_share_storage.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "file_share_storage" {
  bucket = aws_s3_bucket.file_share_storage.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "file_expiry" {
  bucket = aws_s3_bucket.file_share_storage.id

  rule {
    id     = "delete-old-files"
    status = "Enabled"

    filter {}

    expiration {
      days = 14
    }
  }

  rule {
    id     = "multipart-cleanup"
    status = "Enabled"

    filter {}

    abort_incomplete_multipart_upload {
      days_after_initiation = 1
    }
  }
}

resource "aws_s3_bucket_cors_configuration" "file_share_cors" {
  bucket = aws_s3_bucket.file_share_storage.id

  cors_rule {
    allowed_headers = ["*"]

    allowed_methods = [
      "GET",
      "PUT",
      "HEAD"
    ]

    allowed_origins = [
      "http://localhost:5173",
      "https://${aws_cloudfront_distribution.cloudfront_ui.domain_name}"
    ]

    expose_headers = [
      "ETag"
    ]

    max_age_seconds = 300
  }
}

