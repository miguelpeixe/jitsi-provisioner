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

resource "aws_key_pair" "jitsi-key" {
  key_name   = var.ssh_key_name
  public_key = file(var.ssh_pubkey_path)
}

resource "aws_instance" "jitsi-server" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  vpc_security_group_ids = [aws_security_group.jitsi-security-group.id]
  key_name               = var.ssh_key_name
  user_data              = templatefile("install.tpl", { email_address = var.email_address, hostname = var.hostname })
  tags = {
    Name = var.name
  }
}
