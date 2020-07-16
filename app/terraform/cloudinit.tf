variable "instance_api_key" {
  description = "Instance API Key"
  default = ""
}
variable "instance_api_secret" {
  description = "Instance API secret"
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
variable "start_jitsi" {
  description = "Start jitsi after reboot command"
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
        email_address       = var.email_address,
        hostname            = var.hostname,
        instance_api_key    = var.instance_api_key,
        instance_api_secret = var.instance_api_secret,
        nginx               = filebase64("web/jitsi.conf"),
        letsencrypt_renew   = filebase64("web/letsencrypt-renew"),
        start_jitsi         = filebase64("scripts/start-jitsi.sh"),
        certificate         = var.certificate_path != "" ? filebase64(var.certificate_path) : "",
        jitsi_recording     = tobool(var.jitsi_recording)
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
        email_address       = var.email_address,
        hostname            = var.hostname,
        instance_api_key    = var.instance_api_key,
        instance_api_secret = var.instance_api_secret,
        nginx               = filebase64("web/jitsi.conf"),
        letsencrypt_renew   = filebase64("web/letsencrypt-renew"),
        start_jitsi         = filebase64("scripts/start-jitsi.sh"),
        certificate         = var.certificate_path != "" ? filebase64(var.certificate_path) : "",
        jitsi_recording     = tobool(var.jitsi_recording)
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
