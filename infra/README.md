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