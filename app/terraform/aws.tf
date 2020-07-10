provider "aws" {
  access_key = var.aws_access_key
  secret_key = var.aws_secret_key
  region     = var.aws_region
}

data "aws_ami" "ubuntu" {
  most_recent = true

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-bionic-18.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  owners = ["099720109477"] # Canonical
}

data "template_cloudinit_config" "full" {
  gzip          = true
  base64_encode = true

  part {
    filename      = "init"
    content_type  = "text/x-shellscript"
    content       = file("init.sh")
  }

  part {
    content_type  = "text/x-shellscript"
    content       = templatefile("config.tpl",
      {
        email_address = var.email_address,
        hostname      = var.hostname
      }
    )
  }
}

resource "aws_key_pair" "default" {
  key_name   = var.ssh_key_name
  public_key = file(var.ssh_pubkey_path)
}

resource "aws_instance" "default" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  vpc_security_group_ids = [aws_security_group.default.id]
  key_name               = var.ssh_key_name
  user_data              = data.template_cloudinit_config.full.rendered
  tags = {
    Name = var.name
  }
}

resource "aws_instance" "from_ami" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  vpc_security_group_ids = [aws_security_group.default.id]
  key_name               = var.ssh_key_name
  user_data              = templatefile("config.tpl",
                              {
                                email_address = var.email_address,
                                hostname      = var.hostname
                              }
                            )
  tags = {
    Name = var.name
  }
}
