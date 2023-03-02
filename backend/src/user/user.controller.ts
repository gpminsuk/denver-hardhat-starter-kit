import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { MagicAuthGuard } from "src/auth/magic-auth.guard";
import { AddEventDto, AddUserDto, InviteUserDto } from "./user.dto";
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

  @Post("/event")
  @UseGuards(MagicAuthGuard)
  async eventAdded(@Req() req, @Body() body: AddEventDto) {
    return await this.userService.addEvent(req.user.email, body);
  }

  @Get("/events")
  @UseGuards(MagicAuthGuard)
  async getOngoingEvents(@Req() req) {
    return await this.userService.getEvents(req.user.email);
  }

  @Post("/invite/:id")
  @UseGuards(MagicAuthGuard)
  async inviteUser(@Req() req, @Body() body: InviteUserDto) {
    return await this.userService.inviteUser(req.user.email, body);
  }
}
