# Jitsi Provisioner Instance API

A tiny app to help Jitsi Provisioner get information from the instance.

**This application is built to work with [Jitsi Provisioner](https://github.com/miguelpeixe/jitsi-provisioner). Do not use this outside of its context!**

---

## Installation

The installation is handled by the provisioner, but for documentation sake:

```
docker run -d \
  --name instance-api \
  -v /etc/letsencrypt:/data/letsencrypt:ro \
  -v /jitsi/.jitsi-meet-cfg:/data/jitsi:ro \
  -p 8001:8001 \
  --restart unless-stopped \
  miguelpeixe/jitsi-provisioner-instance-api:latest
```

## API

`GET /certificates`

Returns a tarball containing the LetsEncrypt certificates.
