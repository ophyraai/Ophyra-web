/**
 * Cálculo de envío por zonas + umbral de envío gratis.
 *
 * Zona 1 — España
 * Zona 2 — Unión Europea + Reino Unido
 * Zona 3 — Latinoamérica
 * Zona 4 — Resto del mundo
 *
 * Valores configurables vía env var, con defaults razonables.
 */

export type ShippingZone = 1 | 2 | 3 | 4;

interface ZoneConfig {
  zone: ShippingZone;
  shipping_cents: number;
  free_from_cents: number;
  label_es: string;
  label_en: string;
}

function intEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = parseInt(raw, 10);
  return isNaN(n) ? fallback : n;
}

export const SHIPPING_ZONES: Record<ShippingZone, ZoneConfig> = {
  1: {
    zone: 1,
    shipping_cents: intEnv('SHIPPING_ZONE1_CENTS', 290),
    free_from_cents: intEnv('SHIPPING_ZONE1_FREE_CENTS', 2500),
    label_es: 'España',
    label_en: 'Spain',
  },
  2: {
    zone: 2,
    shipping_cents: intEnv('SHIPPING_ZONE2_CENTS', 590),
    free_from_cents: intEnv('SHIPPING_ZONE2_FREE_CENTS', 4000),
    label_es: 'Unión Europea + Reino Unido',
    label_en: 'European Union + UK',
  },
  3: {
    zone: 3,
    shipping_cents: intEnv('SHIPPING_ZONE3_CENTS', 690),
    free_from_cents: intEnv('SHIPPING_ZONE3_FREE_CENTS', 4500),
    label_es: 'Latinoamérica',
    label_en: 'Latin America',
  },
  4: {
    zone: 4,
    shipping_cents: intEnv('SHIPPING_ZONE4_CENTS', 1290),
    free_from_cents: intEnv('SHIPPING_ZONE4_FREE_CENTS', 7000),
    label_es: 'Resto del mundo',
    label_en: 'Rest of world',
  },
};

// ISO-3166-1 alpha-2 country codes

const ZONE1 = new Set(['ES']);

const ZONE2 = new Set([
  // UE
  'FR', 'DE', 'IT', 'PT', 'NL', 'BE', 'AT', 'IE', 'FI',
  'SE', 'DK', 'PL', 'CZ', 'RO', 'BG', 'HR', 'GR', 'HU',
  'SK', 'SI', 'LT', 'LV', 'EE', 'CY', 'MT', 'LU',
  // Reino Unido (misma tarifa por proximidad y volumen)
  'GB',
]);

const ZONE3 = new Set([
  // Latinoamérica (hispanohablantes + Brasil)
  'MX', 'AR', 'CO', 'CL', 'PE', 'BR', 'UY', 'EC', 'BO',
  'PY', 'VE', 'CR', 'GT', 'PA', 'DO', 'SV', 'HN', 'NI', 'CU',
]);

export function getZoneForCountry(countryCode: string): ShippingZone {
  const code = countryCode.trim().toUpperCase();
  if (ZONE1.has(code)) return 1;
  if (ZONE2.has(code)) return 2;
  if (ZONE3.has(code)) return 3;
  return 4;
}

export interface ShippingCalc {
  zone: ShippingZone;
  shipping_cents: number;
  base_cents: number;
  free_threshold_cents: number;
  is_free: boolean;
  amount_to_free_cents: number;
}

export function calculateShipping(
  countryCode: string,
  subtotalCents: number,
): ShippingCalc {
  const zone = getZoneForCountry(countryCode);
  const config = SHIPPING_ZONES[zone];
  const isFree = subtotalCents >= config.free_from_cents;

  return {
    zone,
    shipping_cents: isFree ? 0 : config.shipping_cents,
    base_cents: config.shipping_cents,
    free_threshold_cents: config.free_from_cents,
    is_free: isFree,
    amount_to_free_cents: isFree
      ? 0
      : Math.max(0, config.free_from_cents - subtotalCents),
  };
}

// Lista de países disponibles para el selector del carrito, agrupada por zona.
// Útil para UI — no usar para la lógica (eso va por getZoneForCountry).
export interface CountryOption {
  code: string;
  name_es: string;
  name_en: string;
  zone: ShippingZone;
}

export const COUNTRY_OPTIONS: CountryOption[] = [
  // Zona 1
  { code: 'ES', name_es: 'España', name_en: 'Spain', zone: 1 },

  // Zona 2 — UE + UK
  { code: 'FR', name_es: 'Francia', name_en: 'France', zone: 2 },
  { code: 'DE', name_es: 'Alemania', name_en: 'Germany', zone: 2 },
  { code: 'IT', name_es: 'Italia', name_en: 'Italy', zone: 2 },
  { code: 'PT', name_es: 'Portugal', name_en: 'Portugal', zone: 2 },
  { code: 'NL', name_es: 'Países Bajos', name_en: 'Netherlands', zone: 2 },
  { code: 'BE', name_es: 'Bélgica', name_en: 'Belgium', zone: 2 },
  { code: 'AT', name_es: 'Austria', name_en: 'Austria', zone: 2 },
  { code: 'IE', name_es: 'Irlanda', name_en: 'Ireland', zone: 2 },
  { code: 'PL', name_es: 'Polonia', name_en: 'Poland', zone: 2 },
  { code: 'SE', name_es: 'Suecia', name_en: 'Sweden', zone: 2 },
  { code: 'DK', name_es: 'Dinamarca', name_en: 'Denmark', zone: 2 },
  { code: 'FI', name_es: 'Finlandia', name_en: 'Finland', zone: 2 },
  { code: 'GR', name_es: 'Grecia', name_en: 'Greece', zone: 2 },
  { code: 'GB', name_es: 'Reino Unido', name_en: 'United Kingdom', zone: 2 },

  // Zona 3 — Latinoamérica
  { code: 'MX', name_es: 'México', name_en: 'Mexico', zone: 3 },
  { code: 'AR', name_es: 'Argentina', name_en: 'Argentina', zone: 3 },
  { code: 'CO', name_es: 'Colombia', name_en: 'Colombia', zone: 3 },
  { code: 'CL', name_es: 'Chile', name_en: 'Chile', zone: 3 },
  { code: 'PE', name_es: 'Perú', name_en: 'Peru', zone: 3 },
  { code: 'BR', name_es: 'Brasil', name_en: 'Brazil', zone: 3 },
  { code: 'UY', name_es: 'Uruguay', name_en: 'Uruguay', zone: 3 },
  { code: 'EC', name_es: 'Ecuador', name_en: 'Ecuador', zone: 3 },
  { code: 'BO', name_es: 'Bolivia', name_en: 'Bolivia', zone: 3 },
  { code: 'PY', name_es: 'Paraguay', name_en: 'Paraguay', zone: 3 },
  { code: 'VE', name_es: 'Venezuela', name_en: 'Venezuela', zone: 3 },
  { code: 'CR', name_es: 'Costa Rica', name_en: 'Costa Rica', zone: 3 },
  { code: 'GT', name_es: 'Guatemala', name_en: 'Guatemala', zone: 3 },
  { code: 'PA', name_es: 'Panamá', name_en: 'Panama', zone: 3 },
  { code: 'DO', name_es: 'República Dominicana', name_en: 'Dominican Republic', zone: 3 },
  { code: 'SV', name_es: 'El Salvador', name_en: 'El Salvador', zone: 3 },
  { code: 'HN', name_es: 'Honduras', name_en: 'Honduras', zone: 3 },
  { code: 'NI', name_es: 'Nicaragua', name_en: 'Nicaragua', zone: 3 },

  // Zona 4 — Resto del mundo
  { code: 'US', name_es: 'Estados Unidos', name_en: 'United States', zone: 4 },
  { code: 'CA', name_es: 'Canadá', name_en: 'Canada', zone: 4 },
  { code: 'CH', name_es: 'Suiza', name_en: 'Switzerland', zone: 4 },
  { code: 'NO', name_es: 'Noruega', name_en: 'Norway', zone: 4 },
  { code: 'AU', name_es: 'Australia', name_en: 'Australia', zone: 4 },
  { code: 'NZ', name_es: 'Nueva Zelanda', name_en: 'New Zealand', zone: 4 },
  { code: 'JP', name_es: 'Japón', name_en: 'Japan', zone: 4 },
  { code: 'KR', name_es: 'Corea del Sur', name_en: 'South Korea', zone: 4 },
  { code: 'SG', name_es: 'Singapur', name_en: 'Singapore', zone: 4 },
  { code: 'AE', name_es: 'Emiratos Árabes', name_en: 'UAE', zone: 4 },
];
