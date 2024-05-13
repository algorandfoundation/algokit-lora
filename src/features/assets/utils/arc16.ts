// When the URL contains #arc3 or @arc3, it follows ARC-3
export const isArc16Properties = (properties: Record<string, unknown>) => 'traits' in properties
