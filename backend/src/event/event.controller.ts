import {
  Post,
  Get,
  Controller,
  Param,
  UseGuards,
  Req,
  Body,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { MagicAuthGuard } from "src/auth/magic-auth.guard";
import { AddEventDto, AwardBadgeDto } from "./event.dto";
import { EventService } from "./event.service";
import { FileInterceptor } from "@nestjs/platform-express";

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

  @Post("/:id/:tokenId/award")
  @UseGuards(MagicAuthGuard)
  async awardBadge(
    @Req() req,
    @Param("id") id,
    @Param("tokenId") tokenId,
    @Body() body: AwardBadgeDto
  ) {
    return await this.eventService.awardBadge(
      req.user.id,
      id,
      tokenId,
      body.email
    );
  }

  @Post("/:id/:tokenId/accept")
  @UseGuards(MagicAuthGuard)
  async acceptBadge(@Req() req, @Param("id") id, @Param("tokenId") tokenId) {
    return await this.eventService.acceptBadge(id, tokenId, req.user.email);
  }

  @Post("/:id/:tokenId/reject")
  @UseGuards(MagicAuthGuard)
  async rejectBadge(@Req() req, @Param("id") id, @Param("tokenId") tokenId) {
    return await this.eventService.rejectBadge(id, tokenId, req.user.email);
  }

  @Post("/file")
  @UseGuards(MagicAuthGuard)
  @UseInterceptors(FileInterceptor("file"))
  async uploadBadgeAttachment(@UploadedFile() file: Express.Multer.File) {
    return await this.eventService.uploadBadgeAttachment(file);
  }
}
