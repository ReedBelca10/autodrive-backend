"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const contact_schema_1 = require("./schemas/contact.schema");
const nodemailer = __importStar(require("nodemailer"));
let ContactService = class ContactService {
    constructor(contactModel) {
        this.contactModel = contactModel;
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER || 'your-email@gmail.com',
                pass: process.env.EMAIL_PASSWORD || 'your-app-password',
            },
        });
    }
    async createContact(createContactDto) {
        try {
            const contact = new this.contactModel(createContactDto);
            const savedContact = await contact.save();
            console.log('[contact.service] Message sauvegardé en BD:', savedContact._id);
            try {
                const mailOptions = {
                    from: process.env.EMAIL_USER || 'your-email@gmail.com',
                    to: 'testneyla@gmail.com',
                    replyTo: createContactDto.email,
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
            }
            catch (emailError) {
                console.error('[contact.service] Erreur lors de l\'envoi du mail:', (emailError === null || emailError === void 0 ? void 0 : emailError.message) || emailError);
            }
            return savedContact;
        }
        catch (error) {
            console.error('[contact.service] Erreur lors de la création du message:', (error === null || error === void 0 ? void 0 : error.message) || error);
            throw error;
        }
    }
    async getAllContacts() {
        return this.contactModel.find().sort({ createdAt: -1 }).exec();
    }
    async getContactById(id) {
        return this.contactModel.findById(id).exec();
    }
    async markAsRead(id) {
        return this.contactModel.findByIdAndUpdate(id, { read: true }).exec();
    }
};
exports.ContactService = ContactService;
exports.ContactService = ContactService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(contact_schema_1.Contact.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ContactService);
