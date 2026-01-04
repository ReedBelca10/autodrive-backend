import { Model } from 'mongoose';
import { Contact, ContactDocument } from './schemas/contact.schema';
export declare class ContactService {
    private contactModel;
    private transporter;
    constructor(contactModel: Model<ContactDocument>);
    createContact(createContactDto: {
        name: string;
        email: string;
        message: string;
    }): Promise<import("mongoose").Document<unknown, {}, ContactDocument> & Contact & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    getAllContacts(): Promise<(import("mongoose").Document<unknown, {}, ContactDocument> & Contact & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    getContactById(id: string): Promise<import("mongoose").Document<unknown, {}, ContactDocument> & Contact & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    markAsRead(id: string): Promise<import("mongoose").Document<unknown, {}, ContactDocument> & Contact & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
}
