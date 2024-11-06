import { readFile } from '@/utils/read-file'
import { AppSpecStandard, AppSpecVersion, Arc32AppSpec, Arc4AppSpec } from '../data/types'
import { jsonAsArc32AppSpec, jsonAsArc4AppSpec, jsonAsArc56AppSpec } from '@/features/abi-methods/mappers'
import { Arc56Contract } from '@algorandfoundation/algokit-utils/types/app-arc56'

export const parseAsAppSpec = async (
  file: File,
  supportedStandards: AppSpecStandard[]
): Promise<Arc32AppSpec | Arc4AppSpec | Arc56Contract> => {
  try {
    const content = await readFile(file)
    const jsonData = JSON.parse(content as string)

    if (supportedStandards.includes(AppSpecStandard.ARC32)) {
      try {
        return jsonAsArc32AppSpec(jsonData)
      } catch {
        // ignore
      }
    }
    if (supportedStandards.includes(AppSpecStandard.ARC56)) {
      try {
        return jsonAsArc56AppSpec(jsonData)
      } catch {
        // ignore
      }
    }
    if (supportedStandards.includes(AppSpecStandard.ARC4)) {
      try {
        return jsonAsArc4AppSpec(jsonData)
      } catch {
        // ignore
      }
    }

    throw new Error('Not supported')
  } catch (e) {
    throw new Error(`The file is not a valid ${supportedStandards.join(' or ')} app spec`)
  }
}

export const asAppSpecFilename = (appSpecVersion: AppSpecVersion) => {
  return (
    appSpecVersion.standard === AppSpecStandard.ARC32
      ? `${appSpecVersion.appSpec.contract.name}.arc32.json`
      : `${appSpecVersion.appSpec.name}.arc4.json`
  )
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .toLowerCase()
}
;[0]

export const getLatestAppSpecVersion = (appSpecVersions: AppSpecVersion[]): AppSpecVersion | undefined => {
  const noRoundLastValid = appSpecVersions.find((appSpec) => appSpec.roundLastValid === undefined)
  if (noRoundLastValid) {
    return noRoundLastValid
  }
  const sorted = appSpecVersions.sort((a, b) => b.roundLastValid! - a.roundLastValid!)

  if (sorted.length > 0) {
    return sorted[0]
  }

  return undefined
}
