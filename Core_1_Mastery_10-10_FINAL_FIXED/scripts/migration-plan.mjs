/**
 * Deterministic migration planner shared by the server bootstrap and CLI.
 * Migration filenames are ordered lexicographically and applied exactly once.
 */
export function pendingMigrations(paths = [], applied = []) {
  const done = new Set(applied);
  return paths
    .filter((path) => path.endsWith('.sql'))
    .map((path) => ({ path, name: path.split('/').pop() }))
    .filter(({ name }) => name && !done.has(name))
    .sort((a, b) => a.name.localeCompare(b.name));
}
