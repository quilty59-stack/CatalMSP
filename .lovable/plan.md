

# Plan : Configuration des emails personnalisés dans send-notification

## Objectif
Améliorer l'Edge Function `send-notification` pour envoyer automatiquement des emails professionnels adaptés à chaque type de notification, avec des templates HTML personnalisés.

---

## Analyse de l'existant

L'Edge Function actuelle :
- Intègre déjà Resend et peut envoyer des emails
- Utilise un template générique via `generateEmailTemplate()`
- Reçoit `sendEmail: true` pour déclencher l'envoi d'email

Les appels actuels depuis le frontend :
- **CreateMSP.tsx** : `sendEmail: true` avec sujet personnalisé
- **CreateSite.tsx** : `sendEmail: true` avec sujet personnalisé  
- **EditMSP.tsx** et **Catalogue.tsx** : pas d'email (uniquement in-app)

---

## Modifications à apporter

### 1. Nouveaux templates HTML par type

Créer 4 templates email spécifiques dans l'Edge Function :

| Type | Destinataire | Sujet | Contenu |
|------|--------------|-------|---------|
| `msp_created` | Admin | "Nouvelle fiche MSP en attente de validation" | Nom formateur, titre MSP, lien |
| `msp_validated` | Formateur | "Votre fiche MSP a été validée !" | Titre MSP, lien consultation |
| `msp_rejected` | Formateur | "Votre fiche MSP a été refusée" | Titre MSP, raison si fournie |
| `site_created` | Admin | "Nouveau site conventionné ajouté" | Nom site, ajouté par qui |

### 2. Activation automatique des emails

Modifier la logique pour que :
- `msp_created` et `site_created` → emails automatiques aux admins
- `msp_validated` et `msp_rejected` → emails automatiques au formateur

### 3. Récupération des données nécessaires

Pour envoyer les emails, l'Edge Function devra :
- Récupérer l'email de l'admin depuis la table `profiles` via `user_roles`
- Récupérer l'email du formateur via son `user_id`

---

## Architecture des templates

Chaque template inclura :
- Logo CatalMSP
- Header coloré avec titre
- Corps avec informations contextuelles
- Bouton d'action avec lien
- Footer professionnel

Design cohérent avec les emails existants (welcome, approval).

---

## Modifications du code

### Fichier : `supabase/functions/send-notification/index.ts`

1. **Nouvelles fonctions de template** :
   - `generateMspCreatedEmail(metadata)` : email admin pour nouvelle MSP
   - `generateMspValidatedEmail(metadata)` : email formateur pour validation
   - `generateMspRejectedEmail(metadata)` : email formateur pour refus
   - `generateSiteCreatedEmail(metadata)` : email admin pour nouveau site

2. **Logique d'envoi automatique** :
   - Détecter le type de notification
   - Sélectionner le template approprié
   - Envoyer l'email sans avoir besoin de `sendEmail: true` explicite

3. **Récupération des emails** :
   - Fonction `getAdminEmails()` pour récupérer les emails des admins
   - Utilisation de `profiles.email` pour les formateurs

---

## Design des emails

### MSP Créée (Admin)
```
Header : Rouge pompier
Titre : "Nouvelle MSP en attente"
Contenu :
- "Une nouvelle fiche MSP a été soumise par [NOM_FORMATEUR]"
- Titre de la MSP
- Commune / Site
Bouton : "Voir la MSP" → lien vers /msp/[slug]
```

### MSP Validée (Formateur)
```
Header : Vert succès
Titre : "MSP Validée !"
Contenu :
- "Votre fiche MSP '[TITRE]' a été validée par un administrateur."
- "Elle est maintenant consultable par tous les formateurs."
Bouton : "Consulter ma MSP" → lien vers /msp/[slug]
```

### MSP Refusée (Formateur)
```
Header : Rouge/Orange attention
Titre : "MSP non validée"
Contenu :
- "Votre fiche MSP '[TITRE]' n'a pas été validée."
- Raison si fournie dans metadata
- "Vous pouvez contacter l'administrateur pour plus d'informations."
Pas de bouton (la MSP est supprimée)
```

### Site Créé (Admin)
```
Header : Bleu info
Titre : "Nouveau site conventionné"
Contenu :
- "Un nouveau site a été ajouté par [NOM_FORMATEUR]"
- Nom du site
- Commune
Bouton : "Voir le site" → lien vers /sites/[slug]
```

---

## Flux de données

```text
Frontend appelle sendNotification()
           │
           ▼
    Edge Function reçoit { type, title, message, metadata, ... }
           │
           ▼
    Crée notification in-app ✓
           │
           ▼
    Détermine si email nécessaire selon le type
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
msp_created   msp_validated
site_created  msp_rejected
    │             │
    ▼             ▼
 → Admin      → Formateur
   email         email
```

---

## Note importante

L'email pour `user_signup` existe déjà via `send-admin-notification` et ne sera pas modifié.

---

## Impact sur le frontend

Aucune modification nécessaire côté frontend :
- Les appels existants continueront de fonctionner
- Les emails seront envoyés automatiquement selon le type de notification
- Les métadonnées actuelles (`mspTitle`, `creatorName`, etc.) seront utilisées pour personnaliser les emails

