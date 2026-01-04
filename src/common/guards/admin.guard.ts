import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.replace('Bearer ', '');

    if (!token) throw new ForbiddenException('Jeton requis');

    try {
      const decoded = this.jwtService.verify(token);
      if (decoded.role !== 'admin') throw new ForbiddenException('Accès administrateur requis');
      request.user = decoded;
      return true;
    } catch {
      throw new ForbiddenException('Jeton invalide ou expiré');
    }
  }
}