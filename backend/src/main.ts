import * as _ from "lodash";
const fs = require("fs");

if (fs.existsSync("secrets.json")) {
  var secrets_json = require("../secrets.json");
  var secrets = {};
  for (var index in secrets_json) {
    var item = secrets_json[index];
    secrets[item.name] = item.value;
  }
  process.env = _.extend(process.env, secrets);
}

import { NestFactory } from "@nestjs/core";
import { Logger } from "@nestjs/common";
import { AppModule } from "./app.module";
import cookieParser from "cookie-parser";

import dot from "dot-object";

dot.keepArray = true;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: [/http:\/\/localhost/, "https://app.rubix.social"],
      credentials: true,
    },
  });
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 3000, () => {
    Logger.log(`Listening on ${process.env.PORT ?? 3000}`, "App");
  });
}
bootstrap();
