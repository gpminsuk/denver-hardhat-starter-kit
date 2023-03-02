import { Injectable } from "@nestjs/common";
import { Magic } from "@magic-sdk/admin";
import { Strategy, VerifiedCallback } from "passport-custom";
import { PassportStrategy } from "@nestjs/passport";
import { AuthGuard } from "@nestjs/passport";
import { UserService } from "src/user/user.service";

@Injectable()
export class MagicStrategy extends PassportStrategy(Strategy, "magic") {
  magic: Magic;

  constructor(readonly userService: UserService) {
    super((req: Request, done: VerifiedCallback) => {
      const did = this.magic.token.getIssuer(req.headers["magic-token"]);
      this.userService
        .getUser(did)
        .then(async (user) => {
          if (user) {
            done(undefined, user);
          } else {
            const metadata = await this.magic.users.getMetadataByToken(
              req.headers["magic-token"]
            );
            user = await this.userService.addUser({
              did,
              email: metadata.email,
              publicAddress: metadata.publicAddress,
              magicIdToken: req.headers["magic-token"],
            });
            done(undefined, user);
          }
        })
        .catch((err) => {
          done(err, undefined);
        });
    });
    this.magic = new Magic(process.env.MAGIC_SECRET_KEY);
  }
}

@Injectable()
export class MagicAuthGuard extends AuthGuard("magic") {
  constructor() {
    super({});
  }
}