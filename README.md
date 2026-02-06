# 🍽️ Gourmet App

Application de commande et réservation pour restaurant.

---

## 🚀 Déploiement sur Netlify (étape par étape)

### Prérequis
- Un compte [GitHub](https://github.com) (gratuit)
- Un compte [Netlify](https://netlify.com) (gratuit)
- [Node.js](https://nodejs.org) installé sur ton PC (v18+)
- [Git](https://git-scm.com) installé

### Étape 1 — Tester en local

```bash
cd gourmet-app
npm install
npm run dev
```

Ouvre http://localhost:5173 pour vérifier que tout marche.

### Étape 2 — Créer un repo GitHub

1. Va sur https://github.com/new
2. Nom du repo : `gourmet-app`
3. Laisse en **Public** ou **Private**
4. Ne coche rien (pas de README, pas de .gitignore)
5. Clique **Create repository**

### Étape 3 — Push le code sur GitHub

```bash
cd gourmet-app
git init
git add .
git commit -m "Initial commit - Gourmet App"
git branch -M main
git remote add origin https://github.com/TON-USERNAME/gourmet-app.git
git push -u origin main
```

> ⚠️ Remplace `TON-USERNAME` par ton nom d'utilisateur GitHub.

### Étape 4 — Déployer sur Netlify

1. Va sur https://app.netlify.com
2. Connecte-toi avec GitHub
3. Clique **"Add new site"** → **"Import an existing project"**
4. Sélectionne **GitHub** puis ton repo `gourmet-app`
5. Les paramètres seront auto-détectés grâce au fichier `netlify.toml` :
   - Build command : `npm run build`
   - Publish directory : `dist`
6. Clique **"Deploy site"**
7. En ~1 minute, ton site est live ! 🎉

### Étape 5 — Nom de domaine personnalisé (optionnel)

1. Dans Netlify → **Domain management** → **Add custom domain**
2. Tu peux aussi changer le sous-domaine gratuit :
   - Settings → Domain → Change site name
   - Ex: `gourmet-app.netlify.app`

---

## 🔌 Connexion n8n (webhooks)

Quand tu auras configuré n8n, ouvre `src/App.jsx` et modifie la section `CONFIG` :

```js
const CONFIG = {
  restaurantName: "Gourmet App",
  subtitle: "Commandez & Réservez",
  webhooks: {
    order: "https://ton-n8n.com/webhook/commande",       // ← ton URL ici
    reservation: "https://ton-n8n.com/webhook/reservation", // ← ton URL ici
  },
};
```

Les données envoyées au webhook **commande** :
```json
{
  "timestamp": "2026-02-06T15:30:00.000Z",
  "items": [
    { "name": "Le Burger Signature", "qty": 2, "price": 14.90, "subtotal": 29.80 }
  ],
  "total": 29.80,
  "itemCount": 2
}
```

Les données envoyées au webhook **réservation** :
```json
{
  "timestamp": "2026-02-06T15:30:00.000Z",
  "guests": 4,
  "date": "2026-02-14",
  "time": "20:00",
  "name": "Jean Dupont",
  "phone": "06 12 34 56 78",
  "notes": "Anniversaire"
}
```

---

## 📁 Structure du projet

```
gourmet-app/
├── public/
│   └── favicon.svg
├── src/
│   ├── App.jsx          ← Code principal (menu, panier, réservation)
│   ├── main.jsx         ← Point d'entrée React
│   └── index.css        ← Styles globaux + Tailwind
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── netlify.toml         ← Config Netlify
└── .gitignore
```

## ✏️ Personnalisation rapide

- **Menu** : modifie le tableau `MENU_ITEMS` dans `src/App.jsx`
- **Nom du resto** : modifie `CONFIG.restaurantName`
- **Couleurs** : cherche `orange-600` et remplace par ta couleur Tailwind
- **Horaires de réservation** : modifie le tableau dans le `<select>` du formulaire
