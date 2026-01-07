import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Patch,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { VehiclesService } from './vehicles.service';
import { VehiclesUploadService } from './vehicles-upload.service';
import { CreateVehicleDto, UpdateVehicleDto } from './dtos/vehicle.dto';
import { AdminGuard } from '../common/guards/admin.guard';

@Controller('vehicles')
export class VehiclesController {
  constructor(
    private vehiclesService: VehiclesService,
    private uploadService: VehiclesUploadService,
  ) {}

  // Routes de configuration d'abord (plus spécifiques)
  @Get('config/transmissions')
  getTransmissions() {
    return this.vehiclesService.getTransmissions();
  }

  @Get('config/fuels')
  getFuels() {
    return this.vehiclesService.getFuels();
  }

  @Get('config/body-types')
  getBodyTypes() {
    return this.vehiclesService.getBodyTypes();
  }

  @Get('config/equipments')
  getEquipments() {
    return this.vehiclesService.getEquipments();
  }

  @Get('config/years')
  getYears() {
    return this.vehiclesService.getYears();
  }

  // Routes du manager
  @UseGuards(AuthGuard('jwt'))
  @Get('manager/my-vehicles')
  async getManagerVehicles(@Req() req: Request) {
    const user: any = (req as any).user;
    const userRole = user?.role;
    const userId = user?.userId || user?.sub || user?.id;

    if (userRole !== 'manager') {
      throw new ForbiddenException('Seuls les managers peuvent accéder à cette route');
    }

    return await this.vehiclesService.findByManager(userId);
  }

  // Routes générales après les routes spécifiques
  @Get()
  async findAll() {
    try {
      const vehicles = await this.vehiclesService.findAll();
      return vehicles;
    } catch (err) {
      console.error('Erreur lors de la récupération des véhicules:', err);
      throw err;
    }
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    try {
      if (!id || id.length < 24) {
        throw new BadRequestException('ID de véhicule invalide');
      }
      const vehicle = await this.vehiclesService.findById(id);
      if (!vehicle) {
        throw new NotFoundException('Véhicule non trouvé');
      }
      return vehicle;
    } catch (err: any) {
      if (err.response) throw err;
      console.error('Erreur lors de la récupération du véhicule:', err);
      throw new NotFoundException('Véhicule non trouvé');
    }
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() createVehicleDto: CreateVehicleDto, @Req() req: Request) {
    try {
      const user: any = (req as any).user;
      const userRole = user?.role;
      const userId = user?.userId || user?.sub || user?.id;

      // Admin peut créer pour n'importe quelle agence
      if (userRole === 'admin' && createVehicleDto.agencyId) {
        return await this.vehiclesService.create(createVehicleDto);
      }

      // Manager crée uniquement pour sa propre agence
      if (userRole === 'manager') {
        const agencyId = await this.vehiclesService.getManagerAgencyId(userId);
        if (!agencyId) {
          throw new ForbiddenException('Vous ne gérez pas d\'agence');
        }
        return await this.vehiclesService.create({
          ...createVehicleDto,
          agencyId,
        });
      }

      throw new ForbiddenException('Seuls les administrateurs et managers peuvent créer des véhicules');
    } catch (err: any) {
      console.error('Erreur lors de la création du véhicule:', err);
      if (err instanceof ForbiddenException || err instanceof BadRequestException) {
        throw err;
      }
      throw new BadRequestException(err.message);
    }
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id') id: string,
    @Body() updateVehicleDto: UpdateVehicleDto,
    @Req() req: Request,
  ) {
    try {
      const user: any = (req as any).user;
      const userRole = user?.role;
      const userId = user?.userId || user?.sub || user?.id;

      // Admin peut toujours mettre à jour
      if (userRole === 'admin') {
        return await this.vehiclesService.update(id, updateVehicleDto);
      }

      // Manager ne peut mettre à jour que ses propres véhicules
      if (userRole === 'manager') {
        const agencyId = await this.vehiclesService.getManagerAgencyId(userId);
        if (!agencyId) {
          throw new ForbiddenException('Vous ne gérez pas d\'agence');
        }

        const vehicle = await this.vehiclesService.findById(id);
        if (vehicle.agencyId?.toString() !== agencyId.toString()) {
          throw new ForbiddenException('Vous ne pouvez mettre à jour que vos propres véhicules');
        }

        return await this.vehiclesService.update(id, updateVehicleDto);
      }

      throw new ForbiddenException('Seuls les administrateurs et managers peuvent mettre à jour des véhicules');
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour du véhicule:', err);
      if (err instanceof ForbiddenException || err instanceof BadRequestException) {
        throw err;
      }
      throw new BadRequestException(err.message);
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async delete(@Param('id') id: string, @Req() req: Request) {
    try {
      const user: any = (req as any).user;
      const userRole = user?.role;
      const userId = user?.userId || user?.sub || user?.id;

      // Admin peut toujours supprimer
      if (userRole === 'admin') {
        return await this.vehiclesService.delete(id);
      }

      // Manager ne peut supprimer que ses propres véhicules
      if (userRole === 'manager') {
        const agencyId = await this.vehiclesService.getManagerAgencyId(userId);
        if (!agencyId) {
          throw new ForbiddenException('Vous ne gérez pas d\'agence');
        }

        const vehicle = await this.vehiclesService.findById(id);
        if (vehicle.agencyId?.toString() !== agencyId.toString()) {
          throw new ForbiddenException('Vous ne pouvez supprimer que vos propres véhicules');
        }

        return await this.vehiclesService.delete(id);
      }

      throw new ForbiddenException('Seuls les administrateurs et managers peuvent supprimer des véhicules');
    } catch (err: any) {
      console.error('Erreur lors de la suppression du véhicule:', err);
      if (err instanceof ForbiddenException || err instanceof BadRequestException) {
        throw err;
      }
      throw new BadRequestException(err.message);
    }
  }

  @Patch(':id/toggle-status')
  @UseGuards(AuthGuard('jwt'))
  async toggleStatus(@Param('id') id: string, @Req() req: Request) {
    try {
      const user: any = (req as any).user;
      const userRole = user?.role;
      const userId = user?.userId || user?.sub || user?.id;

      // Admin peut toujours basculer
      if (userRole === 'admin') {
        return await this.vehiclesService.toggleStatus(id);
      }

      // Manager ne peut basculer que ses propres véhicules
      if (userRole === 'manager') {
        const agencyId = await this.vehiclesService.getManagerAgencyId(userId);
        if (!agencyId) {
          throw new ForbiddenException('Vous ne gérez pas d\'agence');
        }

        const vehicle = await this.vehiclesService.findById(id);
        if (vehicle.agencyId?.toString() !== agencyId.toString()) {
          throw new ForbiddenException('Vous ne pouvez basculer l\'état que de vos propres véhicules');
        }

        return await this.vehiclesService.toggleStatus(id);
      }

      throw new ForbiddenException('Seuls les administrateurs et managers peuvent basculer l\'état des véhicules');
    } catch (err: any) {
      console.error('Erreur lors du basculement de l\'état du véhicule:', err);
      if (err instanceof ForbiddenException || err instanceof BadRequestException) {
        throw err;
      }
      throw new BadRequestException(err.message);
    }
  }

  @Post('upload/media')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  async uploadMedia(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    try {
      // Vérifier que l'utilisateur est admin ou manager
      const user: any = (req as any).user;
      const userRole = user?.role;
      if (userRole !== 'admin' && userRole !== 'manager') {
        throw new ForbiddenException('Seuls les administrateurs et managers peuvent uploader des médias');
      }
      // Validation du fichier
      if (!file) {
        console.error('❌ Aucun fichier fourni');
        throw new BadRequestException('Aucun fichier fourni');
      }

      console.log(`📄 Fichier reçu: ${file.originalname}`);
      console.log(`   Taille: ${(file.size / 1024).toFixed(2)} KB`);
      console.log(`   Type: ${file.mimetype}`);

      // Validation du type de fichier
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
      ];

      if (!allowedTypes.includes(file.mimetype)) {
        console.error(`❌ Type de fichier invalide: ${file.mimetype}`);
        throw new BadRequestException(
          `Type de fichier non supporté: ${file.mimetype}`,
        );
      }

      // Validation de la taille (10 MB max)
      const maxTaille = 10 * 1024 * 1024; // 10 MB
      if (file.size > maxTaille) {
        console.error(`❌ Fichier trop volumineux: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
        throw new BadRequestException('Fichier trop volumineux (max 10 MB)');
      }

      // Générer un nom unique
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      const originalNameWithoutExt = file.originalname.replace(/\.[^/.]+$/, '');
      const ext = file.originalname.split('.').pop();
      const fileName = `${timestamp}_${random}_${originalNameWithoutExt}.${ext}`;

      console.log(`🔄 Traitement du fichier en tant que: ${fileName}`);

      // Upload au service
      const publicUrl = await this.uploadService.uploadMediaFile(file, fileName);

      console.log(`✅ Téléchargement multimédia réussi`);
      console.log(`   URL: ${publicUrl}`);

      return {
        success: true,
        publicUrl,
        fileName,
      };
    } catch (err: any) {
      console.error('❌ Erreur du point de terminaison de téléchargement:', err);

      // Si c'est déjà une BadRequestException, la passer telle quelle
      if (err instanceof BadRequestException) {
        throw err;
      }

      // Sinon, créer une nouvelle BadRequestException
      throw new BadRequestException(
        err.message || 'Erreur lors du téléchargement du fichier',
      );
    }
  }

  @Post(':id/add-media')
  @UseGuards(AuthGuard('jwt'))
  async addMediaToVehicle(
    @Param('id') id: string,
    @Body() body: { mediaUrl: string },
    @Req() req: Request,
  ) {
    try {
      // Vérifier que l'utilisateur est admin ou manager et propriétaire du véhicule
      const user: any = (req as any).user;
      const userRole = user?.role;
      const userId = user?.userId || user?.sub || user?.id;

      if (userRole === 'admin') {
        // Admin peut ajouter des médias à n'importe quel véhicule
      } else if (userRole === 'manager') {
        // Manager ne peut ajouter des médias qu'à ses propres véhicules
        const agencyId = await this.vehiclesService.getManagerAgencyId(userId);
        if (!agencyId) {
          throw new ForbiddenException('Vous ne gérez pas d\'agence');
        }

        const vehicle = await this.vehiclesService.findById(id);
        if (vehicle.agencyId?.toString() !== agencyId.toString()) {
          throw new ForbiddenException('Vous ne pouvez ajouter des médias qu\'à vos propres véhicules');
        }
      } else {
        throw new ForbiddenException('Seuls les administrateurs et managers peuvent ajouter des médias');
      }

      if (!body.mediaUrl) {
        throw new BadRequestException('mediaUrl est requis');
      }
      const result = await this.vehiclesService.addMediaUrl(id, body.mediaUrl);
      console.log(`Media added to vehicle ${id}`);
      return result;
    } catch (err: any) {
      console.error('Erreur lors de l\'ajout de médias au véhicule:', err);
      if (err instanceof ForbiddenException || err instanceof BadRequestException) {
        throw err;
      }
      throw new BadRequestException(err.message);
    }
  }
}
