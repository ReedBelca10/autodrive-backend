import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateVehicleDto, UpdateVehicleDto } from './dtos/vehicle.dto';
import { Vehicle, VehicleDocument } from './schemas/vehicle.schema';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectModel('Vehicle') private vehicleModel: Model<VehicleDocument>,
    @InjectModel('Agency') private agencyModel: Model<any>,
  ) {}

  // Configuration constants
  private readonly TRANSMISSIONS = ['automatique', 'manuelle', 'semi-automatique'];
  private readonly FUELS = ['essence', 'diesel', 'électrique', 'hybride'];
  private readonly BODY_TYPES = ['berline', 'suv', 'camionnette', 'monospace', 'cabriolet', 'coupé', 'break'];
  private readonly EQUIPMENTS = [
    'climatisation',
    'gps',
    'toit_panoramique',
    'siege_chauffant',
    'systeme_audio_premium',
    'bluetooth',
    'camera_recul',
    'siege_electrique',
    'toit_ouvrant',
    'suspension_adaptative',
    'assistant_stationnement'
  ];

  async create(createVehicleDto: CreateVehicleDto): Promise<VehicleDocument> {
    // Transformer les données du frontend au format de la BD
    const vehicleData: any = {
      dailyRate: createVehicleDto.dailyRate,
      year: createVehicleDto.year,
      transmission: createVehicleDto.transmission,
      fuel: createVehicleDto.fuel,
      bodyType: createVehicleDto.bodyType,
      description: createVehicleDto.description,
      agencyId: createVehicleDto.agencyId,
      status: createVehicleDto.status || 'available',
    };

    // Gérer les champs name (brand + model ou name directement)
    if (createVehicleDto.brand && createVehicleDto.model) {
      vehicleData.name = `${createVehicleDto.brand} ${createVehicleDto.model}`;
    } else if (createVehicleDto.name) {
      vehicleData.name = createVehicleDto.name;
    } else {
      throw new BadRequestException('Le nom du véhicule est requis (brand + model ou name)');
    }

    // Gérer les passagers (seats ou passengers)
    vehicleData.passengers = createVehicleDto.seats || createVehicleDto.passengers || 5;

    // Gérer la ville (optionnel, utiliser une valeur par défaut si nécessaire)
    vehicleData.city = createVehicleDto.city || 'Non spécifiée';

    // Gérer les équipements (equipment ou features)
    vehicleData.equipment = createVehicleDto.equipment || createVehicleDto.features || [];

    // Gérer les médias
    vehicleData.mediaUrls = createVehicleDto.mediaUrls || [];

    const vehicle = new this.vehicleModel(vehicleData);
    return await vehicle.save();
  }

  async findAll(): Promise<VehicleDocument[]> {
    const vehicles = await this.vehicleModel
      .find({ isActive: { $ne: false } })
      .populate('agencyId')
      .lean()
      .exec();

    // Normaliser les URLs des médias et transformer agencyId en agency
    return vehicles.map(vehicle => {
      const transformedVehicle: any = {
        ...vehicle,
        mediaUrls: this.normalizeMediaUrls(vehicle.mediaUrls || []),
      };

      // Si agencyId est peuplé, le renommer en agency
      if (transformedVehicle.agencyId && typeof transformedVehicle.agencyId === 'object') {
        transformedVehicle.agency = transformedVehicle.agencyId;
        delete transformedVehicle.agencyId;
      }

      return transformedVehicle;
    });
  }

  async findById(id: string): Promise<VehicleDocument> {
    const vehicle: any = await this.vehicleModel
      .findById(id)
      .populate('agencyId')
      .lean()
      .exec();

    if (vehicle) {
      vehicle.mediaUrls = this.normalizeMediaUrls(vehicle.mediaUrls || []);
    }

    return vehicle;
  }

  /**
   * Normalise les URLs des médias pour s'assurer qu'elles sont valides
   */
  private normalizeMediaUrls(urls: any[]): string[] {
    if (!Array.isArray(urls)) return [];

    return urls
      .filter((url): url is string => typeof url === 'string' && url.trim().length > 0)
      .map(url => url.trim());
  }

  async update(id: string, updateVehicleDto: UpdateVehicleDto): Promise<VehicleDocument> {
    const updateData: any = {};

    // Transformer les données du frontend au format de la BD
    if (updateVehicleDto.brand || updateVehicleDto.model) {
      if (updateVehicleDto.brand || updateVehicleDto.model) {
        // Récupérer le véhicule actuel pour compléter les champs manquants
        const currentVehicle = await this.vehicleModel.findById(id);
        const nameParts = currentVehicle?.name?.split(' ') || [];
        const brand = updateVehicleDto.brand || nameParts[0];
        const model = updateVehicleDto.model || nameParts.slice(1).join(' ');
        updateData.name = `${brand} ${model}`;
      }
    } else if (updateVehicleDto.name) {
      updateData.name = updateVehicleDto.name;
    }

    // Copier les autres champs
    if (updateVehicleDto.dailyRate !== undefined) updateData.dailyRate = updateVehicleDto.dailyRate;
    if (updateVehicleDto.year !== undefined) updateData.year = updateVehicleDto.year;
    if (updateVehicleDto.transmission !== undefined) updateData.transmission = updateVehicleDto.transmission;
    if (updateVehicleDto.fuel !== undefined) updateData.fuel = updateVehicleDto.fuel;
    if (updateVehicleDto.bodyType !== undefined) updateData.bodyType = updateVehicleDto.bodyType;
    if (updateVehicleDto.description !== undefined) updateData.description = updateVehicleDto.description;
    if (updateVehicleDto.seats !== undefined) updateData.passengers = updateVehicleDto.seats;
    if (updateVehicleDto.passengers !== undefined) updateData.passengers = updateVehicleDto.passengers;
    if (updateVehicleDto.city !== undefined) updateData.city = updateVehicleDto.city;
    if (updateVehicleDto.status !== undefined) updateData.status = updateVehicleDto.status;
    if (updateVehicleDto.equipment !== undefined) updateData.equipment = updateVehicleDto.equipment;
    if (updateVehicleDto.features !== undefined) updateData.equipment = updateVehicleDto.features;
    if (updateVehicleDto.mediaUrls !== undefined) updateData.mediaUrls = updateVehicleDto.mediaUrls;

    // Filtrer les champs vides
    const cleanedData = Object.entries(updateData).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        acc[key] = value;
      }
      return acc;
    }, {} as any);

    return await this.vehicleModel
      .findByIdAndUpdate(id, { ...cleanedData, updatedAt: new Date() }, { new: true })
      .populate('agencyId')
      .exec();
  }

  async delete(id: string): Promise<VehicleDocument> {
    return await this.vehicleModel.findByIdAndDelete(id).exec();
  }

  async toggleStatus(id: string): Promise<VehicleDocument> {
    const vehicle = await this.vehicleModel.findById(id);
    if (vehicle) {
      vehicle.isActive = !vehicle.isActive;
      vehicle.updatedAt = new Date();
      return await vehicle.save();
    }
    return null;
  }

  async addMediaUrl(id: string, mediaUrl: string): Promise<VehicleDocument> {
    if (!mediaUrl || typeof mediaUrl !== 'string' || mediaUrl.trim().length === 0) {
      throw new Error('URL média invalide');
    }

    const cleanUrl = mediaUrl.trim();
    const vehicle = await this.vehicleModel.findById(id);
    
    if (!vehicle) {
      throw new Error('Véhicule non trouvé');
    }

    // Initialiser mediaUrls s'il n'existe pas
    if (!vehicle.mediaUrls) {
      vehicle.mediaUrls = [];
    }

    // Vérifier que ce n'est pas déjà présent
    const urlExists = vehicle.mediaUrls.some(url => 
      url.toLowerCase() === cleanUrl.toLowerCase()
    );

    if (!urlExists) {
      vehicle.mediaUrls.push(cleanUrl);
      console.log(`Added media URL to vehicle ${vehicle.name}:`, cleanUrl);
    } else {
      console.log(`Media URL already exists for vehicle ${vehicle.name}:`, cleanUrl);
    }

    vehicle.updatedAt = new Date();
    const savedVehicle = await vehicle.save();
    
    // Normaliser les URLs avant de retourner
    return {
      ...savedVehicle.toObject(),
      mediaUrls: this.normalizeMediaUrls(savedVehicle.mediaUrls)
    } as VehicleDocument;
  }

  // Configuration endpoints
  getTransmissions(): string[] {
    return this.TRANSMISSIONS;
  }

  getFuels(): string[] {
    return this.FUELS;
  }

  getBodyTypes(): string[] {
    return this.BODY_TYPES;
  }

  getEquipments(): string[] {
    return this.EQUIPMENTS;
  }

  getYears(): number[] {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let year = currentYear; year >= 1970; year--) {
      years.push(year);
    }
    return years;
  }

  /**
   * Obtient l'agencyId du manager
   * @param userId L'ID du manager (user)
   * @returns L'ID de l'agence gérée par ce manager
   */
  async getManagerAgencyId(userId: string): Promise<string | null> {
    try {
      const agency = await this.agencyModel.findOne({ managerId: userId });
      return agency?._id?.toString() || null;
    } catch (err) {
      console.error('Erreur lors de la recherche de l\'agence du manager:', err);
      return null;
    }
  }

  /**
   * Récupère les véhicules d'un manager
   * @param userId L'ID du manager
   * @returns Les véhicules de l'agence du manager
   */
  async findByManager(userId: string): Promise<VehicleDocument[]> {
    const agencyId = await this.getManagerAgencyId(userId);
    if (!agencyId) {
      return [];
    }

    const vehicles = await this.vehicleModel
      .find({ agencyId, isActive: { $ne: false } })
      .populate('agencyId')
      .lean()
      .exec();

    // Normaliser les URLs des médias
    return vehicles.map(vehicle => {
      const transformedVehicle: any = {
        ...vehicle,
      };
      
      // Normaliser les mediaUrls
      if (vehicle.mediaUrls && vehicle.mediaUrls.length > 0) {
        transformedVehicle.mediaUrls = this.normalizeMediaUrls(vehicle.mediaUrls);
      }

      return transformedVehicle;
    });
  }
}
