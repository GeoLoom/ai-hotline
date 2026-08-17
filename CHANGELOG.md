# Journal des versions

Les évolutions sont regroupées par Pull Request
fusionnée, dans l'ordre chronologique réel du dépôt.

## PR #1 Harnais de tests unitaires

- Mise en place de Vitest
- Correction d'une incompatibilité dans retriever.ts, détectée par les
  premiers tests

## PR #2 Intégration continue

- Mise en place du workflow GitHub Actions
- Régénération complète du fichier de verrouillage des dépendances

## PR #3 Sécurisation et évolutivité

- Authentification par token partagé
- Validation par schémas, limitation de débit, filtre métier
- Dissociation des routes ticket et documentation
- Correction du nettoyage HTML, du chunking et de la métrique de
  similarité (distance cosinus)
- Suppression du dossier CI mal placé

## PR #4 Couverture de tests

- Couverture de tests portée à plus de 90 %
- Audit de sécurité intégré aux tests

## PR #5 Performance

- Script de mesure de performance (npm run perf:check)
- Seuil de couverture Vitest

## PR #6 Frontend de démonstration

- Interface de démonstration (React + Vite), servie par l'API
- Prompt traduit intégralement en français
- Alignement de version npm et resynchronisation du lockfile en CI
- Exclusion du frontend de la vérification de types du backend

## PR #7 Documentation et extraction HTML

- Extracteur HTML générique pour les documents de démonstration
- Resserrement du prompt de la route documentation
- Attribution CC-BY-SA des documents Wikipedia utilisés
- Ajout de Swagger UI

## PR #8 / #9 Feedback et ajustements

- Boutons de retour utilisateur (utile / pas utile) dans l'interface
- Ajustement du fond de l'en-tête et des mots-clés du filtre métier

## PR #11 Dependabot

- Activation de Dependabot sur les trois écosystèmes du projet
  (backend, frontend, actions GitHub)

## PR #12 Supervision

- Route GET /status (disponibilité d'Ollama et de ChromaDB)
- Script de supervision avec seuils d'alerte et notification email
- Indicateurs de disponibilité dans l'interface de démonstration

## PR #15 Signalement

- Formulaire de signalement accessible sans authentification
  (POST /report)

## [1.0.0]  2026-08-17

Première version stable du projet : API RAG fonctionnelle, interface
de démonstration, supervision et alerte, harnais de tests complet.