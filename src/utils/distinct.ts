export const distinct = <T>(keySelector?: (item: T) => unknown) => {
  const ks = keySelector || ((x: T) => x)
  const set = new Set()
  return (item: T) => {
    if (set.has(ks(item))) {
      return false
    }

    set.add(ks(item))
    return true
  }
}
