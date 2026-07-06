
function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}


const LOGISTICS_KEYWORDS = [
  //---logistique
  'colis', 'palette', 'bac', 'stock', 'preparation', 'expedition',
  'reception', 'commande', 'prelevement', 'picking', 'inventaire',
  'quai', 'chariot', 'entrepot','pool',
  //---Technique
  'scanner', 'radio', 'ecran', 'erreur', 'bug', 'latence', 'lock',
  'pool', 'wms', 'imprimante', 'etiquette', 'reseau', 'serveur',
  'connexion', 'application', 'terminal',
];

export function isLogisticsRelated(question: string): boolean {
  const normalized = normalize(question);
  return LOGISTICS_KEYWORDS.some((word) => {
    const pattern = new RegExp(`\\b${word}\\b`, 'i');
    return pattern.test(normalized);
  });
}