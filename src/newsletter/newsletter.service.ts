import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Newsletter, NewsletterDocument } from './schemas/newsletter.schema';

@Injectable()
export class NewsletterService {
    constructor(
        @InjectModel(Newsletter.name)
        private newsletterModel: Model<NewsletterDocument>,
    ) { }

    async subscribe(email: string): Promise<Newsletter> {
        const existing = await this.newsletterModel.findOne({ email }).exec();

        if (existing) {
            if (!existing.active) {
                existing.active = true;
                return existing.save();
            }
            return existing;
        }

        const newSubscriber = new this.newsletterModel({ email });
        return newSubscriber.save();
    }

    async findAll(): Promise<Newsletter[]> {
        return this.newsletterModel.find().sort({ createdAt: -1 }).exec();
    }

    async unsubscribe(email: string): Promise<Newsletter | null> {
        return this.newsletterModel.findOneAndUpdate(
            { email },
            { active: false },
            { new: true }
        ).exec();
    }
}
