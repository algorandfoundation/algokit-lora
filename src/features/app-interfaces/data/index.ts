// const createWritableAppInterfaceEntityAtom = (_: Getter, __: Setter, applicationId: ApplicationId) => {
//   const appInterfaceAtom = atomWithDefault<AppInterfaceEntity | undefined | Promise<AppInterfaceEntity | undefined>>(async (get) => {
//     const dbConnection = await get(dbConnectionAtom)
//     return await getAppInterface(dbConnection, applicationId)
//   })

//   return atom(
//     (get) => get(appInterfaceAtom),
//     async (get, set, appInterface: AppInterfaceEntity) => {
//       const dbConnection = await get(dbConnectionAtom)

//       await writeAppInterface(dbConnection, appInterface)
//       set(appInterfaceAtom, appInterface)
//     }
//   )
// }

// export const [appInterfacesAtom, getAppInterfaceAtom] = writableAtomCache(
//   createWritableAppInterfaceEntityAtom,
//   (applicationId: ApplicationId) => applicationId
// )

export * from './read'
export * from './delete'
export * from './write'
