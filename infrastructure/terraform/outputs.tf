output "vpc_id" {
  description = "ID of the application VPC."
  value       = aws_vpc.this.id
}

output "availability_zones" {
  description = "Availability Zones used by the VPC subnets."
  value       = local.availability_zones
}

output "public_subnet_ids" {
  description = "Public subnet IDs; use these for an internet-facing load balancer."
  value       = [for az in local.availability_zones : aws_subnet.public[az].id]
}

output "private_subnet_ids" {
  description = "Private subnet IDs; use these for Fargate tasks and database/Kafka EC2 instances."
  value       = [for az in local.availability_zones : aws_subnet.private[az].id]
}

output "load_balancer_security_group_id" {
  description = "Security group ID for the public application load balancer."
  value       = aws_security_group.load_balancer.id
}

output "ecs_tasks_security_group_id" {
  description = "Security group ID for ECS tasks."
  value       = aws_security_group.ecs_tasks.id
}

output "data_services_security_group_id" {
  description = "Security group ID to attach to MongoDB and Kafka EC2 instances."
  value       = aws_security_group.data_services.id
}

output "mongodb_instance_id" {
  description = "EC2 instance ID for MongoDB."
  value       = aws_instance.mongodb.id
}

output "mongodb_private_ip" {
  description = "Stable private IPv4 address for MongoDB."
  value       = aws_instance.mongodb.private_ip
}

output "kafka_instance_id" {
  description = "EC2 instance ID for Kafka."
  value       = aws_instance.kafka.id
}

output "kafka_private_ip" {
  description = "Stable private IPv4 address for Kafka."
  value       = aws_instance.kafka.private_ip
}

output "nat_gateway_id" {
  description = "ID of the Regional NAT Gateway shared by the private subnets."
  value       = aws_nat_gateway.this.id
}
