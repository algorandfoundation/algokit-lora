export function trimCharacterFromEnd(str: string, char: string): string {
  if (!str || !char || char.length !== 1) {
    throw new Error('Invalid input: str must be a string and char must be a single character.')
  }

  while (str.endsWith(char)) {
    str = str.slice(0, -1)
  }

  return str
}
