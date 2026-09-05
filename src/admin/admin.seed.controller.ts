import { Controller, Post, Body, Headers, BadRequestException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

@Controller('admin')
export class AdminSeedController {
  constructor(@InjectModel('User') private userModel: Model<any>) {}

  @Post('create')
  async createAdmin(
    @Headers('x-admin-seed-key') key: string,
    @Body() body: { email: string; password: string; fullName?: string },
  ) {
    try {
      console.log('Clé d\'administration reçue:', key);
      console.log('Clé d\'administration attendue:', process.env.ADMIN_SEED_KEY);

      if (!process.env.ADMIN_SEED_KEY) throw new BadRequestException('Clé d\'administration non configurée sur le serveur');
      if (key !== process.env.ADMIN_SEED_KEY) throw new ForbiddenException('Clé d\'administration invalide');

      const { email, password, fullName } = body;
      if (!email || !password) throw new BadRequestException('Email et mot de passe requis');

      const hashedPassword = await bcrypt.hash(password, 10);

      const existing = await this.userModel.findOne({ email });
      if (existing) {
        existing.role = 'admin';
        existing.password = hashedPassword;
        if (fullName) existing.fullName = fullName;
        await existing.save();
        return { message: 'Utilisateur promu administrateur' };
      }

      const newAdmin = new this.userModel({ email, password: hashedPassword, fullName: fullName || 'Admin', role: 'admin' });
      await newAdmin.save();
      return { message: 'Administrateur créé avec succès' };
    } catch (err) {
      console.error('Erreur AdminSeedController:', err);
      if (err instanceof BadRequestException || err instanceof ForbiddenException) throw err;
      throw new InternalServerErrorException(err instanceof Error ? err.message : 'Erreur interne du serveur');
    }
  }
}