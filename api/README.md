# Jitsi Provisioner JS API

JavaScript API for the Jitsi Provisioner

## Installation

```
$ npm install --save @jitsi-provisioner/api
```

## Usage

```js
const io = require("socket.io-client");
const JitsiProvisionerAPI = require("@jitsi-provisioner/api");

const api = new JitsiProvisionerAPI({
  io: io,
  url: "https://meet.peixe.co",
  storage: window.localStorage, // Optional
});

// Terminating `my-instance`
api.instances.find({ query: { name: "my-instance" } }).then((instances) => {
  api.instances.terminate(instances[0]._id);
});
```
