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

`vehicles.csv` reste la source du catalogue lorsque le site est publié sur GitHub Pages ou ouvert via HTTP. Si le CSV est modifié, mettre à jour sa copie `vehicles.js`.

1. Tester la version de base sur `index.html` : formulaire, choix catégorie/véhicule, validation et calcul.
2. Tester la version Bootstrap sur `index2.html` : affichage responsive, carrousel, Select2 et réservation.
3. Tester `catalogue.html` pour la recherche, le tri et la pagination des 50 véhicules.
4. Tester la validation sur `contact.html` et créer/imprimer un devis sur `devis.html`.

## Dépôt et publication

Dépôt du projet : https://biiida35.github.io/tp-web-location-voiture/
 la démonstration accessible en ligne.
