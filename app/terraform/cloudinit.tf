variable "instance_api_key" {
  description = "Instance API Key"
  default = ""
}
variable "nginx" {
  description = "Nginx config"
  default = ""
}
variable "letsencrypt_renew" {
  description = "Letsencrypt renew script"
  default = ""
}
variable "certificate" {
  description = "Letsencrypt certificates to restore"
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
        email_address     = var.email_address,
        hostname          = var.hostname,
        instance_api_key  = var.instance_api_key,
        nginx             = filebase64("web/jitsi.conf"),
        letsencrypt_renew = filebase64("web/letsencrypt-renew"),
        certificate       = var.certificate_path != "" ? filebase64(var.certificate_path) : ""
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
        email_address     = var.email_address,
        hostname          = var.hostname,
        instance_api_key  = var.instance_api_key,
        nginx             = filebase64("web/jitsi.conf"),
        letsencrypt_renew = filebase64("web/letsencrypt-renew"),
        certificate       = var.certificate_path != "" ? filebase64(var.certificate_path) : ""
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
