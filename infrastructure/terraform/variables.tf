variable "aws_region" {
  description = "AWS region where the VPC will be created."
  type        = string
}

variable "project_name" {
  description = "Prefix used to name the VPC resources."
  type        = string
  default     = "purchase-system"
}

variable "vpc_cidr" {
  description = "IPv4 /16 CIDR block containing the VPC subnets."
  type        = string
  default     = "10.0.0.0/16"

  validation {
    condition     = can(cidrnetmask(var.vpc_cidr)) && tonumber(split("/", var.vpc_cidr)[1]) == 16
    error_message = "vpc_cidr must be a valid IPv4 /16 CIDR block."
  }
}

variable "tags" {
  description = "Tags applied to resources created by this Terraform configuration."
  type        = map(string)
  default = {
    Project   = "purchase-system"
    ManagedBy = "Terraform"
  }
}
