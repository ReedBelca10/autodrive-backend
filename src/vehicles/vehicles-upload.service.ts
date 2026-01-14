import { Injectable, BadRequestException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class VehiclesUploadService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('⚠️ Identifiants Supabase manquants!');
      console.error('SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
      console.error('SUPABASE_KEY:', supabaseKey ? '✓' : '✗');
    }

    this.supabase = createClient(supabaseUrl || '', supabaseKey || '');
  }

  async uploadMediaFile(file: Express.Multer.File, fileName: string): Promise<string> {
    try {
      // Validation
      if (!file || !file.buffer) {
        console.error('Fichier invalide reçu');
        throw new BadRequestException('Le fichier est invalide');
      }

      if (!file.originalname) {
        throw new BadRequestException('Nom de fichier manquant');
      }

      // Nettoyer le nom du fichier : remplacer les espaces et caractères spéciaux
      const cleanFileName = fileName
        .replace(/\s+/g, '_') // Remplacer les espaces par des underscores
        .replace(/[^\w\-._]/g, '') // Supprimer les caractères spéciaux
        .replace(/_+/g, '_') // Remplacer les underscores multiples par un seul
        .toLowerCase(); // Convertir en minuscules

      // Logs
      console.log(`📤 Démarrage du téléchargement: ${fileName}`);
      console.log(`   Nom nettoyé: ${cleanFileName}`);
      console.log(`   Nom original: ${file.originalname}`);
      console.log(`   Taille: ${(file.size / 1024).toFixed(2)} KB`);
      console.log(`   Type: ${file.mimetype}`);

      // Vérifier que Supabase est configuré
      if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
        throw new BadRequestException('Configuration Supabase manquante');
      }

      // Upload vers Supabase
      const bucketName = 'vehicle_medias';
      const filePath = `vehicles/${cleanFileName}`;

      console.log(`   Téléchargement vers: ${bucketName}/${filePath}`);

      const { data, error } = await this.supabase.storage
        .from(bucketName)
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          cacheControl: '3600',
          upsert: false, // Ne pas écraser les fichiers existants
        });

      if (error) {
        console.error('❌ Erreur de téléchargement Supabase:', error);
        throw new BadRequestException(
          `Erreur Supabase: ${error.message || 'Upload échoué'}`,
        );
      }

      if (!data) {
        console.error('Aucune donnée retournée par Supabase');
        throw new BadRequestException('Aucune donnée retournée par Supabase');
      }

      console.log('✅ Téléchargement réussi:', data);

      // Récupérer l'URL publique
      const { data: publicUrlData } = this.supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      if (!publicUrlData || !publicUrlData.publicUrl) {
        console.error('Impossible de générer l\'URL publique');
        throw new BadRequestException('Impossible de générer l\'URL publique');
      }

      console.log('✅ URL publique générée:', publicUrlData.publicUrl);
      return publicUrlData.publicUrl;
    } catch (err: any) {
      console.error('❌ Téléchargement échoué:', err.message);
      
      // Si c'est déjà une BadRequestException, la passer telle quelle
      if (err instanceof BadRequestException) {
        throw err;
      }

      throw new BadRequestException(
        `Erreur lors de l'upload: ${err.message || 'Erreur inconnue'}`,
      );
    }
  }

  async deleteMediaFile(url: string): Promise<void> {
    try {
      if (!url) return;

      const fileName = url.split('/').pop();
      if (!fileName) return;

      console.log(`🗑️ Suppression du fichier: ${fileName}`);

      const { error } = await this.supabase.storage
        .from('vehicle_medias')
        .remove([`vehicles/${fileName}`]);

      if (error) {
        console.error('Impossible de supprimer le fichier:', error);
        throw new Error(`Erreur de suppression: ${error.message}`);
      }

      console.log('✅ Fichier supprimé avec succès');
    } catch (err: any) {
      console.error('❌ Impossible de supprimer le fichier:', err.message);
    }
  }
}
