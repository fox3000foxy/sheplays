# Système de disponibilités - Documentation

## Vue d'ensemble

Le système de disponibilités permet aux playmates de définir leurs créneaux horaires par jour de la semaine. Il inclut deux fonctionnalités automatiques importantes :

1. **Découpage automatique des créneaux traversant minuit**
2. **Reset hebdomadaire des disponibilités (dimanche 23h59)**

---

## 1. Découpage automatique des créneaux

### Fonctionnement

Lorsqu'un playmate crée un créneau qui dépasse minuit (par exemple `22:00-02:00`), le système le découpe **automatiquement** en deux créneaux distincts :

- **Jour J** : `22:00-23:59`
- **Jour J+1** : `00:00-02:00`

### Exemple concret

Si un playmate définit le **lundi** :
```
Lundi: 22:00-02:00
```

Le système créera automatiquement :
```
Lundi: 22:00-23:59
Mardi: 00:00-02:00
```

### Implémentation

Fichier : `/src/app/api/db/playmate/calendar/route.ts`

La fonction `splitSlotsAtMidnight()` analyse chaque créneau :
- Détecte si `heure_fin < heure_début` (indique un passage minuit)
- Découpe le créneau en deux parties
- Assigne la première partie au jour actuel (jusqu'à 23:59)
- Assigne la seconde partie au jour suivant (à partir de 00:00)

---

## 2. Reset hebdomadaire automatique

### Fonctionnement

**Chaque dimanche à 23h59**, toutes les disponibilités de tous les playmates sont **automatiquement réinitialisées**.

Cela signifie :
- Tous les créneaux définis sont supprimés
- Les playmates doivent redéfinir leurs disponibilités pour la semaine suivante
- Le statut de disponibilité (`available_status`) passe à `0` (offline)

### Pourquoi ce système ?

Ce système permet :
- D'avoir des disponibilités toujours à jour
- D'éviter que des playmates restent "disponibles" sur des créneaux obsolètes
- De forcer une mise à jour hebdomadaire des plannings

### Implémentation

#### API Endpoint
Fichier : `/src/app/api/cron/weekly-reset/route.ts`

L'endpoint effectue :
1. Vérifie que nous sommes bien dimanche
2. Récupère tous les playmates
3. Pour chaque playmate :
   - Réinitialise les créneaux de chaque jour (lundi à dimanche) à `[]`
   - Met le statut à `0` (offline)

#### Cron Job
Fichier : `/setup-cron.sh`

Configuration du cron :
```bash
59 23 * * 0 curl -s http://localhost:3000/api/cron/weekly-reset > /dev/null 2>&1
```

Format : `minute heure jour_du_mois mois jour_de_la_semaine`
- `59 23` : 23h59
- `* *` : Tous les jours du mois, tous les mois
- `0` : Dimanche (0 = dimanche dans la notation cron)

---

## 3. Interface utilisateur

### Dashboard des playmates

Fichier : `/src/app/dashboard/DashboardClient.tsx`

L'onglet "Disponibilités" affiche maintenant :

1. **Message d'information** (encadré bleu) qui informe :
   - Les créneaux traversant minuit sont automatiquement divisés
   - Toutes les disponibilités sont réinitialisées chaque dimanche à 23h59
   - Il faut redéfinir ses disponibilités chaque semaine

2. **Calendrier hebdomadaire** :
   - 7 jours de la semaine (lundi à dimanche)
   - Champs pour définir heure de début et heure de fin
   - Bouton "Ajouter" pour créer un créneau
   - Affichage des créneaux existants avec possibilité de suppression
   - Bouton "Enregistrer" pour sauvegarder

---

## 4. Autres cron jobs

### Mise à jour du statut de disponibilité

Fichier : `/src/app/api/cron/update-availability-status/route.ts`

Exécuté **toutes les 5 minutes** :
```bash
*/5 * * * * curl -s http://localhost:3000/api/cron/update-availability-status > /dev/null 2>&1
```

Ce cron :
1. Vérifie l'heure actuelle
2. Pour chaque playmate :
   - Récupère ses créneaux du jour actuel
   - Vérifie si l'heure actuelle est dans un de ses créneaux
   - Met à jour son statut (`available_status`) : `1` = online, `0` = offline

---

## 5. Configuration des cron jobs

### Installation

Pour installer/mettre à jour les cron jobs, exécutez :

```bash
bash setup-cron.sh
```

Le script vérifie si les cron jobs existent déjà et les ajoute si nécessaire.

### Vérification

Pour vérifier que les cron jobs sont actifs :

```bash
crontab -l
```

Vous devriez voir :
```
*/5 * * * * curl -s http://localhost:3000/api/cron/update-availability-status > /dev/null 2>&1
59 23 * * 0 curl -s http://localhost:3000/api/cron/weekly-reset > /dev/null 2>&1
```

---

## 6. Tests manuels

### Tester le découpage automatique

1. Se connecter en tant que playmate
2. Aller dans Dashboard → Disponibilités
3. Créer un créneau qui traverse minuit : `22:00-02:00`
4. Enregistrer
5. Vérifier dans la base de données :

```sql
SELECT weekday, slots FROM availability WHERE talent_id = [ID_DU_TALENT];
```

Résultat attendu (si créé le lundi) :
```
weekday | slots
--------|---------------------------
1       | ["22:00-23:59"]
2       | ["00:00-02:00"]
```

### Tester le reset hebdomadaire

Pour tester sans attendre dimanche :

```bash
curl http://localhost:3000/api/cron/weekly-reset
```

Ou modifier temporairement la condition dans `/src/app/api/cron/weekly-reset/route.ts` :

```typescript
// Commenter cette condition pour tester
// if (currentDay !== 0) {
//   console.log(`[Weekly Reset] Aujourd'hui n'est pas dimanche (jour ${currentDay}), skip reset`);
//   return NextResponse.json({ ... });
// }
```

---

## 7. Points techniques importants

### Format des créneaux

Les créneaux sont stockés au format JSON dans la base de données :
```json
["09:00-12:00", "14:00-18:00", "20:00-23:59"]
```

### Jours de la semaine

Convention utilisée (identique à JavaScript `Date.getDay()`) :
- `0` = Dimanche
- `1` = Lundi
- `2` = Mardi
- `3` = Mercredi
- `4` = Jeudi
- `5` = Vendredi
- `6` = Samedi

### Base de données

Table : `availability`

| Colonne | Type | Description |
|---------|------|-------------|
| talent_id | INT | ID du playmate |
| weekday | INT | Jour de la semaine (0-6) |
| slots | TEXT | JSON array des créneaux |
| updated_at | BIGINT | Timestamp de dernière mise à jour |

Clé primaire : `(talent_id, weekday)`

---

## 8. Améliorations futures possibles

- Notification Discord avant le reset du dimanche
- Historique des disponibilités
- Copier les disponibilités de la semaine précédente
- Interface pour gérer plusieurs semaines à l'avance
- Exceptions pour jours fériés
