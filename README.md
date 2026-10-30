# Copie Exelmans — site vitrine

Site statique (HTML, CSS, JS sans dépendance) de **Copie Exelmans**, imprimerie au
40 boulevard Exelmans, 75016 Paris.

Direction artistique : noir, blanc et jaune d'imprimerie (`#0b0b0b`, `#ffffff`, `#ffd400`),
typographies Archivo et Space Mono.

## Pages

| Fichier | Contenu |
| --- | --- |
| `index.html` | Accueil : héro avec bon de commande animé, prestations, pourquoi nous, méthode, en bref, clients, FAQ, boutique |
| `catalogue.html` | Prestations détaillées, avec filtres par famille |
| `contact.html` | Coordonnées, plan cliquable et formulaire de demande de devis |
| `mentions-legales.html` | Mentions légales, données personnelles, crédits |

## Mettre en ligne

Aucun build : déposer le dossier tel quel sur Netlify, GitHub Pages ou tout hébergement statique.
Pour tester en local : `python3 -m http.server` puis ouvrir http://localhost:8000.

## À compléter avant la mise en ligne

- **Infos à confirmer** : adresse, téléphone, email et horaires viennent d'annuaires en ligne
  (40 bd Exelmans · 09 83 65 33 03 · copiexelmans@gmail.com · lun–ven 10h–19h).
- **Prestations** : la liste (`catalogue.html`) est une base à valider ; les prix sont affichés
  « sur devis » — remplacer par les vrais tarifs si besoin.
- **Photos** : les visuels sont des illustrations CSS (`.art`). Remplacer chaque bloc
  `<div class="art …">` par une balise `<img>` (photos de la boutique, des machines, des travaux).
- **Avis clients** : la section « Clients » présente des usages, pas de faux témoignages ;
  y coller de vrais avis Google si souhaité.
- **Mentions légales** : champs « à compléter » (SIRET, hébergeur…).

## Formulaire de contact

Par défaut le formulaire ouvre la messagerie du visiteur (mailto) avec la demande pré-remplie.
Pour un envoi en arrière-plan, renseigner `FORM_ENDPOINT` en haut de `assets/js/main.js`
(Formspree, Netlify Forms…).
