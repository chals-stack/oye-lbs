# oye — Référence du campus LBS

Repérage extérieur effectué le 17 novembre 2026, complété le 24 novembre 2026 par 34 photographies HEIC prises et fournies par l’utilisateur. École choisie : Lomé Business School (LBS), Lomé, Togo.

## Sources

- Google Maps : https://www.google.com/maps/search/?api=1&query=Lom%C3%A9+Business+School&query_place_id=ChIJ3zH76zziIxARemnhvSBkxtc
- Site officiel : https://lome-bs.com/
- Adresse officielle : 96 boulevard Jean-Paul II, Nukafu, face à l’agence Yas (ancien Togocom).
- Fiche Maps consultée : 96 Jean-Paul 2, Lomé ; plus code 567M+FV Lomé. Coordonnées du lieu indiquées dans l’URL : 6.1636914, 1.2347113. Ce point situe la fiche, pas les limites de la parcelle.

## Observations visuelles

Photo extérieure affichée sur Maps par le compte Lomé Business School (LBS), publication août 2023 ; l’interface indique « Date de l’image : mars 2023 ».

- Longue façade sur rue, teinte crème/beige avec encadrements, panneaux et bandeaux orange terre cuite.
- Rez-de-chaussée et étage visibles ; volume supplémentaire plus haut à gauche de la vue.
- Série d’ouvertures/panneaux en arc à l’étage, séparés par des éléments verticaux clairs.
- Entrée piétonne surmontée des lettres LBS, située sous le volume gauche.
- Panneaux de communication et ouvertures à barreaux au rez-de-chaussée.
- Trottoir et chaussée directement devant la façade.

## Limites à conserver dans la modélisation

Les photos récentes confirment les matériaux, les ouvertures et l’aménagement de trois espaces. Elles ne constituent toutefois ni un relevé métrique ni un plan de circulation complet. Les dimensions et les liaisons entre pièces restent des proportions de jeu ; ne pas les présenter comme un relevé d’architecte.

## Intégration photo jouable

La façade et ses volumes principaux sont construits dans `app/lbs-scene.ts`, avec une implantation définie dans `app/lbs-layout.ts`. Les grandes arcades terracotta, les carreaux crème, l’entrée pointue LBS et le volume R+1 reprennent les photos IMG_9277 à IMG_9290.

- Bibliothèque (IMG_9291 à IMG_9298) : rayonnages bois clair, livres, tables centrales, chaises rouge et or, ventilateurs et tubes lumineux.
- Préau (IMG_9299 et IMG_9300) : soubassement bleu, sol carrelé, couverture métallique à deux pentes, poteaux, tables et chaises.
- Grande salle R+1 (IMG_9301 à IMG_9310) : écran, allée rouge, rangées de tables, chaises rouge et or, rideaux gris et climatiseurs.

Les quatre zones sont visitables depuis la navigation du jeu. Chacune possède ses collisions, un point de départ et un sceau de mission. Les photographies servent uniquement de référence visuelle et ne sont pas embarquées dans la version distribuée.
