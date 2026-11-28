# The public load balancer can reach the browser-facing frontend and client API.
resource "aws_security_group" "load_balancer" {
  name        = "${var.project_name}-load-balancer"
  description = "Public HTTP and HTTPS ingress for the application load balancer."
  vpc_id      = aws_vpc.this.id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Allow responses and forwarding to application targets."
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-load-balancer-sg"
  }
}

resource "aws_security_group" "ecs_tasks" {
  name        = "${var.project_name}-ecs-tasks"
  description = "Ingress to app tasks from the load balancer and other app tasks."
  vpc_id      = aws_vpc.this.id

  ingress {
    description     = "Frontend target traffic from the load balancer."
    from_port       = 8000
    to_port         = 8000
    protocol        = "tcp"
    security_groups = [aws_security_group.load_balancer.id]
  }

  ingress {
    description     = "Browser-facing client API target traffic from the load balancer."
    from_port       = 5001
    to_port         = 5001
    protocol        = "tcp"
    security_groups = [aws_security_group.load_balancer.id]
  }

  ingress {
    description = "API server traffic from app tasks."
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    self        = true
  }

  egress {
    description = "Allow app tasks to reach dependencies and external image/service endpoints."
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-ecs-tasks-sg"
  }
}

# Only ECS tasks can connect to the data service ports. There is no public ingress.
resource "aws_security_group" "data_services" {
  name        = "${var.project_name}-data-services"
  description = "Private MongoDB and Kafka access for ECS tasks."
  vpc_id      = aws_vpc.this.id

  ingress {
    description     = "MongoDB from ECS tasks."
    from_port       = 27017
    to_port         = 27017
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  ingress {
    description     = "Kafka broker from ECS tasks."
    from_port       = 9092
    to_port         = 9092
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  egress {
    description = "Allow updates and service responses."
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-data-services-sg"
  }
}
