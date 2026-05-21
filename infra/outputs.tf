output "bucket_name" {
  value = aws_s3_bucket.file_share.bucket
}

output "upload_url_lambda_name" {
  value = aws_lambda_function.upload_url_lambda.function_name
}

output "api_endpoint" {
  value = aws_apigatewayv2_api.http_api.api_endpoint
}