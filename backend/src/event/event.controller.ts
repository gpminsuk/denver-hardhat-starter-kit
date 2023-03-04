import {
  Get,
  Controller,
  Param,
  UseGuards,
  Post,
  Req,
  Body,
} from "@nestjs/common";
import { MagicAuthGuard } from "src/auth/magic-auth.guard";
import { AddBadgeDto, AddEventDto } from "./event.dto";
import { EventService } from "./event.service";

@Controller("/event")
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get("/:id")
  async getEvent(@Param("id") id: string) {
    return await this.eventService.getEvent(id);
  }

  @Get("/")
  @UseGuards(MagicAuthGuard)
  async getEvents(@Req() req) {
    return await this.eventService.getEvents(req.user.id);
  }

  @Post("/")
  @UseGuards(MagicAuthGuard)
  async addEvent(@Req() req, @Body() body: AddEventDto) {
    return await this.eventService.addEvent(req.user.id, body);
  }

  @Post("/:id/badge")
  @UseGuards(MagicAuthGuard)
  async addBadge(@Req() req, @Param("id") id, @Body() body: AddBadgeDto) {
    return await this.eventService.addBadge(id, req.user.id, body);
  }
}
