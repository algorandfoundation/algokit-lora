import { ApplicationResult } from '@/features/applications/data/types'
import { randomBigInt } from '@/utils/random-bigint'
import { DataBuilder, dossierProxy, randomString } from '@makerx/ts-dossier'
import algosdk, { base64ToBytes } from 'algosdk'

export class ApplicationResultBuilder extends DataBuilder<ApplicationResult> {
  constructor(initialState?: ApplicationResult) {
    super(
      initialState
        ? initialState
        : {
            id: randomBigInt(),
            params: {
              creator: algosdk.Address.zeroAddress(),
              approvalProgram: base64ToBytes(randomString(10, 100)),
              clearStateProgram: base64ToBytes(randomString(10, 100)),
              globalState: [],
            },
          }
    )
  }
}

export const applicationResultBuilder = dossierProxy<ApplicationResultBuilder, ApplicationResult>(ApplicationResultBuilder)
