/**
 * Australian suburbs by state for dropdowns and search.
 * Suburb, postcode, state – used for "Suburb or Postcode" selects.
 */
export type SuburbOption = { suburb: string; postcode: string; state: string }

export const AU_STATES = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"] as const

export const AU_SUBURBS: SuburbOption[] = [
  { suburb: "Sydney", postcode: "2000", state: "NSW" },
  { suburb: "Parramatta", postcode: "2150", state: "NSW" },
  { suburb: "Chatswood", postcode: "2067", state: "NSW" },
  { suburb: "Maroubra", postcode: "2035", state: "NSW" },
  { suburb: "Bondi Junction", postcode: "2022", state: "NSW" },
  { suburb: "North Sydney", postcode: "2060", state: "NSW" },
  { suburb: "Melbourne", postcode: "3000", state: "VIC" },
  { suburb: "Richmond", postcode: "3121", state: "VIC" },
  { suburb: "St Kilda", postcode: "3182", state: "VIC" },
  { suburb: "Carlton", postcode: "3053", state: "VIC" },
  { suburb: "Fitzroy", postcode: "3065", state: "VIC" },
  { suburb: "Brisbane City", postcode: "4000", state: "QLD" },
  { suburb: "Fortitude Valley", postcode: "4006", state: "QLD" },
  { suburb: "South Brisbane", postcode: "4101", state: "QLD" },
  { suburb: "Gold Coast", postcode: "4217", state: "QLD" },
  { suburb: "Perth", postcode: "6000", state: "WA" },
  { suburb: "Fremantle", postcode: "6160", state: "WA" },
  { suburb: "Northbridge", postcode: "6003", state: "WA" },
  { suburb: "Adelaide", postcode: "5000", state: "SA" },
  { suburb: "North Adelaide", postcode: "5006", state: "SA" },
  { suburb: "Hobart", postcode: "7000", state: "TAS" },
  { suburb: "Launceston", postcode: "7250", state: "TAS" },
  { suburb: "Canberra", postcode: "2600", state: "ACT" },
  { suburb: "Darwin", postcode: "0800", state: "NT" },
  { suburb: "Palmerston", postcode: "0830", state: "NT" },
]

export function getSuburbsByState(state: string): SuburbOption[] {
  if (!state) return AU_SUBURBS
  return AU_SUBURBS.filter((s) => s.state === state)
}

export function getSuburbOption(suburb: string, postcode: string): SuburbOption | undefined {
  return AU_SUBURBS.find(
    (s) => s.suburb.toLowerCase() === suburb.toLowerCase() || s.postcode === postcode
  )
}
