# File Share

## Deploying

Requires Terraform version and provider versions:

```bash
terraform -v
Terraform v1.15.4
on darwin_arm64
+ provider registry.terraform.io/hashicorp/aws v5.100.0
```

AWS profile is required to run terraform commands e.g.

```bash
export AWS_PROFILE=local-dev
```

before (the following commands need to be run from the `/infra` directory):

```bash
terraform init          # only required for first time set up
terraform plan          # view changes that will be applied
terraform apply         # apply changes
```

## Testing API

### Upload

```bash
curl -X POST https://{apiId}.execute-api.eu-west-2.amazonaws.com/upload-urls \
  -H "Content-Type: application/json" \
  -d '{"filename":"tests/files/text-file.txt","contentType":"text/plain"}'
```

Should return:

```json
{
  "uploadUrl": "https://s3.eu-west-2.amazonaws.com/...",
  "key": "uploads/{uuid}/text-file.txt"
}
```

Then:

```bash
curl -X PUT "{uploadUrl}" \
  -H "Content-Type: text/plain" \
  --upload-file tests/files/text-file.txt
```

### Download

Then to generate a download url for the uploaded file:

```bash
curl -X POST https://{apiId}.execute-api.eu-west-2.amazonaws.com/download-urls \
  -H "Content-Type: application/json" \
  -d '{"key":"{key}","contentType":"text/plain"}'
```

Should return:

```json
{
  "downloadUrl": "https://s3.eu-west-2.amazonaws.com/..."
}
```

And finally to view the contents of the downloaded file:

```bash
curl "{downloadUrl}"
```

### Multipart upload

To start a multipart upload you can run:

```bash
curl -X POST https://{apiId}.execute-api.eu-west-2.amazonaws.com/multipart-uploads \
  -H "Content-Type: application/json" \
  -d '{
    "filename":"tests/files/test-multipart.bin",
    "contentType":"application/octet-stream"
  }'
```

Then to create each part upload url:

```bash
curl -X POST https://{apiId}.execute-api.eu-west-2.amazonaws.com/multipart-uploads/{uploadId}/part-urls \
  -H "Content-Type: application/json" \
  -d '{
    "key":"{key}",
    "partNumber":1
  }'
```

Then upload each part:

```bash
curl -i -X PUT "{uploadUrl}" \
  -H "Content-Type: application/octet-stream" \
  --data-binary @tests/files/test-multipart.bin
```

Then to complete the multipart upload:

```bash
curl -X POST https://{apiId}.execute-api.eu-west-2.amazonaws.com/multipart-uploads/{uploadId} \
  -H "Content-Type: application/json" \
  -d '{
    "key":"{key}",
    "parts": [
      {
        "number": 1,
        "etag": "{etag}"
      }
    ]
  }'
```

# Running UI

To run the UI, run the following commands:

```bash
cd ui
npm install
npm run dev
```

Then navigate [here](http://localhost:5173)
