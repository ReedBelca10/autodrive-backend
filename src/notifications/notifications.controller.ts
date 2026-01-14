import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    UseGuards,
    Req,
    BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
    constructor(private notificationsService: NotificationsService) { }

    @Get()
    async findAll(@Req() req: Request) {
        const user: any = (req as any).user;
        const userId = user?.userId || user?.sub || user?.id;
        if (!userId) throw new BadRequestException('Utilisateur non trouvé');
        return await this.notificationsService.findAllByRecipient(userId);
    }

    @Patch(':id/read')
    async markAsRead(@Param('id') id: string) {
        return await this.notificationsService.markAsRead(id);
    }

    @Post(':id/reply')
    async addReply(
        @Param('id') id: string,
        @Req() req: Request,
        @Body('content') content: string,
    ) {
        const user: any = (req as any).user;
        const userId = user?.userId || user?.sub || user?.id;
        if (!userId) throw new BadRequestException('Utilisateur non trouvé');
        if (!content) throw new BadRequestException('Le contenu de la réponse est requis');

        return await this.notificationsService.addReply(id, userId, content);
    }
}
