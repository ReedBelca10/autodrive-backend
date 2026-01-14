import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ _id: false })
class Reply {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    senderId: MongooseSchema.Types.ObjectId;

    @Prop({ required: true })
    content: string;

    @Prop({ default: Date.now })
    createdAt: Date;
}

const ReplySchema = SchemaFactory.createForClass(Reply);

@Schema({ timestamps: true })
export class Notification {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    recipientId: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false })
    senderId?: MongooseSchema.Types.ObjectId;

    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    content: string;

    @Prop({
        required: true,
        enum: ['reservation_new', 'reservation_confirmed', 'message'],
        default: 'message'
    })
    type: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Reservation', required: false })
    reservationId?: MongooseSchema.Types.ObjectId;

    @Prop({ default: false })
    isRead: boolean;

    @Prop({ type: [ReplySchema], default: [] })
    replies: Reply[];
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
