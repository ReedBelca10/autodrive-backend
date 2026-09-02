import { Controller, Post, Body, Headers, BadRequestException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

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

      const existing = await this.userModel.findOne({ email });
      if (existing) {
        existing.role = 'admin';
        existing.password = password;
        if (fullName) existing.fullName = fullName;
        await existing.save();
        return { message: 'Utilisateur promu administrateur' };
      }

      await this.userModel.create({ email, password, fullName: fullName || 'Admin', role: 'admin' });
      return { message: 'Administrateur créé avec succès' };
    } catch (err) {
      console.error('Erreur AdminSeedController:', err);
      if (err instanceof BadRequestException || err instanceof ForbiddenException) throw err;
      throw new InternalServerErrorException(err instanceof Error ? err.message : 'Erreur interne du serveur');
    }
  }
}