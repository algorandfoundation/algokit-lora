export function parseJson(maybeJson: string) {
  try {
    const json = JSON.parse(maybeJson)
    if (json && typeof json === 'object') {
      return json
    }
  } catch (e) {
    // ignore
  }
}
