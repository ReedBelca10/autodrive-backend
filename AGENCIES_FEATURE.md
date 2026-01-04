# Fonctionnalité Agences

## Vue d'ensemble
La fonctionnalité Agences permet aux administrateurs de gérer les agences de location de véhicules. Chaque agence peut être associée à un gestionnaire (manager) spécifique et posséder des informations de localisation.

## Architecture

### Backend (NestJS)

#### Module: `AgenciesModule`
- **Contrôleur**: `AgenciesController`
- **Service**: `AgenciesService`
- **Schéma**: `AgencySchema`

#### Endpoints API

##### Configuration (Public)
- `GET /agencies/config/cities` - Retourne la liste des 20 villes du Togo
- `GET /agencies/config/managers` (AdminGuard) - Retourne la liste des gestionnaires

##### CRUD Agences
- `GET /agencies` - Récupère toutes les agences actives avec les détails du gestionnaire
- `GET /agencies/:id` - Récupère une agence spécifique
- `POST /agencies` (AdminGuard) - Crée une nouvelle agence
- `PUT /agencies/:id` (AdminGuard) - Mettre à jour une agence
- `DELETE /agencies/:id` (AdminGuard) - Supprime (soft delete) une agence

#### Schéma Agency

```typescript
{
  name: string;              // Nom de l'agence
  city: string;              // Ville (l'une des villes du Togo)
  managerId: ObjectId;       // Référence vers un gestionnaire (User)
  latitude: number;          // Coordonnée GPS
  longitude: number;         // Coordonnée GPS
  phone?: string;            // Numéro de téléphone
  email?: string;            // Adresse email
  description?: string;      // Description de l'agence
  isActive: boolean;         // État de l'agence (soft delete)
  createdAt: Date;           // Date de création
  updatedAt: Date;           // Date de modification
}
```

#### Villes du Togo
Les 20 villes principales du Togo sont définies dans `src/agencies/constants/togo-cities.ts`:
- Lomé
- Sokodé
- Kpalimé
- Atakpamé
- Tchamba
- Kabrais
- Santé
- Tabligbo
- Tsévié
- Dogbo
- Notsé
- Anécho
- Aného
- Dapaong
- Mango
- Bassar
- Dapango
- Vogan
- Badou
- Kamina

### Frontend (Next.js)

#### Pages

##### Page Listing: `/admin/agencies`
- Affiche un tableau de toutes les agences
- Colonnes: Nom, Ville, Gestionnaire, Téléphone, Email, Lien Google Maps, Actions
- Boutons d'action: Edit, Delete
- Bouton: "Ajouter une agence" (redirige vers `/admin/agencies/new`)

**Fichier**: `app/admin/agencies/page.tsx`

##### Page Création: `/admin/agencies/new`
- Formulaire pour créer une nouvelle agence
- Champs:
  - Nom (texte)
  - Ville (sélection dropdown)
  - Gestionnaire (sélection dropdown)
  - Latitude (nombre)
  - Longitude (nombre)
  - Téléphone (texte)
  - Email (texte)
  - Description (textarea)
- Appel API: `POST /agencies`

**Fichier**: `app/admin/agencies/new/page.tsx`

##### Page Édition: `/admin/agencies/[id]`
- Formulaire pour éditer une agence existante
- Même champs que la création, pré-remplis
- Bouton "Supprimer" pour soft delete
- Appel API: `PUT /agencies/:id` et `DELETE /agencies/:id`

**Fichier**: `app/admin/agencies/[id]/page.tsx`

#### Menu de Navigation
Le lien "Nos agences" a été ajouté au layout admin avec l'icône MapPin.

**Fichier modifié**: `app/admin/layout.tsx`

## Utilisation

### Accès
- Les routes admin sont protégées par le middleware d'authentification
- Seuls les administrateurs (role='admin') peuvent accéder à la gestion des agences
- L'authentification utilise les JWT tokens stockés en HttpOnly cookies

### Créer une agence
1. Aller à `/admin/agencies`
2. Cliquer sur "Ajouter une agence"
3. Remplir le formulaire
4. Sélectionner une ville et un gestionnaire
5. Entrer les coordonnées GPS
6. Cliquer sur "Créer l'agence"

### Éditer une agence
1. Aller à `/admin/agencies`
2. Cliquer sur le bouton "Edit" d'une agence
3. Modifier les champs
4. Cliquer sur "Mettre à jour"

### Supprimer une agence
1. Aller à `/admin/agencies/[id]` (page d'édition)
2. Cliquer sur "Supprimer"
3. Confirmer la suppression

## Intégration avec Google Maps
Les agences affichent un lien vers Google Maps basé sur les coordonnées GPS:
```
https://maps.google.com/?q=latitude,longitude
```

## Notes de sécurité
- Les endpoints CRUD (POST, PUT, DELETE) sont protégés par `AdminGuard`
- Les endpoints de configuration (villes, gestionnaires) n'acheminent que des données publiques
- Les gestionnaires doivent avoir le role='manager' pour apparaître dans la sélection

## Fichiers créés/modifiés

### Créés
- `/backend/src/agencies/` - Module complet des agences
- `/backend/src/agencies/schemas/agency.schema.ts`
- `/backend/src/agencies/agencies.service.ts`
- `/backend/src/agencies/agencies.controller.ts`
- `/backend/src/agencies/agencies.module.ts`
- `/backend/src/agencies/constants/togo-cities.ts`
- `/frontend/app/admin/agencies/page.tsx`
- `/frontend/app/admin/agencies/new/page.tsx`
- `/frontend/app/admin/agencies/[id]/page.tsx`

### Modifiés
- `/backend/src/app.module.ts` - Ajout de AgenciesModule
- `/frontend/app/admin/layout.tsx` - Ajout du menu "Nos agences"
