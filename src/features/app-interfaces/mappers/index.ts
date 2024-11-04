import { readFile } from '@/utils/read-file'
import { AppSpecStandard, AppSpecVersion, Arc32AppSpec, Arc4AppSpec } from '../data/types'
import { jsonAsArc32AppSpec, jsonAsArc4AppSpec } from '@/features/abi-methods/mappers'

export const parseAsAppSpec = async (file: File, supportedStandards: AppSpecStandard[]): Promise<Arc32AppSpec | Arc4AppSpec> => {
  try {
    const content = await readFile(file)
    const jsonData = JSON.parse(content as string)

    if (supportedStandards.includes(AppSpecStandard.ARC32) && 'contract' in jsonData) {
      return jsonAsArc32AppSpec(jsonData)
    } else if (supportedStandards.includes(AppSpecStandard.ARC4)) {
      return jsonAsArc4AppSpec(jsonData)
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
