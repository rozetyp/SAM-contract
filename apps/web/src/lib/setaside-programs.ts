// Set-Aside Programs for Federal Contracting
// Source: FAR Part 19 - Small Business Programs
export const setAsidePrograms = [
  { code: "SBA", title: "Small Business Set-Aside", description: "Reserved for small businesses" },
  { code: "8A", title: "8(a) Business Development", description: "For socially and economically disadvantaged small businesses" },
  { code: "WOSB", title: "Women-Owned Small Business", description: "Reserved for women-owned small businesses" },
  { code: "EDWOSB", title: "Economically Disadvantaged WOSB", description: "For economically disadvantaged women-owned small businesses" },
  { code: "HUBZone", title: "HUBZone", description: "For businesses in Historically Underutilized Business Zones" },
  { code: "SDVOSB", title: "Service-Disabled Veteran-Owned Small Business", description: "Reserved for service-disabled veteran-owned small businesses" },
  { code: "VOSB", title: "Veteran-Owned Small Business", description: "For veteran-owned small businesses" },
  { code: "LH", title: "Local Hire", description: "Requires hiring local workers" },
  { code: "IEE", title: "Indian Economic Enterprise", description: "For Indian economic enterprises" },
  { code: "BICiv", title: "Buy Indian", description: "Buy Indian Act procurement" },
  { code: "None", title: "Full and Open Competition", description: "No set-aside restrictions" }
];

// Helper function to search set-aside programs
export function searchSetAside(query: string) {
  const q = query.toLowerCase();
  return setAsidePrograms.filter(
    program => 
      program.code.toLowerCase().includes(q) || 
      program.title.toLowerCase().includes(q) ||
      program.description.toLowerCase().includes(q)
  );
}
