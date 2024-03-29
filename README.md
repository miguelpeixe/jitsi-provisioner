# Jitsi Provisioner

A lightweight app that deploys [Jitsi Meet](https://jitsi.org/) servers in the cloud in less than 3 minutes.

---

This app is built using [Feathersjs](https://feathersjs.com/) with [NeDB](https://github.com/louischatriot/nedb), [Terraform](https://www.terraform.io/), [CloudFlare Node API](https://github.com/cloudflare/node-cloudflare) and [ec2instances.info](https://github.com/powdahound/ec2instances.info) for AWS instance types and cost estimates database.

You can see a demo at https://meet.peixe.co.

## Requirements

- [Amazon Web Services](https://aws.amazon.com/) account
- [CloudFlare](https://www.cloudflare.com/) located domain

## Features

- Provision a Jitsi Meet server of any size and in any region of the world
- Terminate and provision again at any time, preserving allocated elastic IP, hostname and the automatically generated LetsEncrypt certificates
- Create your Jitsi AMI with one click for even faster provisioning
- Store history of instance states for cost calculation
- A [web client](https://meet.peixe.co/) and a [CLI](cli) to easily manage your setup
- REST and real-time [socket.io](https://socket.io/) API

## Installation

Jitsi Provisioner uses [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) for easier setup. [Learn how to install and use Docker](https://docs.docker.com/get-docker/).

Start by cloning the repository:

```
$ git clone https://github.com/miguelpeixe/jitsi-provisioner.git
$ cd jitsi-provisioner
```

Copy env.example to .env:

```
$ cp env.example .env
```

Generate JWT secret by running the random secret generator:

```
$ ./gen-secrets.sh
```

Edit `.env` and set your [AWS Access Key](https://console.aws.amazon.com/iam/home?#/security_credentials), [CloudFlare Global API Key](https://dash.cloudflare.com/profile/api-tokens) and other required information.

Start the server with docker-compose. `-d` flag enables detached mode and run the container in the background:

```
$ docker-compose up -d
```

Access http://localhost:3030

## Demo mode

For safety purposes, demo mode is active by default. You can switch it off by setting `DEMO=0` in your `.env` file and restart your container.

In demo mode:

- There is only one user with admin/admin credentials
- You cannot create new users
- Instances are not created in AWS
- DNS changes are not made in CloudFlare
- Creates fake instances with fake data

## Users

With demo mode off you can create and delete users using the [custom cli](cli):

```
$ cd cli/
$ npm install
$ ./bin/jitsi-provisioner users create myuser --password mypassword --role admin
$ ./bin/jitsi-provisioner users remove myuser
```

### Changing user password

```
$ ./bin/jitsi-provisioner users changePassword myuser mypassword
```

### Changing user role

A non-admin user can only provision and terminate available instances. They cannot create new instances or AMIs.

```
$ ./bin/jitsi-provisioner users changeRole myuser user
```

## CLI

You can also use the [CLI](cli) to manage your whole setup. If you want to just use the CLI or the API, you can disable the web client completely by setting `NO_CLIENT=1` on your `.env`.

You can also install the CLI globally and connect to remote Jitsi Provisioner apps. [Read more about using the CLI](cli).

## Volume and data

Database and instance configuration data are persisted inside the `DATA_PATH` defined in `.env`, which is `.data/` by default. This variable is not passed to the container, instead used to create a local volume for the container.

### Data directory structure

```
├── db ........................... Database directory
│   ├── amis.db .................. AMIs database
│   ├── aws.db ................... AWS instance types and prices pulled from ec2instances.info
│   ├── history.db ............... Instances state history database
│   ├── instances.db.............. Instances database
│   └── users.db ................. Users database
├── amis ......................... AMIs root directory
│   └── 72df3c ................... AMI directory with config data
│       ├── terraform.tfstate .... Terraform state file
│       └── tfcreate ............. Terraform creation plan
└── instances .................... Instances root directory
    └── 2a6e43 ................... Instance directory with config data and keys
        ├── eip .................. Directory containing terraform state and plan for the EIP
        ├── instance ............. Directory containing terraform state and plan for the instance
        ├── certificate.tar.gz ... LetsEncrypt certificate
        ├── jitsi.tar.gz ......... Jitsi config
        ├── recordings.tar.gz .... Jitsi recordings
        ├── transcripts.tar.gz ... Jitsi transcripts
        ├── key.pem .............. AWS private key for server access
        └── key.pem.pub .......... AWS public key
```

## Development

Use docker for development environment, with `docker-compose.dev.yml` compose file:

```
$ docker-compose -f docker-compose.dev.yml up
```

## Important information

Always remember to check [Amazon EC2 pricing table](https://aws.amazon.com/ec2/pricing/on-demand/) and your [billing dashboard](https://console.aws.amazon.com/billing/home).

AWS instance cost estimates are not guaranteed to be accurate or current.

This project is experimental and has no relation to [Jitsi.org](https://jitsi.org/).
