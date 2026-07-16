import { describe, it, expect, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const TEST_DB_PATH = path.join(__dirname, 'test-vector.db');

vi.mock('../config', () => ({
  config: { dbPath: TEST_DB_PATH },
}));

describe('db.insertFeedback', () => {
  afterEach(async () => {
    // On récupère la MÊME instance que celle utilisée par le test (le
    // cache de modules n'a pas encore été vidé à ce stade), on la ferme
    // explicitement, puis seulement APRÈS on vide le cache et on supprime
    // le fichier — sinon Windows refuse (EBUSY).
    const { db } = await import('../db');
    db.close();
    vi.resetModules();
    if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
  });

  it('insère réellement un feedback en base', async () => {
    const { db, insertFeedback } = await import('../db');
    insertFeedback({ question: 'Question test', answer: 'Réponse test', rating: 4, comment: 'Utile' });
    const row = db.prepare('SELECT * FROM feedback WHERE question = ?').get('Question test');
    expect((row as any).rating).toBe(4);
  });

  it('accepte un feedback sans commentaire (comment optionnel -> null en base)', async () => {
    const { db, insertFeedback } = await import('../db');
    insertFeedback({ question: 'Q2', answer: 'A2', rating: 5 });
    const row = db.prepare('SELECT * FROM feedback WHERE question = ?').get('Q2');
    expect((row as any).comment).toBeNull();
  });
});