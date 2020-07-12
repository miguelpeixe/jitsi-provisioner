resource "aws_key_pair" "default" {
  key_name   = var.ssh_key_name
  public_key = file(var.ssh_pubkey_path)
}
