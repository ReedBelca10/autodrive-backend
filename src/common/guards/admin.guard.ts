import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    
    // Essayer d'obtenir le jeton des cookies en premier (cookies HttpOnly)
    let token = request.cookies?.autodrive_token;
    
    // Retour au header Authorization s'il n'y a pas de cookie
    if (!token) {
      token = request.headers.authorization?.replace('Bearer ', '');
    }

    if (!token) throw new ForbiddenException('Jeton requis');

    try {
      const decoded = this.jwtService.verify(token, { secret: process.env.JWT_SECRET || 'change_me' });
      if (decoded.role !== 'admin') throw new ForbiddenException('Accès administrateur requis');
      request.user = decoded;
      return true;
    } catch {
      throw new ForbiddenException('Jeton invalide ou expiré');
    }
  }
}