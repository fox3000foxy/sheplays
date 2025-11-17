# Système de Parrainage ShePlays - Documentation

## Vue d'ensemble

Le système de parrainage permet aux clients de parrainer des talents. Chaque client dispose d'un code de parrainage unique qu'il peut partager avec les talents. Les talents peuvent ensuite valider ce code dans leur dashboard.

---

## 🎯 Fonctionnalités

### Pour les Clients

1. **Code de parrainage unique** : Chaque client reçoit automatiquement un code unique (8 caractères alphanumériques)
2. **Lien de parrainage** : Génération automatique d'un lien avec le code pré-rempli
3. **Liste des talents parrainés** : Visualisation de tous les talents qui ont utilisé leur code
4. **Statistiques** : Nombre de parrainages, sessions des talents parrainés, etc.

### Pour les Talents

1. **Saisie du code** : Interface simple pour entrer le code de parrainage
2. **Validation en temps réel** : Vérification instantanée du code et affichage du parrain
3. **Photo et pseudo du parrain** : Visualisation du client parrain
4. **Pré-remplissage via lien** : Si le talent utilise le lien de parrainage, le code est automatiquement pré-rempli

---

## 📊 Structure de la Base de Données

### Table `referral_codes`

Stocke les codes de parrainage de chaque client.

| Colonne | Type | Description |
|---------|------|-------------|
| id | INT AUTO_INCREMENT | ID unique |
| user_id | VARCHAR(64) UNIQUE | Discord ID du client |
| referral_code | VARCHAR(16) UNIQUE | Code de parrainage unique |
| created_at | BIGINT | Timestamp de création |

**Index:**
- `idx_user_id` sur `user_id`
- `idx_referral_code` sur `referral_code`

### Table `referrals`

Enregistre les parrainages validés.

| Colonne | Type | Description |
|---------|------|-------------|
| id | INT AUTO_INCREMENT | ID unique |
| talent_discord_id | VARCHAR(64) UNIQUE | Discord ID du talent parrainé |
| referrer_user_id | VARCHAR(64) | Discord ID du parrain (client) |
| referral_code | VARCHAR(16) | Code utilisé |
| created_at | BIGINT | Timestamp de validation |

**Index:**
- `idx_talent` sur `talent_discord_id`
- `idx_referrer` sur `referrer_user_id`

**Contraintes:**
- Foreign key sur `referral_code` → `referral_codes(referral_code)` CASCADE

### Modifications Table `talents`

Deux nouvelles colonnes ajoutées:

| Colonne | Type | Description |
|---------|------|-------------|
| referred_by | VARCHAR(64) NULL | Discord ID du parrain |
| referral_code_used | VARCHAR(16) NULL | Code utilisé |

**Index:**
- `idx_referred_by` sur `referred_by`

---

## 🔧 API Endpoints

### 1. Obtenir/Générer le Code de Parrainage

**Endpoint:** `GET /api/referral/get-code/[userId]`

**Description:** Récupère ou génère le code de parrainage d'un client.

**Réponse:**
```json
{
  "referral_code": "ABC12XYZ",
  "referral_link": "https://sheplays.wtf/start?ref=ABC12XYZ"
}
```

### 2. Vérifier un Code de Parrainage

**Endpoint:** `GET /api/referral/get-referrer/[code]`

**Description:** Vérifie si un code de parrainage est valide et retourne les infos du parrain.

**Réponse:**
```json
{
  "valid": true,
  "referrer_user_id": "123456789012345678",
  "referral_code": "ABC12XYZ"
}
```

**Erreur (code invalide):**
```json
{
  "error": "invalid_code"
}
```

### 3. Appliquer un Code de Parrainage

**Endpoint:** `POST /api/referral/apply`

**Body:**
```json
{
  "talentDiscordId": "987654321098765432",
  "referralCode": "ABC12XYZ"
}
```

**Réponse (succès):**
```json
{
  "success": true,
  "message": "Code de parrainage appliqué avec succès!",
  "referrer_user_id": "123456789012345678"
}
```

**Erreurs possibles:**
- `invalid_code` : Code inexistant
- `talent_not_found` : Talent non trouvé
- `already_referred` : Le talent a déjà utilisé un code

### 4. Récupérer les Talents Parrainés

**Endpoint:** `GET /api/referral/my-referrals/[userId]`

**Description:** Récupère tous les talents parrainés par un client.

**Réponse:**
```json
{
  "success": true,
  "count": 3,
  "referrals": [
    {
      "talent_discord_id": "987654321098765432",
      "referral_code": "ABC12XYZ",
      "created_at": 1705000000000,
      "display_name": "GamerGirl",
      "username": "gamergirl#1234",
      "bio": "Joueuse passionnée",
      "total_sessions": 15,
      "rating": 4.8,
      "review_count": 12
    }
  ]
}
```

---

## 💻 Interfaces Utilisateur

### Dashboard Client (onglet "Parrainage")

**Localisation:** `src/app/dashboard/DashboardClient.tsx` (ligne 1015-1100)

**Affichage:**
1. **Section "Mon code de parrainage"**
   - Code en grand, police monospace
   - Lien de parrainage avec bouton "Copier"
   - Message informatif sur comment l'utiliser

2. **Section "Mes talents parrainés"**
   - Liste des talents avec:
     - Photo de profil
     - Nom et pseudo
     - Nombre de sessions
     - Note moyenne
     - Date de parrainage

### Dashboard Talent (onglet "Parrainage")

**Localisation:** `src/app/dashboard/DashboardClient.tsx` (ligne 1104-1178)

**Affichage:**

**Si déjà parrainé:**
- Message de confirmation vert
- Texte de remerciement

**Si pas encore parrainé:**
- Champ de saisie du code (uppercase, max 16 caractères)
- Vérification en temps réel dès 6 caractères
- Affichage du parrain si code valide:
  - Photo de profil Discord
  - Texte "Parrain trouvé"
  - ID partiellement masqué
- Bouton "Valider le parrainage" (désactivé si code invalide)

### Page /start avec Lien de Parrainage

**Localisation:** `src/app/start/StartClient.tsx`

**Fonctionnement:**
1. Détection du paramètre `?ref=CODE` dans l'URL
2. Vérification automatique du code
3. Affichage visuel:
   - **Code valide:** Encadré bleu avec photo du parrain, message d'invitation
   - **Code invalide:** Encadré rouge avec message d'erreur
4. Stockage du code dans `localStorage` pour pré-remplissage ultérieur

---

## 🔄 Flux Complet

### Scénario 1 : Client partage son code

1. **Client** se connecte → Dashboard → Onglet "Parrainage"
2. Le système génère automatiquement un code unique (ex: `XBCJ9K2L`)
3. Le lien est généré: `https://sheplays.wtf/start?ref=XBCJ9K2L`
4. **Client** copie le lien et l'envoie au talent
5. **Talent** clique sur le lien
6. La page `/start` affiche le code et la photo du parrain
7. Le code est stocké dans `localStorage`
8. **Talent** rejoint Discord et crée son profil
9. **Talent** va sur Dashboard → Onglet "Parrainage"
10. Le code est pré-rempli automatiquement depuis le `localStorage`
11. Le parrain s'affiche automatiquement
12. **Talent** clique sur "Valider le parrainage"
13. Le code est enregistré en base de données
14. Le `localStorage` est nettoyé
15. **Client** voit maintenant le talent dans sa liste "Mes talents parrainés"

### Scénario 2 : Talent entre manuellement le code

1. **Talent** va sur Dashboard → Onglet "Parrainage"
2. **Talent** tape le code reçu par message
3. Après 6 caractères, vérification automatique
4. Si valide, le parrain s'affiche
5. **Talent** clique sur "Valider"
6. Code enregistré en base

---

## 🎨 Génération des Codes

**Fonction:** `generateUniqueReferralCode()` dans `src/app/api/referral/get-code/[userId]/route.ts`

**Caractéristiques:**
- **Longueur:** 8 caractères
- **Alphabet:** `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`
  - Exclut: O, 0, I, 1 (pour éviter les confusions)
- **Unicité:** Vérifie en base avant de retourner
- **Fallback:** Si collision après 10 tentatives, utilise un timestamp en base36

**Exemple de codes générés:**
- `ABC12XYZ`
- `KLJN5P8Q`
- `WXYZ2345`

---

## 🔐 Sécurité et Validations

### Côté Backend

1. **Codes uniques:** Index UNIQUE sur `referral_codes.referral_code`
2. **Un seul parrainage par talent:** Index UNIQUE sur `referrals.talent_discord_id`
3. **Validation des talents:** Vérifie que le talent existe avant d'appliquer le code
4. **Validation des codes:** Vérifie que le code existe avant de l'appliquer
5. **Gestion des doublons:** Erreur `ER_DUP_ENTRY` capturée et transformée en message utilisateur

### Côté Frontend

1. **Uppercase automatique:** Le code est converti en majuscules
2. **Longueur limitée:** Max 16 caractères
3. **Vérification en temps réel:** Après 6 caractères minimum
4. **Désactivation du bouton:** Si code invalide ou non vérifié
5. **Messages clairs:** Toasts pour succès/erreur

---

## 📱 Responsive Design

Le système est entièrement responsive:
- **Desktop:** Grille 2 colonnes pour les listes
- **Mobile:** Stacks verticaux, boutons pleine largeur
- **Photos:** Adaptatives (w-12 h-12 soit 48x48px)

---

## 🧪 Tests

### Test Manuel - Client

1. Se connecter en tant que client (non-talent)
2. Aller dans Dashboard → Parrainage
3. Vérifier qu'un code est généré
4. Copier le lien
5. Ouvrir le lien dans un nouvel onglet incognito
6. Vérifier que la page `/start` affiche bien le code

### Test Manuel - Talent

1. Se connecter en tant que talent
2. Aller dans Dashboard → Parrainage
3. Entrer un code invalide → Voir l'erreur
4. Entrer un code valide → Voir le parrain
5. Valider → Voir le message de succès
6. Rafraîchir la page → Voir "Vous avez déjà utilisé un code"

### Test Manuel - Lien Pré-rempli

1. Créer un client et récupérer son lien de parrainage
2. Ouvrir le lien dans un nouveau navigateur
3. Vérifier que la page affiche le code valide
4. Se connecter en tant que talent
5. Aller dans Dashboard → Parrainage
6. Vérifier que le code est pré-rempli

### Tests SQL

```sql
-- Vérifier qu'un client a un code
SELECT * FROM referral_codes WHERE user_id = 'CLIENT_DISCORD_ID';

-- Vérifier les parrainages d'un client
SELECT * FROM referrals WHERE referrer_user_id = 'CLIENT_DISCORD_ID';

-- Vérifier qu'un talent a été parrainé
SELECT referred_by, referral_code_used FROM talents WHERE discord_id = 'TALENT_DISCORD_ID';

-- Lister tous les codes de parrainage
SELECT * FROM referral_codes;
```

---

## 📝 Installation

```bash
# 1. Créer les tables
mysql -u sheplaysuser -p'PASSWORD' sheplays < /home/ubuntu/sheplays/setup-referral-system.sql

# 2. Vérifier les tables
mysql -u sheplaysuser -p'PASSWORD' -e "SHOW TABLES LIKE '%referral%';" sheplays

# 3. Build du projet
npm run build

# 4. Redémarrer l'application
pm2 restart sheplays
```

---

## 🚀 Améliorations Futures Possibles

1. **Notifications Discord** quand un talent utilise votre code
2. **Récompenses** pour les clients qui parrainent beaucoup de talents
3. **Analytics** : Graphiques d'évolution des parrainages
4. **Codes personnalisés** : Permettre aux clients de choisir leur code
5. **Expiration** : Codes valables pendant X temps
6. **Limite** : Nombre maximum de parrainages par client
7. **Niveaux** : Bronze/Silver/Gold selon nombre de parrainages

---

## 🐛 Dépannage

### Le code n'est pas généré

- Vérifier que la table `referral_codes` existe
- Vérifier les logs serveur
- Tester l'endpoint directement: `curl http://localhost:3000/api/referral/get-code/USER_ID`

### Le code n'est pas validé

- Vérifier que le talent existe dans la table `talents`
- Vérifier que le code existe dans `referral_codes`
- Vérifier que le talent n'a pas déjà un `referred_by`

### Le lien ne pré-remplit pas

- Vérifier que le localStorage fonctionne (pas en mode privé)
- Vérifier la console du navigateur pour les erreurs
- Vérifier le format de l'URL: `/start?ref=CODE`

---

## 📞 Support

Pour toute question ou bug, consultez:
- Les logs serveur
- La console navigateur (F12)
- Les tables MySQL directement

---

**Date de création:** 2025-01-17
**Version:** 1.0
**Auteur:** Claude Code
