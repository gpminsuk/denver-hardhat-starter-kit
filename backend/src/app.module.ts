import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { MongooseModule } from "@nestjs/mongoose";
import { UserModule } from "./user/user.module";
import { MagicStrategy } from "./auth/magic-auth.guard";
import { EventModule } from "./event/event.module";

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI),
    UserModule,
    EventModule,
  ],
  controllers: [AppController],
  providers: [AppService, MagicStrategy],
})
export class AppModule {}
