# Guide pour Ajouter les Articles de Blog AutoDrive

Il y a 3 façons d'ajouter les articles du guide d'utilisation au blog AutoDrive:

## Méthode 1: Via MongoDB Shell (Recommandée - Plus Simple) 

Cette méthode insère directement les articles dans la base de données MongoDB.

### Prérequis:
- MongoDB installé et en cours d'exécution localement (`mongod`)
- OU accès à votre instance MongoDB Atlas/distante

### Étapes:

**Windows (PowerShell):**
```powershell
mongosh < add-usage-guide-posts.mongodb.js
```

**Linux/Mac (Bash):**
```bash
mongosh < add-usage-guide-posts.mongodb.js
```

**Si votre MongoDB utilise une URI personnalisée:**
```bash
mongosh "mongodb+srv://username:password@cluster.mongodb.net/" < add-usage-guide-posts.mongodb.js
```

### Résultat:
✓ 5 articles insérés directement dans la base de données
✓ Les articles apparaissent immédiatement sur la page du blog
✓ Aucune authentification requise

---

## Méthode 2: Via l'API REST (Avec Authentification)

Cette méthode crée les articles via l'endpoint API. Vous devez d'abord créer un compte admin.

### Prérequis:
- Le backend doit être en cours d'exécution (`npm run start:dev`)
- Avoir un compte admin ou gestionnaire d'agence

### Étapes:

**Windows (PowerShell):**
```powershell
.\add-usage-guide-posts.ps1
```

**Linux/Mac (Bash):**
```bash
bash add-usage-guide-posts.sh
```

**Note**: Les scripts PS1/SH utiliseront l'API sans authentification. Pour cela, il faut modifier le contrôleur pour autoriser l'ajout sans authentification (à faire manuellement si nécessaire).

---

## Méthode 3: Via l'Interface Web (Manuel)

1. Créez un compte admin
2. Allez au tableau de bord admin
3. Accédez à la section "Blog"
4. Cliquez sur "Ajouter un Article"
5. Remplissez les informations de chacun des 5 articles
6. Publiez

---

## Articles à Ajouter

Les 5 articles suivants seront ajoutés:

1. **"Comment réserver votre premier véhicule sur AutoDrive"**
   - Slug: `comment-reserver-premier-vehicule`
   - Catégorie: Guides
   - Tags: réservation, débutant, tutoriel

2. **"Gérer votre profil et vos préférences sur AutoDrive"**
   - Slug: `gerer-profil-preferences`
   - Catégorie: Guides
   - Tags: profil, sécurité, favoris

3. **"Guide Complet pour les Gestionnaires d'Agence AutoDrive"**
   - Slug: `guide-gestionnaires-agence`
   - Catégorie: Guides
   - Tags: gestionnaire, agence, gestion

4. **"Conseils de Sécurité pour Votre Location de Véhicule"**
   - Slug: `conseils-securite-location`
   - Catégorie: Conseils
   - Tags: sécurité, conduite, prévention

5. **"Guide Complet des Paiements et de la Facturation AutoDrive"**
   - Slug: `guide-paiements-facturation`
   - Catégorie: Guides
   - Tags: paiement, facturation, tarification

---

## Vérification

Après l'insertion, vérifiez que les articles s'affichent:

**Via MongoDB Shell:**
```javascript
db.blogposts.find({ published: true }).pretty()
```

**Via l'API:**
```bash
curl http://localhost:3001/blog
```

**Via la Page Web:**
1. Accédez à `http://localhost:3000/blog`
2. Les articles doivent s'afficher

---

## Troubleshooting

### "Erreur: database command failed"
- Vérifiez que MongoDB est en cours d'exécution
- Vérifiez la connexion à votre MongoDB

### Articles n'apparaissent pas sur la page
- Vérifiez que le backend utilise `API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE`
- Rafraîchissez la page (F5)
- Vérifiez que `published: true` est défini pour les articles

### Erreur d'authentification avec l'API
- La méthode API requiert un compte admin
- Utilisez MongoDB Shell à la place (Méthode 1)

---

## Besoin d'Aide?

- Consultez le README du projet
- Vérifiez que MongoDB est accessible
- Assurez-vous que le backend est en cours d'exécution
