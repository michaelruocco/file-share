output "deployment" {
  value = {
    api_endpoint               = aws_apigatewayv2_api.http_api.api_endpoint
    ui_bucket_name             = aws_s3_bucket.file_share_ui.bucket
    storage_bucket_name        = aws_s3_bucket.file_share_storage.bucket
    cloudfront_domain_name     = aws_cloudfront_distribution.cloudfront_ui.domain_name
    cloudfront_distribution_id = aws_cloudfront_distribution.cloudfront_ui.id
  }
}

output "github_actions_role_arn" {
  value = aws_iam_role.github_actions.arn
}