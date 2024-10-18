import { AccountResult } from '@/features/accounts/data/types'
import { AccountResultBuilder } from '../builders/account-result-builder'
import { AccountStatus } from '@algorandfoundation/algokit-utils/types/indexer'

const encoder = new TextEncoder()

export const accountResultMother = {
  ['mainnet-BIQXAK67KSCKN3EJXT4S3RVXUBFOLZ45IQOBTSOQWOSR4LLULBTD54S5IA']: () => {
    return new AccountResultBuilder({
      address: 'BIQXAK67KSCKN3EJXT4S3RVXUBFOLZ45IQOBTSOQWOSR4LLULBTD54S5IA',
      amount: 5883741,
      'amount-without-pending-rewards': 5883741,
      'apps-local-state': [
        {
          id: 1209868169,
          schema: { 'num-byte-slice': 1, 'num-uint': 0 },
        },
        {
          id: 1210178396,
          schema: { 'num-byte-slice': 1, 'num-uint': 0 },
        },
      ],
      'apps-total-schema': { 'num-byte-slice': 2, 'num-uint': 0 },
      assets: [
        { amount: 2002560000, 'asset-id': 924268058, 'is-frozen': false },
        { amount: 0, 'asset-id': 1010208883, 'is-frozen': false },
        { amount: 0, 'asset-id': 1096015467, 'is-frozen': false },
      ],
      'created-apps': [],
      'created-assets': [],
      'min-balance': 700000,
      'pending-rewards': 0,
      'reward-base': 218288,
      rewards: 0,
      round: 38880589,
      status: AccountStatus.Offline,
      'total-apps-opted-in': 2,
      'total-assets-opted-in': 3,
      'total-created-apps': 0,
      'total-created-assets': 0,
    } satisfies AccountResult)
  },
  ['mainnet-ORANGESCU7XMR2TFXSFTOHCUHNP6OYEPIKZW3JZANTCDHVQYMGQFYFIDDA']: () => {
    return new AccountResultBuilder({
      address: 'ORANGESCU7XMR2TFXSFTOHCUHNP6OYEPIKZW3JZANTCDHVQYMGQFYFIDDA',
      amount: 123714752,
      'amount-without-pending-rewards': 123714752,
      'apps-local-state': [
        {
          id: 1284326447,
          'key-value': [],
          schema: {
            'num-byte-slice': 0,
            'num-uint': 1,
          },
        },
      ],
      'apps-total-extra-pages': 3,
      'apps-total-schema': {
        'num-byte-slice': 38,
        'num-uint': 66,
      },
      assets: [
        { amount: 1, 'asset-id': 1162292622, 'is-frozen': true },
        { amount: 0, 'asset-id': 1284444444, 'is-frozen': false },
        { amount: 1228320, 'asset-id': 1294765516, 'is-frozen': false },
        { amount: 3, 'asset-id': 1336655079, 'is-frozen': false },
        { amount: 1, 'asset-id': 1355858325, 'is-frozen': true },
        { amount: 1, 'asset-id': 1355898842, 'is-frozen': true },
      ],
      'created-apps': [
        {
          id: 1276197345,
          params: {
            'approval-program':
              'CSAFAAGAgNGUtXQGAiYODmhhbHZpbmdfc3VwcGx5BmVmZm9ydApsYXN0X21pbmVyFGN1cnJlbnRfbWluZXJfZWZmb3J0DG1pbmVyX3Jld2FyZAV0b2tlbgdoYWx2aW5nDG1pbmVkX3N1cHBseRFsYXN0X21pbmVyX2VmZm9ydA1jdXJyZW50X21pbmVyBWJsb2NrDHRvdGFsX2VmZm9ydBJ0b3RhbF90cmFuc2FjdGlvbnMPc3RhcnRfdGltZXN0YW1wMRgiDSULMRkIjQgCBgInAAAAAAAAAAACGQIoAIgAAiNDigAAJwUiZycKImcnCyJnJwwiZycGImcogYDAqMqaOmcnByJnJwSBgICAAmcqMgNnJwgiZycJMgNnKyJnJw2BgIHIrAZniYoAACcFsYEDshCABk9yYW5nZbImgANPUkGyJTIKsikyA7IqMgOyKzIDsiwksiIlsiOAFGh0dHBzOi8vb3Jhbmdlcy5tZW1lsicisgGztDxniYgAAiNDigAAJwVkIhJBAAOI/5wxACkiZomKAwAnBmSBDxJBABMrImcnBCJngAhHb29kYnllLrCJMgYyBoEFGAmM/ycKZIv/E0EAuipkJwVkcABMSEEAbihkJwRkDUEABicEZEIAAihkjP6xgQSyECcFZLIRKmSyFIv+shIisgGzJwcnB2SL/ghnKChki/4JZyhkIhJBAC4nBicGZCMIZycGZIEOEkEACigkJwdkCWdCABMoJCcHZAkhBApnJwQnBGQhBApnKmQ2MgBhQQAdKmQpYoz9KmQpi/0nCGQNQQAJi/0nCGQJQgABImYnCWQrZBZQsCcKi/9nKicJZGcnCCtkZysiZ4k2GgFJFYEgEkSIAAIjQ4oBAIv/NjIAKWNMSEQyBycNZA9EMQGBoJwBDkSAAEcCiP7iJwsnC2QxAQhnJwwnDGQjCGeL/ymL/yliMQEIZov/KWIrZA1BAAsnCYv/ZyuL/yliZ4kxG0H99oAEuER7NjYaAI4B/ekAgASrI3DMNhoAjgH/fQAAMRtB/nAA',
            'clear-state-program': 'CQ==',
            creator: 'ORANGESCU7XMR2TFXSFTOHCUHNP6OYEPIKZW3JZANTCDHVQYMGQFYFIDDA',
            'global-state': [],
            'global-state-schema': {
              'num-byte-slice': 2,
              'num-uint': 11,
            },
            'local-state-schema': {
              'num-byte-slice': 0,
              'num-uint': 1,
            },
          },
        },
        {
          id: 1276914366,
          params: {
            'approval-program':
              'CSAFAAGAgNGUtXQGAiYPDmhhbHZpbmdfc3VwcGx5Cmxhc3RfbWluZXIUY3VycmVudF9taW5lcl9lZmZvcnQMbWluZXJfcmV3YXJkEWxhc3RfbWluZXJfZWZmb3J0BmVmZm9ydAV0b2tlbgdoYWx2aW5nDG1pbmVkX3N1cHBseQ1jdXJyZW50X21pbmVyBWJsb2NrDHRvdGFsX2VmZm9ydBJ0b3RhbF90cmFuc2FjdGlvbnMPc3RhcnRfdGltZXN0YW1wADEYIg0lCzEZCI0IAioCSwAAAAAAAAAAAj0CTACIAAIjQ4oAACcGImcnCiJnJwsiZycMImcnByJnKIGAwKjKmjpnJwgiZyuBgICAAmcpMgNnJwQiZycJMgNnKiJnJw2BgIHIrAZniYoAACcGsYEDshCABk9yYW5nZbImgANPUkGyJTIKsikyA7IqMgOyKzIDsiwksiIlsiOAFGh0dHBzOi8vb3Jhbmdlcy5tZW1lsicisgGztDxniYgAAiNDigAAJwZkIhJBAAOI/5wxACcFImaJigMAJwdkgQ8SQQASKiJnKyJngAhHb29kYnllLrCJMgYyBoEFGAmM/ycKZIv/E0EAuClkJwZkcABMSEEAaihkK2QNQQAFK2RCAAIoZIz+sYEEshAnBmSyESlkshSL/rISIrIBsycIJwhki/4IZygoZIv+CWcoZCISQQAsJwcnB2QjCGcnB2SBDhJBAAooJCcIZAlnQgARKCQnCGQJIQQKZysrZCEECmcpZDYyAGFBAB8pZCcFYoz9KWQnBYv9JwRkDUEACYv9JwRkCUIAASJmJwlkKmQWULAnCov/ZyknCWRnJwQqZGcqImeJJw5JNhoBSRWBIBJEiAACI0OKAwCL/zYyACcFY0xIRDIHJw1kD0QxAYGgnAEORCcORwKI/uEnCycLZDEBCGcnDCcMZCMIZ4v/JwViMQEIjP6L/ycFi/5mi/6M/Slki/8SQQAVi/0nBGQNQQAJi/4nBGQJQgABIoz9i/0qZA1BAAknCYv/ZyqL/WeJMRtB/dKABLhEezY2GgCOAf3FAIAEqyNwzDYaAI4B/1YAADEbQf5LAA==',
            'clear-state-program': 'CQ==',
            creator: 'ORANGESCU7XMR2TFXSFTOHCUHNP6OYEPIKZW3JZANTCDHVQYMGQFYFIDDA',
            'global-state': [],
            'global-state-schema': {
              'num-byte-slice': 2,
              'num-uint': 11,
            },
            'local-state-schema': {
              'num-byte-slice': 0,
              'num-uint': 1,
            },
          },
        },
        {
          id: 1284326447,
          params: {
            'approval-program':
              'CSAFAAGAgKSPxPlaEAImDwpsYXN0X21pbmVyDmhhbHZpbmdfc3VwcGx5EWxhc3RfbWluZXJfZWZmb3J0BmVmZm9ydAV0b2tlbgdoYWx2aW5nDG1pbmVkX3N1cHBseQxtaW5lcl9yZXdhcmQUY3VycmVudF9taW5lcl9lZmZvcnQFYmxvY2sMdG90YWxfZWZmb3J0EnRvdGFsX3RyYW5zYWN0aW9ucw1jdXJyZW50X21pbmVyD3N0YXJ0X3RpbWVzdGFtcAAxGCINgQYLMRkIjQgDCgMrAAAAAAAAAAADHQMsAIgAAiNDigAAJwQiZycJImcnCiJnJwsiZycFImcpgYCA0ofivC1nJwYiZycHgYCAgDJnKDIDZyoiZycMMgNnJwgiZycNgYCByKwGZ4mKAAAnBLGBA7IQgAZPcmFuZ2WyJoADT1JBsiUyCrIpMgqyKjIDsisyA7IsJLIigQiyI4A6aXBmczovL1FtVWl0eEp1UEpKcmN1QWRBaVZkRUVwdXpHbXNFTEdnQXZoTGQ1RmlYUlNoRXUjYXJjM7IngCDT/VG+LujCsXp66CbTScDfIP6rik1oAwNAHHQVYMMkNrIoIrIBgKgBSm9obiBBbGFuIFdvb2RzIDAxL0RlYy8yMDIzIFlvdSBrbm93LCBJIGNhbiBwdWxsIG1ldHJpY3Mgb3V0IG9mIHRoZSBhaXIgdG9vLCB3aGF0ZXZlciwgOCBtaWxsaW9uIHRyYW5zYWN0aW9ucyBvdmVyIHRoZSBsYXN0IHdlZWssIEkgZG9uJ3Qga25vdywgbXkgbW9tIGhhcyBmb3VyIG9yYW5nZXMusgWztDxniYgAAiNDigAAJwRkIhJBAAOI/qQxACsiZomKAwAyBjIGgQUYCYz/Jwlki/8TQQC3KGQnBGRwAExIQQB0KWQnB2QNQQAGJwdkQgACKWSM/rGBBLIQJwRkshEoZLIUi/6yEiKyAbMoZCpkFlCwJwYnBmSL/ghnKSlki/4JZylkIhJBAC0nBScFZCMIZycFZCUPQQAKKSQnBmQJZ0IAEykkJwZkCSEECmcnBycHZCEECmcoZDYyAGFBABsoZCtijP0oZCuL/SpkDUEACIv9KmQJQgABImYnCYv/ZygnDGRnKicIZGcnCCJniScOSTYaAUkVgSASRIgAAiNDigMAi/82MgArY0xIRDIHJw1kD0QnBWQlDkQxAYGgnAEORCcORwKI/vgnCicKZDEBCGcnCycLZCMIZ4v/K2IxAQiM/ov/K4v+Zov+jP0oZIv/EkEAE4v9KmQNQQAIi/0qZAlCAAEijP2L/ScIZA1BAAonDIv/ZycIi/1niTEbQfzygAS4RHs2NhoAjgH85QCABKsjcMw2GgCOAf9TAAAxG0H+ZQA=',
            'clear-state-program': 'CQ==',
            creator: 'ORANGESCU7XMR2TFXSFTOHCUHNP6OYEPIKZW3JZANTCDHVQYMGQFYFIDDA',
            'global-state': [],
            'global-state-schema': {
              'num-byte-slice': 2,
              'num-uint': 11,
            },
            'local-state-schema': {
              'num-byte-slice': 0,
              'num-uint': 1,
            },
          },
        },
        {
          id: 1439234347,
          params: {
            'approval-program':
              'CiASAAEQCECQTgaAAQSgnAEgkAEFoAEwOAqAAiYaAXAQAAAAAAAAAAEAAAAAAAAAABFtaW5pbmdBcHBsaWNhdGlvbg50b3RhbERlcG9zaXRlZAALcG9vbEFkZHJlc3MLcGVuZGluZ0Nvc3QLbWluaW5nVG9rZW4JcG9vbFRva2VuEP////////////////////8PcG9vbEFwcGxpY2F0aW9uCmJhc2VUeG5GZWUKdG90YWxTcGVudA1zcGVudFBlclRva2VuDnJld2FyZFBlclRva2VuCP//////////B21hbmFnZXIKbWluRGVwb3NpdA1tYXJrZXRSYXRlQnBzDnRvdGFsV2l0aGRyYXduCWxhc3RTcGVudAtsYXN0UmV3YXJkcw5sYXN0UHJpY2VSb3VuZBAAAAAAAAAAAAAAAAAAAAAABKsjcMwQAAAAAAAAAAAAAAAAAAAAZDEYFCEGCzEZCI0MCQwAAAAAAAAJOwAACPkAAAAAAAAAAAAAAIgAAiNDigAAJxAxAGcqga+IteQEZycHgZyivOQEZycFgCCcREx2mTTBM0y9VunNIYOfPfHwh6/l1mEhYtmARwl2SmcnCoGdpobeA2cnCIHMm7LpBGcnEYGgjQZnJwshCWcnEoGEUmcrImcnDCJnJxMiZycUImcnFSJnJw0nF2cnDicXZycWImcnBiJniYgAAiNDigAAMQAnEGQSRIk2GgMXNhoCFzYaAReIAAIjQ4oDADEAJxBkEkSL/jIAD0SL/iEJDkSL/4HAhD0ORIv/gdCGAw9Ei/0hCQ5EKL1MSBRBAAUoIQ25SDIKJwdkcABMSBRBADqxIQiyECcHZLIRMgqyFCKyEiKyAbOxIQayECpkshgjshkisgGzsSEIshAnCGSyETIKshQishIisgGzJxGL/2cnC4v+ZycSi/1niYoAACcERwUrZCINQQBzKYwAJwxkJxRkCRaMATIKJwhkcABIJxNkCIwCiwInFWQJFowDiwEpoytkFqKMBIsDKaMrZBaijAUnDUlkiwSgSZMhBw5EJwmsSRVJJAlMUmcnDklkiwWgSZMhBw5EJwmsSRVJJAlMUmcnFCcMZGcnFYsCZ4mKAgEnBEcFi/+9TEgUQQAPi/+BSLlIi/6BxNgCCYz+i/+MACmMAStJZIv/IiW6FwlnJw1ki/8kJLqhjAKL/yIluhcWiwKjKaJJkyEEDkQnD6xJFUklCUxSF4wDJw5ki/8hCiS6oYwEi/8iJboXFosEoymiSZMhBA5EJw+sSRVJJQlMUheMBSKL/yIluheL/giLAwkWiwBOArshBIv/IQQluheLBQgWiwBOArslMgcWiwBOArskJw1kiwBOArshCicOZIsATgK7IQ6L/yEOJboXiwMIFosATgK7K0lki/8iJboXCGeLA4wARgWJiAACI0OKAAAnBDEWIg1EMRYjCYwAiwA4ECMSRIsAOAcyChJEiP5siwA4CDEAiP7lMQC+RLCJigMAJwRJi/+MAIv/IQQluheL/QshBQqMAYsBIg1BAEKxIQiyECcIZLIRi/6yFIsBshIisgGzJxNJZIsBCGchD4v/IQ8luheLAQgWiwBOArshBIv/IQQluheLAQkWiwBOAruJigMAJwRJi/+MAIv/IiW6F4v9CyEFCowBiwEjDUEAErEjshCL/rIHiwEjCbIIIrIBsytJZIsBCWcii/8iJboXiwEJFosATgK7iTYaAhc2GgEXiAACI0OKAgCL/yEFDkSL/iEFDkSI/ZIiMQCI/g6L/zEAMQCI/yaL/jEAMQCI/4AxAL5EsIk2GgFJFSEKEkSIAAIjQ4oBACcERwQxFiINRDEWIwmMAIsAOBAjEkSLADgHMgoSRIj9Qov/jAGL/yIluheMAosAOAiL/4j9r4wDiwMnEWQIiwINRIsDiwINQQAWiwIhBQuLAwqMBCEFiwQJMQCL/4j+piEFMQCL/4j/AIv/vkSwiYoAAScERwYyBicWZAmMACmMAScKZCcFZIAQYXNzZXRfMV9yZXNlcnZlc0xOAmNEjAInCmQnBWSAEGFzc2V0XzJfcmVzZXJ2ZXNMTgJjRIwDiwMWKaOLAhaijASLACINQQFSiwAhEA1BAKUogKABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAL+LBCgiJLqkQQAdKIsESZMhBw5EJwmsSRVJJAlMUigiIQu6UL9CAH6LBCghCyS6p0EAHShJJCELuosESZMhBw5EJwmsSRVJJAlMUlC/QgBWI4wFiwUhEAxBAEuLBIsFJAskKE4CuqZBADMkiwULjAYoSb5EJIsGJAlYiwRJkyEHDkQnCaxJFUkkCUxSUCi+RIsGIQ2LBglYUL9CAAmLBSMIjAVC/60nFjIGZ4sEjABGBomKAgCxIQiyECcHZLIRi/+yEicFZLIUIrIBtiOyEIv+sggnBWSyByKyAbYhBrIQJwpkshiADWFkZF9saXF1aWRpdHmyGoAIZmxleGlibGWyGoAIAAAAAAAAAACyGicIZLIwJwVkshwisgGzJwxJZIv+CCcGZAhnJwYiZ4mIAAIjQ4oAACcERxMrZCINRDIGMgYhDBgJjACLACpkgAVibG9ja2VEE4wBKmSADWN1cnJlbnRfbWluZXJlRIwCiwFJQAAGMgqLAhMRRDIAjAOBA4wEiwFBAA2LAzIACIwDiwQjCIwEsSEGshAnGLIaKmSyGIsDsgEyCrIasycGSWSLAwhniP09jAUoIQQkuowGiwWLBqRBAAWLBUIAAosGjAcpjAgqZIAMbWluZXJfcmV3YXJkZUSMCScSZBaLCRajiwejgBAAAAAAAAAAAAAAAAAAACcQKaOiSZMhBA5EJw+sSRVJJQlMUheMCipkgApsYXN0X21pbmVyZUSMCypkgBFsYXN0X21pbmVyX2VmZm9ydGVEjAwqZIAGZWZmb3J0MgpOAmNEjA2LCzIKEkEAB4sNiwwJjA2BAjIAC4wOMgonB2RwAEiMD4AQAAAAAAAAAAAAAAAAAAAAX4sGoycZoowQgBAAAAAAAAAAAAAAAAAAAABpiwajJxmijBGLDyINSUEABosQiwWkEElBAAaLEYsFpRCMEosSQQARiw4hDDIACwiMDosEIQwIjASLCosNiw4IDUEAB4sKiw0JjA6LDiINSUEABosEIREMEEEAZ4sEIwiMBIsOJwtkDUEABicLZEIAAosOjBOLBCERE0lBAAaLE4sOExBJQQAJiw4yAIsTCAwQQQAHixMyAAmME4sOixMJjA4nBklkixMIZ7EhBrIQJxiyGipkshiLE7IBMgqyGrNC/4ixI7IQMQCyBzIAsggisgGzJwZJZDIACGeLEkEAHosPFosFoymiSZMhBA5EJw+sSRVJJQlMUheLD4j9E4kxG0H3A4AEuER7NjYaAI4B9vYAgATI07R7gASS4DscgATjrrJcgAQ8aaf3gAR4Srd6NhoAjgX3Zflz+lX6kv1NAAAxG0H3ToAERvdlMzYaAI4B90EA',
            'clear-state-program': 'Cg==',
            creator: 'ORANGESCU7XMR2TFXSFTOHCUHNP6OYEPIKZW3JZANTCDHVQYMGQFYFIDDA',
            'extra-program-pages': 3,
            'global-state': [],
            'global-state-schema': {
              'num-byte-slice': 32,
              'num-uint': 32,
            },
            'local-state-schema': {
              'num-byte-slice': 0,
              'num-uint': 0,
            },
          },
        },
      ],
      'created-assets': [
        {
          index: 1336655079,
          params: {
            creator: 'ORANGESCU7XMR2TFXSFTOHCUHNP6OYEPIKZW3JZANTCDHVQYMGQFYFIDDA',
            decimals: 0,
            'default-frozen': false,
            'metadata-hash': encoder.encode('HbvUpgutrE/1EOdh9NYWQ92XiQrViveNl19QfX2y68Q='),
            name: 'Juicer Club Membership Card',
            'name-b64': encoder.encode('SnVpY2VyIENsdWIgTWVtYmVyc2hpcCBDYXJk'),
            total: 1910,
            'unit-name': 'JUICER',
            'unit-name-b64': encoder.encode('SlVJQ0VS'),
            url: 'ipfs://QmeatcmRtwiyV3gWRAFbFmy2HvwFKk6qpJ825JK1Vo8839#arc3',
            'url-b64': encoder.encode('aXBmczovL1FtZWF0Y21SdHdpeVYzZ1dSQUZiRm15Mkh2d0ZLazZxcEo4MjVKSzFWbzg4MzkjYXJjMw=='),
          },
        },
      ],
      'min-balance': 5281000,
      'pending-rewards': 0,
      'reward-base': 218288,
      rewards: 0,
      round: 39088730,
      status: AccountStatus.Offline,
      'total-apps-opted-in': 1,
      'total-assets-opted-in': 6,
      'total-created-apps': 4,
      'total-created-assets': 1,
    } satisfies AccountResult)
  },
  ['mainnet-DGOANM6JL4VNSBJW737T24V4WVQINFWELRE3OKHQQFZ2JFMVKUF52D4AY4']: () => {
    return new AccountResultBuilder({
      address: 'DGOANM6JL4VNSBJW737T24V4WVQINFWELRE3OKHQQFZ2JFMVKUF52D4AY4',
      amount: 98433606,
      'amount-without-pending-rewards': 98433606,
      'apps-local-state': [
        {
          id: 811554792,
          schema: {
            'num-byte-slice': 0,
            'num-uint': 0,
          },
        },
        {
          id: 811555774,
          schema: {
            'num-byte-slice': 0,
            'num-uint': 0,
          },
        },
        {
          id: 811556459,
          schema: {
            'num-byte-slice': 0,
            'num-uint': 0,
          },
        },
        {
          id: 811563899,
          schema: {
            'num-byte-slice': 0,
            'num-uint': 0,
          },
        },
        {
          id: 811564745,
          schema: {
            'num-byte-slice': 0,
            'num-uint': 0,
          },
        },
        {
          id: 811565811,
          schema: {
            'num-byte-slice': 0,
            'num-uint': 0,
          },
        },
        {
          id: 812246978,
          schema: {
            'num-byte-slice': 0,
            'num-uint': 0,
          },
        },
        {
          id: 829144306,
          'key-value': [],
          schema: {
            'num-byte-slice': 0,
            'num-uint': 1,
          },
        },
      ],
      'apps-total-schema': {
        'num-byte-slice': 0,
        'num-uint': 1,
      },
      assets: [],
      'auth-addr': 'K7F3GQNOXIMJFF2NJSBHZ7OPNWVLIJM3BN6CYAZJBY3MS6C7TN24JTYX5E',
      'created-apps': [],
      'created-assets': [],
      'min-balance': 2228500,
      'pending-rewards': 0,
      'reward-base': 218288,
      rewards: 0,
      round: 39090114,
      status: AccountStatus.Offline,
      'total-apps-opted-in': 8,
      'total-assets-opted-in': 0,
      'total-created-apps': 0,
      'total-created-assets': 0,
    })
  },
  ['mainnet-X6MNR4AVJQEMJRHAPZ6F4O4SVDIYN67ZRMD2O3ULPY4QFMANQNZOEYHODE']: () => {
    return new AccountResultBuilder({
      address: 'X6MNR4AVJQEMJRHAPZ6F4O4SVDIYN67ZRMD2O3ULPY4QFMANQNZOEYHODE',
      amount: 273116395038,
      'amount-without-pending-rewards': 273116395038,
      'apps-total-schema': {
        'num-byte-slice': 0,
        'num-uint': 0,
      },
      'auth-addr': 'NMR5PS2KYAEN73U4AK476QXEA3IPG2AUE6BSF73UA7EKHXZ76YX24HVRNQ',
      'min-balance': 98439400000,
      'pending-rewards': 0,
      'reward-base': 218288,
      rewards: 0,
      round: 40262299,
      status: AccountStatus.Offline,
      'total-apps-opted-in': 0,
      'total-assets-opted-in': 984393,
      'total-created-apps': 0,
      'total-created-assets': 984393,
    })
  },
  ['mainnet-DHMCHBN4W5MBO72C3L3ZP6GGJHQ4OR6SW2EP3VDEJ5VHT4MERQLCTVW6PU']: () => {
    return new AccountResultBuilder({
      address: 'DHMCHBN4W5MBO72C3L3ZP6GGJHQ4OR6SW2EP3VDEJ5VHT4MERQLCTVW6PU',
      amount: 1915706350,
      'amount-without-pending-rewards': 1915706350,
      'apps-local-state': [],
      'apps-total-schema': {
        'num-byte-slice': 0,
        'num-uint': 0,
      },
      assets: [],
      'created-apps': [],
      'created-assets': [],
      'min-balance': 100000,
      'pending-rewards': 0,
      'reward-base': 218288,
      rewards: 19424,
      round: 43483662,
      status: AccountStatus.Offline,
      'total-apps-opted-in': 0,
      'total-assets-opted-in': 0,
      'total-created-apps': 0,
      'total-created-assets': 0,
    } satisfies AccountResult)
  },
}
