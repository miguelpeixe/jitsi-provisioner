variable "nginx" {
  description = "Nginx config"
  default = ""
}

variable "letsencrypt" {
  description = "Letsencrypt renew script"
  default = ""
}

data "template_cloudinit_config" "default" {
  gzip          = true
  base64_encode = true

  part {
    filename      = "init"
    content_type  = "text/x-shellscript"
    content       = file("scripts/init.sh")
  }

  part {
    content_type  = "text/x-shellscript"
    content       = templatefile("scripts/config.sh",
      {
        email_address = var.email_address,
        hostname      = var.hostname,
        nginx         = base64encode(file("web/jitsi.conf")),
        letsencrypt   = base64encode(file("web/letsencrypt-renew"))
      }
    )
  }
}

data "template_cloudinit_config" "from_ami" {
  gzip          = true
  base64_encode = true

  part {
    filename      = "config"
    content_type  = "text/x-shellscript"
    content       = templatefile("scripts/config.sh",
      {
        email_address = var.email_address,
        hostname      = var.hostname,
        nginx         = base64encode(file("web/jitsi.conf")),
        letsencrypt   = base64encode(file("web/letsencrypt-renew"))
      }
    )
  }
}

data "template_cloudinit_config" "ami" {
  gzip          = true
  base64_encode = true

  part {
    filename      = "init"
    content_type  = "text/x-shellscript"
    content       = file("scripts/init.sh")
  }

  part {
    content_type  = "text/x-shellscript"
    content       = file("scripts/poweroff.sh")
  }
}
