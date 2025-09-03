// NAICS 2022 - Major categories and common subcodes for government contracting
// Source: US Census Bureau NAICS 2022
export const naicsCodes = [
  // Professional, Scientific, and Technical Services (Most common for gov contracts)
  { code: "541511", title: "Custom Computer Programming Services", sector: "Professional Services" },
  { code: "541512", title: "Computer Systems Design Services", sector: "Professional Services" },
  { code: "541513", title: "Computer Facilities Management Services", sector: "Professional Services" },
  { code: "541519", title: "Other Computer Related Services", sector: "Professional Services" },
  { code: "541330", title: "Engineering Services", sector: "Professional Services" },
  { code: "541611", title: "Administrative Management and General Management Consulting Services", sector: "Professional Services" },
  { code: "541612", title: "Human Resources Consulting Services", sector: "Professional Services" },
  { code: "541613", title: "Marketing Consulting Services", sector: "Professional Services" },
  { code: "541614", title: "Process, Physical Distribution, and Logistics Consulting Services", sector: "Professional Services" },
  { code: "541618", title: "Other Management Consulting Services", sector: "Professional Services" },
  { code: "541690", title: "Other Scientific and Technical Consulting Services", sector: "Professional Services" },
  { code: "541715", title: "Research and Development in the Physical, Engineering, and Life Sciences", sector: "Professional Services" },
  { code: "541720", title: "Research and Development in the Social Sciences and Humanities", sector: "Professional Services" },
  
  // Administrative and Support Services
  { code: "561110", title: "Office Administrative Services", sector: "Administrative Services" },
  { code: "561210", title: "Facilities Support Services", sector: "Administrative Services" },
  { code: "561499", title: "All Other Business Support Services", sector: "Administrative Services" },
  { code: "561612", title: "Security Guards and Patrol Services", sector: "Administrative Services" },
  { code: "561621", title: "Security Systems Services (except Locksmiths)", sector: "Administrative Services" },
  
  // Educational Services
  { code: "611430", title: "Professional and Management Development Training", sector: "Educational Services" },
  { code: "611710", title: "Educational Support Services", sector: "Educational Services" },
  
  // Construction
  { code: "236220", title: "Commercial and Institutional Building Construction", sector: "Construction" },
  { code: "237310", title: "Highway, Street, and Bridge Construction", sector: "Construction" },
  { code: "237990", title: "Other Heavy and Civil Engineering Construction", sector: "Construction" },
  { code: "238210", title: "Electrical Contractors and Other Wiring Installation Contractors", sector: "Construction" },
  { code: "238220", title: "Plumbing, Heating, and Air-Conditioning Contractors", sector: "Construction" },
  
  // Manufacturing
  { code: "334111", title: "Electronic Computer Manufacturing", sector: "Manufacturing" },
  { code: "334118", title: "Computer Terminal and Other Computer Peripheral Equipment Manufacturing", sector: "Manufacturing" },
  { code: "334290", title: "Other Communications Equipment Manufacturing", sector: "Manufacturing" },
  { code: "336411", title: "Aircraft Manufacturing", sector: "Manufacturing" },
  { code: "336412", title: "Aircraft Engine and Engine Parts Manufacturing", sector: "Manufacturing" },
  
  // Transportation and Warehousing
  { code: "481111", title: "Scheduled Passenger Air Transportation", sector: "Transportation" },
  { code: "484110", title: "General Freight Trucking, Local", sector: "Transportation" },
  { code: "484121", title: "General Freight Trucking, Long-Distance, Truckload", sector: "Transportation" },
  
  // Information
  { code: "518210", title: "Data Processing, Hosting, and Related Services", sector: "Information" },
  { code: "519130", title: "Internet Publishing and Broadcasting and Web Search Portals", sector: "Information" },
  
  // Health Care and Social Assistance
  { code: "621111", title: "Offices of Physicians (except Mental Health Specialists)", sector: "Healthcare" },
  { code: "621399", title: "Offices of All Other Miscellaneous Health Practitioners", sector: "Healthcare" },
  { code: "622110", title: "General Medical and Surgical Hospitals", sector: "Healthcare" },
];

export const naicsSectors = [
  "Professional Services",
  "Administrative Services", 
  "Educational Services",
  "Construction",
  "Manufacturing", 
  "Transportation",
  "Information",
  "Healthcare"
];

// Helper function to search NAICS codes
export function searchNaics(query: string) {
  const q = query.toLowerCase();
  return naicsCodes.filter(
    naics => 
      naics.code.includes(q) || 
      naics.title.toLowerCase().includes(q) ||
      naics.sector.toLowerCase().includes(q)
  );
}
