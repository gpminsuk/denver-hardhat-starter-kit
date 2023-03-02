import _ from "lodash";
import fs from "fs";
import parse from "csv-parser";

if (fs.existsSync("secrets.json")) {
  var secrets_json = require("../secrets.json");
  var secrets = {};
  for (var index in secrets_json) {
    var item = secrets_json[index];
    secrets[item.name] = item.value;
  }
  process.env = _.extend(process.env, secrets);
}

import { AppModule } from "./app.module";
import { NestFactory } from "@nestjs/core";
import minimist from "minimist";
import { INestApplicationContext } from "@nestjs/common";

function scriptMain() {
  return async (
    scriptToRun: (app: INestApplicationContext, parsedArgs: any) => void
  ) => {
    const app = await NestFactory.createApplicationContext(AppModule);
    const parsedArgs = minimist(process.argv.slice(2));
    try {
      await scriptToRun(app, parsedArgs);
    } finally {
      await app.close();
      process.exit(0);
    }
  };
}

export const main = scriptMain();

export const readCsv = async (filename: string) => {
  const records = [];
  const parser = fs.createReadStream(filename).pipe(parse({}));
  for await (const record of parser) {
    records.push(record);
  }
  return records;
};
