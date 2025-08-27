# MediaStacks — GitHub Pages Ready (PWA + AniList/TMDB)

## ⚙️ Démarrage en local
1. Copier `src/config.sample.js` en `src/config.js` et mettre votre **clé TMDB** :
   ```js
   export const TMDB_API_KEY = "TA_CLE_ICI";
   export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w342";
   ```
2. Lancer : `npx serve .` puis ouvrir l'URL (ex. http://localhost:3000).

## 🌐 Déploiement GitHub Pages
- **Actions** (recommandé) : *Settings → Pages* = **GitHub Actions**. Le workflow `.github/workflows/pages.yml` déploie à chaque push (avec annulation auto des runs en cours).
- **Deploy from a branch** : *Settings → Pages* = **main / root**. Pas de workflow nécessaire.

## ✅ Compat
- Chemins **relatifs** `./...`, hash routing, SW à la racine, manifest + icônes locales.
