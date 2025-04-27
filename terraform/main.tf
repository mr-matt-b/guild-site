terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}


resource "aws_iam_instance_profile" "ecs_ec2" {
  name = "guild-site-ecs-ec2-profile"
  role = aws_iam_role.ecs_execution_role.name
} 

# ECR Repository
resource "aws_ecr_repository" "guild_site" {
  name = "guild-site"
}

# ECS Cluster
resource "aws_ecs_cluster" "guild_site" {
  name = "guild-site-cluster"
}

# ECS Task Definition
resource "aws_ecs_task_definition" "guild_site" {
  family                   = "guild-site-task"
  network_mode            = "awsvpc"
  requires_compatibilities = ["EC2"]
  cpu                     = "256"  # t2.micro compatible
  memory                  = "512"  # t2.micro compatible
  execution_role_arn      = aws_iam_role.ecs_execution_role.arn
  task_role_arn          = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name      = "backend"
      image     = "${aws_ecr_repository.guild_site.repository_url}:latest"
      essential = true
      portMappings = [
        {
          containerPort = 3001
          hostPort      = 3001
          protocol      = "tcp"
        }
      ]
      environment = [
        {
          name  = "NODE_ENV"
          value = "production"
        }
      ]
      secrets = [
        {
          name      = "MONGODB_URI"
          valueFrom = aws_ssm_parameter.mongodb_uri.arn
        },
        {
          name      = "BLIZZARD_CLIENT_ID"
          valueFrom = aws_ssm_parameter.blizzard_client_id.arn
        },
        {
          name      = "BLIZZARD_CLIENT_SECRET"
          valueFrom = aws_ssm_parameter.blizzard_client_secret.arn
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = "/ecs/guild-site"
          awslogs-region        = var.region
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])
}

# ECS Service
resource "aws_ecs_service" "guild_site" {
  name            = "guild-site-service"
  cluster         = aws_ecs_cluster.guild_site.id
  task_definition = aws_ecs_task_definition.guild_site.arn
  desired_count   = 1
  launch_type     = "EC2"

  network_configuration {
    subnets         = [aws_subnet.public.id]
    security_groups = [aws_security_group.ecs_tasks.id]
  }
}

# EC2 Auto Scaling Group for ECS Cluster
resource "aws_autoscaling_group" "ecs_cluster" {
  name                = "guild-site-ecs-cluster"
  vpc_zone_identifier = [aws_subnet.public.id]
  desired_capacity    = 1
  max_size           = 1
  min_size           = 1

  launch_template {
    id      = aws_launch_template.ecs_ec2.id
    version = "$Latest"
  }
}

# Launch Template for EC2 instances
resource "aws_launch_template" "ecs_ec2" {
  name_prefix   = "guild-site-ecs-"
  image_id      = data.aws_ami.ecs_optimized.id
  instance_type = "t2.micro"

  iam_instance_profile {
    name = aws_iam_instance_profile.ecs_ec2.name
  }

  network_interfaces {
    associate_public_ip_address = true
    security_groups            = [aws_security_group.ecs_tasks.id]
  }

  user_data = base64encode(<<-EOF
    #!/bin/bash
    echo ECS_CLUSTER=${aws_ecs_cluster.guild_site.name} >> /etc/ecs/ecs.config
  EOF
  )
}

# IAM Roles and Policies
resource "aws_iam_role" "ecs_execution_role" {
  name = "guild-site-ecs-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role" "ecs_task_role" {
  name = "guild-site-ecs-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

# SSM Parameters for secrets
resource "aws_ssm_parameter" "mongodb_uri" {
  name  = "/guild-site/mongodb-uri"
  type  = "SecureString"
  value = "your-mongodb-uri"
}

resource "aws_ssm_parameter" "blizzard_client_id" {
  name  = "/guild-site/blizzard-client-id"
  type  = "SecureString"
  value = "your-client-id"
}

resource "aws_ssm_parameter" "blizzard_client_secret" {
  name  = "/guild-site/blizzard-client-secret"
  type  = "SecureString"
  value = "your-client-secret"
}

# Data sources
data "aws_ami" "ecs_optimized" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-ecs-hvm-*-x86_64-ebs"]
  }
} 