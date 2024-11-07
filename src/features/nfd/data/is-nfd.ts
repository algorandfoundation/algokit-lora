const nfdRegex = /^(.+\.algo)$/

export const isNfd = (name: string) => nfdRegex.test(name)
