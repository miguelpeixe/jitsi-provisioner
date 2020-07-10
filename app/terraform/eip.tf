resource "aws_eip" "default" {}

resource "aws_eip_association" "default" {
  instance_id   = aws_instance[var.instance_config].id
  allocation_id = var.eip_id
}
