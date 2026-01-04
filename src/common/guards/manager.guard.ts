import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ManagerGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    
    // Try to get token from cookies first (HttpOnly cookies)
    let token = request.cookies?.autodrive_token;
    
    // Fallback to Authorization header if no cookie
    if (!token) {
      token = request.headers.authorization?.replace('Bearer ', '');
    }

    if (!token) throw new ForbiddenException('Jeton requis');

    try {
      const decoded = this.jwtService.verify(token, { secret: process.env.JWT_SECRET || 'change_me' });
      if (decoded.role !== 'manager' && decoded.role !== 'admin') {
        throw new ForbiddenException('Accès manager requis');
      }
      request.user = decoded;
      return true;
    } catch {
      throw new ForbiddenException('Jeton invalide ou expiré');
    }
  }
}
