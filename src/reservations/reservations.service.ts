import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectModel('Reservation') private reservationModel: Model<any>,
  ) {}

  async findAll() {
    return await this.reservationModel
      .find()
      .populate('userId vehicleId')
      .exec();
  }

  async findById(id: string) {
    return await this.reservationModel
      .findById(id)
      .populate('userId vehicleId')
      .exec();
  }

  async create(reservationData: any) {
    const reservation = new this.reservationModel(reservationData);
    return await reservation.save();
  }

  async delete(id: string) {
    return await this.reservationModel.findByIdAndDelete(id).exec();
  }

  async updateStatus(id: string, status: string) {
    return await this.reservationModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();
  }
}
