resource "aws_cloudwatch_log_group" "mongodb" {
  name              = "/${var.project_name}/mongodb"
  retention_in_days = 30

  tags = merge(var.tags, {
    Name = "${var.project_name}-mongodb-logs"
  })
}

resource "aws_iam_role_policy" "mongodb_logs" {
  name = "${var.project_name}-mongodb-logs"
  role = aws_iam_role.ec2_ssm.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["logs:CreateLogStream", "logs:PutLogEvents"]
      Resource = "${aws_cloudwatch_log_group.mongodb.arn}:*"
    }]
  })
}
