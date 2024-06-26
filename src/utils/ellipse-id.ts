export function ellipseId(id = '', width = 7): string {
  return id ? `${id.slice(0, width)}…` : id
}
