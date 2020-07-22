# Jitsi Provisioner CLI

CLI interface to manage your Jitsi Provisioner

![](https://media.giphy.com/media/gGwjWshjjBcaCqeQfA/giphy.gif)

## Install

```
$ npm install -g jitsi-provisioner-cli
$ jitsi-provisioner
Usage: jitsi-provisioner [options] [command]

Options:
  -V, --version           output the version number
  -h, --help              display help for command

Commands:
  auth [options]
  users                   Jitsi Provisioner Users
  instances [instanceId]  Jitsi Provisioner Instances
  help [command]          display help for command
```

---

## Authenticate

If no auth is configured, the cli will look for the parent directory to connect to a local Jitsi Provisioner with a self-generated access token.

```
$ jitsi-provisioner auth --help
Usage: jitsi-provisioner auth [options] [command]

Options:
  -u, --user <user>          Username (default: "admin")
  -p, --password <password>  Password (default: "admin")
  -s, --server <url>         Server url (default: "http://localhost:3030")
  -h, --help                 display help for command

Commands:
  remove                     Clear authentication
```

## Manage instances

```
$ jitsi-provisioner instances --help
Usage: jitsi-provisioner instances [options] [command] [instanceId]

Jitsi Provisioner Instances

Options:
  -h, --help              display help for command

Commands:
  create [options]        Create new instance
  provision <instanceId>  Provision an instance
  terminate <instanceId>  Terminate an instance
  remove <instanceId>     Remove a terminated instance
```

### Listing instances

```
$ jitsi-provisioner instances
┌─────────┬──────────┬────────────────────────┬──────┬─────────────┬───────────────┬─────────────┬────────────┐
│ (index) │   _id    │        hostname        │ info │   status    │   publicIp    │   region    │    type    │
├─────────┼──────────┼────────────────────────┼──────┼─────────────┼───────────────┼─────────────┼────────────┤
│    0    │ 'be87e7' │ 'be87e7.meet.peixe.co' │  ''  │ 'available' │ '100.0.0.113' │ 'us-east-1' │ 't3.large' │
│    1    │ 'e3a881' │ 'e3a881.meet.peixe.co' │  ''  │ 'available' │ '100.0.0.204' │ 'us-east-1' │ 't3.large' │
└─────────┴──────────┴────────────────────────┴──────┴─────────────┴───────────────┴─────────────┴────────────┘
```

### Creating, provisioning, terminating and removing instances

Creating a new instance in São Paulo of type c5.xlarge:

```
$ jitsi-provisioner instances create --region sa-east-1 --type c5.xlarge --hostname my-jitsi.meet.peixe.co
Provisioning instance ✔ Available
┌──────────┬──────────────────────────┐
│ (index)  │          Values          │
├──────────┼──────────────────────────┤
│   _id    │         'b586fe'         │
│ hostname │ 'my-jitsi.meet.peixe.co' │
│   info   │            ''            │
│  status  │       'available'        │
│ publicIp │       '100.0.0.73'       │
│  region  │       'sa-east-1'        │
│   type   │       'c5.xlarge'        │
└──────────┴──────────────────────────┘
```

Terminating the created instance:

```
$ jitsi-provisioner instances terminate b586fe
Terminating instance ✔ Terminated
```

Provisioning the terminated instance:

```
$ jitsi-provisioner instances provision b586fe
```

Removing a terminated instance:

```
$ jitsi-provisioner instances remove b586fe
```

Information on a single instance:

```
$ jitsi-provisioner instances b586fe
```

## Manage users

```
$ jitsi-provisioner users --help
Usage: jitsi-provisioner users [options] [command] [userId]

Jitsi Provisioner Users

Options:
  -h, --help                               display help for command

Commands:
  create <username> <password>             Create new user
  changePassword <username> <newPassword>  Change user password
  remove <username>                        Remove user
```
