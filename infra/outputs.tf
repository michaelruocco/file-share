output "storage_bucket_name" {
  value = aws_s3_bucket.file_share_storage.bucket
}

output "ui_bucket_name" {
  value = aws_s3_bucket.file_share_ui.bucket
}

output "upload_url_lambda_name" {
  value = aws_lambda_function.upload_url_lambda.function_name
}

output "api_endpoint" {
  value = aws_apigatewayv2_api.http_api.api_endpoint
}

output "ui_url" {
  value = aws_cloudfront_distribution.cloudfront_ui.domain_name
}