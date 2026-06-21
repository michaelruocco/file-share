output "deployment" {
  value = {
    api_endpoint        = tostring(aws_apigatewayv2_api.http_api.api_endpoint)
    ui_bucket_name      = aws_s3_bucket.file_share_ui.bucket
    storage_bucket_name = aws_s3_bucket.file_share_storage.bucket
    ui_url              = aws_cloudfront_distribution.cloudfront_ui.domain_name
  }
}