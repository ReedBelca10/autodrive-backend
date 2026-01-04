import { ContactService } from './contact.service';
declare class CreateContactDto {
    name: string;
    email: string;
    message: string;
}
export declare class ContactController {
    private contactService;
    constructor(contactService: ContactService);
    create(createContactDto: CreateContactDto): Promise<{
        success: boolean;
        message: string;
        contactId: any;
    }>;
    getAll(): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/contact.schema").ContactDocument> & import("./schemas/contact.schema").Contact & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    getById(id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/contact.schema").ContactDocument> & import("./schemas/contact.schema").Contact & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    markAsRead(id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/contact.schema").ContactDocument> & import("./schemas/contact.schema").Contact & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
}
export {};
