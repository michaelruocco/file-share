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

```bash
curl -X POST https://{api.id}.execute-api.eu-west-2.amazonaws.com/multipart-uploads \
  -H "Content-Type: application/json" \
  -d '{
    "filename":"tests/files/test-multipart.bin",
    "contentType":"application/octet-stream"
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

```bash
curl -X POST https://ltc01ebmr1.execute-api.eu-west-2.amazonaws.com/multipart-uploads \
  -H "Content-Type: application/json" \
  -d '{
    "filename":"tests/files/test-multipart.bin",
    "contentType":"application/octet-stream"
  }'

curl -X POST https://ltc01ebmr1.execute-api.eu-west-2.amazonaws.com/multipart-uploads/h7BJkO36N5dTE8ohGywB5DJX1m.wo_8WWKvV8wIqtd9H.1ArGMrVvlbP3m_2pvPZfrQneU7QISzfof5r.Uk7LKuQs2dWpr5_a.w5nLbLTfLBtD4Iscr9ndrBZP.42FepxYyv8EJbbunvzY0QZ14G2A--/part-urls \
  -H "Content-Type: application/json" \
  -d '{
    "key":"uploads/58210b01-0e25-40a1-a7d0-221d1ee82a5a/test-multipart.bin",
    "partNumber":1
  }'

curl -i -X PUT "https://mruocco-file-share-dev.s3.eu-west-2.amazonaws.com/uploads/58210b01-0e25-40a1-a7d0-221d1ee82a5a/test-multipart.bin?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAUYKQC5P5SSQBNZ3Y%2F20260522%2Feu-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260522T155047Z&X-Amz-Expires=300&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFgaCWV1LXdlc3QtMiJHMEUCIF9OHcUqH0p8wdbHLA7hA9stk3W60w9NdHjw4AYbezR2AiEAtQ5rX00ziCY%2FIBl4Aqm2Dq7nMuka8r2y4WfQz%2BIlhHQq7AMIIRAGGgwzMjcxMjIzNDkwNTEiDBDfOoZ%2Fwd5nPc5ptSrJAwIfPLvbE0DZf3Z9MGhasCu%2F1rjlrHRv0gSbr8nfeNAm9ezbgT1BYqNhcp8NFcM9XuaCQ1PIoRZUMKFsaeMGRC03oph%2BjHj4WpSpe%2FJir0j5yOIdsTNbytegPDbj7NUrqEvGoqvRP2S8740wYHZfAVZPJ9Jmd%2BVefoIeEwAj9tM98S7IpmcaBpRFd1kMTDxlNdmk%2F24a18fYC9IjWTOEQis9N6qEQSA5J8z2zK8lnaAeJ5pq66sDMWWr9BDfbKc%2FUduVYV2FGyuaCcgZm7qRbWDAaeft%2FY4dbuOX1EobE%2BSTSc%2FnI6FvS0I%2Fn6rB7fW%2FK48wRLUyauf2Fl2waCRJvLlc5rh8gVe1Sjo7jXHgIAEA4zpcoydYDosjmTxbOwJKhFUwr5xLm49GQMMN5378bPtL58PhMM7plZWCO5byTBpbLTSAJw5OFYTNs9SrMfQrKVLqXIXPulw70HtD1bWE8T%2FpIah1ZoyIlMQQVrcHY2wm9TTZmeY8fl6cNcCZRfe9TnVA5hUH0vYAtBNUfiJ3wQfGtgJ%2BN2HZH0IsIhN9L9hP8h08cC5UOj1%2Fc8jPVPzskgdandZCfsFJOTIL9scDB2C9sihl7IXwjPgw9fPB0AY6oQFGv9OHFKDm98YU85cUJ47hMd0mUddHRKWWQOksdt40MnicIpYjjtkzyf%2BRn8R%2BtikxwLvC48ukyKzW3yGh6oDXSBwsJvWN5jvC6vinyMtiX0iAC3u1D7u3alWxPIcyLQeC9foR7ut4vpDvI67W7vtDposHAitVbCKONi5%2B7wlXLWfpe3pRUR61CJDCImi1%2FH1SDdGVmjaIidaEBWzy3KNiWA%3D%3D&X-Amz-Signature=109c40f0d42d95ed39b9b6699476f1b7e8130f8b7e0ea2e6e79f08c307e32286&X-Amz-SignedHeaders=host&partNumber=1&uploadId=h7BJkO36N5dTE8ohGywB5DJX1m.wo_8WWKvV8wIqtd9H.1ArGMrVvlbP3m_2pvPZfrQneU7QISzfof5r.Uk7LKuQs2dWpr5_a.w5nLbLTfLBtD4Iscr9ndrBZP.42FepxYyv8EJbbunvzY0QZ14G2A--&x-amz-checksum-crc32=AAAAAA%3D%3D&x-amz-sdk-checksum-algorithm=CRC32&x-id=UploadPart" \
-H "Content-Type: application/octet-stream" \
--data-binary @tests/files/test-multipart.bin
```
