/**
 * Helper pour valider et gérer les URLs des médias des véhicules
 */

/**
 * Valide si une URL est une URL Supabase valide
 */
export const isValidSupabaseUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  return url.includes('/storage/v1/object/public/vehicle_medias') || 
         (url.startsWith('http') && url.includes('supabase'));
};

/**
 * Filtre et nettoie les URLs des médias
 */
export const sanitizeMediaUrls = (urls: any[]): string[] => {
  if (!Array.isArray(urls)) return [];

  return urls
    .filter((url): url is string => typeof url === 'string' && url.trim().length > 0)
    .map(url => url.trim())
    .filter(url => isValidSupabaseUrl(url));
};

/**
 * Valide une liste d'URLs avant de les sauvegarder
 */
export const validateMediaUrls = (urls: string[]): boolean => {
  if (!Array.isArray(urls)) return false;
  return urls.length === 0 || urls.every(url => isValidSupabaseUrl(url));
};
