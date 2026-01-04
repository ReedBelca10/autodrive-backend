import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Contact, ContactDocument } from './schemas/contact.schema';
import * as nodemailer from 'nodemailer';

@Injectable()
export class ContactService {
  private transporter: nodemailer.Transporter;

  constructor(@InjectModel(Contact.name) private contactModel: Model<ContactDocument>) {
    // Configurer Nodemailer pour envoyer des emails
    // En production, utilisez des variables d'environnement pour les credentials
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'your-app-password',
      },
    });
  }

  async createContact(createContactDto: { name: string; email: string; message: string }) {
    try {
      // 1. Stocker le message en base de données
      const contact = new this.contactModel(createContactDto);
      const savedContact = await contact.save();
      console.log('[contact.service] Message sauvegardé en BD:', savedContact._id);

      // 2. Envoyer un email à testneyla@gmail.com
      try {
        const mailOptions = {
          from: process.env.EMAIL_USER || 'your-email@gmail.com',
          to: 'testneyla@gmail.com',
          replyTo: createContactDto.email, // Permettre de répondre à l'utilisateur
          subject: `Nouveau message de ${createContactDto.name}`,
          html: `
            <h2>Nouveau message de contact</h2>
            <p><strong>De:</strong> ${createContactDto.name} (${createContactDto.email})</p>
            <hr>
            <h3>Message:</h3>
            <p>${createContactDto.message.replace(/\n/g, '<br>')}</p>
            <hr>
            <small>Message reçu le ${new Date().toLocaleString('fr-FR')}</small>
          `,
        };

        await this.transporter.sendMail(mailOptions);
        console.log('[contact.service] Email envoyé avec succès à testneyla@gmail.com');
      } catch (emailError) {
        console.error('[contact.service] Erreur lors de l\'envoi du mail:', emailError?.message || emailError);
        // Ne pas faire échouer la requête si l'email ne s'envoie pas
        // Le message est quand même sauvegardé en BD
      }

      return savedContact;
    } catch (error) {
      console.error('[contact.service] Erreur lors de la création du message:', error?.message || error);
      throw error;
    }
  }

  async getAllContacts() {
    return this.contactModel.find().sort({ createdAt: -1 }).exec();
  }

  async getContactById(id: string) {
    return this.contactModel.findById(id).exec();
  }

  async markAsRead(id: string) {
    return this.contactModel.findByIdAndUpdate(id, { read: true }).exec();
  }
}
