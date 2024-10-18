export function ellipseAddress(address = '', width = 4): string {
  return address ? `${address.slice(0, width)}…${address.slice(-width)}` : address
}

export function ellipseNfd(address = '', width = 5): string {
  if (address.length <= width * 2) {
    return address
  }
  return address ? `${address.slice(0, width)}…${address.slice(-width)}` : address
}
