import { MongoClient } from 'mongodb';
import 'dotenv/config';

async function migrateVehicleStatus() {
  const mongoUri = process.env.MONGODB_URI;
  
  if (!mongoUri) {
    console.error('❌ MONGODB_URI introuvable dans .env');
    process.exit(1);
  }

  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    console.log('✅ Connecté à MongoDB');

    const db = client.db('AutoDrive');
    const vehiclesCollection = db.collection('vehicles');

    // Ajouter le champ 'status' à tous les documents qui ne l'ont pas
    const result = await vehiclesCollection.updateMany(
      { status: { $exists: false } },
      { $set: { status: 'available' } }
    );

    console.log(`✅ Migration complétée :`);
    console.log(`   Modifiés : ${result.modifiedCount} documents`);
    console.log(`   Tous les véhicules ont maintenant le champ status avec la valeur par défaut : 'available'`);

    // Vérifier quelques documents
    const sampleVehicles = await vehiclesCollection.find().limit(3).toArray();
    console.log('\n📋 Exemples de véhicules après la migration :');
    sampleVehicles.forEach((vehicle: any) => {
      console.log(`   - ${vehicle.name}: status = "${vehicle.status}"`);
    });

  } catch (error) {
    console.error('❌ La migration a échoué :', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n✅ Connexion à la base de données fermée');
  }
}

migrateVehicleStatus();
