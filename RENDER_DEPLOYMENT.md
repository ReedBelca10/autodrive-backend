# Guide de Déploiement sur Render

## Étapes d'Installation

### 1. **Créer un compte Render**
   - Allez sur [render.com](https://render.com)
   - Créez un compte (gratuit ou payant)
   - Connectez-vous avec GitHub

### 2. **Préparer le Repository GitHub**
   ```bash
   # Assurez-vous que votre backend est sur GitHub
   git remote add origin https://github.com/votre-username/AutoDrive-Backend.git
   git push -u origin main
   ```

### 3. **Connecter Render à GitHub**
   - Dans votre dashboard Render, cliquez sur **New +**
   - Sélectionnez **Web Service**
   - Connectez votre compte GitHub
   - Sélectionnez le repository `AutoDrive-Backend`
   - Choisissez la branche `main` (ou votre branche de déploiement)

### 4. **Configurer le Web Service**

   #### Informations Basiques
   - **Name**: `autodrive-backend`
   - **Environment**: `Node`
   - **Plan**: `Standard` (recommandé pour production)
   
   #### Build & Deploy
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   
   #### Variables d'Environnement
   Cliquez sur **Environment** et ajoutez toutes les variables depuis `.env.example`:

   ```
   NODE_ENV: production
   PORT: 3001
   MONGODB_URI: [votre URL MongoDB Atlas]
   JWT_SECRET: [votre clé secrète forte]
   FRONTEND_ORIGIN: [URL de votre frontend]
   STRIPE_SECRET_KEY: [votre clé Stripe]
   FEDAPAY_API_KEY: [votre clé FedaPay]
   SUPABASE_URL: [votre URL Supabase]
   SUPABASE_KEY: [votre clé Supabase]
   SMTP_HOST: smtp.gmail.com
   SMTP_PORT: 587
   SMTP_USER: [votre email]
   SMTP_PASSWORD: [votre mot de passe]
   SMTP_FROM: noreply@autodrive.com
   ```

### 5. **Déployer**
   - Cliquez sur **Create Web Service**
   - Attendez que le déploiement se termine (3-5 minutes)
   - Votre URL sera: `https://autodrive-backend.onrender.com`

---

## Configuration Important

### MongoDB
- Utilisez MongoDB Atlas (gratuit jusqu'à 512MB)
- Créez un cluster gratuit sur [mongodb.com/cloud](https://mongodb.com/cloud)
- Whitelist l'IP `0.0.0.0/0` sur MongoDB Atlas pour permettre Render

### JWT Secret
- Générez une clé forte:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

### CORS Frontend
- Mettez à jour `FRONTEND_ORIGIN` avec l'URL de votre frontend
- Si le frontend est aussi sur Render, utilisez: `https://your-frontend.onrender.com`

### Stripe & FedaPay
- Obtenez les clés API depuis vos dashboards respectifs
- Mettez à jour les URLs de webhook si nécessaire

---

## Redéploiement Automatique

Render redéploie automatiquement quand vous pushez sur la branche configurée:

```bash
git add .
git commit -m "feat: update backend"
git push origin main
```

Vérifiez l'état du déploiement dans l'onglet **Deploys** de Render.

---

## Vérifier que le Backend Fonctionne

```bash
# Tester l'API
curl https://autodrive-backend.onrender.com/health

# Vérifier les logs
# Dans Render Dashboard → Logs
```

---

## Backup des Variables d'Environnement

Sauvegardez votre `.env` local en sécurité:
```bash
# Ne JAMAIS commitez le .env
# Gardez-le dans 1Password ou similaire
```

---

## Checklist Finale

- [ ] MongoDB Atlas configuré et accessible
- [ ] Repository GitHub créé et pushé
- [ ] Compte Render créé et connecté à GitHub
- [ ] Web Service créé et déployé
- [ ] Toutes les variables d'environnement configurées
- [ ] Frontend mis à jour avec la nouvelle URL backend
- [ ] Tests des endpoints principaux passés
- [ ] SSL/HTTPS vérifié (Render le fait automatiquement)

---

## Support Render

- [Documentation Render](https://render.com/docs)
- [Status Page](https://status.render.com)
- Support email: support@render.com
