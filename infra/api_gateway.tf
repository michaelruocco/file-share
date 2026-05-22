resource "aws_apigatewayv2_api" "http_api" {
  name          = "file-share-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = [
      "http://localhost:5173"
    ]

    allow_methods = [
      "GET",
      "POST",
      "PUT",
      "OPTIONS"
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

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.http_api.id
  name        = "$default"
  auto_deploy = true
}