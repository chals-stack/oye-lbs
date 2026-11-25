# oye — Noël au campus

La carte représente une interprétation jouable de **Lomé Business School**, construite à partir de photographies prises sur place : façade R+1 crème et terre cuite, entrée LBS, bibliothèque, préau et grande salle. Les proportions sont adaptées au jeu et ne constituent pas un relevé architectural. Voir `docs/lbs-reference.md`.

Le bouton **Voir toute l’école** affiche une vue d’ensemble. La navigation supérieure permet de visiter les quatre zones à mesure qu’elles sont débloquées par la mission.

Prototype solo 3D : déplacement au clavier (ZQSD, WASD, flèches), à la souris ou au tactile, collisions avec le bâtiment et le mobilier, et mission de préparation de la veillée en 11 étapes.

Le joueur doit consulter le briefing, sélectionner des ouvrages dans la bibliothèque, préparer les tables du préau puis mettre en service la grande salle. Les actions se déclenchent volontairement avec `E`, `Entrée` ou le bouton contextuel tactile. Elles ont un effet visible sur le décor : livres déplacés, centres de table installés, guirlande allumée, alimentation, projection et son activés. Les salles se débloquent dans l’ordre de la mission.

## Mini-jeux

Le bouton **Mini-jeux** ouvre la Campus Arcade :

- **Éclats de Noël** : puzzle match-3 en 20 déplacements, avec cascades, combos et objectif de score.
- **Lomé Ride** : course moto originale en trois voies dans plusieurs quartiers de Lomé, avec circulation, nids-de-poule, pièces CFA, vies et difficulté progressive.

Les deux jeux fonctionnent au clavier, à la souris et au tactile. Les victoires rapportent des tickets Oye conservés localement sur l’appareil. Lomé Ride a été conçu après étude du genre et du projet public Zem Rush, avec une implémentation et une direction artistique propres à Oye.

## Personnage et commandes

Avatar d’hiver articulé : bonnet, écharpe, sac à dos, marche et course animées. Les directions suivent la caméra ; Maj permet de courir. Accélération, freinage et rotation sont progressifs.

Ouvrir **Paramètres** pour choisir **Directions** (clavier / boutons tactiles) ou **Curseur guidé**. Dans ce dernier mode, cliquer ou toucher le sol pour rejoindre une destination ; maintenir le clic pour guider en continu. Le personnage contourne les bâtiments. Échap annule le trajet. Un repère gris indique une destination inaccessible.

Les paramètres permettent aussi de choisir la couleur du manteau, de courir par défaut, de régler la caméra et de réduire les animations. Ils sont mémorisés localement, sans compte. Le jeu se met en pause pendant les réglages et s’arrête en cas de perte de focus.

## Vérifications

Après `npm run build`, lancer `npx playwright test`. La configuration utilise Microsoft Edge installé localement et un serveur de test sur le port 3012. Pour une autre machine, adapter `channel` dans `playwright.config.ts` ou installer Chromium avec Playwright. Les tests couvrent les trajets, le clavier, la souris, le tactile et la persistance des paramètres.

## Démarrage

Node.js 22 LTS recommandé.

```sh
npm install
npm run dev
```

Ouvrir http://localhost:3000. Depuis un téléphone connecté au même réseau, utiliser l’adresse IP locale de l’ordinateur, port 3000.

## Production

```sh
npm run typecheck
npm run build
npm start
```

Déployer sur Vercel en important le dépôt (preset Next.js), ou sur un hébergement Node.js avec les commandes ci-dessus. Aucune variable d’environnement requise.

## Périmètre

Next.js App Router, React, TypeScript, Tailwind CSS 4 et Three.js. Géométrie procédurale sans ressources externes. Ce premier socle n’inclut pas encore de comptes, de sauvegarde ou de multijoueur.
