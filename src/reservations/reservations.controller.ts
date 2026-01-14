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
  Res,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReservationsService } from './reservations.service';
import { Request, Response } from 'express';

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

  @Get('fedapay-callback')
  async handleFedapayRedirect(@Res() res: Response) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    // On renvoie une petite page HTML qui ferme la fenêtre (si c'est un popup)
    // ou redirige vers le profil (si c'est la fenêtre principale)
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Paiement AutoDrive</title>
          <style>
            body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f9fafb; }
            .card { background: white; padding: 2rem; border-radius: 12px; shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); text-align: center; }
            .loader { border: 3px solid #f3f3f3; border-top: 3px solid #3b82f6; border-radius: 50%; width: 24px; height: 24px; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="loader"></div>
            <p>Paiement validé ! Fermeture de la fenêtre...</p>
            <script>
              setTimeout(function() {
                if (window.opener || window.history.length === 1) {
                  window.close();
                } else {
                  window.location.href = "${frontendUrl}/profile/reservations";
                }
              }, 1500);
            </script>
          </div>
        </body>
      </html>
    `);
  }

  @Post('fedapay-callback')
  async handleFedapayCallback(@Body() payload: any) {
    // Endpoint pour recevoir les webhooks de FedaPay (POST)
    return await this.reservationsService.handleFedapayCallback(payload);
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
