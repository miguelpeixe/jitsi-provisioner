variable "ami_id" {
  description = "AMI ID for Instance creation"
  default     = ""
}
variable "ami_instance_id" {
  description = "Instance ID for AMI creation"
  default     = ""
}
variable "ami_name" {
  description = "AMI name"
  default     = ""
}
variable "source_ami_region" {
  description = "Source AMI region to copy from"
  default     = ""
}
variable "source_ami_id" {
  description = "Source AMI ID to copy from"
  default     = ""
}
resource "aws_ami_from_instance" "default" {
  name               = var.ami_name
  source_instance_id = var.ami_instance_id
  tags = {
    Name = var.ami_name
  }
}

resource "aws_ami_copy" "default" {
  name              = var.ami_name
  source_ami_id     = var.source_ami_id
  source_ami_region = var.source_ami_region
  tags = {
    Name = var.ami_name
  }
}
