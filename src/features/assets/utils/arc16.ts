// When properties contains the key traits, it conforms to ARC-16.
export const isArc16Properties = (properties: Record<string, unknown>) => 'traits' in properties
