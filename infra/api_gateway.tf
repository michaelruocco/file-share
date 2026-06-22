resource "aws_apigatewayv2_api" "http_api" {
  name = "file-share-api-${var.environment}"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = [
      "http://localhost:5173",
      "https://${aws_cloudfront_distribution.cloudfront_ui.domain_name}"
    ]

    allow_methods = [
      "GET",
      "POST",
      "PUT",
      "OPTIONS",
      "DELETE"
    ]

    allow_headers = [
      "content-type"
    ]

    expose_headers = [
      "etag"
    ]

    max_age = 300
  }
}

resource "aws_apigatewayv2_route" "get_health_route" {
  api_id = aws_apigatewayv2_api.http_api.id

  route_key = "GET /health"

  target = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id = aws_apigatewayv2_api.http_api.id

  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.upload_url_lambda.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "upload_urls_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "POST /upload-urls"

  target = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_apigatewayv2_route" "download_urls_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "POST /download-urls"

  target = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_apigatewayv2_route" "multipart_uploads_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "POST /multipart-uploads"

  target = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_apigatewayv2_route" "multipart_upload_part_route" {
  api_id = aws_apigatewayv2_api.http_api.id

  route_key = "POST /multipart-uploads/{uploadId}/part-urls"

  target = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_apigatewayv2_route" "complete_multipart_upload_route" {
  api_id = aws_apigatewayv2_api.http_api.id

  route_key = "POST /multipart-uploads/{uploadId}"

  target = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_apigatewayv2_route" "get_files_route" {
  api_id = aws_apigatewayv2_api.http_api.id

  route_key = "GET /files"

  target = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_apigatewayv2_route" "delete_files_route" {
  api_id = aws_apigatewayv2_api.http_api.id

  route_key = "DELETE /files"

  target = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.http_api.id
  name        = "$default"
  auto_deploy = true
}