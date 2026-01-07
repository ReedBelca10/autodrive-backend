import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load .env
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';

async function testSupabaseConnection() {
  console.log('\n Test de connexion Supabase\n');
  console.log('═'.repeat(50));

  // Vérifier les variables
  console.log('\n Configuration:');
  console.log(`  SUPABASE_URL: ${SUPABASE_URL ? '✓' : '✗'}`);
  console.log(`  SUPABASE_KEY: ${SUPABASE_KEY ? `✓ (${SUPABASE_KEY.substring(0, 20)}...)` : '✗'}`);

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('\n❌ Identifiants Supabase manquants!');
    process.exit(1);
  }

  // Créer le client
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Test 1: Lister les buckets
  console.log('\n\n1️⃣  Test de la liste des buckets...');
  console.log('─'.repeat(50));
  try {
    const { data, error } = await supabase.storage.listBuckets();

    if (error) {
      console.error('❌ Erreur:', error);
    } else {
      console.log('✅ Buckets trouvés:');
      data.forEach((bucket) => {
        console.log(`  - ${bucket.name} (${bucket.public ? 'PUBLIC' : 'PRIVATE'})`);
      });

      // Vérifier vehicle_medias
      const hasVehicleMedias = data.find((b) => b.name === 'vehicle_medias');
      if (!hasVehicleMedias) {
        console.warn('\n⚠️  Bucket "vehicle_medias" NON TROUVÉ');
        console.log('   Veuillez le créer manuellement dans le tableau de bord Supabase');
      } else if (!hasVehicleMedias.public) {
        console.warn('\n⚠️  Le bucket "vehicle_medias" est PRIVÉ');
        console.log('   Il devrait être PUBLIC pour accès public aux fichiers');
      }
    }
  } catch (err: any) {
    console.error('❌ Exception:', err.message);
  }

  // Test 2: Upload de test
  console.log('\n\n2️⃣  Test du téléchargement de fichier...');
  console.log('─'.repeat(50));
  try {
    const timestamp = Date.now();
    const testFileName = `test/test_${timestamp}.txt`;
    const testContent = Buffer.from(`Test upload at ${new Date().toISOString()}`);

    console.log(`  Téléchargement vers: vehicle_medias/${testFileName}`);

    const { data, error } = await supabase.storage
      .from('vehicle_medias')
      .upload(testFileName, testContent, {
        contentType: 'text/plain',
        upsert: true,
      });

    if (error) {
      console.error('❌ Upload error:', error.message);
      console.error('   Status:', (error as any).status);
      console.error('   Status Code:', (error as any).statusCode);
    } else {
      console.log('✅ Téléchargement réussi');
      console.log(`   Path: ${data.path}`);
      console.log(`   ID: ${data.id}`);
    }
  } catch (err: any) {
    console.error('❌ Exception:', err.message);
  }

  // Test 3: Get public URL
  console.log('\n\n3️⃣  Test de l\'URL publique...');
  console.log('─'.repeat(50));
  try {
    const timestamp = Date.now();
    const testFileName = `test/test_${timestamp}.txt`;

    const { data } = supabase.storage
      .from('vehicle_medias')
      .getPublicUrl(testFileName);

    console.log('✅ URL publique générée:');
    console.log(`   ${data.publicUrl}`);
  } catch (err: any) {
    console.error('❌ Exception:', err.message);
  }

  // Test 4: Vérifier la structure du JWT
  console.log('\n\n4️⃣  Vérification de la structure JWT...');
  console.log('─'.repeat(50));
  try {
    const parts = SUPABASE_KEY.split('.');
    if (parts.length !== 3) {
      console.error('❌ Format JWT invalide (devrait avoir 3 parties)');
    } else {
      console.log('✅ Format JWT valide');

      // Decode header et payload
      const header = JSON.parse(
        Buffer.from(parts[0], 'base64').toString('utf8')
      );
      const payload = JSON.parse(
        Buffer.from(parts[1], 'base64').toString('utf8')
      );

      console.log('\n  En-tête JWT:');
      console.log(`    Algorithme: ${header.alg}`);
      console.log(`    Type: ${header.typ}`);

      console.log('\n  Charge utile JWT:');
      console.log(`    Émetteur: ${payload.iss}`);
      console.log(`    Role: ${payload.role}`);
      console.log(`    Reference: ${payload.ref}`);
      console.log(`    Émis à: ${new Date(payload.iat * 1000).toISOString()}`);
      console.log(`    Expire: ${new Date(payload.exp * 1000).toISOString()}`);

      if (payload.role !== 'service_role') {
        console.warn(
          '\n⚠️  This JWT has role "' + payload.role + '" instead of "service_role"'
        );
        console.log('   La clé de rôle de service doit être utilisée pour les téléchargements!');
      } else {
        console.log('\n✅ Utilisation de la clé de rôle de service (correct pour les téléchargements)');
      }
    }
  } catch (err: any) {
    console.error('❌ Error parsing JWT:', err.message);
  }

  console.log('\n' + '═'.repeat(50) + '\n');
}

testSupabaseConnection().catch(console.error);
