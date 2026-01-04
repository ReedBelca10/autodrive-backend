import { Controller, Post, Body, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

@Controller('admin')
export class AdminController {
  constructor(
    private jwtService: JwtService,
    @InjectModel('User') private userModel: Model<any>,
  ) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    try {
      const { email, password } = body;

      // Valide les données
      if (!email || !password) {
        throw new BadRequestException('Email et mot de passe requis');
      }

      // Cherche l'utilisateur avec le rôle admin
      const user = await this.userModel.findOne({ email, role: 'admin' }).select('+password');

      if (!user) {
        throw new UnauthorizedException('Email ou mot de passe incorrect');
      }

      // Vérifie le mot de passe
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Email ou mot de passe incorrect');
      }

      // Génère le JWT
      const token = this.jwtService.sign({
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      });

      return {
        message: 'Connexion réussie',
        token,
        user: {
          _id: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      };
    } catch (err) {
      console.error('Erreur lors de la connexion admin:', err);
      if (err instanceof BadRequestException || err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }
  }
}
