variable "name" {
  description = "Server name"
  default = ""
}
variable "aws_access_key" {
  description = "Access key from AWS"
  default = ""
}
variable "aws_secret_key" {
  description = "Secret key from AWS"
  default = ""
}
variable "aws_region" {
  description = "Region where the instance should be located"
  default = ""
}
variable "ssh_key_path" {
  description = "Path to the AWS SSH key"
  default = ""
}
variable "ssh_pubkey_path" {
  description = "Path to the AWS SSH pubkey"
  default = ""
}
variable "instance_type" {
  description = "Instance type to launch"
  default = ""
}
variable "ssh_key_name" {
  description = "Name of the SSH key"
  default = ""
}
variable "security_group_name" {
  description = "Name of the security group"
  default = ""
}
variable "email_address" {
  description = "Email to use for the certificate generation"
  default     = ""
}
variable "hostname" {
  description = "Hostname of the Jitsi Server"
  default     = ""
}
variable "eip_id" {
  description = "EIP ID for Server allocation"
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
