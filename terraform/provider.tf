provider "aws" {
  region = var.region

  # These can be set via environment variables:
  # AWS_ACCESS_KEY_ID
  # AWS_SECRET_ACCESS_KEY
  # AWS_SESSION_TOKEN (if using temporary credentials)
} 