# 🚗 AutoDrive Backend - Documentation Complète

## Table des Matières
1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Installation & Configuration](#installation--configuration)
4. [Structure des Modules](#structure-des-modules)
5. [API Endpoints](#api-endpoints)
6. [Base de Données](#base-de-données)
7. [Authentification & Sécurité](#authentification--sécurité)
8. [Paiements](#paiements)
9. [Scripts de Déploiement](#scripts-de-déploiement)
10. [Dépannage](#dépannage)

---

## Vue d'ensemble

**AutoDrive Backend** est un serveur NestJS complèt pour la gestion d'une plateforme de location de véhicules. Il gère :

- ✅ Authentification JWT avec Passport
- ✅ Gestion complète des véhicules
- ✅ Système de réservations avancé
- ✅ Paiements sécurisés (Stripe + FedaPay)
- ✅ Gestion des agences et managers
- ✅ Upload de médias (Supabase)
- ✅ Gestion des utilisateurs et profils
- ✅ Blog avec articles
- ✅ FAQ (Questions Fréquemment Posées)
- ✅ Newsletter (Abonnements)
- ✅ Formulaire de contact
- ✅ Favoris de véhicules
- ✅ Système de rôles (Admin/Manager/Client)

**Version**: 1.0.0
**Node**: v18+
**NestJS**: v11
**MongoDB**: v7

---

## Architecture

### Stack Technologique

```
Backend
├── Framework: NestJS 11
├── Language: TypeScript 5
├── Database: MongoDB 7 + Mongoose 7
├── Auth: JWT (Passport)
├── Validation: class-validator
├── Payments: Stripe + FedaPay
├── Storage: Supabase
└── File Upload: Multer
```

### Diagramme d'Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Frontend (Next.js)                      │
├─────────────────────────────────────────────────────────┤
│                     HTTP/CORS                            │
├─────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────────┐│
│ │           NestJS Backend (Port 3001)                 ││
│ ├──────────────────────────────────────────────────────┤│
│ │  Auth Module      Vehicles Module   Reservations    ││
│ │  Users Module     Agencies Module   Blog Module     ││
│ │  Contact Module   Payments Module   Faq Module     ││
│ │  Newsletter Module                                  ││
│ └──────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────────┐│
│ │  MongoDB (Database)  Supabase (Storage)  Stripe API ││
│ │  FedaPay API         Nodemailer (Email)             ││
│ └──────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### Flux d'Authentification

```
1. Client se connecte (POST /auth/login)
   ↓
2. Backend valide les credentials + hash bcrypt
   ↓
3. JWT tokens générés (access + refresh)
   ↓
4. Tokens stockés en cookies (secure, httpOnly)
   ↓
5. Requêtes futures: JWT validé par AuthGuard('jwt')
   ↓
6. Rôles vérifiés (Admin/Manager/Client)
```

---

## Installation & Configuration

### Prérequis

- Node.js >= 18
- MongoDB >= 7.0 (Atlas ou local)
- Compte Supabase
- Clés Stripe
- Clés FedaPay

### Installation

```bash
# Cloner le repository
git clone <repo-url>
cd AutoDrive-Backend

# Installer les dépendances
npm install

# Créer le fichier .env
cp .env.example .env

# Configurer les variables d'environnement
nano .env
```

### Variables d'Environnement

```env
# Server
NODE_ENV=development
PORT=3001
FRONTEND_ORIGIN=http://localhost:3000

# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/autodrive?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRATION=3600  # 1 heure

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...

# FedaPay
FEDAPAY_API_KEY=sk_live_...
FEDAPAY_PUBLIC_KEY=pk_live_...

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_BUCKET=avatars

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@autodrive.tg
```

### Démarrage

```bash
# Développement (avec hot reload)
npm run start:dev

# Production
npm run build
npm run start

# Lint
npm run lint
```

---

## Structure des Modules

### 1. **Auth Module** (`src/auth/`)

Gère l'authentification et l'autorisation.

**Fichiers clés:**
- `auth.controller.ts` - Routes login/register/logout/refresh
- `auth.service.ts` - Logique JWT et bcrypt
- `jwt.strategy.ts` - Stratégie Passport JWT

**Routes:**
```
POST   /auth/register         - Créer un compte
POST   /auth/login            - Se connecter
POST   /auth/logout           - Se déconnecter
POST   /auth/refresh          - Renouveler le token
GET    /auth/profile          - Récupérer le profil
POST   /auth/forgot-password  - Demander reset
POST   /auth/reset-password   - Réinitialiser mot de passe
```

**Feature Social OAuth:**
- Google OAuth
- Facebook OAuth
- Twitter/X OAuth

### 2. **Users Module** (`src/users/`)

Gère les profils utilisateurs.

**Fichiers clés:**
- `user.schema.ts` - Schéma MongoDB pour User
- `users.controller.ts` - Routes CRUD
- `users.service.ts` - Business logic

**Routes:**
```
GET    /users              - Récupérer tous les utilisateurs (admin)
GET    /users/:id          - Détails d'un utilisateur
PUT    /users/:id          - Modifier un utilisateur
DELETE /users/:id          - Supprimer un utilisateur
PATCH  /users/:id/toggle-status - Activer/désactiver
POST   /users/avatar       - Upload avatar
POST   /users/favorites/:vehicleId - Ajouter aux favoris
DELETE /users/favorites/:vehicleId - Retirer des favoris
GET    /users/:id/favorites - Récupérer ses favoris
```

**Schéma User:**
```typescript
{
  firstName: string;
  lastName: string;
  email: string (unique);
  password: string (bcrypted);
  phone: string;
  role: 'admin' | 'manager' | 'client';
  status: 'active' | 'inactive';
  avatarUrl: string;
  avatarPath: string;
  favoriteVehicles: ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
```

### 3. **Vehicles Module** (`src/vehicles/`)

Gestion complète des véhicules.

**Fichiers clés:**
- `vehicle.schema.ts` - Schéma MongoDB
- `vehicles.controller.ts` - Routes CRUD
- `vehicles.service.ts` - Business logic
- `vehicles-upload.service.ts` - Gestion fichiers

**Routes:**
```
GET    /vehicles                    - Tous les véhicules (public)
GET    /vehicles/:id                - Détail d'un véhicule
GET    /vehicles/manager/my-vehicles - Véhicules du manager (protégé)
POST   /vehicles                    - Créer véhicule (admin/manager)
PUT    /vehicles/:id                - Modifier véhicule (admin/manager)
DELETE /vehicles/:id                - Supprimer véhicule (admin/manager)
PATCH  /vehicles/:id/toggle-status  - Masquer/afficher
POST   /vehicles/upload/media       - Upload médias
POST   /vehicles/:id/add-media      - Ajouter médias à un véhicule

# Config endpoints
GET    /vehicles/config/years       - Années disponibles
GET    /vehicles/config/transmissions - Types transmission
GET    /vehicles/config/fuels       - Types carburant
GET    /vehicles/config/body-types  - Carrosseries
GET    /vehicles/config/equipments  - Équipements
```

**Schéma Vehicle:**
```typescript
{
  name: string;
  brand: string;
  model: string;
  year: number;
  dailyRate: number;
  transmission: 'automatique' | 'manuelle' | 'semi-automatique';
  fuel: 'essence' | 'diesel' | 'électrique' | 'hybride';
  bodyType: 'berline' | 'suv' | 'camionnette' | 'monospace' | 'cabriolet' | 'coupé' | 'break';
  passengers: number;
  city: string;
  description: string;
  equipment: string[];
  mediaUrls: string[];
  agencyId: ObjectId (référence Agency);
  status: 'available' | 'reserved' | 'maintenance';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### 4. **Reservations Module** (`src/reservations/`)

Système de réservations complet.

**Fichiers clés:**
- `reservation.schema.ts` - Schéma MongoDB
- `reservations.controller.ts` - Routes
- `reservations.service.ts` - Business logic

**Routes:**
```
GET    /reservations                - Mes réservations (utilisateur)
GET    /reservations/admin/all      - Toutes les réservations (admin/manager)
GET    /reservations/:id            - Détails réservation
POST   /reservations                - Créer réservation
PATCH  /reservations/:id/confirm    - Confirmer réservation
PATCH  /reservations/:id/cancel     - Annuler réservation
PATCH  /reservations/:id/archive    - Archiver réservation
DELETE /reservations/:id            - Supprimer réservation (admin)
POST   /reservations/:id/payment-intent - Créer intent paiement
POST   /reservations/:id/confirm-payment - Confirmer paiement Stripe
POST   /reservations/:id/confirm-fedapay - Confirmer paiement FedaPay
GET    /reservations/:id/fedapay-status - Vérifier statut FedaPay
POST   /reservations/fedapay-callback - Webhook FedaPay
```

**Schéma Reservation:**
```typescript
{
  userId: ObjectId;
  vehicleId: ObjectId;
  startDate: Date;
  returnDate: Date;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus: 'pending' | 'paid';
  paymentMethod: 'stripe' | 'fedapay' | 'none';
  paymentGateway: 'stripe' | 'fedapay';
  totalPrice: number;
  insuranceOption: 'basic' | 'premium';
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  drivingLicense: string;
  pickupLocation: string;
  returnLocation: string;
  paymentIntentId: string;
  fedapayTransactionId: string;
  archived: boolean;
  archivedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

**Logique Métier:**
- Vérification disponibilité du véhicule
- Calcul du prix (jours × tarifJournalier + assurance)
- Prévention des réservations conflictuelles
- Gestion des statuts (pending → confirmed → archived)
- Mise à jour automatique du statut du véhicule

### 5. **Agencies Module** (`src/agencies/`)

Gestion des agences de location.

**Routes:**
```
GET    /agencies              - Toutes les agences (public)
GET    /agencies/:id          - Détails agence
POST   /agencies              - Créer agence (admin)
PUT    /agencies/:id          - Modifier agence (admin)
DELETE /agencies/:id          - Supprimer agence (admin)
```

**Schéma Agency:**
```typescript
{
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  managerId: ObjectId;
  description: string;
  createdAt: Date;
}
```

### 6. **Payments Module** (`src/payments/`)

Intégration des paiements.

**Fichiers clés:**
- `fedapay.service.ts` - Service FedaPay
- `stripe.service.ts` (implicite dans reservations)

**Features:**
- Création de Payment Intent Stripe
- Création de transactions FedaPay
- Vérification de statut de paiement
- Webhook handling FedaPay
- Support devise XOF (franc CFA)

### 7. **Blog Module** (`src/blog/`)

Système de blog avec articles.

**Routes:**
```
GET    /blog                - Tous les articles publiés
GET    /blog/:id            - Détails article
POST   /blog                - Créer article (admin/manager)
PUT    /blog/:id            - Modifier article (admin/manager)
DELETE /blog/:id            - Supprimer article (admin/manager)
```

**Schéma BlogPost:**
```typescript
{
  title: string;
  slug: string (unique);
  content: string;
  category: string;
  tags: string[];
  author: ObjectId;
  published: boolean;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 8. **Contact Module** (`src/contact/`)

Formulaire de contact.

**Routes:**
```
POST   /contact  - Soumettre un message de contact
```

**Schéma Contact:**
```typescript
{
  name: string;
  email: string;
  subject: string;
  message: string;
  phone: string;
  createdAt: Date;
}
```

### 10. **FAQ Module** (`src/faq/`)

Gestion des questions fréquemment posées.

**Routes:**
```
GET    /faq                - Toutes les FAQ publiées (public)
GET    /faq/admin          - Toutes les FAQ (admin/manager)
POST   /faq                - Créer une FAQ
PUT    /faq/:id            - Modifier une FAQ
DELETE /faq/:id            - Supprimer une FAQ
```

**Schéma FAQ:**
```typescript
{
  question: string;
  answer: string;
  category: string;
  order: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### 11. **Newsletter Module** (`src/newsletter/`)

Gestion des abonnements à la newsletter.

**Routes:**
```
POST   /newsletter/subscribe   - S'abonner (public)
GET    /newsletter/admin       - Liste des abonnés (admin/manager)
```

**Schéma Newsletter:**
```typescript
{
  email: string (unique);
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### 9. **Admin Module** (`src/admin/`)

Fonctionnalités administrateur.

**Routes:**
```
GET    /admin/dashboard      - Stats dashboard
GET    /admin/users          - Gérer utilisateurs
POST   /admin/seed           - Seed data (dev)
GET    /admin/reservations   - Toutes les réservations
```

---

## API Endpoints

### Authentication

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "jean@example.com",
  "password": "SecurePass123!",
  "phone": "+228 90000000"
}

Response: 201
{
  "userId": "507f1f77bcf86cd799439011",
  "email": "jean@example.com",
  "role": "client"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "jean@example.com",
  "password": "SecurePass123!"
}

Response: 200
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "jean@example.com",
    "role": "client"
  }
}
```

#### Profile
```http
GET /auth/profile
Authorization: Bearer {access_token}

Response: 200
{
  "id": "507f1f77bcf86cd799439011",
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "jean@example.com",
  "role": "client",
  "avatarUrl": "https://...",
  "favoriteVehicles": ["607f1f77bcf86cd799439011", ...],
  "agencyId": "707f1f77bcf86cd799439011" (si manager)
}
```

### Vehicles

#### Get All Vehicles
```http
GET /vehicles

Response: 200
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Toyota Corolla",
    "dailyRate": 50000,
    "year": 2023,
    "status": "available",
    "mediaUrls": ["https://..."],
    "agency": { "name": "AutoDrive Lome", ... }
  },
  ...
]
```

#### Create Vehicle
```http
POST /vehicles
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Toyota Corolla 2023",
  "brand": "Toyota",
  "model": "Corolla",
  "year": 2023,
  "dailyRate": 50000,
  "transmission": "automatique",
  "fuel": "essence",
  "bodyType": "berline",
  "passengers": 5,
  "city": "Lomé",
  "agencyId": "607f1f77bcf86cd799439011",
  "description": "Véhicule confortable pour transport quotidien",
  "equipment": ["climatisation", "bluetooth", "camera_recul"],
  "mediaUrls": ["https://..."]
}

Response: 201
{
  "_id": "707f1f77bcf86cd799439012",
  "name": "Toyota Corolla 2023",
  ...
}
```

### Reservations

#### Create Reservation
```http
POST /reservations
Authorization: Bearer {token}
Content-Type: application/json

{
  "vehicleId": "507f1f77bcf86cd799439011",
  "startDate": "2026-01-15T09:00:00Z",
  "returnDate": "2026-01-20T18:00:00Z",
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "jean@example.com",
  "phone": "+228 90000000",
  "drivingLicense": "AB123456",
  "pickupLocation": "Lomé",
  "returnLocation": "Kpalimé",
  "insuranceOption": "basic"
}

Response: 201
{
  "_id": "607f1f77bcf86cd799439012",
  "vehicleId": "507f1f77bcf86cd799439011",
  "status": "pending",
  "totalPrice": 250000,
  ...
}
```

#### Create Payment Intent
```http
POST /reservations/{reservationId}/payment-intent
Authorization: Bearer {token}
Content-Type: application/json

{
  "gateway": "stripe"  // ou "fedapay"
}

Response: 200 (Stripe)
{
  "clientSecret": "pi_1234567890_secret_1234567890"
}

Response: 200 (FedaPay)
{
  "transactionId": "123456",
  "token": "tok_live_...",
  "paymentUrl": "https://checkout.fedapay.com/..."
}
```

---

## Base de Données

### Schema Design

```
┌─────────────────────────────────────────┐
│            Collections                  │
├─────────────────────────────────────────┤
│ users (index: email)                    │
│ vehicles (index: agencyId, status)      │
│ reservations (index: userId, vehicleId) │
│ agencies (index: managerId)             │
│ blogposts (index: slug, published)      │
│ contacts                                │
│ payments (implicit via reservations)    │
└─────────────────────────────────────────┘
```

### Indexes recommandés

```javascript
// Users
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });

// Vehicles
db.vehicles.createIndex({ agencyId: 1 });
db.vehicles.createIndex({ status: 1 });
db.vehicles.createIndex({ city: 1 });

// Reservations
db.reservations.createIndex({ userId: 1 });
db.reservations.createIndex({ vehicleId: 1 });
db.reservations.createIndex({ status: 1 });
db.reservations.createIndex({ startDate: 1, returnDate: 1 });

// BlogPosts
db.blogposts.createIndex({ slug: 1 }, { unique: true });
db.blogposts.createIndex({ published: 1 });
```

### Migration de Données

Pour initialiser les données de développement:

```bash
# Via API
curl -X POST http://localhost:3001/admin/seed \
  -H "Authorization: Bearer {admin_token}"

# Ou via MongoDB directement
mongoimport --db autodrive --collection users --file users.json
```

---

## Authentification & Sécurité

### JWT Flow

```
1. Login → Génère access_token (1h) + refresh_token (7j)
2. Tokens stockés en HttpOnly cookies
3. Requête protégée → AuthGuard valide JWT
4. Token expiré → Refresh token renouvelle
5. Logout → Supprime cookies
```

### Rôles & Permissions

```
Admin
├── Voir tous les utilisateurs
├── Voir tous les véhicules (tous les managers)
├── Voir toutes les réservations
├── Créer/modifier/supprimer véhicules (pour toutes les agences)
├── Créer/modifier/supprimer agences
├── Créer/modifier articles blog
└── Voir analytics complètes

Manager
├── Voir ses véhicules seulement
├── Créer/modifier/supprimer ses véhicules
├── Voir les réservations de ses véhicules
├── Confirmer/annuler les réservations
└── Voir les stats de son agence

Client
├── Voir tous les véhicules publics
├── Créer ses réservations
├── Voir ses réservations
├── Annuler ses réservations
└── Gérer ses favoris
```

### Sécurité

- ✅ Bcrypt password hashing (salt: 10)
- ✅ CORS restrictif
- ✅ HttpOnly + Secure cookies
- ✅ Validation DTOs + class-validator
- ✅ Exception filtering global
- ✅ Rate limiting (à implémenter)
- ✅ Input sanitization

### Bonnes Pratiques Implémentées

```typescript
// 1. Password hashing
const hashedPassword = await bcrypt.hash(password, 10);

// 2. JWT validation
@UseGuards(AuthGuard('jwt'))
@Post('protected-route')
async protectedRoute(@Req() req) {
  const userId = req.user.id;
  // ...
}

// 3. Role checking
if (user.role !== 'admin') {
  throw new ForbiddenException('Admin required');
}

// 4. Input validation
@IsEmail()
@IsNotEmpty()
email: string;

// 5. Error handling
try {
  // business logic
} catch (err) {
  throw new BadRequestException(err.message);
}
```

---

## Paiements

### Intégration Stripe

```typescript
// Créer un Payment Intent
const paymentIntent = await stripe.paymentIntents.create({
  amount: totalPrice * 100, // En centimes
  currency: 'xof',
  payment_method_types: ['card'],
  automatic_payment_methods: { enabled: true },
  metadata: { reservationId: id }
});

// Vérifier le paiement
const paymentIntent = await stripe.paymentIntents.retrieve(intentId);
if (paymentIntent.status === 'succeeded') {
  // Marquer comme payé
}
```

### Intégration FedaPay

```typescript
// Créer une transaction
const transaction = await this.fedapayService.createTransaction(
  amount,
  description,
  { reservationId: id }
);

// Vérifier le statut
const status = await this.fedapayService.getTransactionStatus(transactionId);
if (status === 'approved') {
  // Marquer comme payé
}
```

### Flux de Paiement

```
Client choisit gateway
    ↓
POST /reservations/{id}/payment-intent
    ↓
Backend crée intent/transaction
    ↓
Frontend reçoit clientSecret/paymentUrl
    ↓
Client effectue paiement (Stripe/FedaPay)
    ↓
Webhook/Callback → Backend valide
    ↓
Réservation marquée comme payée
    ↓
Véhicule passe en "reserved"
```

---

## Scripts de Déploiement

### Production Build

```bash
# Compiler le TypeScript
npm run build

# Vérifier la taille du bundle
ls -lah dist/

# Démarrer en production
NODE_ENV=production npm run start
```

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 3001

CMD ["node", "dist/main.js"]
```

```bash
docker build -t autodrive-backend:latest .
docker run -p 3001:3001 --env-file .env autodrive-backend:latest
```

### Environment Variables

```bash
# Développement
NODE_ENV=development
DEBUG=true

# Production
NODE_ENV=production
DEBUG=false
```

---

## Dépannage

### Erreurs Communes

#### 1. MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:**
```bash
# Vérifier que MongoDB est lancé
mongod

# Ou vérifier la string MONGODB_URI
echo $MONGODB_URI
```

#### 2. JWT Token Invalid
```
Error: invalid token
```
**Solution:**
```bash
# Vérifier JWT_SECRET est défini
echo $JWT_SECRET

# Vérifier le token n'est pas expiré
```

#### 3. CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:**
```typescript
// Vérifier FRONTEND_ORIGIN dans .env
// S'assurer que credentials: true au frontend
```

#### 4. Supabase Upload Failed
```
Error: 403 Forbidden
```
**Solution:**
```bash
# Vérifier les permissions du bucket Supabase
# Vérifier SUPABASE_KEY est valide
# Vérifier SUPABASE_BUCKET existe
```

### Logs Debugging

```bash
# Activer les logs verbeux
DEBUG=* npm run start:dev

# Vérifier la connexion MongoDB
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/autodrive"

# Tester les endpoints avec curl
curl -X GET http://localhost:3001/vehicles
```

### Performance Optimization

```typescript
// 1. Utiliser .lean() pour les queries en lecture
const vehicles = await this.vehicleModel.find().lean().exec();

// 2. Ajouter les indexes
db.vehicles.createIndex({ agencyId: 1 });

// 3. Paginer les résultats
const page = req.query.page || 1;
const limit = 20;
const skip = (page - 1) * limit;

// 4. Cache avec Redis (optionnel)
@Cacheable()
async findAll() { ... }
```

---

## Support & Documentation

- **Documentation NestJS**: https://docs.nestjs.com
- **MongoDB Docs**: https://docs.mongodb.com
- **Stripe Docs**: https://stripe.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **JWT**: https://jwt.io

## Contributeurs

- Équipe AutoDrive

## License

MIT
