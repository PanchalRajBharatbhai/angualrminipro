/**
 * Utility to match entity IDs (Students, Courses, Enrollments) with robust tolerance
 * for spaces, hyphens, lowercase/uppercase, URI encoding, and partial numeric suffixes.
 * E.g., matches "STU 1001", "stu-1001", "STU-1001", "1001", and "STU%201001".
 */

export function normalizeEntityId(id: string): string {
  if (!id) return '';
  try {
    return decodeURIComponent(id)
      .trim()
      .toLowerCase()
      .replace(/[\s\-_]/g, '');
  } catch {
    return id.trim().toLowerCase().replace(/[\s\-_]/g, '');
  }
}

export function matchesEntityId(rawId: string | undefined | null, searchId: string | undefined | null): boolean {
  if (!rawId || !searchId) return false;
  if (rawId === searchId) return true;

  const normA = normalizeEntityId(rawId);
  const normB = normalizeEntityId(searchId);
  if (!normA || !normB) return false;

  if (normA === normB) return true;

  // Handle numeric suffix lookup (e.g. searching '1001' matches 'stu1001')
  if (normA.endsWith(normB) || normB.endsWith(normA)) {
    return true;
  }

  return false;
}
