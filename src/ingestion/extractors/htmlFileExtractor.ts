import fs from 'node:fs';
import { stripHtml } from '../../utils/htmlCleaner.js';

export async function extractHtmlFileText(filePath: string): Promise<string> {
  const raw = fs.readFileSync(filePath, 'utf-8');
  return stripHtml(raw);
}