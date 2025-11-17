# Changelog - Système de disponibilités amélioré

## Version 2.0 - 2025-01-17

### ✨ Nouvelles fonctionnalités

#### 1. Découpage automatique des créneaux traversant minuit

**Problème résolu :** Auparavant, il était difficile de gérer les créneaux qui dépassent minuit.

**Solution :** Les créneaux qui traversent minuit sont maintenant **automatiquement découpés** en deux créneaux distincts.

**Exemple :**
- **Avant :** Un playmate devait manuellement créer deux créneaux
- **Maintenant :** Le playmate crée un seul créneau `22:00-02:00` et le système le découpe automatiquement :
  - Lundi : `22:00-23:59`
  - Mardi : `00:00-02:00`

**Fichier modifié :** `src/app/api/db/playmate/calendar/route.ts`

---

#### 2. Reset hebdomadaire automatique des disponibilités

**Fonctionnalité :** Chaque **dimanche à 23h59**, toutes les disponibilités de tous les playmates sont **automatiquement réinitialisées**.

**Avantages :**
- Garantit que les disponibilités sont toujours à jour
- Évite les créneaux obsolètes
- Force les playmates à mettre à jour leur planning chaque semaine

**Implémentation :**
- Nouveau endpoint : `GET /api/cron/weekly-reset`
- Nouveau cron job : `59 23 * * 0` (dimanche 23h59)
- Fichier : `src/app/api/cron/weekly-reset/route.ts`

---

#### 3. Interface utilisateur améliorée

**Ajout :** Bandeau d'information dans l'onglet "Disponibilités" du dashboard des playmates.

**Contenu du message :**
- Les créneaux qui dépassent minuit sont automatiquement divisés
- Toutes les disponibilités sont réinitialisées chaque dimanche à 23h59
- Rappel de redéfinir les disponibilités chaque semaine

**Fichier modifié :** `src/app/dashboard/DashboardClient.tsx`

---

### 🛠️ Fichiers créés

1. **`src/app/api/cron/weekly-reset/route.ts`**
   - Endpoint pour le reset hebdomadaire
   - Réinitialise toutes les disponibilités
   - Met tous les statuts à "offline"

2. **`AVAILABILITY_SYSTEM.md`**
   - Documentation complète du système
   - Guide d'utilisation
   - Exemples de tests

3. **`test-slot-splitting.js`**
   - Tests unitaires pour la fonction de découpage
   - 7 cas de test couverts
   - Tous les tests passent ✅

4. **`CHANGELOG_AVAILABILITY.md`** (ce fichier)
   - Résumé des changements

---

### 🔧 Fichiers modifiés

1. **`src/app/api/db/playmate/calendar/route.ts`**
   - Ajout de la fonction `splitSlotsAtMidnight()`
   - Logique de découpage automatique des créneaux
   - Sauvegarde des créneaux découpés dans les jours appropriés

2. **`src/app/dashboard/DashboardClient.tsx`**
   - Ajout du bandeau d'information
   - Interface visuelle améliorée

3. **`setup-cron.sh`**
   - Support de plusieurs cron jobs
   - Ajout du cron job de reset hebdomadaire
   - Meilleure gestion des cron existants

---

### 📋 Configuration requise

Pour activer le système complet, exécutez :

```bash
# 1. Installer/mettre à jour les cron jobs
bash setup-cron.sh

# 2. Vérifier que les cron jobs sont actifs
crontab -l

# Vous devriez voir :
# */5 * * * * curl -s http://localhost:3000/api/cron/update-availability-status > /dev/null 2>&1
# 59 23 * * 0 curl -s http://localhost:3000/api/cron/weekly-reset > /dev/null 2>&1
```

---

### 🧪 Tests

**Tests unitaires :**
```bash
node test-slot-splitting.js
```

Résultat attendu : ✨ Tous les tests sont passés ! ✨

**Build de production :**
```bash
npm run build
```

Statut : ✅ Build réussi sans erreurs

---

### 📊 Cas de test couverts

| Cas | Input | Output (today) | Output (nextDay) | Status |
|-----|-------|----------------|------------------|--------|
| Créneau normal | `09:00-17:00` | `09:00-17:00` | - | ✅ |
| Traverse minuit | `22:00-02:00` | `22:00-23:59` | `00:00-02:00` | ✅ |
| Traverse minuit court | `23:00-01:00` | `23:00-23:59` | `00:00-01:00` | ✅ |
| Plusieurs créneaux | `09:00-12:00`, `14:00-18:00`, `20:00-02:00` | `09:00-12:00`, `14:00-18:00`, `20:00-23:59` | `00:00-02:00` | ✅ |
| Créneau de nuit | `00:00-06:00` | `00:00-06:00` | - | ✅ |
| Jusqu'à minuit | `20:00-00:00` | `20:00-00:00` | - | ✅ |
| Deux créneaux traversants | `20:00-01:00`, `22:00-03:00` | `20:00-23:59`, `22:00-23:59` | `00:00-01:00`, `00:00-03:00` | ✅ |

---

### 🔄 Comportement du système

#### Scénario 1 : Playmate crée un créneau normal
```
Action : Lundi 09:00-17:00
Résultat :
  - Lundi: ["09:00-17:00"]
```

#### Scénario 2 : Playmate crée un créneau traversant minuit
```
Action : Lundi 22:00-02:00
Résultat automatique :
  - Lundi: ["22:00-23:59"]
  - Mardi: ["00:00-02:00"]
```

#### Scénario 3 : Arrivée du dimanche soir
```
Heure : Dimanche 23:59
Action automatique :
  - Tous les créneaux de tous les playmates sont supprimés
  - Tous les statuts passent à "offline"
  - Les playmates doivent redéfinir leurs disponibilités pour la nouvelle semaine
```

---

### 💡 Recommandations pour les playmates

1. **Définir les disponibilités en début de semaine** (lundi matin par exemple)
2. **Ne pas attendre dimanche soir** pour définir la semaine suivante
3. **Utiliser des créneaux qui traversent minuit** si nécessaire (le système gère automatiquement)
4. **Vérifier régulièrement** que les disponibilités sont correctes

---

### 🚀 Prochaines étapes possibles

1. Notification Discord avant le reset hebdomadaire
2. Copie automatique des disponibilités de la semaine précédente
3. Historique des disponibilités
4. Planning sur plusieurs semaines
5. Gestion des jours fériés / exceptions

---

### 📞 Support

Pour plus d'informations, consultez :
- `AVAILABILITY_SYSTEM.md` - Documentation complète
- `test-slot-splitting.js` - Exemples de cas d'usage

Pour signaler un bug ou suggérer une amélioration, contactez l'équipe de développement.
