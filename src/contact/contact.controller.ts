import { Controller, Post, Get, Param, Patch, Body, BadRequestException } from '@nestjs/common';
import { ContactService } from './contact.service';
import { IsString, IsEmail, MinLength } from 'class-validator';

class CreateContactDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(10)
  message: string;
}

@Controller('contact')
export class ContactController {
  constructor(private contactService: ContactService) {}

  @Post()
  async create(@Body() createContactDto: CreateContactDto) {
    console.log('[contact.controller] Message reçu:', {
      name: createContactDto.name,
      email: createContactDto.email,
      messageLength: createContactDto.message?.length || 0,
    });

    // La validation de class-validator s'exécute automatiquement via ValidationPipe
    const savedContact = await this.contactService.createContact(createContactDto);

    return {
      success: true,
      message: 'Message envoyé avec succès',
      contactId: savedContact._id,
    };
  }

  @Get()
  async getAll() {
    return await this.contactService.getAllContacts();
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return await this.contactService.getContactById(id);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    return await this.contactService.markAsRead(id);
  }
}
