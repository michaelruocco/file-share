resource "aws_s3_bucket" "file_share_ui" {
  bucket = "file-share-ui-${var.environment}-${var.aws_region}-${data.aws_caller_identity.current.account_id}"

  force_destroy = true

  tags = {
    Project     = "file-share"
    Environment = var.environment
  }
}

resource "aws_s3_bucket_public_access_block" "file_share_ui" {
  bucket = aws_s3_bucket.file_share_ui.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_policy" "file_share_ui" {
  bucket = aws_s3_bucket.file_share_ui.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipal"
        Effect = "Allow"

        Principal = {
          Service = "cloudfront.amazonaws.com"
        }

        Action = "s3:GetObject"

        Resource = "${aws_s3_bucket.file_share_ui.arn}/*"

        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.cloudfront_ui.arn
          }
        }
      }
    ]
  })
}