import fs from 'node:fs';
import { simpleParser } from 'mailparser';
import { stripHtml } from '../../utils/htmlCleaner.js';


export async function extractConfluenceEmailText(filePath: string): Promise<string> {
  const raw = fs.readFileSync(filePath);
  const parsed = await simpleParser(raw);
  const html = parsed.html || parsed.text || '';
  return stripHtml(html);
}