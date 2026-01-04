import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../common/guards/admin.guard';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Controller('admin/dashboard')
@UseGuards(AdminGuard)
export class AdminDashboardController {
  constructor(
    @InjectModel('User') private userModel: Model<any>,
    @InjectModel('Vehicle') private vehicleModel: Model<any>,
    @InjectModel('Reservation') private reservationModel: Model<any>,
  ) {}

  @Get('stats')
  async getStats() {
    try {
      const totalUsers = await this.userModel.countDocuments({ role: 'client' });
      const totalManagers = await this.userModel.countDocuments({ role: 'manager' });
      const totalVehicles = await this.vehicleModel.countDocuments();
      const totalReservations = await this.reservationModel.countDocuments();

      return {
        totalUsers,
        totalManagers,
        totalVehicles,
        totalReservations,
      };
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
      throw err;
    }
  }

  @Get('users')
  async getAllUsers() {
    try {
      return await this.userModel
        .find({ role: 'client' })
        .select('-password')
        .limit(50)
        .lean();
    } catch (err) {
      console.error('Erreur lors du chargement des utilisateurs:', err);
      throw err;
    }
  }

  @Get('managers')
  async getAllManagers() {
    try {
      return await this.userModel
        .find({ role: 'manager' })
        .select('-password')
        .limit(50)
        .lean();
    } catch (err) {
      console.error('Erreur lors du chargement des managers:', err);
      throw err;
    }
  }

  @Get('vehicles')
  async getAllVehicles() {
    try {
      return await this.vehicleModel.find().limit(50).lean();
    } catch (err) {
      console.error('Erreur lors du chargement des véhicules:', err);
      throw err;
    }
  }

  @Get('reservations')
  async getAllReservations() {
    try {
      return await this.reservationModel
        .find()
        .populate('userId', 'email fullName')
        .populate('vehicleId', 'brand model')
        .limit(50)
        .lean();
    } catch (err) {
      console.error('Erreur lors du chargement des réservations:', err);
      throw err;
    }
  }
}