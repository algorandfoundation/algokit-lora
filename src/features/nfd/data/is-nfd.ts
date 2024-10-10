const nfdRegex = /^(.+\.algo)$/

export const isNFD = (name: string) => nfdRegex.test(name)
