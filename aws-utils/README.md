# Jitsi Provisioner AWS Utils

AWS Utils for Jitsi Provisioner

```
$ npm install --save @jitsi-provisioner/aws-utils
```

---

## Regions

```
import { regions } from "@jitsi-provisioner/aws-utils";

console.log(regions);
```

## Instances

Instances from ec2instances.info

```
import { instances } from "@jitsi-provisioner/aws-utils";

instances().then((data) => {
  console.log(data);
});
```
