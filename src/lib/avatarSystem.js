// ==============================================================================
// HCM Lite — Illustrated Vector Avatar System (Based on Reference Design)
// Hand-crafted SVG line-art avatars with solid pastel background circles,
// gender-matched portraits, and anonymous fallbacks.
// ==============================================================================

export const AVATAR_PALETTES = {
  cyan: "#38bdf8",
  yellow: "#facc15",
  mint: "#4ade80",
  coral: "#fb7185",
  teal: "#2dd4bf",
  indigo: "#6366f1",
  slate: "#64748b",
  purple: "#a855f7",
};

/**
 * 1. Female Avatar 1: Wavy bob, beaded necklace, cyan circle background
 */
const SVG_FEMALE_1 = `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="48" fill="#38bdf8"/>
  <!-- Hair back -->
  <path d="M26 48 C22 62 26 72 35 76 C45 80 55 80 65 76 C74 72 78 62 74 48 Z" fill="#18181b"/>
  <!-- Body/Shoulders -->
  <path d="M22 100 C22 78 35 72 50 72 C65 72 78 78 78 100 Z" fill="#ffffff" stroke="#18181b" stroke-width="2.5" stroke-linejoin="round"/>
  <!-- Neck -->
  <path d="M43 62 L43 74 C43 78 57 78 57 74 L57 62 Z" fill="#ffffff" stroke="#18181b" stroke-width="2.5" stroke-linejoin="round"/>
  <!-- Beaded necklace -->
  <circle cx="43" cy="74" r="1.8" fill="#18181b"/>
  <circle cx="46" cy="76" r="1.8" fill="#18181b"/>
  <circle cx="50" cy="77" r="1.8" fill="#18181b"/>
  <circle cx="54" cy="76" r="1.8" fill="#18181b"/>
  <circle cx="57" cy="74" r="1.8" fill="#18181b"/>
  <!-- Head / Face -->
  <path d="M34 44 C34 32 40 28 50 28 C60 28 66 32 66 44 C66 57 58 64 50 64 C42 64 34 57 34 44 Z" fill="#ffffff" stroke="#18181b" stroke-width="2.5" stroke-linejoin="round"/>
  <!-- Ears -->
  <circle cx="34" cy="47" r="3.5" fill="#ffffff" stroke="#18181b" stroke-width="2"/>
  <circle cx="66" cy="47" r="3.5" fill="#ffffff" stroke="#18181b" stroke-width="2"/>
  <!-- Hair Front (Wavy with flicks) -->
  <path d="M32 42 C30 30 40 22 50 22 C62 22 70 30 68 42 C64 33 58 31 50 34 C42 37 36 33 32 42 Z" fill="#18181b"/>
  <path d="M28 44 C26 38 32 32 37 34 C33 39 30 46 36 49 C32 50 29 48 28 44 Z" fill="#18181b"/>
  <path d="M72 44 C74 38 68 32 63 34 C67 39 70 46 64 49 C68 50 71 48 72 44 Z" fill="#18181b"/>
  <!-- Eyes -->
  <ellipse cx="44" cy="46" rx="2" ry="2.2" fill="#18181b"/>
  <ellipse cx="56" cy="46" rx="2" ry="2.2" fill="#18181b"/>
  <!-- Eyebrows -->
  <path d="M41 42 Q44 40 47 42" stroke="#18181b" stroke-width="2" stroke-linecap="round"/>
  <path d="M53 42 Q56 40 59 42" stroke="#18181b" stroke-width="2" stroke-linecap="round"/>
  <!-- Nose -->
  <path d="M49 47 Q48 51 51 52" fill="none" stroke="#18181b" stroke-width="2" stroke-linecap="round"/>
  <!-- Smile -->
  <path d="M45 56 Q50 60 55 56" fill="none" stroke="#18181b" stroke-width="2.2" stroke-linecap="round"/>
</svg>`;

/**
 * 2. Female Avatar 2: High Ponytail, Hoodie, yellow circle background
 */
const SVG_FEMALE_2 = `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="48" fill="#facc15"/>
  <!-- Ponytail -->
  <path d="M42 28 C34 22 28 26 26 35 C24 44 26 52 30 54 C35 56 36 46 38 38 C39 32 40 30 42 28 Z" fill="#18181b" stroke="#18181b" stroke-width="2"/>
  <!-- Body / Hoodie -->
  <path d="M24 100 C24 78 35 72 50 72 C65 72 76 78 76 100 Z" fill="#ffffff" stroke="#18181b" stroke-width="2.5" stroke-linejoin="round"/>
  <!-- Hoodie collar overlap -->
  <path d="M38 72 C38 80 44 85 50 85 C56 85 62 80 62 72" fill="none" stroke="#18181b" stroke-width="2.5"/>
  <path d="M46 85 L46 94" stroke="#18181b" stroke-width="2" stroke-linecap="round"/>
  <path d="M54 85 L54 94" stroke="#18181b" stroke-width="2" stroke-linecap="round"/>
  <!-- Neck -->
  <path d="M43 62 L43 73 C43 76 57 76 57 73 L57 62 Z" fill="#ffffff" stroke="#18181b" stroke-width="2.5" stroke-linejoin="round"/>
  <!-- Head / Face -->
  <path d="M35 44 C35 32 41 28 50 28 C59 28 65 32 65 44 C65 57 58 64 50 64 C42 64 35 57 35 44 Z" fill="#ffffff" stroke="#18181b" stroke-width="2.5" stroke-linejoin="round"/>
  <!-- Ear -->
  <circle cx="65" cy="46" r="3.5" fill="#ffffff" stroke="#18181b" stroke-width="2"/>
  <!-- Hair (Sleek bun/pulled back) -->
  <path d="M36 40 C34 30 42 24 50 24 C60 24 66 30 65 40 C61 31 54 29 46 31 C40 33 37 36 36 40 Z" fill="#18181b"/>
  <!-- Hair tie -->
  <ellipse cx="40" cy="27" rx="3" ry="4" fill="#ffffff" stroke="#18181b" stroke-width="2"/>
  <!-- Eyes -->
  <ellipse cx="45" cy="45" rx="2" ry="2.2" fill="#18181b"/>
  <ellipse cx="56" cy="45" rx="2" ry="2.2" fill="#18181b"/>
  <!-- Eyebrows -->
  <path d="M42 41 Q45 39 48 41" stroke="#18181b" stroke-width="2" stroke-linecap="round"/>
  <path d="M53 41 Q56 39 59 41" stroke="#18181b" stroke-width="2" stroke-linecap="round"/>
  <!-- Nose -->
  <path d="M50 46 Q49 50 52 51" fill="none" stroke="#18181b" stroke-width="2" stroke-linecap="round"/>
  <!-- Smile -->
  <path d="M46 55 Q51 59 56 55" fill="none" stroke="#18181b" stroke-width="2.2" stroke-linecap="round"/>
</svg>`;

/**
 * 3. Female Avatar 3: Voluminous wavy hair, big hoop earrings, coral background
 */
const SVG_FEMALE_3 = `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="48" fill="#fb7185"/>
  <!-- Big hair back/sides -->
  <path d="M22 45 C18 60 22 76 34 80 C40 82 60 82 66 80 C78 76 82 60 78 45 C82 30 72 18 50 18 C28 18 18 30 22 45 Z" fill="#18181b"/>
  <!-- Body/Shoulders -->
  <path d="M24 100 C24 78 35 72 50 72 C65 72 76 78 76 100 Z" fill="#ffffff" stroke="#18181b" stroke-width="2.5" stroke-linejoin="round"/>
  <!-- Neck -->
  <path d="M43 62 L43 74 C43 78 57 78 57 74 L57 62 Z" fill="#ffffff" stroke="#18181b" stroke-width="2.5"/>
  <!-- Big Hoop Earrings -->
  <circle cx="34" cy="50" r="6" fill="none" stroke="#18181b" stroke-width="2.2"/>
  <circle cx="66" cy="50" r="6" fill="none" stroke="#18181b" stroke-width="2.2"/>
  <!-- Head / Face -->
  <path d="M35 44 C35 32 41 28 50 28 C59 28 65 32 65 44 C65 57 58 64 50 64 C42 64 35 57 35 44 Z" fill="#ffffff" stroke="#18181b" stroke-width="2.5" stroke-linejoin="round"/>
  <!-- Ears -->
  <circle cx="35" cy="46" r="3" fill="#ffffff" stroke="#18181b" stroke-width="2"/>
  <circle cx="65" cy="46" r="3" fill="#ffffff" stroke="#18181b" stroke-width="2"/>
  <!-- Hair Front (Side swept volume) -->
  <path d="M34 38 C32 26 44 20 56 22 C65 24 68 32 66 40 C62 32 54 28 46 30 C38 32 35 34 34 38 Z" fill="#18181b"/>
  <path d="M30 46 C28 55 32 65 37 68 C34 60 33 50 36 44 Z" fill="#18181b"/>
  <!-- Eyes -->
  <ellipse cx="44" cy="45" rx="2" ry="2.2" fill="#18181b"/>
  <ellipse cx="56" cy="45" rx="2" ry="2.2" fill="#18181b"/>
  <!-- Eyebrows -->
  <path d="M41 41 Q44 39 47 41" stroke="#18181b" stroke-width="2" stroke-linecap="round"/>
  <path d="M53 41 Q56 39 59 41" stroke="#18181b" stroke-width="2" stroke-linecap="round"/>
  <!-- Nose -->
  <path d="M50 46 Q49 50 52 51" fill="none" stroke="#18181b" stroke-width="2" stroke-linecap="round"/>
  <!-- Smile -->
  <path d="M45 55 Q50 60 55 55" fill="none" stroke="#18181b" stroke-width="2.2" stroke-linecap="round"/>
</svg>`;

/**
 * 4. Female Avatar 4: Short crop, geometric hexagon earrings, striped collar, mint background
 */
const SVG_FEMALE_4 = `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="48" fill="#4ade80"/>
  <!-- Body/Shoulders -->
  <path d="M22 100 C22 78 35 72 50 72 C65 72 78 78 78 100 Z" fill="#ffffff" stroke="#18181b" stroke-width="2.5" stroke-linejoin="round"/>
  <!-- Ribbed mockneck stripes -->
  <path d="M42 66 L58 66" stroke="#18181b" stroke-width="2"/>
  <path d="M42 70 L58 70" stroke="#18181b" stroke-width="2"/>
  <path d="M43 74 L57 74" stroke="#18181b" stroke-width="2"/>
  <!-- Neck -->
  <path d="M42 62 L42 74 C42 77 58 77 58 74 L58 62 Z" fill="#ffffff" stroke="#18181b" stroke-width="2.5"/>
  <!-- Hexagon Earrings -->
  <polygon points="30,48 33,45 36,48 36,53 33,56 30,53" fill="none" stroke="#18181b" stroke-width="2"/>
  <polygon points="64,48 67,45 70,48 70,53 67,56 64,53" fill="none" stroke="#18181b" stroke-width="2"/>
  <!-- Head / Face -->
  <path d="M35 44 C35 32 41 28 50 28 C59 28 65 32 65 44 C65 57 58 64 50 64 C42 64 35 57 35 44 Z" fill="#ffffff" stroke="#18181b" stroke-width="2.5" stroke-linejoin="round"/>
  <!-- Ears -->
  <circle cx="34" cy="46" r="3" fill="#ffffff" stroke="#18181b" stroke-width="2"/>
  <circle cx="66" cy="46" r="3" fill="#ffffff" stroke="#18181b" stroke-width="2"/>
  <!-- Short Edgy Hair -->
  <path d="M31 42 C30 28 40 22 50 22 C60 22 70 28 69 42 C64 32 54 30 46 33 C39 36 34 38 31 42 Z" fill="#18181b"/>
  <path d="M29 38 L34 32 L36 36 Z" fill="#18181b"/>
  <path d="M69 36 C72 40 70 46 66 48 L67 40 Z" fill="#18181b"/>
  <!-- Eyes -->
  <ellipse cx="44" cy="46" rx="2" ry="2.2" fill="#18181b"/>
  <ellipse cx="56" cy="46" rx="2" ry="2.2" fill="#18181b"/>
  <!-- Eyebrows -->
  <path d="M41 42 Q44 40 47 42" stroke="#18181b" stroke-width="2" stroke-linecap="round"/>
  <path d="M53 42 Q56 40 59 42" stroke="#18181b" stroke-width="2" stroke-linecap="round"/>
  <!-- Nose -->
  <path d="M49 47 Q48 51 51 52" fill="none" stroke="#18181b" stroke-width="2" stroke-linecap="round"/>
  <!-- Smile -->
  <path d="M45 56 Q50 60 55 56" fill="none" stroke="#18181b" stroke-width="2.2" stroke-linecap="round"/>
</svg>`;

/**
 * 5. Female Avatar 5: Long sleek dark hair, collared shirt, cyan background
 */
const SVG_FEMALE_5 = `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="48" fill="#0ea5e9"/>
  <!-- Long hair falling behind & over shoulders -->
  <path d="M22 52 C20 70 24 88 34 94 C32 82 32 68 34 52 Z" fill="#18181b"/>
  <path d="M78 52 C80 70 76 88 66 94 C68 82 68 68 66 52 Z" fill="#18181b"/>
  <!-- Body/Shoulders -->
  <path d="M24 100 C24 78 35 72 50 72 C65 72 76 78 76 100 Z" fill="#ffffff" stroke="#18181b" stroke-width="2.5" stroke-linejoin="round"/>
  <!-- V-neck Collared Shirt -->
  <path d="M43 72 L47 84 L50 82 L53 84 L57 72" fill="#ffffff" stroke="#18181b" stroke-width="2.2"/>
  <path d="M50 82 L50 98" stroke="#18181b" stroke-width="2"/>
  <!-- Neck -->
  <path d="M43 62 L43 74 C43 78 57 78 57 74 L57 62 Z" fill="#ffffff" stroke="#18181b" stroke-width="2.5"/>
  <!-- Head / Face -->
  <path d="M35 44 C35 32 41 28 50 28 C59 28 65 32 65 44 C65 57 58 64 50 64 C42 64 35 57 35 44 Z" fill="#ffffff" stroke="#18181b" stroke-width="2.5" stroke-linejoin="round"/>
  <!-- Hair top & front framing face -->
  <path d="M32 44 C30 26 40 20 50 20 C60 20 70 26 68 44 C65 32 58 28 50 29 C42 28 35 32 32 44 Z" fill="#18181b"/>
  <!-- Eyes -->
  <ellipse cx="44" cy="46" rx="2" ry="2.2" fill="#18181b"/>
  <ellipse cx="56" cy="46" rx="2" ry="2.2" fill="#18181b"/>
  <!-- Eyebrows -->
  <path d="M41 42 Q44 40 47 42" stroke="#18181b" stroke-width="2" stroke-linecap="round"/>
  <path d="M53 42 Q56 40 59 42" stroke="#18181b" stroke-width="2" stroke-linecap="round"/>
  <!-- Nose -->
  <path d="M49 47 Q48 51 51 52" fill="none" stroke="#18181b" stroke-width="2" stroke-linecap="round"/>
  <!-- Smile -->
  <path d="M45 56 Q50 60 55 56" fill="none" stroke="#18181b" stroke-width="2.2" stroke-linecap="round"/>
</svg>`;

/**
 * 6. Male Avatar 1: Round glasses, striped shirt, mint green background
 */
const SVG_MALE_1 = `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="48" fill="#4ade80"/>
  <!-- Body/Shoulders -->
  <path d="M22 100 C22 78 35 72 50 72 C65 72 78 78 78 100 Z" fill="#ffffff" stroke="#18181b" stroke-width="2.5" stroke-linejoin="round"/>
  <!-- Horizontal Stripes -->
  <path d="M25 80 L75 80" stroke="#18181b" stroke-width="2.2"/>
  <path d="M23 88 L77 88" stroke="#18181b" stroke-width="2.2"/>
  <path d="M22 96 L78 96" stroke="#18181b" stroke-width="2.2"/>
  <!-- Neck -->
  <path d="M42 62 L42 74 C42 78 58 78 58 74 L58 62 Z" fill="#ffffff" stroke="#18181b" stroke-width="2.5"/>
  <!-- Head / Face -->
  <path d="M35 44 C35 32 41 28 50 28 C59 28 65 32 65 44 C65 57 58 64 50 64 C42 64 35 57 35 44 Z" fill="#ffffff" stroke="#18181b" stroke-width="2.5" stroke-linejoin="round"/>
  <!-- Ears -->
  <circle cx="34" cy="47" r="3.5" fill="#ffffff" stroke="#18181b" stroke-width="2"/>
  <circle cx="66" cy="47" r="3.5" fill="#ffffff" stroke="#18181b" stroke-width="2"/>
  <!-- Short wavy hair -->
  <path d="M32 42 C30 26 42 20 50 20 C62 20 68 26 68 40 C63 32 55 30 48 31 C40 32 36 36 32 42 Z" fill="#18181b"/>
  <path d="M48 20 C54 18 60 22 62 26 C56 22 51 22 48 20 Z" fill="#18181b"/>
  <!-- Round Glasses -->
  <circle cx="43" cy="47" r="5.5" fill="#ffffff" stroke="#18181b" stroke-width="2.2"/>
  <circle cx="57" cy="47" r="5.5" fill="#ffffff" stroke="#18181b" stroke-width="2.2"/>
  <path d="M48.5 47 L51.5 47" stroke="#18181b" stroke-width="2.2"/>
  <!-- Eyes inside glasses -->
  <ellipse cx="43" cy="47" rx="1.8" ry="2" fill="#18181b"/>
  <ellipse cx="57" cy="47" rx="1.8" ry="2" fill="#18181b"/>
  <!-- Eyebrows -->
  <path d="M40 39 Q43 37 46 39" stroke="#18181b" stroke-width="2" stroke-linecap="round"/>
  <path d="M54 39 Q57 37 60 39" stroke="#18181b" stroke-width="2" stroke-linecap="round"/>
  <!-- Nose -->
  <path d="M49 48 Q48 52 51 53" fill="none" stroke="#18181b" stroke-width="2" stroke-linecap="round"/>
  <!-- Smile -->
  <path d="M46 57 Q50 60 54 57" fill="none" stroke="#18181b" stroke-width="2.2" stroke-linecap="round"/>
</svg>`;

/**
 * 7. Male Avatar 2: Clean comb-over, collared dress shirt, coral background
 */
const SVG_MALE_2 = `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="48" fill="#fb7185"/>
  <!-- Body/Shoulders -->
  <path d="M22 100 C22 78 35 72 50 72 C65 72 78 78 78 100 Z" fill="#ffffff" stroke="#18181b" stroke-width="2.5" stroke-linejoin="round"/>
  <!-- Dress Shirt Collar -->
  <path d="M42 72 L36 82 L48 78 L50 82 L52 78 L64 82 L58 72 Z" fill="#ffffff" stroke="#18181b" stroke-width="2.2" stroke-linejoin="round"/>
  <path d="M50 82 L50 100" stroke="#18181b" stroke-width="2"/>
  <!-- Neck -->
  <path d="M42 62 L42 74 C42 78 58 78 58 74 L58 62 Z" fill="#ffffff" stroke="#18181b" stroke-width="2.5"/>
  <!-- Head / Face -->
  <path d="M35 44 C35 32 41 28 50 28 C59 28 65 32 65 44 C65 57 58 64 50 64 C42 64 35 57 35 44 Z" fill="#ffffff" stroke="#18181b" stroke-width="2.5" stroke-linejoin="round"/>
  <!-- Ears -->
  <circle cx="34" cy="47" r="3.5" fill="#ffffff" stroke="#18181b" stroke-width="2"/>
  <circle cx="66" cy="47" r="3.5" fill="#ffffff" stroke="#18181b" stroke-width="2"/>
  <!-- Comb-over hair -->
  <path d="M32 42 C30 26 40 18 52 18 C62 18 68 24 68 38 C64 30 56 28 48 29 C40 30 36 34 32 42 Z" fill="#18181b"/>
  <path d="M38 22 C44 16 54 18 58 22 C52 18 44 18 38 22 Z" fill="#18181b"/>
  <!-- Eyes -->
  <ellipse cx="44" cy="46" rx="2" ry="2.2" fill="#18181b"/>
  <ellipse cx="56" cy="46" rx="2" ry="2.2" fill="#18181b"/>
  <!-- Eyebrows -->
  <path d="M41 41 Q44 39 47 41" stroke="#18181b" stroke-width="2" stroke-linecap="round"/>
  <path d="M53 41 Q56 39 59 41" stroke="#18181b" stroke-width="2" stroke-linecap="round"/>
  <!-- Nose -->
  <path d="M49 47 Q48 51 51 52" fill="none" stroke="#18181b" stroke-width="2" stroke-linecap="round"/>
  <!-- Smile -->
  <path d="M45 56 Q50 60 55 56" fill="none" stroke="#18181b" stroke-width="2.2" stroke-linecap="round"/>
</svg>`;

/**
 * 8. Male Avatar 3: Middle-part curtains hair, checkered shirt, yellow background
 */
const SVG_MALE_3 = `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="48" fill="#facc15"/>
  <!-- Body/Shoulders -->
  <path d="M22 100 C22 78 35 72 50 72 C65 72 78 78 78 100 Z" fill="#ffffff" stroke="#18181b" stroke-width="2.5" stroke-linejoin="round"/>
  <!-- Checkered grid pattern on jacket -->
  <path d="M32 80 L32 100" stroke="#18181b" stroke-width="1.8"/>
  <path d="M42 82 L42 100" stroke="#18181b" stroke-width="1.8"/>
  <path d="M58 82 L58 100" stroke="#18181b" stroke-width="1.8"/>
  <path d="M68 80 L68 100" stroke="#18181b" stroke-width="1.8"/>
  <path d="M24 88 L76 88" stroke="#18181b" stroke-width="1.8"/>
  <!-- Neck -->
  <path d="M42 62 L42 74 C42 78 58 78 58 74 L58 62 Z" fill="#ffffff" stroke="#18181b" stroke-width="2.5"/>
  <!-- Head / Face -->
  <path d="M35 44 C35 32 41 28 50 28 C59 28 65 32 65 44 C65 57 58 64 50 64 C42 64 35 57 35 44 Z" fill="#ffffff" stroke="#18181b" stroke-width="2.5" stroke-linejoin="round"/>
  <!-- Ears -->
  <circle cx="34" cy="47" r="3.5" fill="#ffffff" stroke="#18181b" stroke-width="2"/>
  <circle cx="66" cy="47" r="3.5" fill="#ffffff" stroke="#18181b" stroke-width="2"/>
  <!-- Middle-part Curtain Hair -->
  <path d="M32 42 C30 26 42 20 50 22 C58 20 70 26 68 42 C64 30 56 28 50 34 C44 28 36 30 32 42 Z" fill="#18181b"/>
  <!-- Eyes -->
  <ellipse cx="44" cy="46" rx="2" ry="2.2" fill="#18181b"/>
  <ellipse cx="56" cy="46" rx="2" ry="2.2" fill="#18181b"/>
  <!-- Eyebrows -->
  <path d="M41 41 Q44 39 47 41" stroke="#18181b" stroke-width="2" stroke-linecap="round"/>
  <path d="M53 41 Q56 39 59 41" stroke="#18181b" stroke-width="2" stroke-linecap="round"/>
  <!-- Nose -->
  <path d="M49 47 Q48 51 51 52" fill="none" stroke="#18181b" stroke-width="2" stroke-linecap="round"/>
  <!-- Smile -->
  <path d="M45 56 Q50 60 55 56" fill="none" stroke="#18181b" stroke-width="2.2" stroke-linecap="round"/>
</svg>`;

/**
 * 9. Anonymous / Neutral Avatar 1: Sleek modern persona, purple background
 */
const SVG_ANONYMOUS_1 = `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="48" fill="#6366f1"/>
  <!-- Body/Shoulders -->
  <path d="M24 100 C24 78 35 72 50 72 C65 72 76 78 76 100 Z" fill="#ffffff" stroke="#18181b" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M40 72 C40 82 46 86 50 86 C54 86 60 82 60 72" fill="none" stroke="#18181b" stroke-width="2.2"/>
  <!-- Neck -->
  <path d="M43 62 L43 74 C43 78 57 78 57 74 L57 62 Z" fill="#ffffff" stroke="#18181b" stroke-width="2.5"/>
  <!-- Head / Face -->
  <path d="M35 44 C35 32 41 28 50 28 C59 28 65 32 65 44 C65 57 58 64 50 64 C42 64 35 57 35 44 Z" fill="#ffffff" stroke="#18181b" stroke-width="2.5" stroke-linejoin="round"/>
  <!-- Neutral sleek hair / beanie -->
  <path d="M34 40 C32 26 40 22 50 22 C60 22 68 26 66 40 C62 30 55 28 50 30 C45 28 38 30 34 40 Z" fill="#18181b"/>
  <!-- Minimalist curved smile eyes -->
  <path d="M42 45 Q44 48 46 45" fill="none" stroke="#18181b" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M54 45 Q56 48 58 45" fill="none" stroke="#18181b" stroke-width="2.5" stroke-linecap="round"/>
  <!-- Smile -->
  <path d="M46 55 Q50 58 54 55" fill="none" stroke="#18181b" stroke-width="2.2" stroke-linecap="round"/>
</svg>`;

/**
 * 10. Anonymous / Neutral Avatar 2: Clean abstract silhouette, slate background
 */
const SVG_ANONYMOUS_2 = `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="48" fill="#64748b"/>
  <circle cx="50" cy="50" r="44" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="4 4" opacity="0.6"/>
  <!-- Body/Shoulders Silhouette -->
  <path d="M26 96 C26 76 36 70 50 70 C64 70 74 76 74 96 Z" fill="#ffffff" stroke="#18181b" stroke-width="2.5"/>
  <!-- Head Silhouette -->
  <circle cx="50" cy="46" r="16" fill="#ffffff" stroke="#18181b" stroke-width="2.5"/>
  <!-- Friendly minimalist eyes & smile -->
  <ellipse cx="45" cy="45" rx="1.8" ry="2" fill="#18181b"/>
  <ellipse cx="55" cy="45" rx="1.8" ry="2" fill="#18181b"/>
  <path d="M46 54 Q50 57 54 54" fill="none" stroke="#18181b" stroke-width="2" stroke-linecap="round"/>
</svg>`;

export const FEMALE_AVATARS = [
  SVG_FEMALE_1,
  SVG_FEMALE_2,
  SVG_FEMALE_3,
  SVG_FEMALE_4,
  SVG_FEMALE_5,
];

export const MALE_AVATARS = [
  SVG_MALE_1,
  SVG_MALE_2,
  SVG_MALE_3,
  SVG_MALE_1, // Variant with green background
  SVG_MALE_2, // Variant with coral background
];

export const ANONYMOUS_AVATARS = [
  SVG_ANONYMOUS_1,
  SVG_ANONYMOUS_2,
];

// Helper to convert raw SVG string into clean Data URL
export function svgToDataUri(svgString) {
  const cleaned = svgString.replace(/[\n\r\t]+/g, " ").replace(/\s+/g, " ");
  return `data:image/svg+xml;utf8,${encodeURIComponent(cleaned)}`;
}

// Convert all SVG templates to Data URIs
export const FEMALE_DATA_URIS = FEMALE_AVATARS.map(svgToDataUri);
export const MALE_DATA_URIS = MALE_AVATARS.map(svgToDataUri);
export const ANONYMOUS_DATA_URIS = ANONYMOUS_AVATARS.map(svgToDataUri);

const KNOWN_FEMALES = new Set([
  "sarah", "elena", "aaliyah", "chloe", "clara", "mei", "maria", "emma", "olivia",
  "sophia", "isabella", "mia", "charlotte", "amelia", "harper", "evelyn", "abigail",
  "emily", "elizabeth", "mila", "ella", "avery", "sofia", "camila", "aria", "scarlett",
  "victoria", "madison", "luna", "grace", "penelope", "layla", "riley", "zoey",
  "nora", "lily", "eleanor", "hannah", "lillian", "addison", "aubrey", "ellie", "stella",
  "natalie", "leah", "hazel", "violet", "aurora", "savannah", "audrey", "brooklyn",
  "bella", "claire", "anna", "maya", "naomi", "fatima", "zainab", "ayesha", "amira"
]);

const KNOWN_MALES = new Set([
  "marcus", "david", "john", "lucas", "dmitri", "liam", "james", "alex", "noah",
  "oliver", "william", "benjamin", "elijah", "mason", "logan", "alexander", "ethan",
  "jacob", "michael", "daniel", "henry", "jackson", "sebastian", "aidan", "matthew",
  "samuel", "joseph", "carter", "owen", "wyatt", "jack", "luke", "dylan", "isaac",
  "gabriel", "anthony", "joshua", "andrew", "caleb", "ryan", "nathan", "thomas",
  "leo", "charles", "christian", "connor", "aaron", "adrian", "jonathan", "cameron",
  "robert", "adam", "ian", "austin", "jordan", "umer", "omer", "ali", "ahmed",
  "hassan", "rahul", "vikram", "arjun", "bilal", "hamza"
]);

/**
 * Predict gender from name
 */
export function detectGenderFromName(name = "") {
  const clean = String(name).trim().toLowerCase();
  if (!clean || clean === "user" || clean === "admin" || clean === "employee" || clean.startsWith("emp-")) {
    return "anonymous";
  }

  const firstName = clean.split(/[\s._-]+/)[0];

  if (KNOWN_FEMALES.has(firstName)) return "female";
  if (KNOWN_MALES.has(firstName)) return "male";

  // Heuristic suffix rules
  if (firstName.endsWith("a") || firstName.endsWith("ie") || firstName.endsWith("ah") || firstName.endsWith("i")) {
    return "female";
  }
  if (firstName.endsWith("o") || firstName.endsWith("us") || firstName.endsWith("er") || firstName.endsWith("d") || firstName.endsWith("n") || firstName.endsWith("m")) {
    return "male";
  }

  return "anonymous";
}

/**
 * Deterministically pick an avatar Data URI matching the gender and name
 */
export function getIllustratedAvatar(name = "User", explicitGender = null) {
  const gender = explicitGender || detectGenderFromName(name);

  let hash = 0;
  const str = String(name || "User");
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  if (gender === "female") {
    const idx = Math.abs(hash) % FEMALE_DATA_URIS.length;
    return FEMALE_DATA_URIS[idx];
  }

  if (gender === "male") {
    const idx = Math.abs(hash) % MALE_DATA_URIS.length;
    return MALE_DATA_URIS[idx];
  }

  // Anonymous / Neutral
  const idx = Math.abs(hash) % ANONYMOUS_DATA_URIS.length;
  return ANONYMOUS_DATA_URIS[idx];
}

/**
 * Explicit mapping for HCM Lite Core Workforce Personas & Known IDs
 */
export const CORE_PERSONA_AVATARS = {
  // Super Admin: Sarah Connor (Female - Wavy Bob on Cyan)
  "sarah.connor@hcmlite.internal": FEMALE_DATA_URIS[0],
  "admin@hcmlite.internal": FEMALE_DATA_URIS[0],
  "EMP-001": FEMALE_DATA_URIS[0],
  "demo-admin": FEMALE_DATA_URIS[0],
  "K9NpOuZMS8YiMVMBNCDZ4LChY672": FEMALE_DATA_URIS[0],
  "sarah connor": FEMALE_DATA_URIS[0],
  "sarah": FEMALE_DATA_URIS[0],

  // Head of Engineering: Marcus Vance (Male - Round glasses on Mint)
  "marcus.vance@hcmlite.internal": MALE_DATA_URIS[0],
  "EMP-002": MALE_DATA_URIS[0],
  "marcus vance": MALE_DATA_URIS[0],
  "marcus": MALE_DATA_URIS[0],

  // Staff Software Engineer: Elena Rostova (Female - High Ponytail on Yellow)
  "elena.rostova@hcmlite.internal": FEMALE_DATA_URIS[1],
  "employee@hcmlite.internal": FEMALE_DATA_URIS[1],
  "EMP-003": FEMALE_DATA_URIS[1],
  "demo-employee": FEMALE_DATA_URIS[1],
  "fzUdUgY9OQeucAp1aH0pfvqy1Ki2": FEMALE_DATA_URIS[1],
  "elena rostova": FEMALE_DATA_URIS[1],
  "elena": FEMALE_DATA_URIS[1],

  // Director of Product: David Chen (Male - Short comb-over on Coral)
  "david.chen@hcmlite.internal": MALE_DATA_URIS[1],
  "EMP-004": MALE_DATA_URIS[1],
  "david chen": MALE_DATA_URIS[1],
  "david": MALE_DATA_URIS[1],

  // HR Business Partner: Aaliyah Patel (Female - Voluminous hoop earrings on Coral)
  "aaliyah.patel@hcmlite.internal": FEMALE_DATA_URIS[2],
  "hr@hcmlite.internal": FEMALE_DATA_URIS[2],
  "EMP-005": FEMALE_DATA_URIS[2],
  "demo-hr": FEMALE_DATA_URIS[2],
  "B6H2WvF88WPcaaG4lzDvV7hyiOG3": FEMALE_DATA_URIS[2],
  "aaliyah patel": FEMALE_DATA_URIS[2],
  "aaliyah": FEMALE_DATA_URIS[2],

  // Product Designer: Lucas Silva (Male - Middle-part curtains on Yellow)
  "lucas.silva@hcmlite.internal": MALE_DATA_URIS[2],
  "EMP-006": MALE_DATA_URIS[2],
  "lucas silva": MALE_DATA_URIS[2],
  "lucas": MALE_DATA_URIS[2],

  // Senior Frontend Engineer: Chloe Dupont (Female - Short crop on Mint)
  "chloe.dupont@hcmlite.internal": FEMALE_DATA_URIS[3],
  "EMP-007": FEMALE_DATA_URIS[3],
  "chloe dupont": FEMALE_DATA_URIS[3],
  "chloe": FEMALE_DATA_URIS[3],

  // Account Executive: James Wilson (Male - Modern comb on Coral)
  "james.wilson@hcmlite.internal": MALE_DATA_URIS[1],
  "EMP-008": MALE_DATA_URIS[1],
  "james wilson": MALE_DATA_URIS[1],
  "james": MALE_DATA_URIS[1],

  // New Hire: Liam Nguyen (Male - Checkered shirt on Yellow)
  "new.hire@hcmlite.internal": MALE_DATA_URIS[2],
  "EMP-009": MALE_DATA_URIS[2],
  "demo-temp-user": MALE_DATA_URIS[2],
  "liam nguyen": MALE_DATA_URIS[2],
  "liam": MALE_DATA_URIS[2],

  // Umer (Male)
  "umer": MALE_DATA_URIS[0],
  "umer raza": MALE_DATA_URIS[0],

  // Anonymous default
  "anonymous": ANONYMOUS_DATA_URIS[0],
};

/**
 * Visual Avatar Presets for Picker & Selection
 */
export const ALL_AVATAR_PRESETS = [
  { id: "female-1", label: "Cyan Bob (Female)", dataUri: FEMALE_DATA_URIS[0], gender: "female" },
  { id: "female-2", label: "Yellow Ponytail (Female)", dataUri: FEMALE_DATA_URIS[1], gender: "female" },
  { id: "female-3", label: "Coral Curls (Female)", dataUri: FEMALE_DATA_URIS[2], gender: "female" },
  { id: "female-4", label: "Mint Crop (Female)", dataUri: FEMALE_DATA_URIS[3], gender: "female" },
  { id: "female-5", label: "Teal Sleek (Female)", dataUri: FEMALE_DATA_URIS[4], gender: "female" },
  { id: "male-1", label: "Mint Glasses (Male)", dataUri: MALE_DATA_URIS[0], gender: "male" },
  { id: "male-2", label: "Coral Side-Part (Male)", dataUri: MALE_DATA_URIS[1], gender: "male" },
  { id: "male-3", label: "Yellow Curtains (Male)", dataUri: MALE_DATA_URIS[2], gender: "male" },
  { id: "anon-1", label: "Indigo Minimalist (Neutral)", dataUri: ANONYMOUS_DATA_URIS[0], gender: "anonymous" },
  { id: "anon-2", label: "Slate Silhouette (Neutral)", dataUri: ANONYMOUS_DATA_URIS[1], gender: "anonymous" },
];

/**
 * Unified Avatar Resolver:
 * Guarantees every user / employee gets a clean vector illustrated avatar
 * matching their persona and gender, intercepting legacy Unsplash URLs or empty states.
 */
export function resolveAvatar(options = {}) {
  // If a string URL/path is passed directly
  if (typeof options === "string") {
    options = { src: options };
  }

  const { src, name, email, id, gender } = options || {};

  // 1. If it's already an illustrated SVG Data URI, preserve it
  if (src && typeof src === "string" && src.startsWith("data:image/svg+xml")) {
    return src;
  }

  // 2. Check Core Persona mapping
  const keysToTry = [
    id,
    email?.toLowerCase(),
    name?.toLowerCase(),
    name ? name.toLowerCase().split(/[\s._-]+/)[0] : null,
  ].filter(Boolean);

  for (const k of keysToTry) {
    if (CORE_PERSONA_AVATARS[k]) {
      return CORE_PERSONA_AVATARS[k];
    }
  }

  // 3. Fallback: Generate deterministic gender-matched illustrated avatar
  return getIllustratedAvatar(name || email || id || "User", gender);
}
