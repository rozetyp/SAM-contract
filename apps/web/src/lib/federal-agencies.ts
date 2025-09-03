// Federal Agencies - Common agencies that issue contracts
// Source: USA.gov Federal Agencies Directory
export const federalAgencies = [
  // Department of Defense
  { code: "97", name: "Department of Defense", shortName: "DoD" },
  { code: "9700", name: "Department of the Army", shortName: "Army" },
  { code: "9701", name: "Department of the Navy", shortName: "Navy" },
  { code: "9702", name: "Department of the Air Force", shortName: "Air Force" },
  { code: "9703", name: "Defense Logistics Agency", shortName: "DLA" },
  { code: "9704", name: "Defense Information Systems Agency", shortName: "DISA" },
  
  // Civilian Agencies
  { code: "47", name: "General Services Administration", shortName: "GSA" },
  { code: "75", name: "Department of Health and Human Services", shortName: "HHS" },
  { code: "1434", name: "Centers for Disease Control and Prevention", shortName: "CDC" },
  { code: "7529", name: "National Institutes of Health", shortName: "NIH" },
  { code: "89", name: "Department of Energy", shortName: "DOE" },
  { code: "80", name: "National Aeronautics and Space Administration", shortName: "NASA" },
  { code: "91", name: "Department of Transportation", shortName: "DOT" },
  { code: "6925", name: "Federal Aviation Administration", shortName: "FAA" },
  { code: "70", name: "Department of Homeland Security", shortName: "DHS" },
  { code: "7014", name: "Transportation Security Administration", shortName: "TSA" },
  { code: "7012", name: "Customs and Border Protection", shortName: "CBP" },
  { code: "69", name: "Department of Justice", shortName: "DOJ" },
  { code: "1849", name: "Federal Bureau of Investigation", shortName: "FBI" },
  { code: "15", name: "Department of Agriculture", shortName: "USDA" },
  { code: "68", name: "Environmental Protection Agency", shortName: "EPA" },
  { code: "86", name: "United States Agency for International Development", shortName: "USAID" },
  { code: "84", name: "Department of Education", shortName: "ED" },
  { code: "49", name: "National Science Foundation", shortName: "NSF" },
  { code: "31", name: "Department of Commerce", shortName: "DOC" },
  { code: "1341", name: "National Institute of Standards and Technology", shortName: "NIST" },
  { code: "14", name: "Department of the Interior", shortName: "DOI" },
  { code: "16", name: "Department of Labor", shortName: "DOL" },
  { code: "19", name: "Department of State", shortName: "State" },
  { code: "20", name: "Department of the Treasury", shortName: "Treasury" },
  { code: "24", name: "Office of Personnel Management", shortName: "OPM" },
  { code: "95", name: "Department of Veterans Affairs", shortName: "VA" },
  { code: "27", name: "Small Business Administration", shortName: "SBA" },
  { code: "29", name: "Social Security Administration", shortName: "SSA" }
];

// Helper function to search agencies
export function searchAgencies(query: string) {
  const q = query.toLowerCase();
  return federalAgencies.filter(
    agency => 
      agency.code.includes(q) || 
      agency.name.toLowerCase().includes(q) ||
      agency.shortName.toLowerCase().includes(q)
  );
}
