import { retrieveSimilarIncidents } from '../src/rag/retriever.js';
import { generateAnswer } from '../src/services/ollama.js';
import { buildTicketSupportPrompt } from '../src/rag/promptBuilder.js';

async function timed<T>(label: string, targetMs: number, fn: () => Promise<T>): Promise<T> {
  const start = Date.now();
  const result = await fn();
  const duration = Date.now() - start;
  const status = duration <= targetMs ? 'OK' : 'DÉPASSÉ';
  console.log(`[${status}] ${label} : ${duration}ms (cible : ${targetMs}ms)`);
  return result;
}

async function checkHttpEndpoint(label: string, targetMs: number, url: string, init?: RequestInit) {
  const start = Date.now();
  const res = await fetch(url, init);
  const duration = Date.now() - start;
  const status = duration <= targetMs ? 'OK' : 'DÉPASSÉ';
  console.log(`[${status}] ${label} : ${duration}ms (cible : ${targetMs}ms, HTTP ${res.status})`);
}

async function main() {
  const question = 'Erreur scanner sur le quai de préparation';
  const token = process.env.API_TOKEN;

  if (!token) {
    console.error('Définissez API_TOKEN avant de lancer ce script.');
    process.exit(1);
  }

  const retrieved = await timed('retrieveSimilarIncidents', 1200, () =>
    retrieveSimilarIncidents(question)
  );
  const prompt = buildTicketSupportPrompt(question, retrieved);
  await timed('generateAnswer (LLM)', 120000, () => generateAnswer(prompt));

  await checkHttpEndpoint('GET /health', 100, 'http://localhost:3000/health');

  await checkHttpEndpoint('POST /feedback', 300, 'http://localhost:3000/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ question: 'q', answer: 'a', rating: 5 }),
  });
}

main().catch((error) => {
  console.error('Erreur pendant la mesure de performance :', error);
  process.exit(1);
});