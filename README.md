# ai-hotline

API RAG (Retrieval-Augmented Generation) pour la gestion d'incidents, basée sur Hono, ChromaDB et Ollama.x


## Prérequis

- Node.js 20+
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
        tests/        # tests unitaires
        types/        # Types TypeScript
        utils/        # Utilitaires
        config.ts     # Configuration via variables d'environnement
        db.ts         # Base SQLite locale
      ```



##Version
- Node.js 24.11.0
- NPM 11.6.1
- hono 1.12.7
- chromadb 3.3.2
- ollama 0.30.11

##List model dispo
mistral:7b     
glm-4.7-flash:latest
nomic-embed-text:latest
phi3:latest

