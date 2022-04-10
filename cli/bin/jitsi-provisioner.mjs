#!/usr/bin/env node

import { Command } from "commander";

import auth from "../programs/auth.mjs";
import instances from "../programs/instances.mjs";
import users from "../programs/users.mjs";

async function jitsiProvisioner() {
  const program = new Command();

  program.addCommand(auth());
  program.addCommand(users());
  program.addCommand(instances());

  process.on("uncaughtException", function (err) {
    console.error(err.message || err);
    process.exit(1);
  });

  await program.parseAsync(process.argv);
}

jitsiProvisioner();
