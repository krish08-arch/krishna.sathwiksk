export interface StreetRegistryEntry {
  zone: string;
  wardNo: number;
  wardName: string;
  roadType: string;
  streetId: string;
  streetName: string;
  lengthMeters: number;
}

export const URBAN_REGISTRY: StreetRegistryEntry[] = [
  // Block 1: Chickpete
  { zone: "West", wardNo: 109, wardName: "Chickpete", roadType: "Intermediate Road", streetId: "I0001", streetName: "B V K IYENGAR RD", lengthMeters: 309.53 },
  { zone: "West", wardNo: 109, wardName: "Chickpete", roadType: "Intermediate Road", streetId: "I0001", streetName: "B V K IYENGAR RD", lengthMeters: 258.59 },
  { zone: "West", wardNo: 109, wardName: "Chickpete", roadType: "Intermediate Road", streetId: "I0029", streetName: "15TH CROSS", lengthMeters: 106.37 },
  { zone: "West", wardNo: 109, wardName: "Chickpete", roadType: "Intermediate Road", streetId: "I0050", streetName: "RANGASWAMY TEMPLE ST", lengthMeters: 246.01 },
  { zone: "West", wardNo: 109, wardName: "Chickpete", roadType: "Intermediate Road", streetId: "I0052", streetName: "TULSI THOTA 1ST CRS", lengthMeters: 106.09 },
  { zone: "West", wardNo: 109, wardName: "Chickpete", roadType: "Intermediate Road", streetId: "I0056", streetName: "J M LANE 1ST CRS", lengthMeters: 120.2 },
  { zone: "West", wardNo: 109, wardName: "Chickpete", roadType: "Intermediate Road", streetId: "I0125", streetName: "BALEPET MAIN RD", lengthMeters: 156.89 },
  { zone: "West", wardNo: 109, wardName: "Chickpete", roadType: "Intermediate Road", streetId: "I0125", streetName: "BALEPET MAIN RD", lengthMeters: 87.35 },
  { zone: "West", wardNo: 109, wardName: "Chickpete", roadType: "Major Road", streetId: "M0078", streetName: "KEMPEGOWDA  RD", lengthMeters: 263.15 },
  { zone: "West", wardNo: 109, wardName: "Chickpete", roadType: "Major Road", streetId: "M0078", streetName: "KEMPEGOWDA  RD", lengthMeters: 337.08 },
  { zone: "West", wardNo: 109, wardName: "Chickpete", roadType: "Major Road", streetId: "M0109", streetName: "BHASHYAM RD", lengthMeters: 318.77 },
  { zone: "West", wardNo: 109, wardName: "Chickpete", roadType: "Major Road", streetId: "MA080", streetName: "O T C RD", lengthMeters: 1420.12 },
  { zone: "West", wardNo: 109, wardName: "Chickpete", roadType: "Major Road", streetId: "MA109", streetName: "AVENUE RD", lengthMeters: 623.87 },
  { zone: "West", wardNo: 109, wardName: "Chickpete", roadType: "Minor Road", streetId: "W0003", streetName: "3RD CRS, K G RD", lengthMeters: 125.34 },
  { zone: "West", wardNo: 109, wardName: "Chickpete", roadType: "Minor Road", streetId: "W0005", streetName: "2ND CRS, K G RD", lengthMeters: 125.27 },
  { zone: "West", wardNo: 109, wardName: "Chickpete", roadType: "Minor Road", streetId: "W0006", streetName: "HOSPITAL RD", lengthMeters: 375.44 },

  // Block 2: Srirammandir
  { zone: "West", wardNo: 108, wardName: "Srirammandir", roadType: "Intermediate Road", streetId: "I0109", streetName: "12th Main 3rd Block Rajaji Nagar", lengthMeters: 618.63 },
  { zone: "West", wardNo: 108, wardName: "Srirammandir", roadType: "Major Road", streetId: "M0093", streetName: "Dr Rajkumar Rd (link Rd)", lengthMeters: 1828.08 },
  { zone: "West", wardNo: 108, wardName: "Srirammandir", roadType: "Major Road", streetId: "M0095", streetName: "West Of Chord Rd", lengthMeters: 463.57 },
  { zone: "West", wardNo: 108, wardName: "Srirammandir", roadType: "Minor Road", streetId: "W0007", streetName: "11th Main Rd", lengthMeters: 371.29 },
  { zone: "West", wardNo: 108, wardName: "Srirammandir", roadType: "Minor Road", streetId: "W0013", streetName: "10th Main Rd 41st Crs Rajajinagar", lengthMeters: 542.74 },

  // Block 3: Basaveshwara Nagar
  { zone: "West", wardNo: 100, wardName: "Basaveshwara Nagar", roadType: "Intermediate Road", streetId: "I0002", streetName: "1st Main Rd", lengthMeters: 905.98 },
  { zone: "West", wardNo: 100, wardName: "Basaveshwara Nagar", roadType: "Intermediate Road", streetId: "I0043", streetName: "7th Main Rd", lengthMeters: 1063.65 },
  { zone: "West", wardNo: 100, wardName: "Basaveshwara Nagar", roadType: "Major Road", streetId: "M0097", streetName: "1st Crs (80 Feet Rd)Siddaiah Puranik Road", lengthMeters: 1040.74 },
  { zone: "West", wardNo: 100, wardName: "Basaveshwara Nagar", roadType: "Minor Road", streetId: "W0005", streetName: "2nd Crs", lengthMeters: 570.93 },

  // Block 4: Sampangiram Nagar
  { zone: "East", wardNo: 110, wardName: "Sampangiram Nagar", roadType: "Intermediate Road", streetId: "I0001", streetName: "St Johns Rd", lengthMeters: 319.78 },
  { zone: "East", wardNo: 110, wardName: "Sampangiram Nagar", roadType: "Intermediate Road", streetId: "I0002", streetName: "Cubbon Rd", lengthMeters: 1951.68 },
  { zone: "East", wardNo: 110, wardName: "Sampangiram Nagar", roadType: "Major Road", streetId: "M0070", streetName: "Kasturba Rd", lengthMeters: 1532.8 },
  { zone: "East", wardNo: 110, wardName: "Sampangiram Nagar", roadType: "Major Road", streetId: "M0073", streetName: "Dr Ambedkar Rd", lengthMeters: 1447.09 },
  { zone: "East", wardNo: 110, wardName: "Sampangiram Nagar", roadType: "Minor Road", streetId: "W0038", streetName: "Infantry Rd", lengthMeters: 1652.07 },

  // Block 5: Kempegowda Ward / Yelahanka
  { zone: "Yelahanka", wardNo: 1, wardName: "Kempegowda Ward", roadType: "Major Road", streetId: "M0011", streetName: "Bellary Main Rd", lengthMeters: 5357.1 },
  { zone: "Yelahanka", wardNo: 1, wardName: "Kempegowda Ward", roadType: "Major Road", streetId: "M0013", streetName: "Kempegowda Rd (jakkur Crs )", lengthMeters: 1422.55 },
  { zone: "Yelahanka", wardNo: 1, wardName: "Kempegowda Ward", roadType: "Minor Road", streetId: "W0127", streetName: "Kere Kodi Rd", lengthMeters: 1459.6 },

  // Block 6: Govindarajanagara
  { zone: "West", wardNo: 104, wardName: "Govindarajanagara", roadType: "Intermediate Road", streetId: "I0034", streetName: "8th Main Rd, Binny Layout, 1st Stage", lengthMeters: 713.94 },
  { zone: "West", wardNo: 104, wardName: "Govindarajanagara", roadType: "Major Road", streetId: "M0064", streetName: "Magadi Mn Rd", lengthMeters: 888.41 },
  { zone: "West", wardNo: 104, wardName: "Govindarajanagara", roadType: "Minor Road", streetId: "W0027", streetName: "24th Main Rd Govindaraj Nagar", lengthMeters: 609.52 }
];

export const getWardStats = (wardName: string) => {
  const wardStreets = URBAN_REGISTRY.filter(s => s.wardName.toLowerCase() === wardName.toLowerCase());
  if (wardStreets.length === 0) return null;

  const totalLength = wardStreets.reduce((acc, s) => acc + s.lengthMeters, 0);
  const byType = wardStreets.reduce((acc, s) => {
    acc[s.roadType] = (acc[s.roadType] || 0) + s.lengthMeters;
    return acc;
  }, {} as Record<string, number>);

  return {
    wardName: wardStreets[0].wardName,
    wardNo: wardStreets[0].wardNo,
    totalStreets: wardStreets.length,
    totalLengthKm: (totalLength / 1000).toFixed(2),
    distribution: byType
  };
};
