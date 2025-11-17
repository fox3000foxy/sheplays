# 🎮 Système de disponibilités ShePlays - Guide rapide

## 🎯 Résumé en 3 points

1. **Créneaux automatiques** : Les créneaux qui dépassent minuit sont automatiquement divisés en deux
2. **Reset hebdomadaire** : Toutes les disponibilités sont effacées chaque dimanche à 23h59
3. **Simple pour les playmates** : Il suffit de définir ses créneaux normalement, le système fait le reste

---

## 🚀 Démarrage rapide

### Pour les playmates

1. Connectez-vous à votre dashboard
2. Cliquez sur l'onglet **"Disponibilités"**
3. Pour chaque jour de la semaine :
   - Sélectionnez l'heure de début
   - Sélectionnez l'heure de fin
   - Cliquez sur **"Ajouter"**
4. Cliquez sur **"Enregistrer"** quand vous avez fini

**💡 Astuce :** Vous pouvez créer un créneau comme `22:00-02:00` sans vous soucier du passage de minuit, le système le découpe automatiquement !

### Pour les administrateurs

```bash
# 1. Configurer les cron jobs (à faire une seule fois)
bash setup-cron.sh

# 2. Vérifier que tout fonctionne
crontab -l

# 3. Tester le découpage des créneaux
node test-slot-splitting.js

# 4. Tester le reset hebdomadaire (manuel)
curl http://localhost:3000/api/cron/weekly-reset
```

---

## 📅 Exemples d'utilisation

### Exemple 1 : Créneaux normaux

**Configuration playmate :**
```
Lundi : 09:00-12:00
Lundi : 14:00-18:00
```

**Résultat dans la BDD :**
```json
{
  "weekday": 1,
  "slots": ["09:00-12:00", "14:00-18:00"]
}
```

---

### Exemple 2 : Créneau traversant minuit

**Configuration playmate :**
```
Vendredi : 20:00-02:00
```

**Résultat dans la BDD (automatique) :**
```json
// Vendredi (weekday: 5)
{
  "weekday": 5,
  "slots": ["20:00-23:59"]
}

// Samedi (weekday: 6)
{
  "weekday": 6,
  "slots": ["00:00-02:00"]
}
```

---

### Exemple 3 : Mix de créneaux

**Configuration playmate :**
```
Samedi : 10:00-14:00
Samedi : 16:00-20:00
Samedi : 22:00-03:00  ⬅️ Traverse minuit
```

**Résultat dans la BDD (automatique) :**
```json
// Samedi (weekday: 6)
{
  "weekday": 6,
  "slots": ["10:00-14:00", "16:00-20:00", "22:00-23:59"]
}

// Dimanche (weekday: 0)
{
  "weekday": 0,
  "slots": ["00:00-03:00"]
}
```

---

## ⏰ Calendrier de reset

| Jour | Heure | Action | Description |
|------|-------|--------|-------------|
| Toute la semaine | Toutes les 5 min | Mise à jour statut | Le cron vérifie si chaque playmate est actuellement dans un de ses créneaux |
| **Dimanche** | **23:59** | **Reset complet** | **Toutes les disponibilités sont effacées, statuts mis à "offline"** |
| Lundi matin | - | Recommandation | Les playmates devraient redéfinir leurs disponibilités pour la semaine |

---

## 🔧 Architecture technique

```
┌─────────────────────────────────────────────────────────────┐
│                    PLAYMATE DASHBOARD                       │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Disponibilités Tab                                  │    │
│  │ • Sélection créneaux par jour                       │    │
│  │ • Validation UI                                     │    │
│  └────────────────────────────────────────────────────┘    │
└───────────────────────────┬─────────────────────────────────┘
                            │ POST /api/db/playmate/calendar
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              API - calendar/route.ts                        │
│  ┌────────────────────────────────────────────────────┐    │
│  │ splitSlotsAtMidnight()                              │    │
│  │ • Détecte créneaux traversant minuit                │    │
│  │ • Découpe en deux créneaux                          │    │
│  │ • Assigne au bon jour                               │    │
│  └────────────────────────────────────────────────────┘    │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    BASE DE DONNÉES                          │
│  Table: availability                                        │
│  • talent_id                                                │
│  • weekday (0-6)                                            │
│  • slots (JSON array)                                       │
│  • updated_at                                               │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
┌───────┴────────┐                   ┌──────────┴────────┐
│ CRON #1        │                   │ CRON #2           │
│ Toutes les     │                   │ Dimanche 23:59    │
│ 5 minutes      │                   │                   │
│                │                   │ weekly-reset      │
│ update-        │                   │ • Vide tous les   │
│ availability-  │                   │   créneaux        │
│ status         │                   │ • Status offline  │
│ • Check time   │                   │                   │
│ • Update status│                   │                   │
└────────────────┘                   └───────────────────┘
```

---

## 📁 Fichiers importants

| Fichier | Description |
|---------|-------------|
| `src/app/api/db/playmate/calendar/route.ts` | Logique de sauvegarde et découpage des créneaux |
| `src/app/api/cron/weekly-reset/route.ts` | Endpoint de reset hebdomadaire |
| `src/app/api/cron/update-availability-status/route.ts` | Mise à jour du statut online/offline |
| `src/app/dashboard/DashboardClient.tsx` | Interface de gestion des disponibilités |
| `setup-cron.sh` | Configuration des cron jobs |
| `test-slot-splitting.js` | Tests unitaires |

---

## 🧪 Tests

### Lancer les tests unitaires
```bash
node test-slot-splitting.js
```

**Résultat attendu :**
```
✨ Tous les tests sont passés ! ✨
```

### Tester le reset manuel
```bash
# Note: le reset vérifie qu'on est dimanche, donc ce test retournera "skipped" les autres jours
curl http://localhost:3000/api/cron/weekly-reset | jq .
```

### Tester la mise à jour du statut
```bash
curl http://localhost:3000/api/cron/update-availability-status | jq .
```

---

## 🆘 Dépannage

### Les cron jobs ne s'exécutent pas

```bash
# Vérifier que les cron jobs sont installés
crontab -l

# Si vide, réinstaller
bash setup-cron.sh

# Vérifier les logs système
grep CRON /var/log/syslog | tail -20
```

### Les créneaux ne sont pas découpés

1. Vérifier que le build est à jour : `npm run build`
2. Tester la fonction manuellement : `node test-slot-splitting.js`
3. Vérifier les logs du serveur

### Le reset ne fonctionne pas dimanche

```bash
# Vérifier l'heure système
date

# Tester le endpoint manuellement
curl http://localhost:3000/api/cron/weekly-reset

# Vérifier les cron jobs
crontab -l | grep weekly-reset
```

---

## 📚 Documentation complète

Pour plus de détails, consultez :
- **`AVAILABILITY_SYSTEM.md`** : Documentation technique complète
- **`CHANGELOG_AVAILABILITY.md`** : Historique des changements

---

## 🎉 C'est tout !

Le système est maintenant opérationnel. Les playmates peuvent définir leurs créneaux en toute simplicité, et le système gère automatiquement les cas complexes.

**Questions ?** Consultez la documentation ou contactez l'équipe technique.
