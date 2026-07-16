
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
  'quai', 'chariot', 'entrepot', 'pool', 'article', 'transporteur',
  'AFFRÉTEUR', 'ALVÉOLE', 'ALLOTMENT', 'REQUIREMENTS', 'SHIPPING',
  'SUPPLY CHAIN', 'EAN', 'CONTAINER', 'CROSS DOCKING', 'EDI',
  //---Technique
  'scanner', 'radio', 'ecran', 'erreur', 'bug', 'latence', 'lock',
  'pool', 'wms', 'imprimante', 'etiquette', 'reseau', 'serveur',
  'connexion', 'application', 'terminal', 'parametre',
  //---Mot clé
  'maGistor', 'Logys', 'WMS', 'WTS', 'LM', 'Odatio', 'Exotec', 'TDI', 'LMD',
];

export function isLogisticsRelated(question: string): boolean {
  const normalized = normalize(question);
  return LOGISTICS_KEYWORDS.some((word) => {
    const pattern = new RegExp(`\\b${word}\\b`, 'i');
    return pattern.test(normalized);
  });
}