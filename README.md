# Mini-projet — Location de voitures

Projet statique du TP Programmation Web ENET'Com. Il présente les versions successives demandées dans le sujet et les extensions de la Partie 4.

## Versions et arborescence

- `index.html` : Partie 1, première version HTML5, CSS3 et JavaScript pur, sans framework ni bibliothèque externe. Elle contient les trois catégories, le tableau de cinq véhicules et le formulaire de réservation.
- `index2.html` : Partie 2, version responsive Bootstrap avec grille, cartes, carrousel et formulaire modernisé. Elle conserve les interactions de réservation et ajoute les listes Select2.
- `catalogue.html` : Partie 3, tableau des véhicules intégrant DataTables (recherche, tri et pagination).
- `contact.html` : formulaire de contact avec validation JavaScript.
- `devis.html` : génération d'un récapitulatif de location imprimable.
- `style.css` et `script.js` : styles partagés et interactions. La version `index.html` reste en JavaScript natif ; les intégrations de bibliothèques ne s'activent que sur les pages qui les chargent.
- `data/vehicles.csv` : 50 véhicules simulés utilisés pour alimenter le catalogue, les réservations et les devis.
- `data/vehicles.js` : copie JavaScript du CSV pour ouvrir les pages enrichies directement avec `file://`, car les navigateurs bloquent généralement Fetch depuis un fichier local.
- `images/citadine.jpg`, `images/berline.jpg`, `images/commerciale.jpg` : images des trois catégories.

## Membres du groupe

- Ahmed Abida

## Technologies et fonctionnalités

- HTML5 sémantique, CSS3, JavaScript natif et Flexbox.
- Bootstrap 5 via CDN HTTPS pour la seconde version, notamment sa grille responsive, ses cards, son carousel et ses formulaires.
- Select2 pour les listes de catégories et véhicules recherchables ; les véhicules proposés dépendent de la catégorie choisie.
- DataTables pour la recherche, le tri et la pagination du tableau.
- En HTTP, Fetch charge le CSV. En ouverture directe, `vehicles.js` fournit les mêmes données ; elles alimentent les cartes, la table, les sélecteurs et le devis. Les véhicules indisponibles ne peuvent pas être réservés.
- Les formulaires vérifient les champs obligatoires et les dates. Le prix est calculé selon `nombre de jours × prix journalier` ; une location sur une seule date compte pour un jour.
- Le devis présente le client, la catégorie, le véhicule, les dates, la durée, le tarif journalier et le total. Le bouton d'impression appelle `window.print()` et la feuille `@media print` masque les commandes de navigation.

Les formulaires sont des démonstrations côté client : aucune donnée personnelle ou réservation n'est transmise à un serveur.

## Tester le projet

Pour ouvrir le projet sans serveur, double-cliquer sur `index.html`, `index2.html`, `catalogue.html`, `contact.html` ou `devis.html`. Les pages enrichies utilisent `vehicles.js` pour contourner le blocage de Fetch sous `file://`. Une connexion Internet reste nécessaire pour charger Bootstrap, Select2 et DataTables.

`vehicles.csv` reste la source du catalogue lorsque le site est publié sur GitHub Pages ou ouvert via HTTP. Si le CSV est modifié, mettre à jour sa copie `vehicles.js`. Pour tester explicitement le chargement Fetch du CSV, on peut lancer un serveur statique depuis la racine du dépôt :

```powershell
python -m http.server 8000
```

Ouvrir ensuite `http://localhost:8000/`.

1. Tester la version de base sur `index.html` : formulaire, choix catégorie/véhicule, validation et calcul.
2. Tester la version Bootstrap sur `index2.html` : affichage responsive, carrousel, Select2 et réservation.
3. Tester `catalogue.html` pour la recherche, le tri et la pagination des 50 véhicules.
4. Tester la validation sur `contact.html` et créer/imprimer un devis sur `devis.html`.

Les CDN requièrent une connexion Internet. Les ressources locales utilisent des chemins relatifs et les noms de fichiers respectent la casse attendue par GitHub Pages.

## Extensions réalisées avec l'aide de l'IA — Partie 4

### 1. Chargement asynchrone du catalogue CSV

**Prompt utilisé :** « Charge `data/vehicles.csv` avec Fetch en JavaScript natif, vérifie son en-tête et les valeurs de chaque véhicule, puis affiche les données dans les cartes et le tableau. »

**Proposition/code généré :** lire les lignes CSV, vérifier leur schéma et convertir les valeurs numériques avant de les présenter.

**Version intégrée :** `script.js` valide l'en-tête exact, les catégories, les nombres, la disponibilité et le nombre minimal de lignes. Les données sont partagées entre `index2.html`, `catalogue.html` et `devis.html`.

**Explication :** le CSV sert de source aux accès HTTP ; `vehicles.js` en est la copie utilisable depuis `file://`, où Fetch ne peut pas lire les fichiers locaux. Les deux chemins passent par la même validation avant affichage.

### 2. Page Contact validée

**Prompt utilisé :** « Ajoute un formulaire de contact accessible et responsive avec nom, e-mail, téléphone, sujet et message, validation JavaScript et retour lisible, sans prétendre envoyer le message sans serveur. »

**Proposition/code généré :** utiliser les contraintes de formulaire HTML et l'événement `submit` pour refuser les entrées invalides puis afficher un retour à l'utilisateur.

**Version intégrée :** `contact.html` contient les champs demandés ; `script.js` vérifie le formulaire et affiche un état de succès ou d'erreur.

**Explication :** les champs obligatoires, le format e-mail, le format du téléphone lorsqu'il est fourni et la longueur minimale du message sont contrôlés côté navigateur. Le succès précise que le message n'est pas transmis.

### 3. Devis de location imprimable

**Prompt utilisé :** « Crée une page Devis qui récupère un véhicule disponible depuis le CSV, vérifie les dates et affiche le client, la catégorie, le véhicule, la durée, le tarif journalier et le total, puis permet l'impression. »

**Proposition/code généré :** calculer `jours × prix journalier`, construire un récapitulatif après validation, appeler `window.print()` et adapter la feuille avec `@media print`.

**Version intégrée :** `devis.html`, `script.js` et `style.css` fournissent le formulaire, le récapitulatif et l'impression.

**Explication :** une date de fin antérieure à la date de début est refusée ; une même date représente un jour de location. Le récapitulatif s'imprime sans les commandes de navigation et de saisie.

## Dépôt et publication

Dépôt du projet : https://github.com/biiida35/tp-web-location-voiture

Le dépôt doit rester public pour la remise. GitHub Pages peut publier la racine du dépôt afin de rendre la démonstration accessible en ligne.
