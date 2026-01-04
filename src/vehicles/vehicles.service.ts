import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateVehicleDto, UpdateVehicleDto } from './dtos/vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectModel('Vehicle') private vehicleModel: Model<any>,
  ) {}

  async create(createVehicleDto: CreateVehicleDto) {
    const vehicle = new this.vehicleModel(createVehicleDto);
    return await vehicle.save();
  }

  async findAll() {
    return await this.vehicleModel.find().exec();
  }

  async findById(id: string) {
    return await this.vehicleModel.findById(id).exec();
  }

  async update(id: string, updateVehicleDto: UpdateVehicleDto) {
    return await this.vehicleModel.findByIdAndUpdate(id, updateVehicleDto, {
      new: true,
    }).exec();
  }

  async delete(id: string) {
    return await this.vehicleModel.findByIdAndDelete(id).exec();
  }
}
