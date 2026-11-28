# Infrastructure

Terraform creates the VPC, two public and two private subnets, a Regional NAT Gateway, security groups, and two private EC2 instances for MongoDB and Kafka. The instances use SSM instead of SSH. MongoDB logs go to CloudWatch Logs and are kept for 30 days.

## Apply

Requirements: Terraform 1.10+, AWS credentials, and the existing S3 backend bucket `purchase-system-terraform-lock` in `eu-north-1`.

Create `terraform.tfvars` with your AWS region:

```hcl
aws_region = "eu-north-1"
```

Then run from this directory:

```sh
terraform init
terraform plan
terraform apply
```

If moving existing local state to S3, use `terraform init -migrate-state` instead of `terraform init`.

MongoDB and Kafka containers, their database/topic initialization, the load balancer, and ECS services are set up separately. Use the Terraform outputs for subnet IDs, security group IDs, instance IDs, and private IPs.

To remove these resources, run `terraform destroy` from this directory.
