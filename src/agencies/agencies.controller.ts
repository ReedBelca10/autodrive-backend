import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Inject } from '@nestjs/common';
import { AgenciesService } from './agencies.service';
import { AdminGuard } from '../common/guards/admin.guard';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TOGO_CITIES } from './constants/togo-cities';

@Controller('agencies')
export class AgenciesController {
  constructor(
    private agenciesService: AgenciesService,
    @InjectModel('User') private userModel: Model<any>,
  ) {}

  @Get('config/cities')
  async getCities() {
    return { cities: TOGO_CITIES };
  }

  @Get('config/managers')
  @UseGuards(AdminGuard)
  async getManagers() {
    const managers = await this.userModel.find({ role: 'manager' }).select('_id fullName email').lean();
    return managers;
  }

  @Get()
  async findAll() {
    return this.agenciesService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.agenciesService.findById(id);
  }

  @Post()
  @UseGuards(AdminGuard)
  async create(@Body() createAgencyDto: any) {
    return this.agenciesService.create(createAgencyDto);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  async update(@Param('id') id: string, @Body() updateAgencyDto: any) {
    return this.agenciesService.update(id, updateAgencyDto);
  }

  @Put(':id/toggle-status')
  @UseGuards(AdminGuard)
  async toggleStatus(@Param('id') id: string) {
    return this.agenciesService.toggleStatus(id);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  async delete(@Param('id') id: string) {
    return this.agenciesService.delete(id);
  }
}

