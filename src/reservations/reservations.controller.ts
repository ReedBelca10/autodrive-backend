import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';

@Controller('reservations')
export class ReservationsController {
  constructor(private reservationsService: ReservationsService) {}

  @Get()
  async findAll() {
    return await this.reservationsService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.reservationsService.findById(id);
  }

  @Post()
  async create(@Body() reservationData: any) {
    return await this.reservationsService.create(reservationData);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.reservationsService.delete(id);
  }
}
