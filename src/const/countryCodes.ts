import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import type { Feature } from "geojson";

// Country styles tip tanımı
export interface CountryStyle {
  fillOpacity: null;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  onClick?: (feature: Feature, name: string) => void;
}

export type CountryStylesMap = Record<string, CountryStyle>;

// Register English locale for i18n-iso-countries lookups
try {
  countries.registerLocale(enLocale);
} catch {
  // Zaten kayıtlıysa hata yutulur
}

export interface DerivedCountryKeys {
  id: string;
  numeric3: string;
  alpha2?: string;
  alpha3?: string;
}

export function deriveCountryKeysFromFeature(countryFeature: Feature): DerivedCountryKeys {
  const rawId = (countryFeature as any)?.id;
  const idAsString = rawId != null ? String(rawId) : "";
  const numeric3 = idAsString.padStart(3, "0");

  let alpha2: string | undefined;
  let alpha3: string | undefined;

  try {
    alpha2 = countries.numericToAlpha2(numeric3);
  } catch {
    alpha2 = undefined;
  }

  try {
    alpha3 = alpha2 ? countries.alpha2ToAlpha3(alpha2) : undefined;
  } catch {
    alpha3 = undefined;
  }

  return {
    id: idAsString,
    numeric3,
    alpha2,
    alpha3,
  };
}

export function pickStylesForCountry(
  countryStyles: CountryStylesMap | undefined,
  derivedKeys: DerivedCountryKeys
): CountryStyle {
  if (!countryStyles || typeof countryStyles !== "object") return {
  fillOpacity: null
};

  const tryKey = (keyCandidate?: string) => {
    if (!keyCandidate) return undefined;
    if (countryStyles[keyCandidate] != null) return countryStyles[keyCandidate];
    const upper = keyCandidate.toUpperCase();
    const lower = keyCandidate.toLowerCase();
    if (upper && countryStyles[upper] != null) return countryStyles[upper];
    if (lower && countryStyles[lower] != null) return countryStyles[lower];
    return undefined;
  };

  return (
    tryKey(derivedKeys.alpha2) ||
    tryKey(derivedKeys.alpha3) ||
    tryKey(derivedKeys.numeric3) ||
    tryKey(derivedKeys.id) ||
    { fillOpacity: null }
  );
}
