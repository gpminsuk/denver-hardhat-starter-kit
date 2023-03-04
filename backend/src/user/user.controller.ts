import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { MagicAuthGuard } from "src/auth/magic-auth.guard";
import { AddUserDto, QueueAwardDto } from "./user.dto";
import { UserService } from "./user.service";

@Controller("/user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("/")
  @UseGuards(MagicAuthGuard)
  async getMe(@Req() req) {
    return req.user;
  }

  @Post("/")
  async addUser(@Body() body: AddUserDto) {
    return await this.userService.addUser(body);
  }

  @Get("/users")
  async getUsers(@Query("emails") emails: string) {
    return await this.userService.getUsers(emails.split(","));
  }

  @Post("/users/queue")
  async queueAward(@Body() body: QueueAwardDto) {
    return await this.userService.queueAward(body);
  }
}
