import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Req,
    UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FaqService } from './faq.service';
import { CreateFaqDto } from './dtos/create-faq.dto';
import { UpdateFaqDto } from './dtos/update-faq.dto';

@Controller('faq')
export class FaqController {
    constructor(private readonly faqService: FaqService) { }

    @Post()
    @UseGuards(AuthGuard('jwt'))
    create(@Body() createFaqDto: CreateFaqDto, @Req() req: any) {
        this.checkAdminAction(req);
        return this.faqService.create(createFaqDto);
    }

    @Get()
    findAll() {
        return this.faqService.findAll(true);
    }

    @Get('admin')
    @UseGuards(AuthGuard('jwt'))
    findAllAdmin(@Req() req: any) {
        this.checkAdminAction(req);
        return this.faqService.findAll(false);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.faqService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(AuthGuard('jwt'))
    update(
        @Param('id') id: string,
        @Body() updateFaqDto: UpdateFaqDto,
        @Req() req: any,
    ) {
        this.checkAdminAction(req);
        return this.faqService.update(id, updateFaqDto);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'))
    remove(@Param('id') id: string, @Req() req: any) {
        this.checkAdminAction(req);
        return this.faqService.remove(id);
    }

    private checkAdminAction(req: any) {
        const userRole = req.user?.role;
        if (userRole !== 'admin' && userRole !== 'manager') {
            throw new UnauthorizedException('Access restricted to admin and managers');
        }
    }
}
