import type { Tile, CountryTile } from "./types";

/**
 * 40-square FIFA Monopoly board.
 *
 * 4 corners: 0=KICK-OFF, 10=RED CARD, 20=HALF-TIME, 30=GO TO RED
 * 24 countries across 8 groups (A-H), 3 per group
 * 4 stadiums, 2 broadcasters, 4 chance, 2 tax
 */

export const GROUP_COLORS: Record<string, string> = {
  A: "#8B4513",
  B: "#87CEEB",
  C: "#FF1493",
  D: "#FFA500",
  E: "#FF0000",
  F: "#FFFF00",
  G: "#00B140",
  H: "#000080",
};

interface CountrySpec {
  letter: string;
  code: string;
  name: string;
  nameEn: string;
  price: number;
}

const COUNTRY_SPECS: CountrySpec[] = [
  // Group A (brown) — tiles 1, 3, 4
  { letter: "A", code: "MEX", name: "Мексика",      nameEn: "Mexico",       price: 60  },
  { letter: "A", code: "RSA", name: "ЮАР",          nameEn: "South Africa", price: 60  },
  { letter: "A", code: "QAT", name: "Катар",        nameEn: "Qatar",        price: 80  },
  // Group B (light blue) — tiles 6, 7, 9
  { letter: "B", code: "CAN", name: "Канада",       nameEn: "Canada",       price: 100 },
  { letter: "B", code: "SUI", name: "Швейцария",    nameEn: "Switzerland",  price: 100 },
  { letter: "B", code: "MAR", name: "Марокко",      nameEn: "Morocco",      price: 120 },
  // Group C (pink) — tiles 11, 13, 14
  { letter: "C", code: "BRA", name: "Бразилия",     nameEn: "Brazil",       price: 140 },
  { letter: "C", code: "SCO", name: "Шотландия",    nameEn: "Scotland",     price: 140 },
  { letter: "C", code: "USA", name: "США",          nameEn: "USA",          price: 160 },
  // Group D (orange) — tiles 16, 18, 19
  { letter: "D", code: "PAR", name: "Парагвай",     nameEn: "Paraguay",     price: 180 },
  { letter: "D", code: "GER", name: "Германия",     nameEn: "Germany",      price: 200 },
  { letter: "D", code: "ECU", name: "Эквадор",      nameEn: "Ecuador",      price: 200 },
  // Group E (red) — tiles 21, 23, 24
  { letter: "E", code: "NED", name: "Нидерланды",   nameEn: "Netherlands",  price: 220 },
  { letter: "E", code: "JPN", name: "Япония",       nameEn: "Japan",        price: 240 },
  { letter: "E", code: "SWE", name: "Швеция",       nameEn: "Sweden",       price: 240 },
  // Group F (yellow) — tiles 26, 27, 29
  { letter: "F", code: "BEL", name: "Бельгия",      nameEn: "Belgium",      price: 260 },
  { letter: "F", code: "EGY", name: "Египет",       nameEn: "Egypt",        price: 260 },
  { letter: "F", code: "ESP", name: "Испания",      nameEn: "Spain",        price: 280 },
  // Group G (green) — tiles 31, 32, 34
  { letter: "G", code: "FRA", name: "Франция",      nameEn: "France",       price: 300 },
  { letter: "G", code: "URU", name: "Уругвай",      nameEn: "Uruguay",      price: 300 },
  { letter: "G", code: "SEN", name: "Сенегал",      nameEn: "Senegal",      price: 320 },
  // Group H (navy) — tiles 37, 38, 39 (before last stadium which is BMO at 35? no, see layout)
  { letter: "H", code: "ARG", name: "Аргентина",    nameEn: "Argentina",    price: 350 },
  { letter: "H", code: "POR", name: "Португалия",   nameEn: "Portugal",     price: 375 },
  { letter: "H", code: "NOR", name: "Норвегия",     nameEn: "Norway",       price: 400 },
];

function makeCountry(index: number, spec: CountrySpec): CountryTile {
  const p = spec.price;
  return {
    index,
    kind: "country",
    label: spec.name,
    labelEn: spec.nameEn,
    groupLetter: spec.letter,
    fifaCode: spec.code,
    price: p,
    rent: [
      Math.round(p / 30),
      Math.round(p / 6),
      Math.round(p / 2),
      Math.round(p),
      Math.round(p * 1.5),
      Math.round(p * 2),
    ],
    buildCost: p < 200 ? 50 : p < 300 ? 100 : 150,
    mortgageValue: Math.round(p / 2),
  };
}

let countryIdx = 0;
function nextCountry(index: number): CountryTile {
  return makeCountry(index, COUNTRY_SPECS[countryIdx++]);
}

export const BOARD: Tile[] = [
  // ── Bottom row (right to left) ──
  { index: 0,  kind: "kickoff",       label: "KICK-OFF",        labelEn: "KICK-OFF" },
  nextCountry(1),   // A: MEX
  { index: 2,  kind: "chance",        label: "Матч-событие",    labelEn: "Match event" },
  nextCountry(3),   // A: RSA
  nextCountry(4),   // A: QAT
  { index: 5,  kind: "stadium",       label: "Эстадио Ацтека",  labelEn: "Estadio Azteca", price: 200 } as Tile,
  nextCountry(6),   // B: CAN
  nextCountry(7),   // B: SUI
  { index: 8,  kind: "chance",        label: "Матч-событие",    labelEn: "Match event" },
  nextCountry(9),   // B: MAR

  // ── Left column (top to bottom) ──
  { index: 10, kind: "red_card_jail", label: "КРАСНАЯ КАРТОЧКА", labelEn: "RED CARD (visit)" },
  nextCountry(11),  // C: BRA
  { index: 12, kind: "broadcaster",   label: "FIFA Media",      labelEn: "FIFA Media", price: 150 } as Tile,
  nextCountry(13),  // C: SCO
  nextCountry(14),  // C: USA
  { index: 15, kind: "stadium",       label: "MetLife Stadium", labelEn: "MetLife Stadium", price: 200 } as Tile,
  nextCountry(16),  // D: PAR
  { index: 17, kind: "chance",        label: "Матч-событие",    labelEn: "Match event" },
  nextCountry(18),  // D: GER
  nextCountry(19),  // D: ECU

  // ── Top row (left to right) ──
  { index: 20, kind: "half_time",     label: "ПЕРЕРЫВ",         labelEn: "HALF-TIME" },
  nextCountry(21),  // E: NED
  { index: 22, kind: "tax",           label: "FIFA штраф",      labelEn: "FIFA fine", amount: 200 } as Tile,
  nextCountry(23),  // E: JPN
  nextCountry(24),  // E: SWE
  { index: 25, kind: "stadium",       label: "AT&T Stadium",    labelEn: "AT&T Stadium", price: 200 } as Tile,
  nextCountry(26),  // F: BEL
  nextCountry(27),  // F: EGY
  { index: 28, kind: "chance",        label: "Матч-событие",    labelEn: "Match event" },
  nextCountry(29),  // F: ESP

  // ── Right column (bottom to top) ──
  { index: 30, kind: "go_to_red",     label: "В РАЗДЕВАЛКУ",    labelEn: "GO TO RED CARD" },
  nextCountry(31),  // G: FRA
  nextCountry(32),  // G: URU
  { index: 33, kind: "broadcaster",   label: "FIFA+",           labelEn: "FIFA+", price: 150 } as Tile,
  nextCountry(34),  // G: SEN
  { index: 35, kind: "stadium",       label: "BMO Field",       labelEn: "BMO Field", price: 200 } as Tile,
  { index: 36, kind: "tax",           label: "Налог за роскошь", labelEn: "Luxury tax", amount: 100 } as Tile,
  nextCountry(37),  // H: ARG
  nextCountry(38),  // H: POR
  nextCountry(39),  // H: NOR
];

// Sanity: make sure indices match array positions
for (let i = 0; i < BOARD.length; i++) {
  BOARD[i] = { ...BOARD[i], index: i } as Tile;
}

export function tileAt(index: number): Tile {
  return BOARD[((index % 40) + 40) % 40];
}

export function isCountry(t: Tile): t is CountryTile {
  return t.kind === "country";
}

export const KICKOFF_BONUS = 200;
export const STARTING_CASH = 1500;
export const RED_CARD_FINE = 50;
export const RED_CARD_INDEX = 10;
