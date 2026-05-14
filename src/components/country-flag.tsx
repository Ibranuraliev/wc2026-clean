"use client";

import Image from "next/image";

// Map FIFA 3-letter codes → ISO 3166-1 alpha-2 codes (lowercase, for flagcdn.com)
const FIFA_TO_ISO2: Record<string, string> = {
  // Hosts
  USA: "us", MEX: "mx", CAN: "ca",
  // Group A
  RSA: "za", KOR: "kr", CZE: "cz",
  // Group B
  SUI: "ch", QAT: "qa", BIH: "ba",
  // Group C
  BRA: "br", MAR: "ma", HAI: "ht", SCO: "gb-sct",
  // Group D
  PAR: "py", AUS: "au", TUR: "tr",
  // Group E
  GER: "de", CUW: "cw", CIV: "ci", ECU: "ec",
  // Group F
  NED: "nl", JPN: "jp", SWE: "se", TUN: "tn",
  // Group G
  BEL: "be", EGY: "eg", IRN: "ir", NZL: "nz",
  // Group H
  ESP: "es", CPV: "cv", KSA: "sa", URU: "uy",
  // Group I
  FRA: "fr", SEN: "sn", IRQ: "iq", NOR: "no",
  // Group J
  ARG: "ar", ALG: "dz", AUT: "at", JOR: "jo",
  // Group K
  POR: "pt", UZB: "uz", COL: "co", COD: "cd",
  // Group L
  ENG: "gb-eng", CRO: "hr", GHA: "gh", PAN: "pa",
  // Other historical / fact-section flags
  ITA: "it", DEN: "dk", NGR: "ng", UAE: "ae",
  CHI: "cl", PER: "pe", POL: "pl", UKR: "ua",
  SVK: "sk", GRE: "gr", SRB: "rs", HUN: "hu",
  CMR: "cm",
};

interface Props {
  code: string | null | undefined;
  size?: number;
  className?: string;
  rounded?: boolean;
}

export function CountryFlag({ code, size = 20, className = "", rounded = true }: Props) {
  const iso = code ? FIFA_TO_ISO2[code] : undefined;
  if (!iso) {
    return (
      <span
        className={`inline-block bg-line/10 ${rounded ? "rounded-sm" : ""} ${className}`}
        style={{ width: size * 1.33, height: size }}
        aria-hidden
      />
    );
  }
  // flagcdn provides high-quality SVG country flags
  const src = `https://flagcdn.com/${iso}.svg`;
  return (
    <Image
      src={src}
      alt={code ?? ""}
      width={Math.round(size * 1.33)}
      height={size}
      className={`inline-block object-cover shadow-[0_0_0_1px_rgba(255,255,255,0.08)] ${rounded ? "rounded-[2px]" : ""} ${className}`}
      unoptimized
    />
  );
}
