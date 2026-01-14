import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
        @InjectModel('User') private userModel: Model<any>,
    ) { }

    async create(data: {
        recipientId: string;
        senderId?: string;
        title: string;
        content: string;
        type: string;
        reservationId?: string;
    }): Promise<NotificationDocument> {
        const notification = new this.notificationModel({
            ...data,
            recipientId: new Types.ObjectId(data.recipientId),
            senderId: data.senderId ? new Types.ObjectId(data.senderId) : undefined,
            reservationId: data.reservationId ? new Types.ObjectId(data.reservationId) : undefined,
        });
        return await notification.save();
    }

    async findAllByRecipient(recipientId: string): Promise<NotificationDocument[]> {
        return await this.notificationModel
            .find({ recipientId: new Types.ObjectId(recipientId) })
            .populate('senderId', 'fullName email avatarUrl')
            .populate({
                path: 'reservationId',
                populate: { path: 'vehicleId', select: 'name' }
            })
            .sort({ createdAt: -1 })
            .exec();
    }

    async markAsRead(id: string): Promise<NotificationDocument> {
        const notification = await this.notificationModel.findByIdAndUpdate(
            id,
            { isRead: true },
            { new: true },
        ).exec();
        if (!notification) {
            throw new NotFoundException('Notification non trouvée');
        }
        return notification;
    }

    async addReply(id: string, senderId: string, content: string): Promise<NotificationDocument> {
        const notification = await this.notificationModel.findById(id).exec();
        if (!notification) {
            throw new NotFoundException('Notification non trouvée');
        }

        notification.replies.push({
            senderId: new Types.ObjectId(senderId) as any,
            content,
            createdAt: new Date(),
        });

        return await notification.save();
    }

    async notifyAdmins(data: {
        senderId?: string;
        title: string;
        content: string;
        type: string;
        reservationId?: string;
    }): Promise<void> {
        const admins = await this.userModel.find({ role: 'admin' }).exec();
        for (const admin of admins) {
            await this.create({
                ...data,
                recipientId: admin._id.toString(),
            });
        }
    }
}
