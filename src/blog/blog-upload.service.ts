import { Injectable, BadRequestException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class BlogUploadService {
    private supabase: SupabaseClient;

    constructor() {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error('⚠️ Identifiants Supabase manquants dans BlogUploadService!');
        }

        this.supabase = createClient(supabaseUrl || '', supabaseKey || '');
    }

    async uploadMediaFile(file: Express.Multer.File, fileName: string): Promise<string> {
        try {
            if (!file || !file.buffer) {
                throw new BadRequestException('Le fichier est invalide');
            }

            // Nettoyer le nom du fichier
            const cleanFileName = fileName
                .replace(/\s+/g, '_')
                .replace(/[^\w\-._]/g, '')
                .replace(/_+/g, '_')
                .toLowerCase();

            if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
                throw new BadRequestException('Configuration Supabase manquante');
            }

            const bucketName = process.env.SUPABASE_BUCKET_BLOG_MEDIAS || 'blog-medias';
            const filePath = `articles/${cleanFileName}`;

            const { data, error } = await this.supabase.storage
                .from(bucketName)
                .upload(filePath, file.buffer, {
                    contentType: file.mimetype,
                    cacheControl: '3600',
                    upsert: false,
                });

            if (error) {
                console.error('❌ Erreur de téléchargement Supabase (Blog):', error);
                throw new BadRequestException(
                    `Erreur Supabase: ${error.message || 'Upload échoué'}`,
                );
            }

            // Get public URL
            const { data: publicUrlData } = this.supabase.storage
                .from(bucketName)
                .getPublicUrl(filePath);

            if (!publicUrlData || !publicUrlData.publicUrl) {
                throw new BadRequestException('Impossible de générer l\'URL publique');
            }

            return publicUrlData.publicUrl;
        } catch (err: any) {
            if (err instanceof BadRequestException) {
                throw err;
            }
            throw new BadRequestException(
                `Erreur lors de l'upload: ${err.message || 'Erreur inconnue'}`,
            );
        }
    }
}
