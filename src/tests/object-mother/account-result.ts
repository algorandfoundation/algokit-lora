import { AccountResult } from '@/features/accounts/data/types'
import { AccountResultBuilder } from '../builders/account-result-builder'
import { AccountStatus } from '@algorandfoundation/algokit-utils/types/indexer'
import { Address } from '@algorandfoundation/algokit-utils/common'
import { base64ToBytes } from '@algorandfoundation/algokit-utils'

const encoder = new TextEncoder()

export const accountResultMother = {
  ['mainnet-BIQXAK67KSCKN3EJXT4S3RVXUBFOLZ45IQOBTSOQWOSR4LLULBTD54S5IA']: () => {
    return new AccountResultBuilder({
      address: 'BIQXAK67KSCKN3EJXT4S3RVXUBFOLZ45IQOBTSOQWOSR4LLULBTD54S5IA',
      amount: 5883741n,
      amountWithoutPendingRewards: 5883741n,
      appsLocalState: [
        {
          id: 1209868169n,
          schema: { numByteSlice: 1, numUint: 0 },
        },
        {
          id: 1210178396n,
          schema: { numByteSlice: 1, numUint: 0 },
        },
      ],
      appsTotalSchema: { numByteSlice: 2, numUint: 0 },
      assets: [
        { amount: 2002560000n, assetId: 924268058n, isFrozen: false },
        { amount: 0n, assetId: 1010208883n, isFrozen: false },
        { amount: 0n, assetId: 1096015467n, isFrozen: false },
      ],
      createdApps: [],
      createdAssets: [],
      minBalance: 700000n,
      pendingRewards: 0n,
      rewardBase: 218288n,
      rewards: 0n,
      round: 38880589n,
      status: AccountStatus.Offline,
      totalAppsOptedIn: 2,
      totalAssetsOptedIn: 3,
      totalCreatedApps: 0,
      totalCreatedAssets: 0,
    } satisfies AccountResult)
  },
  ['mainnet-ORANGESCU7XMR2TFXSFTOHCUHNP6OYEPIKZW3JZANTCDHVQYMGQFYFIDDA']: () => {
    return new AccountResultBuilder({
      address: 'ORANGESCU7XMR2TFXSFTOHCUHNP6OYEPIKZW3JZANTCDHVQYMGQFYFIDDA',
      amount: 123714752n,
      amountWithoutPendingRewards: 123714752n,
      appsLocalState: [
        {
          id: 1284326447n,
          keyValue: [],
          schema: {
            numByteSlice: 0,
            numUint: 1,
          },
        },
      ],
      appsTotalExtraPages: 3,
      appsTotalSchema: {
        numByteSlice: 38,
        numUint: 66,
      },
      assets: [
        { amount: 1n, assetId: 1162292622n, isFrozen: true },
        { amount: 0n, assetId: 1284444444n, isFrozen: false },
        { amount: 1228320n, assetId: 1294765516n, isFrozen: false },
        { amount: 3n, assetId: 1336655079n, isFrozen: false },
        { amount: 1n, assetId: 1355858325n, isFrozen: true },
        { amount: 1n, assetId: 1355898842n, isFrozen: true },
      ],
      createdApps: [
        {
          id: 1276197345n,
          params: {
            approvalProgram: base64ToBytes(
              'CSAFAAGAgNGUtXQGAiYODmhhbHZpbmdfc3VwcGx5BmVmZm9ydApsYXN0X21pbmVyFGN1cnJlbnRfbWluZXJfZWZmb3J0DG1pbmVyX3Jld2FyZAV0b2tlbgdoYWx2aW5nDG1pbmVkX3N1cHBseRFsYXN0X21pbmVyX2VmZm9ydA1jdXJyZW50X21pbmVyBWJsb2NrDHRvdGFsX2VmZm9ydBJ0b3RhbF90cmFuc2FjdGlvbnMPc3RhcnRfdGltZXN0YW1wMRgiDSULMRkIjQgCBgInAAAAAAAAAAACGQIoAIgAAiNDigAAJwUiZycKImcnCyJnJwwiZycGImcogYDAqMqaOmcnByJnJwSBgICAAmcqMgNnJwgiZycJMgNnKyJnJw2BgIHIrAZniYoAACcFsYEDshCABk9yYW5nZbImgANPUkGyJTIKsikyA7IqMgOyKzIDsiwksiIlsiOAFGh0dHBzOi8vb3Jhbmdlcy5tZW1lsicisgGztDxniYgAAiNDigAAJwVkIhJBAAOI/5wxACkiZomKAwAnBmSBDxJBABMrImcnBCJngAhHb29kYnllLrCJMgYyBoEFGAmM/ycKZIv/E0EAuipkJwVkcABMSEEAbihkJwRkDUEABicEZEIAAihkjP6xgQSyECcFZLIRKmSyFIv+shIisgGzJwcnB2SL/ghnKChki/4JZyhkIhJBAC4nBicGZCMIZycGZIEOEkEACigkJwdkCWdCABMoJCcHZAkhBApnJwQnBGQhBApnKmQ2MgBhQQAdKmQpYoz9KmQpi/0nCGQNQQAJi/0nCGQJQgABImYnCWQrZBZQsCcKi/9nKicJZGcnCCtkZysiZ4k2GgFJFYEgEkSIAAIjQ4oBAIv/NjIAKWNMSEQyBycNZA9EMQGBoJwBDkSAAEcCiP7iJwsnC2QxAQhnJwwnDGQjCGeL/ymL/yliMQEIZov/KWIrZA1BAAsnCYv/ZyuL/yliZ4kxG0H99oAEuER7NjYaAI4B/ekAgASrI3DMNhoAjgH/fQAAMRtB/nAA'
            ),
            clearStateProgram: base64ToBytes('CQ=='),
            creator: Address.fromString('ORANGESCU7XMR2TFXSFTOHCUHNP6OYEPIKZW3JZANTCDHVQYMGQFYFIDDA'),
            globalState: [],
            globalStateSchema: {
              numByteSlice: 2,
              numUint: 11,
            },
            localStateSchema: {
              numByteSlice: 0,
              numUint: 1,
            },
          },
        },
        {
          id: 1276914366n,
          params: {
            approvalProgram: base64ToBytes(
              'CSAFAAGAgNGUtXQGAiYPDmhhbHZpbmdfc3VwcGx5Cmxhc3RfbWluZXIUY3VycmVudF9taW5lcl9lZmZvcnQMbWluZXJfcmV3YXJkEWxhc3RfbWluZXJfZWZmb3J0BmVmZm9ydAV0b2tlbgdoYWx2aW5nDG1pbmVkX3N1cHBseQ1jdXJyZW50X21pbmVyBWJsb2NrDHRvdGFsX2VmZm9ydBJ0b3RhbF90cmFuc2FjdGlvbnMPc3RhcnRfdGltZXN0YW1wADEYIg0lCzEZCI0IAioCSwAAAAAAAAAAAj0CTACIAAIjQ4oAACcGImcnCiJnJwsiZycMImcnByJnKIGAwKjKmjpnJwgiZyuBgICAAmcpMgNnJwQiZycJMgNnKiJnJw2BgIHIrAZniYoAACcGsYEDshCABk9yYW5nZbImgANPUkGyJTIKsikyA7IqMgOyKzIDsiwksiIlsiOAFGh0dHBzOi8vb3Jhbmdlcy5tZW1lsicisgGztDxniYgAAiNDigAAJwZkIhJBAAOI/5wxACcFImaJigMAJwdkgQ8SQQASKiJnKyJngAhHb29kYnllLrCJMgYyBoEFGAmM/ycKZIv/E0EAuClkJwZkcABMSEEAaihkK2QNQQAFK2RCAAIoZIz+sYEEshAnBmSyESlkshSL/rISIrIBsycIJwhki/4IZygoZIv+CWcoZCISQQAsJwcnB2QjCGcnB2SBDhJBAAooJCcIZAlnQgARKCQnCGQJIQQKZysrZCEECmcpZDYyAGFBAB8pZCcFYoz9KWQnBYv9JwRkDUEACYv9JwRkCUIAASJmJwlkKmQWULAnCov/ZyknCWRnJwQqZGcqImeJJw5JNhoBSRWBIBJEiAACI0OKAwCL/zYyACcFY0xIRDIHJw1kD0QxAYGgnAEORCcORwKI/uEnCycLZDEBCGcnDCcMZCMIZ4v/JwViMQEIjP6L/ycFi/5mi/6M/Slki/8SQQAVi/0nBGQNQQAJi/4nBGQJQgABIoz9i/0qZA1BAAknCYv/ZyqL/WeJMRtB/dKABLhEezY2GgCOAf3FAIAEqyNwzDYaAI4B/1YAADEbQf5LAA=='
            ),
            clearStateProgram: base64ToBytes('CQ=='),
            creator: Address.fromString('ORANGESCU7XMR2TFXSFTOHCUHNP6OYEPIKZW3JZANTCDHVQYMGQFYFIDDA'),
            globalState: [],
            globalStateSchema: {
              numByteSlice: 2,
              numUint: 11,
            },
            localStateSchema: {
              numByteSlice: 0,
              numUint: 1,
            },
          },
        },
        {
          id: 1284326447n,
          params: {
            approvalProgram: base64ToBytes(
              'CSAFAAGAgKSPxPlaEAImDwpsYXN0X21pbmVyDmhhbHZpbmdfc3VwcGx5EWxhc3RfbWluZXJfZWZmb3J0BmVmZm9ydAV0b2tlbgdoYWx2aW5nDG1pbmVkX3N1cHBseQxtaW5lcl9yZXdhcmQUY3VycmVudF9taW5lcl9lZmZvcnQFYmxvY2sMdG90YWxfZWZmb3J0EnRvdGFsX3RyYW5zYWN0aW9ucw1jdXJyZW50X21pbmVyD3N0YXJ0X3RpbWVzdGFtcAAxGCINgQYLMRkIjQgDCgMrAAAAAAAAAAADHQMsAIgAAiNDigAAJwQiZycJImcnCiJnJwsiZycFImcpgYCA0ofivC1nJwYiZycHgYCAgDJnKDIDZyoiZycMMgNnJwgiZycNgYCByKwGZ4mKAAAnBLGBA7IQgAZPcmFuZ2WyJoADT1JBsiUyCrIpMgqyKjIDsisyA7IsJLIigQiyI4A6aXBmczovL1FtVWl0eEp1UEpKcmN1QWRBaVZkRUVwdXpHbXNFTEdnQXZoTGQ1RmlYUlNoRXUjYXJjM7IngCDT/VG+LujCsXp66CbTScDfIP6rik1oAwNAHHQVYMMkNrIoIrIBgKgBSm9obiBBbGFuIFdvb2RzIDAxL0RlYy8yMDIzIFlvdSBrbm93LCBJIGNhbiBwdWxsIG1ldHJpY3Mgb3V0IG9mIHRoZSBhaXIgdG9vLCB3aGF0ZXZlciwgOCBtaWxsaW9uIHRyYW5zYWN0aW9ucyBvdmVyIHRoZSBsYXN0IHdlZWssIEkgZG9uJ3Qga25vdywgbXkgbW9tIGhhcyBmb3VyIG9yYW5nZXMusgWztDxniYgAAiNDigAAJwRkIhJBAAOI/qQxACsiZomKAwAyBjIGgQUYCYz/Jwlki/8TQQC3KGQnBGRwAExIQQB0KWQnB2QNQQAGJwdkQgACKWSM/rGBBLIQJwRkshEoZLIUi/6yEiKyAbMoZCpkFlCwJwYnBmSL/ghnKSlki/4JZylkIhJBAC0nBScFZCMIZycFZCUPQQAKKSQnBmQJZ0IAEykkJwZkCSEECmcnBycHZCEECmcoZDYyAGFBABsoZCtijP0oZCuL/SpkDUEACIv9KmQJQgABImYnCYv/ZygnDGRnKicIZGcnCCJniScOSTYaAUkVgSASRIgAAiNDigMAi/82MgArY0xIRDIHJw1kD0QnBWQlDkQxAYGgnAEORCcORwKI/vgnCicKZDEBCGcnCycLZCMIZ4v/K2IxAQiM/ov/K4v+Zov+jP0oZIv/EkEAE4v9KmQNQQAIi/0qZAlCAAEijP2L/ScIZA1BAAonDIv/ZycIi/1niTEbQfzygAS4RHs2NhoAjgH85QCABKsjcMw2GgCOAf9TAAAxG0H+ZQA='
            ),
            clearStateProgram: base64ToBytes('CQ=='),
            creator: Address.fromString('ORANGESCU7XMR2TFXSFTOHCUHNP6OYEPIKZW3JZANTCDHVQYMGQFYFIDDA'),
            globalState: [],
            globalStateSchema: {
              numByteSlice: 2,
              numUint: 11,
            },
            localStateSchema: {
              numByteSlice: 0,
              numUint: 1,
            },
          },
        },
        {
          id: 1439234347n,
          params: {
            approvalProgram: base64ToBytes(
              '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'
            ),
            clearStateProgram: base64ToBytes('CQ=='),
            creator: Address.fromString('ORANGESCU7XMR2TFXSFTOHCUHNP6OYEPIKZW3JZANTCDHVQYMGQFYFIDDA'),
            extraProgramPages: 3,
            globalState: [],
            globalStateSchema: {
              numByteSlice: 32,
              numUint: 32,
            },
            localStateSchema: {
              numByteSlice: 0,
              numUint: 0,
            },
          },
        },
      ],
      createdAssets: [
        {
          index: 1336655079n,
          params: {
            creator: 'ORANGESCU7XMR2TFXSFTOHCUHNP6OYEPIKZW3JZANTCDHVQYMGQFYFIDDA',
            decimals: 0,
            defaultFrozen: false,
            metadataHash: encoder.encode('HbvUpgutrE/1EOdh9NYWQ92XiQrViveNl19QfX2y68Q='),
            name: 'Juicer Club Membership Card',
            nameB64: encoder.encode('SnVpY2VyIENsdWIgTWVtYmVyc2hpcCBDYXJk'),
            total: 1910n,
            unitName: 'JUICER',
            unitNameB64: encoder.encode('SlVJQ0VS'),
            url: 'ipfs://QmeatcmRtwiyV3gWRAFbFmy2HvwFKk6qpJ825JK1Vo8839#arc3',
            urlB64: encoder.encode('aXBmczovL1FtZWF0Y21SdHdpeVYzZ1dSQUZiRm15Mkh2d0ZLazZxcEo4MjVKSzFWbzg4MzkjYXJjMw=='),
          },
        },
      ],
      minBalance: 5281000n,
      pendingRewards: 0n,
      rewardBase: 218288n,
      rewards: 0n,
      round: 39088730n,
      status: AccountStatus.Offline,
      totalAppsOptedIn: 1,
      totalAssetsOptedIn: 6,
      totalCreatedApps: 4,
      totalCreatedAssets: 1,
    } satisfies AccountResult)
  },
  ['mainnet-DGOANM6JL4VNSBJW737T24V4WVQINFWELRE3OKHQQFZ2JFMVKUF52D4AY4']: () => {
    return new AccountResultBuilder({
      address: 'DGOANM6JL4VNSBJW737T24V4WVQINFWELRE3OKHQQFZ2JFMVKUF52D4AY4',
      amount: 98433606n,
      amountWithoutPendingRewards: 98433606n,
      appsLocalState: [
        {
          id: 811554792n,
          schema: {
            numByteSlice: 0,
            numUint: 0,
          },
        },
        {
          id: 811555774n,
          schema: {
            numByteSlice: 0,
            numUint: 0,
          },
        },
        {
          id: 811556459n,
          schema: {
            numByteSlice: 0,
            numUint: 0,
          },
        },
        {
          id: 811563899n,
          schema: {
            numByteSlice: 0,
            numUint: 0,
          },
        },
        {
          id: 811564745n,
          schema: {
            numByteSlice: 0,
            numUint: 0,
          },
        },
        {
          id: 811565811n,
          schema: {
            numByteSlice: 0,
            numUint: 0,
          },
        },
        {
          id: 812246978n,
          schema: {
            numByteSlice: 0,
            numUint: 0,
          },
        },
        {
          id: 829144306n,
          keyValue: [],
          schema: {
            numByteSlice: 0,
            numUint: 1,
          },
        },
      ],
      appsTotalSchema: {
        numByteSlice: 0,
        numUint: 1,
      },
      assets: [],
      authAddr: Address.fromString('K7F3GQNOXIMJFF2NJSBHZ7OPNWVLIJM3BN6CYAZJBY3MS6C7TN24JTYX5E'),
      createdApps: [],
      createdAssets: [],
      minBalance: 2228500n,
      pendingRewards: 0n,
      rewardBase: 218288n,
      rewards: 0n,
      round: 39090114n,
      status: AccountStatus.Offline,
      totalAppsOptedIn: 8,
      totalAssetsOptedIn: 0,
      totalCreatedApps: 0,
      totalCreatedAssets: 0,
    })
  },
  ['mainnet-X6MNR4AVJQEMJRHAPZ6F4O4SVDIYN67ZRMD2O3ULPY4QFMANQNZOEYHODE']: () => {
    return new AccountResultBuilder({
      address: 'X6MNR4AVJQEMJRHAPZ6F4O4SVDIYN67ZRMD2O3ULPY4QFMANQNZOEYHODE',
      amount: 273116395038n,
      amountWithoutPendingRewards: 273116395038n,
      appsTotalSchema: {
        numByteSlice: 0,
        numUint: 0,
      },
      authAddr: Address.fromString('NMR5PS2KYAEN73U4AK476QXEA3IPG2AUE6BSF73UA7EKHXZ76YX24HVRNQ'),
      minBalance: 98439400000n,
      pendingRewards: 0n,
      rewardBase: 218288n,
      rewards: 0n,
      round: 40262299n,
      status: AccountStatus.Offline,
      totalAppsOptedIn: 0,
      totalAssetsOptedIn: 984393,
      totalCreatedApps: 0,
      totalCreatedAssets: 984393,
    })
  },
  ['mainnet-DHMCHBN4W5MBO72C3L3ZP6GGJHQ4OR6SW2EP3VDEJ5VHT4MERQLCTVW6PU']: () => {
    return new AccountResultBuilder({
      address: 'DHMCHBN4W5MBO72C3L3ZP6GGJHQ4OR6SW2EP3VDEJ5VHT4MERQLCTVW6PU',
      amount: 1915706350n,
      amountWithoutPendingRewards: 1915706350n,
      appsLocalState: [],
      appsTotalSchema: {
        numByteSlice: 0,
        numUint: 0,
      },
      assets: [],
      createdApps: [],
      createdAssets: [],
      minBalance: 100000n,
      pendingRewards: 0n,
      rewardBase: 218288n,
      rewards: 19424n,
      round: 43483662n,
      status: AccountStatus.Offline,
      totalAppsOptedIn: 0,
      totalAssetsOptedIn: 0,
      totalCreatedApps: 0,
      totalCreatedAssets: 0,
    } satisfies AccountResult)
  },
}
