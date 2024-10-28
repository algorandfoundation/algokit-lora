export const shortId = (date: Date = new Date()) => {
  return Number(date).toString(36).toUpperCase()
}
