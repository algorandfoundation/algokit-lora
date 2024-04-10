export function ellipseAddress(address = ``, width = 4): string {
  return address ? `${address.slice(0, width)}...${address.slice(-width)}` : address
}
