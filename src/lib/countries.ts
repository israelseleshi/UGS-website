// Country mapping utility for converting abbreviations to full names
export const countryMap: Record<string, string> = {
  // Common abbreviations to full names
  'us': 'United States',
  'usa': 'United States',
  'uk': 'United Kingdom',
  'gb': 'United Kingdom',
  'ca': 'Canada',
  'can': 'Canada',
  'au': 'Australia',
  'aus': 'Australia',
  'de': 'Germany',
  'deu': 'Germany',
  'fr': 'France',
  'fra': 'France',
  'jp': 'Japan',
  'jpn': 'Japan',
  'cn': 'China',
  'chn': 'China',
  'in': 'India',
  'ind': 'India',
  'br': 'Brazil',
  'bra': 'Brazil',
  'it': 'Italy',
  'ita': 'Italy',
  'es': 'Spain',
  'esp': 'Spain',
  'mx': 'Mexico',
  'mex': 'Mexico',
  'ru': 'Russia',
  'rus': 'Russia',
  'za': 'South Africa',
  'zaf': 'South Africa',
  'ae': 'United Arab Emirates',
  'are': 'United Arab Emirates',
  'sa': 'Saudi Arabia',
  'sau': 'Saudi Arabia',
  'eg': 'Egypt',
  'egy': 'Egypt',
  'ng': 'Nigeria',
  'nga': 'Nigeria',
  'ke': 'Kenya',
  'ken': 'Kenya',
  'et': 'Ethiopia',
  'eth': 'Ethiopia',
  'gh': 'Ghana',
  'gha': 'Ghana',
  'tz': 'Tanzania',
  'tza': 'Tanzania',
  'ug': 'Uganda',
  'uga': 'Uganda',
  'rw': 'Rwanda',
  'rwa': 'Rwanda',
  'ma': 'Morocco',
  'mar': 'Morocco',
  'dz': 'Algeria',
  'dza': 'Algeria',
  'tn': 'Tunisia',
  'tun': 'Tunisia',
  'ly': 'Libya',
  'lby': 'Libya',
  'sd': 'Sudan',
  'sdn': 'Sudan',
  'ss': 'South Sudan',
  'ssd': 'South Sudan',
  'so': 'Somalia',
  'som': 'Somalia',
  'dj': 'Djibouti',
  'dji': 'Djibouti',
  'er': 'Eritrea',
  'eri': 'Eritrea',
  'td': 'Chad',
  'tcd': 'Chad',
  'cf': 'Central African Republic',
  'caf': 'Central African Republic',
  'cm': 'Cameroon',
  'cmr': 'Cameroon',
  'cg': 'Republic of the Congo',
  'cog': 'Republic of the Congo',
  'cd': 'Democratic Republic of the Congo',
  'cod': 'Democratic Republic of the Congo',
  'ga': 'Gabon',
  'gab': 'Gabon',
  'gq': 'Equatorial Guinea',
  'gnq': 'Equatorial Guinea',
  'st': 'São Tomé and Príncipe',
  'stp': 'São Tomé and Príncipe',
  'ao': 'Angola',
  'ago': 'Angola',
  'zm': 'Zambia',
  'zmb': 'Zambia',
  'zw': 'Zimbabwe',
  'zwe': 'Zimbabwe',
  'bw': 'Botswana',
  'bwa': 'Botswana',
  'na': 'Namibia',
  'nam': 'Namibia',
  'sz': 'Eswatini',
  'swz': 'Eswatini',
  'ls': 'Lesotho',
  'lso': 'Lesotho',
  'mw': 'Malawi',
  'mwi': 'Malawi',
  'mz': 'Mozambique',
  'moz': 'Mozambique',
  'mg': 'Madagascar',
  'mdg': 'Madagascar',
  'mu': 'Mauritius',
  'mus': 'Mauritius',
  'sc': 'Seychelles',
  'syc': 'Seychelles',
  'km': 'Comoros',
  'com': 'Comoros',
  'cv': 'Cape Verde',
  'cpv': 'Cape Verde',
  'gw': 'Guinea-Bissau',
  'gnb': 'Guinea-Bissau',
  'gn': 'Guinea',
  'gin': 'Guinea',
  'sl': 'Sierra Leone',
  'sle': 'Sierra Leone',
  'lr': 'Liberia',
  'lbr': 'Liberia',
  'ci': 'Côte d\'Ivoire',
  'civ': 'Côte d\'Ivoire',
  'bf': 'Burkina Faso',
  'bfa': 'Burkina Faso',
  'ml': 'Mali',
  'mli': 'Mali',
  'ne': 'Niger',
  'ner': 'Niger',
  'sn': 'Senegal',
  'sen': 'Senegal',
  'gm': 'Gambia',
  'gmb': 'Gambia',
  'mr': 'Mauritania',
  'mrt': 'Mauritania',
  // Add more as needed
};

/**
 * Converts a country code or abbreviation to its full name
 * @param countryCode - The country code or abbreviation (case-insensitive)
 * @returns The full country name or the original input if no mapping found
 */
export function getFullCountryName(countryCode: string): string {
  if (!countryCode) return '';
  
  const normalized = countryCode.toLowerCase().trim();
  return countryMap[normalized] || countryCode;
}

/**
 * Checks if a string appears to be a country abbreviation
 * @param str - The string to check
 * @returns True if it looks like a country code (2-3 letters)
 */
export function isCountryAbbreviation(str: string): boolean {
  if (!str) return false;
  const trimmed = str.trim();
  return /^[a-zA-Z]{2,3}$/.test(trimmed) && Boolean(countryMap[trimmed.toLowerCase()]);
}

/**
 * Formats country display text, converting abbreviations to full names
 * @param country - The country string to format
 * @returns Formatted country name
 */
export function formatCountryDisplay(country: string): string {
  if (!country || country === '—' || country === '-' || country.toLowerCase() === 'not specified') {
    return '—';
  }
  
  return getFullCountryName(country);
}
