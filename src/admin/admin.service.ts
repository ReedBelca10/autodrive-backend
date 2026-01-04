import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { AdminLoginDto } from './dtos/admin-login.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel('User') private userModel: Model<any>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: AdminLoginDto) {
    const user = await this.userModel.findOne({ email: loginDto.email }).select('+password');

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    if (user.role !== 'admin') {
      throw new UnauthorizedException('Accès admin requis');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Mot de passe incorrect');
    }

    const token = this.jwtService.sign({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return { token, admin: { id: user._id, email: user.email, role: user.role } };
  }

  async validateAdmin(id: string) {
    return await this.userModel.findOne({ _id: id, role: 'admin' }).select('-password');
  }
}
