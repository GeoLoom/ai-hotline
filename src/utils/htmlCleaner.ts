export function stripHtml(input: string): string {
  return input
    .replace(/<xmp[\s\S]*?>/gi, '')
    .replace(/<\/xmp>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p[\s\S]*?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<table[\s\S]*?<\/table>/gi, ' [TABLE_REMOVED] ')
    .replace(/<\/?[a-zA-Z][a-zA-Z0-9]*(?:\s[^<>]*)?>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&eacute;/g, 'é')
    .replace(/&agrave;/g, 'à')
    .replace(/&uuml;/g, 'ü')
    .replace(/&#65533;/g, ' ')
    .replace(/\r/g, ' ')
    .replace(/\t/g, ' ')
    .replace(/[ ]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}