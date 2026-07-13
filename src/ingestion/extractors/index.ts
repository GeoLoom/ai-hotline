import { extractDocText } from './docExtractor.js';
import { extractDocxText } from './docxExtractor.js';
import { sniffFormat, type SniffedFormat } from './sniffFormat.js';
import { extractConfluenceEmailText } from './confluenceEmailExtractor.js';

export type Extractor = (filePath: string) => Promise<string>;

const extractorsByFormat: Record<SniffedFormat, Extractor | undefined> = {
  'ole-doc': extractDocText,
  'zip-docx': extractDocxText,
  'mime-message': extractConfluenceEmailText,
  unknown: undefined,
};

export function getExtractorFor(filePath: string): Extractor | undefined {
  const format = sniffFormat(filePath);
  return extractorsByFormat[format];
}

export function getSupportedFormats(): string[] {
  return Object.keys(extractorsByFormat).filter((f) => f !== 'unknown');
}