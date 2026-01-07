import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configurer le transporteur d'email
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendPasswordResetEmail(email: string, fullName: string, resetToken: string) {
    const resetLink = `${process.env.FRONTEND_ORIGIN || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Réinitialisation de votre mot de passe</h2>
        <p>Bonjour ${fullName},</p>
        <p>Vous avez demandé une réinitialisation de votre mot de passe AutoDrive.</p>
        <p>Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe:</p>
        <p style="margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #0066cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Réinitialiser mon mot de passe
          </a>
        </p>
        <p>Ou copiez ce lien dans votre navigateur:</p>
        <p style="word-break: break-all; color: #666;">${resetLink}</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">
          Ce lien est valide pendant 1 heure.<br>
          Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
        </p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Réinitialisation de votre mot de passe AutoDrive',
        html: htmlContent,
      });
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      throw new Error('Impossible d\'envoyer l\'email de réinitialisation');
    }
  }

  async sendPasswordChangeConfirmation(email: string, fullName: string) {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Votre mot de passe a été changé</h2>
        <p>Bonjour ${fullName},</p>
        <p>Votre mot de passe AutoDrive a été réinitialisé avec succès.</p>
        <p>Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">
          Si vous avez des questions, contactez notre support.
        </p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Votre mot de passe AutoDrive a été changé',
        html: htmlContent,
      });
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de confirmation:', error);
      throw new Error('Impossible d\'envoyer l\'email de confirmation');
    }
  }
}
