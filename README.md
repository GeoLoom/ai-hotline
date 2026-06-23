# ai-hotline

API RAG (Retrieval-Augmented Generation) pour la gestion d'incidents, basée sur Hono, ChromaDB et Ollama.

## Prérequis

- Node.js 18+
- - [Ollama](https://ollama.ai) en local (modèles : `phi3` et `nomic-embed-text`)
  - - [ChromaDB](https://www.trychroma.com/) en local
   
    - ## Installation
   
    - ```bash
      npm install
      ```

      ## Configuration

      Copier le fichier `.env.example` en `.env` et adapter les valeurs :

      ```bash
      cp .env.example .env
      ```

      ## Utilisation

      ```bash
      # Démarrage en développement
      npm run dev

      # Indexation des incidents
      npm run ingest

      # Build de production
      npm run build
      npm run start
      ```

      ## Déploiement AWS Lambda

      ```bash
      npm run deploy
      ```

      ## Structure

      ```
      src/
        api/          # Routes Hono
        ingestion/    # Scripts d'indexation
        rag/          # Logique RAG (ChromaDB, embeddings, prompts)
        services/     # Appels Ollama
        types/        # Types TypeScript
        utils/        # Utilitaires
        config.ts     # Configuration via variables d'environnement
        db.ts         # Base SQLite locale
      ```

      ## Nettoyage du repo Git (à faire en local)

      Le dossier `node_modules` a été commité par erreur. Pour le supprimer de l'historique Git :

      ```bash
      # Retirer node_modules du tracking (sans supprimer les fichiers locaux)
      git rm -r --cached node_modules/
      git rm -r --cached data/raw/
      git rm --cached chroma_db

      # Commiter la suppression
      git commit -m "chore: remove node_modules, data/raw and chroma_db from git tracking"

      # Pousser
      git push origin main
      ```
