import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type VehicleDocument = Vehicle & Document & {
  createdAt: Date;
  updatedAt: Date;
};

@Schema({ timestamps: true })
export class Vehicle {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  dailyRate: number; // Tarif journalier en F CFA

  @Prop({ required: true })
  passengers: number; // Nombre de passagers

  @Prop({ required: true })
  year: number; // Année de conception

  @Prop({ 
    required: true, 
    enum: ['automatique', 'manuelle', 'semi-automatique']
  })
  transmission: string;

  @Prop({ 
    required: true, 
    enum: ['essence', 'diesel', 'électrique', 'hybride']
  })
  fuel: string;

  @Prop({ required: true })
  city: string; // Ville de disponibilité

  @Prop({ 
    required: true, 
    type: MongooseSchema.Types.ObjectId, 
    ref: 'Agency'
  })
  agencyId: string; // Référence à l'agence

  @Prop({ 
    required: true, 
    enum: ['berline', 'suv', 'camionnette', 'monospace', 'cabriolet', 'coupé', 'break']
  })
  bodyType: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [String], default: [] })
  equipment: string[]; // Liste d'équipements

  @Prop({ type: [String], default: [] })
  mediaUrls: string[]; // URLs des médias Supabase

  @Prop({ 
    type: {
      totalRatings: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
      reviews: [
        {
          userId: MongooseSchema.Types.ObjectId,
          rating: Number,
          comment: String,
          createdAt: Date
        }
      ]
    },
    default: { totalRatings: 0, averageRating: 0, reviews: [] }
  })
  reviews: {
    totalRatings: number;
    averageRating: number;
    reviews: Array<{
      userId: string;
      rating: number;
      comment: string;
      createdAt: Date;
    }>;
  };

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ 
    required: true, 
    enum: ['available', 'reserved', 'maintenance'],
    default: 'available'
  })
  status: 'available' | 'reserved' | 'maintenance';

  @Prop({ type: Date })
  createdAt?: Date;

  @Prop({ type: Date })
  updatedAt?: Date;
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);
