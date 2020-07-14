variable "eip_id" {
  description = "EIP ID for Instance allocation"
  default     = ""
}
variable "eip_instance_config" {
  description = "Instance config source name for EIP association"
  default     = "default"
}

resource "aws_eip" "default" {}

resource "aws_eip_association" "default" {
  instance_id   = aws_instance.default.id
  allocation_id = var.eip_id
}
resource "aws_eip_association" "from_ami" {
  instance_id   = aws_instance.from_ami.id
  allocation_id = var.eip_id
}
