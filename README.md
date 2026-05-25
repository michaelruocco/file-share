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

curl -X POST https://sj7l9w57m1.execute-api.eu-west-2.amazonaws.com/multipart-uploads \
  -H "Content-Type: application/json" \
  -d '{
    "filename":"tests/files/test-multipart.bin",
    "contentType":"application/octet-stream"
  }'

curl -X POST https://sj7l9w57m1.execute-api.eu-west-2.amazonaws.com/multipart-uploads/evM9l8ro1tMJ3R.Nv2H1VQoZ7ibz5bx.EvmG7GPdAZYXn.DbdLV5tda4HUXLOWx_FJMxKfhiQUEbXo.ldhX4T6oFBdve3H9REwGayDswIaHpXRq8ATNMbRk5e1OnUkyXG2fixpRP899D4Z_vWoqATg--/part-urls \
  -H "Content-Type: application/json" \
  -d '{
    "key":"uploads/84dd93d6-4862-4cae-9f91-4eabac3a2bae/test-multipart.bin",
    "partNumber":1
  }'

curl -i -X PUT "https://mruocco-file-share-dev.s3.eu-west-2.amazonaws.com/uploads/84dd93d6-4862-4cae-9f91-4eabac3a2bae/test-multipart.bin?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAUYKQC5P5VKD3BNRZ%2F20260525%2Feu-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260525T100352Z&X-Amz-Expires=300&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEJr%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCWV1LXdlc3QtMiJHMEUCIQDgj6fKVqgWqdNAssKt8oBKNgC6pN6MNMqqJ4%2BhtaO6aAIgel6Womvdn8a3qqe8beHCTAUN1la01N2tqX9FiQfJkJEq7AMIYxAGGgwzMjcxMjIzNDkwNTEiDN8lubdmvy%2BlivwTpyrJA5VjHvxrKhDaJ0S3QCy%2FDiwBMDzIp7y5OTwonzOZoJad6H%2B%2BoL8aXMEOoxqK1DreqPBqfHgaXQMB35H6B2J%2FTR7Mj%2BiF610u27iZ2fY0lR7jeUD4DpaQ6Zp%2B%2Bjw3TwQ5%2BHEyiIsxHo2d50cz8%2BtfBxD2Tt6WvG0L7OqUmy2ljvqI%2BglbLqhv1Eh5dtCloyfqBpL7tO%2FWpVQ%2BDECERlj4Bce%2B7eBkS%2FR1ydUqvyPkiNYzIpU1gU9ngjaiw0KDKwAg72VMUPuTmv5kn84VnIRCQoGdeiR1vbuAd7h78bnO4p8X9ZMUVPYNyUqaegdd2dQu%2BVkjBbM4EVFMX8BkxfUH%2B5SJ70rHeS6QZIC5gKiWnaqWVsFo6qlcsRNdFgps23MFqNkRPybC3R4s8wF22MjG0dIsINmd9u4jIIH3%2BmVg0WItS8YscmP6u5BUdSLq5WV%2BQPhq11tD9a6FcQJj%2BkDvPeGHp9K4BeRXoNZpaiL5x6iWVRcjeHE%2BFxnzKhKvFDCAfPpEKWTdQF32XOGxrBWudOZUazNU7C4yHskFEy%2BWV2hQVzMInQE62qpR4c%2BEO0YszDU4swWir2etXnIVZygupNUe9jcXFYLMq54w4bzQ0AY6oQFG1W8VS%2Fy3qJnH66BlK5exQaACpnQUB9Q3LnmpHvxm0bP7br1HNq4M%2BNn33G45O7SRmhiRfgj6CH%2BVH63fk53spHNUW6TtipvApRD%2F2AKZ8QC6FpDqe0qIe%2F4vMt8bqcnHCzObH33d7Tu5ziHP0lkuVjjA03JlIWpvK%2FyR%2FOik7AqvJcjRy6GaAvgYh%2BBpbYvqY4nlkRapJmaUB1rxaWlSyQ%3D%3D&X-Amz-Signature=e98dd895dd6637bec53f990426b07cd9e7cb1b607760c9174b64e320073c52fc&X-Amz-SignedHeaders=host&partNumber=1&uploadId=evM9l8ro1tMJ3R.Nv2H1VQoZ7ibz5bx.EvmG7GPdAZYXn.DbdLV5tda4HUXLOWx_FJMxKfhiQUEbXo.ldhX4T6oFBdve3H9REwGayDswIaHpXRq8ATNMbRk5e1OnUkyXG2fixpRP899D4Z_vWoqATg--&x-amz-checksum-crc32=AAAAAA%3D%3D&x-amz-sdk-checksum-algorithm=CRC32&x-id=UploadPart" \
  -H "Content-Type: application/octet-stream" \
  --data-binary @tests/files/test-multipart.bin

curl -X POST https://sj7l9w57m1.execute-api.eu-west-2.amazonaws.com/multipart-uploads/evM9l8ro1tMJ3R.Nv2H1VQoZ7ibz5bx.EvmG7GPdAZYXn.DbdLV5tda4HUXLOWx_FJMxKfhiQUEbXo.ldhX4T6oFBdve3H9REwGayDswIaHpXRq8ATNMbRk5e1OnUkyXG2fixpRP899D4Z_vWoqATg-- \
  -H "Content-Type: application/json" \
  -d '{
    "key":"uploads/84dd93d6-4862-4cae-9f91-4eabac3a2bae/test-multipart.bin",
    "parts": [
      {
        "number": 1,
        "etag": "c3ed94fe77b6a17581201f9dfd56ecb4"
      }
    ]
  }'


# Running UI

To run the UI, run the following commands:

```bash
cd ui
npm install
npm run dev
```

Then navigate [here](http://localhost:5173)
