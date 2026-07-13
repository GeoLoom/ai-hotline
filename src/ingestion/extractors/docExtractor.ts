import WordExtractor from 'word-extractor';

const extractor = new WordExtractor();

export async function extractDocText(filePath: string): Promise<string> {
  const extracted = await extractor.extract(filePath);
  return extracted.getBody();
}