import { OpenApiGeneratorV3, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { answerSchema, feedbackSchema } from './schemas.js';

const registry = new OpenAPIRegistry();

registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
});

registry.registerPath({
  method: 'post',
  path: '/v1/answer',
  summary: 'Poser une question au model',
  security: [{ bearerAuth: [] }],
  request: { body: { content: { 'application/json': { schema: answerSchema } } } },
  responses: {
    200: { description: "Réponse générée avec sources" },
    400: { description: "Requête invalide (question hors domaine d'expertise, trop longue, etc.)" },
    401: { description: "Authentification manquante ou invalide" },
    429: { description: "Trop de requêtes" },
  },
});

registry.registerPath({
  method: 'post',
  path: '/v1/feedback',
  summary: 'Envoyer un retour utilisateur sur une réponse',
  security: [{ bearerAuth: [] }],
  request: { body: { content: { 'application/json': { schema: feedbackSchema } } } },
  responses: {
    200: { description: "Feedback enregistré" },
    400: { description: "Requête invalide" },
    401: { description: "Authentification manquante ou invalide" },
  },
});

const generator = new OpenApiGeneratorV3(registry.definitions);

export const openApiDocument = generator.generateDocument({
  openapi: '3.0.0',
  info: { title: 'ai-hotline', version: '1.0.0' },
});