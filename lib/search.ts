/**
 * Match case-insensitive per la ricerca di sezione (?q=):
 * true se la query è vuota o se almeno un campo la contiene.
 */
export function matchesQuery(
  q: string | undefined,
  ...fields: (string | undefined | null)[]
): boolean {
  const needle = q?.trim().toLowerCase()
  if (!needle) return true
  return fields.some((f) => f?.toLowerCase().includes(needle))
}
