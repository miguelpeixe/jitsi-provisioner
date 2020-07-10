data "template_cloudinit_config" "ami" {
  gzip          = true
  base64_encode = true

  part {
    filename      = "init"
    content_type  = "text/x-shellscript"
    content       = file("init.sh")
  }

  part {
    content_type  = "text/x-shellscript"
    content       = file("poweroff.sh")
  }
}

resource "aws_instance" "for_ami" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = "t3.large"
  user_data              = data.template_cloudinit_config.ami.rendered
  tags = {
    Name = var.name
  }
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
