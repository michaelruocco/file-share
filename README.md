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

once the AWS profile is set up the following commands need to be run from the `/infra` directory:

```bash
terraform init          # only required for first time set up
terraform plan          # view changes that will be applied
terraform apply         # apply changes
```

these commands will return output containing details of the api endpoint, bucket names,
ui url and lambda name

```bash
api_endpoint = "https://t08qceavmb.execute-api.eu-west-2.amazonaws.com"
storage_bucket_name = "file-share-storage-dev-eu-west-2-327122349051"
ui_bucket_name = "file-share-ui-dev-eu-west-2-327122349051"
ui_url = "dh4unqc8j5ixg.cloudfront.net"
upload_url_lambda_name = "file-share-upload-dev-eu-west-2-327122349051"
```

to deploy the front end you need to move back up out of the `/infra` directory, then
into the ui directory where you can build the ui code with the following commands:

```bash
npm install
npm run build
```

then to deploy the ui built ui code you need to run the following, using the
value of the `ui_bucket_name` variable output from the previous step:

```bash
aws s3 sync dist/ s3://{ui_bucket_name} --delete
```

then to view the deployed ui you can navigate to the valaue of the `ui_url`
variable output above from `terraform apply` step i.e `https://dh4unqc8j5ixg.cloudfront.net`
from the example above.

# Running UI locally

To run the UI on your local machine, run the following commands, using the value of
the `api_endpoint` variable returned from the `terraform apply` step above:

```bash
cd ui
npm install
export VITE_API_BASE_URL={api_endpoint}
npm run dev
```

Then navigate [here](http://localhost:5173)

## Testing API with automated tests

To run the automated API tests on your local machine, run the following commands,
using the value of the `api_endpoint` variable returned from the `terraform apply` step above:

```bash
cd tests
npm install
export API_BASE_URL={api_endpoint}
npx playwright test
```

## Testing API Manally using cURL

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

The `-i` option is used here to log the response headers which will
contain the etag header, the etag header value is required to be passed to
the multipart complete endpoint. To complete the multipart upload:

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
