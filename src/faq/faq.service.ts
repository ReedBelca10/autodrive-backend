import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Faq, FaqDocument } from './schemas/faq.schema';
import { CreateFaqDto } from './dtos/create-faq.dto';
import { UpdateFaqDto } from './dtos/update-faq.dto';

@Injectable()
export class FaqService {
    constructor(
        @InjectModel(Faq.name)
        private faqModel: Model<FaqDocument>,
    ) { }

    async create(createFaqDto: CreateFaqDto): Promise<Faq> {
        const createdFaq = new this.faqModel(createFaqDto);
        return createdFaq.save();
    }

    async findAll(publishedOnly: boolean = false): Promise<Faq[]> {
        const query = publishedOnly ? { published: true } : {};
        return this.faqModel.find(query).sort({ order: 1, createdAt: -1 }).exec();
    }

    async findOne(id: string): Promise<Faq> {
        const faq = await this.faqModel.findById(id).exec();
        if (!faq) {
            throw new NotFoundException(`FAQ with ID ${id} not found`);
        }
        return faq;
    }

    async update(id: string, updateFaqDto: UpdateFaqDto): Promise<Faq> {
        const updatedFaq = await this.faqModel
            .findByIdAndUpdate(id, updateFaqDto, { new: true })
            .exec();
        if (!updatedFaq) {
            throw new NotFoundException(`FAQ with ID ${id} not found`);
        }
        return updatedFaq;
    }

    async remove(id: string): Promise<void> {
        const result = await this.faqModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new NotFoundException(`FAQ with ID ${id} not found`);
        }
    }
}
