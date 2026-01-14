import { IsEmail, IsNotEmpty } from 'class-validator';

export class SubscribeDto {
    @IsEmail({}, { message: 'Veuillez entrer une adresse email valide' })
    @IsNotEmpty({ message: "L'email est obligatoire" })
    email: string;
}
