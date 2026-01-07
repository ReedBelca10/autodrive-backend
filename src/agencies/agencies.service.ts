import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AgenciesService {
  constructor(@InjectModel('Agency') private agencyModel: Model<any>) {}

  async create(createAgencyDto: any) {
    const agency = new this.agencyModel(createAgencyDto);
    return (await agency.save()).populate('managerId', 'fullName email');
  }

  async findAll() {
    return this.agencyModel.find({ isActive: { $ne: false } }).populate('managerId', 'fullName email').lean();
  }

  async findById(id: string) {
    return this.agencyModel.findById(id).populate('managerId', 'fullName email').lean();
  }

  async update(id: string, updateAgencyDto: any) {
    const updateData: any = {};
    Object.keys(updateAgencyDto).forEach(key => {
      updateData[key] = updateAgencyDto[key] !== undefined ? updateAgencyDto[key] : '';
    });
    return this.agencyModel.findByIdAndUpdate(id, updateData, { new: true }).populate('managerId', 'fullName email').lean();
  }

  async delete(id: string) {
    const result = await this.agencyModel.findByIdAndDelete(id).lean();
    if (!result) throw new Error('Agence non trouvée');
    return { message: 'Agence supprimée avec succès' };
  }

  async toggleStatus(id: string) {
    const agency = await this.agencyModel.findById(id) as any;
    if (!agency) throw new Error('Agence non trouvée');
    
    const newStatus = !(agency.isActive || false);
    const updated = await this.agencyModel.findByIdAndUpdate(id, { isActive: newStatus }, { new: true }).populate('managerId', 'fullName email').lean();
    return updated;
  }

  async count() {
    return this.agencyModel.countDocuments({ isActive: true });
  }
}

