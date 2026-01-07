# Guide d'utilisation du Blog

## Structure du Blog

Le système de blog a été implémenté complètement avec les fonctionnalités suivantes :

### Backend (NestJS)
- **Module Blog** : `/src/blog/`
  - `blog.controller.ts` : Endpoints REST
  - `blog.service.ts` : Logique métier
  - `blog-post.schema.ts` : Schéma MongoDB

### Frontend (Next.js)
- **Pages Blog** :
  - `/app/blog/page.tsx` : Liste complète avec filtrage et pagination
  - `/app/blog/[slug]/page.tsx` : Détail d'un article avec articles connexes
- **Homepage** : Section affichant les 3 derniers articles
- **Navigation** : Lien "BLOG" dans la navbar

---

## Endpoints API

### Récupérer les articles (avec pagination)
```bash
GET /api/blog?page=1&limit=10&category=actualités
```

**Paramètres** :
- `page` (défaut: 1)
- `limit` (défaut: 10)
- `category` (optionnel): 'conseils', 'actualités', 'guides', 'tutoriels'

**Réponse** :
```json
{
  "data": [
    {
      "_id": "...",
      "title": "...",
      "slug": "...",
      "excerpt": "...",
      "content": "...",
      "author": "...",
      "imageUrl": "...",
      "tags": ["...", "..."],
      "category": "actualités",
      "published": true,
      "views": 42,
      "publishedAt": "2025-01-07T...",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "total": 15,
  "pages": 2
}
```

### Récupérer les 3 derniers articles
```bash
GET /api/blog/latest?limit=3
```

**Réponse** : Array de 3 articles (dernier format)

### Récupérer un article par slug
```bash
GET /api/blog/:slug
```

**Note** : Incrémente automatiquement le compteur de vues

### Rechercher par tag
```bash
GET /api/blog/tag/:tag
```

---

## Créer un Article (Admin/Manager)

### Endpoint
```bash
POST /api/blog
```

### Authentification
Nécessite un JWT Bearer token avec rôle `admin` ou `manager`

```bash
curl -X POST http://localhost:3001/api/blog \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Guide complet de la location de voiture",
    "excerpt": "Découvrez tous nos conseils pour bien louer une voiture",
    "content": "<h2>Introduction</h2><p>La location de voiture...</p>",
    "author": "Équipe AutoDrive",
    "imageUrl": "https://example.com/image.jpg",
    "tags": ["conseils", "guides", "location"],
    "category": "guides",
    "published": true
  }'
```

### Champs obligatoires
- `title` : Titre de l'article
- `excerpt` : Résumé court (affiché en aperçu)
- `content` : Contenu HTML complet
- `author` : Nom de l'auteur
- `imageUrl` (optionnel) : URL de l'image de couverture

### Champs optionnels
- `tags` : Array de tags
- `category` : 'conseils', 'actualités', 'guides', 'tutoriels' (défaut: 'actualités')
- `published` : true/false (défaut: true)

---

## Modifier un Article (Admin/Manager)

```bash
PATCH /api/blog/:id
```

Accepte les mêmes champs que la création (tous optionnels pour une mise à jour partielle)

---

## Supprimer un Article (Admin/Manager)

```bash
DELETE /api/blog/:id
```

---

## Exemple complet avec cURL

### 1. Créer un article
```bash
curl -X POST http://localhost:3001/api/blog \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "5 conseils pour une location réussie",
    "excerpt": "Nos meilleures pratiques pour vos trajets",
    "content": "<h2>Conseil 1</h2><p>Toujours vérifier l'état du véhicule...</p><h2>Conseil 2</h2><p>...</p>",
    "author": "Jean Dupont",
    "imageUrl": "https://images.unsplash.com/photo-...",
    "tags": ["conseils", "location", "sécurité"],
    "category": "conseils",
    "published": true
  }'
```

### 2. Récupérer les articles
```bash
curl http://localhost:3001/api/blog?category=conseils&limit=5
```

### 3. Accéder au blog
- Page d'accueil : http://localhost:3000 (section "Blog et Actualités")
- Page complète : http://localhost:3000/blog
- Détail article : http://localhost:3000/blog/5-conseils-pour-une-location-reussie

---

## Fonctionnalités SEO

- **Slug unique** : Généré automatiquement à partir du titre, optimisé pour les URLs
- **Métadonnées** : Chaque article a titre, description (excerpt), image, auteur, date
- **URLs amies** : `/blog/titre-article` au lieu d'IDs
- **Compteur de vues** : Suivi du nombre de lectures
- **Tags** : Permettent la catégorisation et la découverte croisée

### Amélioration du référencement
Pour améliorer le SEO, vous pouvez :
1. Créer des articles de 500+ mots
2. Utiliser des mots-clés pertinents dans le titre et excerpt
3. Ajouter des images optimisées
4. Lier les articles connexes (automatique par catégorie)
5. Ajouter du contenu HTML riche avec titres (h2, h3)
6. Créer des articles sur des sujets pertinents pour votre audience

---

## Structure de la Base de Données

### BlogPost Collection
```javascript
{
  _id: ObjectId,
  title: String (unique index),
  slug: String (unique index),
  excerpt: String,
  content: String (HTML),
  author: String,
  imageUrl: String,
  tags: [String],
  category: 'conseils' | 'actualités' | 'guides' | 'tutoriels',
  published: Boolean,
  views: Number,
  publishedAt: Date,
  createdAt: Date (automatique),
  updatedAt: Date (automatique)
}
```

---

## Notes d'implémentation

- **Slug automatique** : Generé depuis le titre, accents et caractères spéciaux supprimés
- **Validation** : Slug unique, catégorie valide, titre requis
- **Permissions** : Seuls les admins et managers peuvent créer/modifier/supprimer
- **Filtrage** : Les articles non publiés (`published: false`) ne s'affichent pas publiquement
- **Tri** : Par défaut trié par date de publication décroissante (plus récent en premier)
- **Images** : Peut utiliser Supabase ou autre service, passé en URL

---

## Améliorations futures

- [ ] Commentaires sur les articles
- [ ] Système de notation (étoiles)
- [ ] Newsletter d'abonnement aux nouvelles
- [ ] Génération automatique de sitemap XML
- [ ] Integration avec les médias sociaux (partage)
- [ ] Recherche full-text avec Elasticsearch
- [ ] Articles suggérés par IA basés sur les vues
- [ ] Minuteur de lecture estimée
- [ ] Authentification sociale pour les commentaires
