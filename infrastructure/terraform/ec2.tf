resource "aws_instance" "mongodb" {
  ami                         = "ami-0d7437f20eef139c4"
  instance_type               = "t3.small"
  subnet_id                   = aws_subnet.private[local.availability_zones[0]].id
  private_ip                  = cidrhost(local.subnets_by_az[local.availability_zones[0]].private_cidr, 10)
  vpc_security_group_ids      = [aws_security_group.data_services.id]
  iam_instance_profile        = aws_iam_instance_profile.ec2_ssm.name
  associate_public_ip_address = false

  depends_on = [
    aws_iam_role_policy_attachment.ec2_ssm_core,
  ]

  root_block_device {
    volume_size           = 15
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true
  }

  tags = {
    Name    = "${var.project_name}-mongodb"
    Service = "mongodb"
  }
}

resource "aws_instance" "kafka" {
  ami                         = "ami-06fdeb5c7347e04ec"
  instance_type               = "t3.small"
  subnet_id                   = aws_subnet.private[local.availability_zones[1]].id
  private_ip                  = cidrhost(local.subnets_by_az[local.availability_zones[1]].private_cidr, 10)
  vpc_security_group_ids      = [aws_security_group.data_services.id]
  iam_instance_profile        = aws_iam_instance_profile.ec2_ssm.name
  associate_public_ip_address = false

  depends_on = [
    aws_iam_role_policy_attachment.ec2_ssm_core,
  ]

  root_block_device {
    volume_size           = 10
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true
  }

  tags = {
    Name    = "${var.project_name}-kafka"
    Service = "kafka"
  }
}