// PSC Codes - Product Service Codes for Federal Procurement
// Source: GSA Federal Procurement Data System Product and Service Codes Manual
export const pscCodes = [
  // Information Technology (D3xx)
  { code: "D302", title: "ADP Systems Development", category: "IT Services" },
  { code: "D307", title: "ADP Systems Analysis", category: "IT Services" },
  { code: "D310", title: "ADP Data Entry", category: "IT Services" },
  { code: "D316", title: "ADP Systems Programming", category: "IT Services" },
  { code: "D317", title: "ADP Software Programming", category: "IT Services" },
  { code: "D318", title: "ADP Data Processing and Preparation Services", category: "IT Services" },
  { code: "D319", title: "ADP Teleprocessing and Timesharing Services", category: "IT Services" },
  { code: "D320", title: "ADP Professional Services", category: "IT Services" },
  { code: "D399", title: "Other ADP and Telecommunications Services", category: "IT Services" },
  
  // Professional Services (R4xx)
  { code: "R408", title: "Program Management/Support Services", category: "Professional Services" },
  { code: "R409", title: "General Admin, Human Resources, and Business Support Services", category: "Professional Services" },
  { code: "R410", title: "Support- Administrative: Logistics", category: "Professional Services" },
  { code: "R423", title: "Support- Professional: Engineering/Technical", category: "Professional Services" },
  { code: "R425", title: "Support- Professional: Health Care", category: "Professional Services" },
  { code: "R429", title: "Support- Professional: Other", category: "Professional Services" },
  { code: "R497", title: "Professional Services- Other", category: "Professional Services" },
  
  // Research and Development (A1xx)
  { code: "A111", title: "Research- Basic Scientific Research", category: "R&D" },
  { code: "A112", title: "Research- Applied Research", category: "R&D" },
  { code: "A113", title: "Research- Developmental Research", category: "R&D" },
  { code: "A119", title: "Research- Other", category: "R&D" },
  { code: "A121", title: "Development- Experimental", category: "R&D" },
  { code: "A122", title: "Development- Prototype", category: "R&D" },
  { code: "A129", title: "Development- Other", category: "R&D" },
  
  // Construction (Y1xx, Z1xx)
  { code: "Y1DA", title: "Construction of Office Buildings", category: "Construction" },
  { code: "Y1DZ", title: "Construction of Other Administrative Facilities", category: "Construction" },
  { code: "Y1EA", title: "Construction of Educational Buildings", category: "Construction" },
  { code: "Y1JA", title: "Construction of Health Care Facilities", category: "Construction" },
  { code: "Z1DA", title: "Maintenance of Office Buildings", category: "Construction" },
  { code: "Z1JA", title: "Maintenance of Health Care Facilities", category: "Construction" },
  
  // Transportation (V1xx)
  { code: "V111", title: "Transportation- Motor Freight", category: "Transportation" },
  { code: "V121", title: "Transportation- Passenger", category: "Transportation" },
  { code: "V131", title: "Transportation- Air Freight", category: "Transportation" },
  { code: "V141", title: "Transportation- Air Passenger", category: "Transportation" },
  
  // Education and Training (U0xx)
  { code: "U009", title: "Training Services- Other", category: "Education" },
  { code: "U010", title: "Educational Services- Higher Education", category: "Education" },
  { code: "U099", title: "Education and Training Services- Other", category: "Education" },
  
  // Medical Services (Q1xx)
  { code: "Q101", title: "Medical Services- General", category: "Medical" },
  { code: "Q201", title: "Hospital Services", category: "Medical" },
  { code: "Q301", title: "Laboratory Services- Medical/Dental", category: "Medical" },
  
  // Maintenance and Repair (J0xx)
  { code: "J019", title: "Maintenance/Repair- General", category: "Maintenance" },
  { code: "J099", title: "Maintenance/Repair- Other", category: "Maintenance" },
];

export const pscCategories = [
  "IT Services",
  "Professional Services",
  "R&D", 
  "Construction",
  "Transportation",
  "Education",
  "Medical",
  "Maintenance"
];

// Helper function to search PSC codes
export function searchPsc(query: string) {
  const q = query.toLowerCase();
  return pscCodes.filter(
    psc => 
      psc.code.toLowerCase().includes(q) || 
      psc.title.toLowerCase().includes(q) ||
      psc.category.toLowerCase().includes(q)
  );
}
