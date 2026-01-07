import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  Req,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReservationsService } from './reservations.service';
import { Request } from 'express';

@Controller('reservations')
export class ReservationsController {
  constructor(private reservationsService: ReservationsService) { }

  @UseGuards(AuthGuard('jwt'))
  @Get('admin/all')
  async getAllReservationsAdmin(@Req() req: Request) {
    const user: any = (req as any).user;
    const userRole = user?.role;
    const userId = user?.userId || user?.sub || user?.id;

    // Admin voit toutes les réservations
    if (userRole === 'admin') {
      return await this.reservationsService.findAllWithDetails();
    }

    // Manager voit seulement les réservations de ses véhicules
    if (userRole === 'manager') {
      return await this.reservationsService.findAllByManager(userId);
    }

    throw new ForbiddenException('Accès réservé aux administrateurs et managers');
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll(@Req() req: Request) {
    const user: any = (req as any).user;
    const userId = user?.userId || user?.sub || user?.id;
    if (!userId) throw new BadRequestException('Utilisateur non trouvé');
    return await this.reservationsService.findByUserId(userId);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.reservationsService.findById(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(@Body() reservationData: any, @Req() req: Request) {
    const user: any = (req as any).user;
    const userId = user?.userId || user?.sub || user?.id;
    if (!userId) throw new BadRequestException('Utilisateur non trouvé');

    return await this.reservationsService.create({
      ...reservationData,
      userId
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/cancel')
  async cancelReservation(@Param('id') id: string, @Req() req: Request) {
    const user: any = (req as any).user;
    const userId = user?.userId || user?.sub || user?.id;
    if (!userId) throw new BadRequestException('Utilisateur non trouvé');
    return await this.reservationsService.cancelReservation(id, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/confirm')
  async confirmReservation(@Param('id') id: string, @Req() req: Request) {
    const user: any = (req as any).user;
    const userId = user?.userId || user?.sub || user?.id;
    if (!userId) throw new BadRequestException('Utilisateur non trouvé');
    return await this.reservationsService.confirmReservation(id, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/archive')
  async archiveReservation(@Param('id') id: string, @Req() req: Request) {
    const user: any = (req as any).user;
    const userId = user?.userId || user?.sub || user?.id;
    const userRole = user?.role;
    if (!userId) throw new BadRequestException('Utilisateur non trouvé');
    return await this.reservationsService.archiveReservation(id, userId, userRole);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: Request) {
    const user: any = (req as any).user;
    const userId = user?.userId || user?.sub || user?.id;
    const userRole = user?.role;
    if (!userId) throw new BadRequestException('Utilisateur non trouvé');
    return await this.reservationsService.delete(id, userId, userRole);
  }
  @UseGuards(AuthGuard('jwt'))
  @Post(':id/payment-intent')
  async createPaymentIntent(
    @Param('id') id: string,
    @Body() body: { gateway?: 'stripe' | 'fedapay' },
    @Req() req: Request
  ) {
    const user: any = (req as any).user;
    const userId = user?.userId || user?.sub || user?.id;
    if (!userId) throw new BadRequestException('Utilisateur non trouvé');
    const gateway = body?.gateway || 'stripe';
    return await this.reservationsService.createPaymentIntent(id, userId, gateway);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/confirm-payment')
  async confirmPayment(@Param('id') id: string, @Body('paymentIntentId') paymentIntentId: string, @Req() req: Request) {
    const user: any = (req as any).user;
    const userId = user?.userId || user?.sub || user?.id;
    if (!userId) throw new BadRequestException('Utilisateur non trouvé');
    return await this.reservationsService.verifyPaymentAndConfirm(id, userId, paymentIntentId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/confirm-fedapay')
  async confirmFedapayPayment(
    @Param('id') id: string,
    @Body() body: { transactionId?: string },
    @Req() req: Request
  ) {
    const user: any = (req as any).user;
    const userId = user?.userId || user?.sub || user?.id;
    if (!userId) throw new BadRequestException('Utilisateur non trouvé');
    if (!body?.transactionId) throw new BadRequestException('Transaction ID manquant');
    return await this.reservationsService.verifyFedapayPayment(id, userId, body.transactionId);
  }

  @Post('fedapay-callback')
  async handleFedapayCallback(@Body() payload: any) {
    // Endpoint pour recevoir les webhooks de FedaPay
    // Note: En production, vous devriez vérifier la signature du webhook
    return await this.reservationsService.handleFedapayCallback(payload);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id/fedapay-status')
  async getFedapayPaymentStatus(
    @Param('id') id: string,
    @Req() req: Request
  ) {
    const user: any = (req as any).user;
    const userId = user?.userId || user?.sub || user?.id;
    if (!userId) throw new BadRequestException('Utilisateur non trouvé');
    return await this.reservationsService.getFedapayPaymentStatus(id, userId);
  }
}
