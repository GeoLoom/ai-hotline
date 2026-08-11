import { describe, it, expect, vi } from 'vitest';
import app from '../api/routes';

vi.mock('../utils/mailer', () => ({
sendAlertEmail: vi.fn(async () => {}),
}));

describe('POST /report', () => {
it('accepte un signalement valide sans authentification', async () => {
const res = await app.request('/report', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ message: 'Impossible de me connecter avec mon token' }),
});
expect(res.status).toBe(200);
});

it('rejette un message trop court', async () => {
const res = await app.request('/report', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ message: 'a' }),
});
expect(res.status).toBe(400);
});
});