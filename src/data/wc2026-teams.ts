import type { Team } from "@/store/prediction-store";

/**
 * Final FIFA World Cup 2026 group draw — held on 5 December 2025 in
 * Washington, D.C. 12 groups × 4 teams = 48 nations.
 *
 * Sources cross-checked: FIFA.com final draw, Wikipedia "2026 FIFA World Cup",
 * NBC Sports, MLSSoccer.com, Fox Sports, ESPN.
 */
export const WC2026_TEAMS: Team[] = [
  // ── GROUP A ────────────────────────────────────────────
  { id: 1,  code: "MEX", name_ru: "Мексика",          name_en: "Mexico",          flag_emoji: "🇲🇽", group_letter: "A" },
  { id: 2,  code: "RSA", name_ru: "ЮАР",              name_en: "South Africa",    flag_emoji: "🇿🇦", group_letter: "A" },
  { id: 3,  code: "KOR", name_ru: "Южная Корея",      name_en: "Korea Republic",  flag_emoji: "🇰🇷", group_letter: "A" },
  { id: 4,  code: "CZE", name_ru: "Чехия",            name_en: "Czechia",         flag_emoji: "🇨🇿", group_letter: "A" },

  // ── GROUP B ────────────────────────────────────────────
  { id: 5,  code: "CAN", name_ru: "Канада",           name_en: "Canada",          flag_emoji: "🇨🇦", group_letter: "B" },
  { id: 6,  code: "SUI", name_ru: "Швейцария",        name_en: "Switzerland",     flag_emoji: "🇨🇭", group_letter: "B" },
  { id: 7,  code: "QAT", name_ru: "Катар",            name_en: "Qatar",           flag_emoji: "🇶🇦", group_letter: "B" },
  { id: 8,  code: "BIH", name_ru: "Босния и Герц.",   name_en: "Bosnia & Herz.",  flag_emoji: "🇧🇦", group_letter: "B" },

  // ── GROUP C ────────────────────────────────────────────
  { id: 9,  code: "BRA", name_ru: "Бразилия",         name_en: "Brazil",          flag_emoji: "🇧🇷", group_letter: "C" },
  { id: 10, code: "MAR", name_ru: "Марокко",          name_en: "Morocco",         flag_emoji: "🇲🇦", group_letter: "C" },
  { id: 11, code: "HAI", name_ru: "Гаити",            name_en: "Haiti",           flag_emoji: "🇭🇹", group_letter: "C" },
  { id: 12, code: "SCO", name_ru: "Шотландия",        name_en: "Scotland",        flag_emoji: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", group_letter: "C" },

  // ── GROUP D ────────────────────────────────────────────
  { id: 13, code: "USA", name_ru: "США",              name_en: "USA",             flag_emoji: "🇺🇸", group_letter: "D" },
  { id: 14, code: "PAR", name_ru: "Парагвай",         name_en: "Paraguay",        flag_emoji: "🇵🇾", group_letter: "D" },
  { id: 15, code: "AUS", name_ru: "Австралия",        name_en: "Australia",       flag_emoji: "🇦🇺", group_letter: "D" },
  { id: 16, code: "TUR", name_ru: "Турция",           name_en: "Türkiye",         flag_emoji: "🇹🇷", group_letter: "D" },

  // ── GROUP E ────────────────────────────────────────────
  { id: 17, code: "GER", name_ru: "Германия",         name_en: "Germany",         flag_emoji: "🇩🇪", group_letter: "E" },
  { id: 18, code: "CUW", name_ru: "Кюрасао",          name_en: "Curaçao",         flag_emoji: "🇨🇼", group_letter: "E" },
  { id: 19, code: "CIV", name_ru: "Кот-д'Ивуар",      name_en: "Côte d'Ivoire",   flag_emoji: "🇨🇮", group_letter: "E" },
  { id: 20, code: "ECU", name_ru: "Эквадор",          name_en: "Ecuador",         flag_emoji: "🇪🇨", group_letter: "E" },

  // ── GROUP F ────────────────────────────────────────────
  { id: 21, code: "NED", name_ru: "Нидерланды",       name_en: "Netherlands",     flag_emoji: "🇳🇱", group_letter: "F" },
  { id: 22, code: "JPN", name_ru: "Япония",           name_en: "Japan",           flag_emoji: "🇯🇵", group_letter: "F" },
  { id: 23, code: "SWE", name_ru: "Швеция",           name_en: "Sweden",          flag_emoji: "🇸🇪", group_letter: "F" },
  { id: 24, code: "TUN", name_ru: "Тунис",            name_en: "Tunisia",         flag_emoji: "🇹🇳", group_letter: "F" },

  // ── GROUP G ────────────────────────────────────────────
  { id: 25, code: "BEL", name_ru: "Бельгия",          name_en: "Belgium",         flag_emoji: "🇧🇪", group_letter: "G" },
  { id: 26, code: "EGY", name_ru: "Египет",           name_en: "Egypt",           flag_emoji: "🇪🇬", group_letter: "G" },
  { id: 27, code: "IRN", name_ru: "Иран",             name_en: "Iran",            flag_emoji: "🇮🇷", group_letter: "G" },
  { id: 28, code: "NZL", name_ru: "Новая Зеландия",   name_en: "New Zealand",     flag_emoji: "🇳🇿", group_letter: "G" },

  // ── GROUP H ────────────────────────────────────────────
  { id: 29, code: "ESP", name_ru: "Испания",          name_en: "Spain",           flag_emoji: "🇪🇸", group_letter: "H" },
  { id: 30, code: "CPV", name_ru: "Кабо-Верде",       name_en: "Cabo Verde",      flag_emoji: "🇨🇻", group_letter: "H" },
  { id: 31, code: "KSA", name_ru: "Саудовская Аравия", name_en: "Saudi Arabia",   flag_emoji: "🇸🇦", group_letter: "H" },
  { id: 32, code: "URU", name_ru: "Уругвай",          name_en: "Uruguay",         flag_emoji: "🇺🇾", group_letter: "H" },

  // ── GROUP I ────────────────────────────────────────────
  { id: 33, code: "FRA", name_ru: "Франция",          name_en: "France",          flag_emoji: "🇫🇷", group_letter: "I" },
  { id: 34, code: "SEN", name_ru: "Сенегал",          name_en: "Senegal",         flag_emoji: "🇸🇳", group_letter: "I" },
  { id: 35, code: "IRQ", name_ru: "Ирак",             name_en: "Iraq",            flag_emoji: "🇮🇶", group_letter: "I" },
  { id: 36, code: "NOR", name_ru: "Норвегия",         name_en: "Norway",          flag_emoji: "🇳🇴", group_letter: "I" },

  // ── GROUP J ────────────────────────────────────────────
  { id: 37, code: "ARG", name_ru: "Аргентина",        name_en: "Argentina",       flag_emoji: "🇦🇷", group_letter: "J" },
  { id: 38, code: "ALG", name_ru: "Алжир",            name_en: "Algeria",         flag_emoji: "🇩🇿", group_letter: "J" },
  { id: 39, code: "AUT", name_ru: "Австрия",          name_en: "Austria",         flag_emoji: "🇦🇹", group_letter: "J" },
  { id: 40, code: "JOR", name_ru: "Иордания",         name_en: "Jordan",          flag_emoji: "🇯🇴", group_letter: "J" },

  // ── GROUP K ────────────────────────────────────────────
  { id: 41, code: "POR", name_ru: "Португалия",       name_en: "Portugal",        flag_emoji: "🇵🇹", group_letter: "K" },
  { id: 42, code: "UZB", name_ru: "Узбекистан",       name_en: "Uzbekistan",      flag_emoji: "🇺🇿", group_letter: "K" },
  { id: 43, code: "COL", name_ru: "Колумбия",         name_en: "Colombia",        flag_emoji: "🇨🇴", group_letter: "K" },
  { id: 44, code: "COD", name_ru: "ДР Конго",         name_en: "DR Congo",        flag_emoji: "🇨🇩", group_letter: "K" },

  // ── GROUP L ────────────────────────────────────────────
  { id: 45, code: "ENG", name_ru: "Англия",           name_en: "England",         flag_emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", group_letter: "L" },
  { id: 46, code: "CRO", name_ru: "Хорватия",         name_en: "Croatia",         flag_emoji: "🇭🇷", group_letter: "L" },
  { id: 47, code: "GHA", name_ru: "Гана",             name_en: "Ghana",           flag_emoji: "🇬🇭", group_letter: "L" },
  { id: 48, code: "PAN", name_ru: "Панама",           name_en: "Panama",          flag_emoji: "🇵🇦", group_letter: "L" },
];
