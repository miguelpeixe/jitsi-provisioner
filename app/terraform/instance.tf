resource "aws_instance" "default" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  vpc_security_group_ids = [aws_security_group.default.id]
  key_name               = var.ssh_key_name
  user_data              = data.template_cloudinit_config.default.rendered
  tags = {
    Name = var.name
  }
}

resource "aws_instance" "from_ami" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  vpc_security_group_ids = [aws_security_group.default.id]
  key_name               = var.ssh_key_name
  user_data              = data.template_cloudinit_config.from_ami.rendered
  tags = {
    Name = var.name
  }
}

resource "aws_instance" "ami" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = "t3.large"
  user_data              = data.template_cloudinit_config.ami.rendered
  tags = {
    Name = var.name
  }
}
