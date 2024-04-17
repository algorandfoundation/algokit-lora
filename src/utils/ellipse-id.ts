export function ellipseId(id = '', width = 7): string {
  if (id.length <= 7) return id
  return id ? `${id.slice(0, width)}...` : id
}
