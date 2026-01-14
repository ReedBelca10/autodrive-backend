import { Controller, Post, Get, Body, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NewsletterService } from './newsletter.service';
import { SubscribeDto } from './dtos/subscribe.dto';

@Controller('newsletter')
export class NewsletterController {
    constructor(private readonly newsletterService: NewsletterService) { }

    @Post('subscribe')
    subscribe(@Body() subscribeDto: SubscribeDto) {
        return this.newsletterService.subscribe(subscribeDto.email);
    }

    @Get('admin')
    @UseGuards(AuthGuard('jwt'))
    findAll(@Req() req: any) {
        const userRole = req.user?.role;
        if (userRole !== 'admin' && userRole !== 'manager') {
            throw new UnauthorizedException('Access restricted to admin and managers');
        }
        return this.newsletterService.findAll();
    }
}
