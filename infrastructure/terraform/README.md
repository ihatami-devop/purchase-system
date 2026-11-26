# Purchase system VPC

This Terraform configuration creates the network foundation for the purchase system:

- A VPC with DNS support and subnets in two Availability Zones.
- One public and one private subnet per Availability Zone: `10.0.0.0/24` and `10.0.1.0/24` in the first AZ, then `10.0.2.0/24` and `10.0.3.0/24` in the second AZ.
- An Internet Gateway and public routes for the load balancer subnets.
- One Regional NAT Gateway and a shared private route for outbound access from both Availability Zones.
- Security groups for the public load balancer, ECS tasks, and EC2 instances running MongoDB/Kafka.

The private subnets are intended for Fargate tasks and the MongoDB/Kafka EC2 instances. The data services security group only allows MongoDB (`27017`) and Kafka (`9092`) connections from the ECS tasks security group. It does not allow public inbound traffic. Use AWS Systems Manager Session Manager for administration instead of opening SSH to the internet.

The Regional NAT Gateway automatically expands across Availability Zones where it detects workloads, and one route can serve private subnets in both AZs. It does not need a public subnet or manually managed Elastic IPs. It incurs hourly and data processing charges; check current pricing for your selected AWS Region before applying. Regional NAT Gateway support requires AWS provider version 6.24.0 or later. AWS describes its [Regional NAT Gateway behavior](https://docs.aws.amazon.com/vpc/latest/userguide/nat-gateways-regional.html).

## Apply

Install Terraform and configure AWS credentials with permissions to create VPC, subnet, route, Regional NAT Gateway, and security group resources. Copy `terraform.tfvars.example` to `terraform.tfvars` and choose your region there. The local `terraform.tfvars` and Terraform state files are ignored by Git.

```sh
terraform init
terraform plan
terraform apply
```

Review the plan and Regional NAT Gateway cost before applying. The configuration creates AWS resources only when `terraform apply` is run.

Terraform outputs the VPC, subnet, and security group IDs. Use the public subnet IDs for an internet-facing Application Load Balancer, and the private subnet IDs plus ECS task security group for Fargate services. Attach the data services security group to the private EC2 instances hosting MongoDB and Kafka.

This is the VPC layer only. It does not create the ALB/listeners/target groups, ECS cluster or task definitions, EC2 instances, EBS data volumes, MongoDB or Kafka configuration, DNS/TLS, or secrets. Those are separate deployment resources.

To remove this network later, run `terraform destroy` from this directory after confirming that no other resources depend on it.
