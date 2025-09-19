import { ApplicationResultBuilder, applicationResultBuilder } from '../builders/application-result-builder'
import algosdk, { base64ToBytes, modelsv2 } from 'algosdk'

export const applicationResultMother = {
  basic: () => {
    return applicationResultBuilder()
  },
  'mainnet-80441968': () => {
    return new ApplicationResultBuilder({
      id: 80441968n,
      params: {
        approvalProgram: base64ToBytes(
          'AiAIAAUEAgEKkE5kJhMDYmlkBWRyYWluB0NyZWF0b3IGRXNjcm93Bldpbm5lcgNQb3QEQmlkcwpSb3VuZEJlZ2luCFJvdW5kRW5kBVByaWNlCk11bHRpcGxpZXIFVGltZXIKVGltZXJGaXJzdAtUaW1lclNlY29uZAlGZWVzRmlyc3QKRmVlc1NlY29uZAhEaXZpZGVuZANCaWQERmVlczEYIhJAAC4xGSMSQACTMRkkEkAApDEZJRJAALoxGSEEEkAAtyg2GgASQADQKTYaABJAAbIAMRshBRJAAAEAKjEAZys2GgBnJwQxAGcnBSJnJwYiZycHMgdnJwgyBzYaARcIZycJNhoCF2cnCjYaAxdnJws2GgQXZycMNhoFF2cnDTYaBhdnJw42GgcXZycPNhoIF2cnEDYaCRdnIQRDQgGBMQAqZBJAAAEAJwVkIhJAAAEAIQRDQgFpMQAqZBJAAAEAMRshBBJAAAEAKzYaAGchBENCAUwiQ0IBRzIHJwdkDzIHJwhkDhBAAAEAIicRImYiJxIiZiEEQ0IBJjIEJRIzAQgnCWQSMwEIJwlkJw5kCBIRMwEIJwlkJw9kCBIREDMAACpkEhAzAQcrZBIQMwEQIQQSEEAAAQAnBScFZCcJZAgnBWQnCWQIJxBkCyEGCglnJwQzAQBnJwknCWQnCWQnCmQLIQcKCGchBCcRIQQnEWInCWQIZjMBCCcJZBJBAAonCCcIZCcLZAhnMwEIJwlkJw5kCBJBABghBCcSIQQnEmInDmQIZicIJwhkJwxkCGczAQgnCWQnD2QIEkEAGCEEJxIhBCcSYicPZAhmJwgnCGQnDWQIZycGJwZkIQQIZyEEQ0IAPDIEJRJAAAEAMwAAKmQSQAABADMBACtkEkAAAQAzAQgiEkAAAQAzAQcyAxJAAAEAMwEJKmQSQAABACEEQw=='
        ),
        clearStateProgram: base64ToBytes('AiABASJD'),
        creator: algosdk.Address.fromString('24YD4UNKUGVNGZ6QGXWIUPQ5L456FBH7LB5L6KFGQJ65YLQHXX4CQNPCZA'),
        globalState: [
          toTealKeyValue({ key: 'Qmlkcw==', value: { bytes: '', type: 2, uint: 0 } }),
          toTealKeyValue({ key: 'VGltZXI=', value: { bytes: '', type: 2, uint: 20 } }),
          toTealKeyValue({ key: 'RGl2aWRlbmQ=', value: { bytes: '', type: 2, uint: 5 } }),
          toTealKeyValue({ key: 'RmVlc0ZpcnN0', value: { bytes: '', type: 2, uint: 250000 } }),
          toTealKeyValue({ key: 'TXVsdGlwbGllcg==', value: { bytes: '', type: 2, uint: 5 } }),
          toTealKeyValue({ key: 'RXNjcm93', value: { bytes: '1zA+UaqhqtNn0DXsij4dXzvihP9Yer8opoJ93C4Hvfg=', type: 1, uint: 0 } }),
          toTealKeyValue({ key: 'UG90', value: { bytes: '', type: 2, uint: 0 } }),
          toTealKeyValue({ key: 'RmVlc1NlY29uZA==', value: { bytes: '', type: 2, uint: 500000 } }),
          toTealKeyValue({ key: 'Q3JlYXRvcg==', value: { bytes: '1zA+UaqhqtNn0DXsij4dXzvihP9Yer8opoJ93C4Hvfg=', type: 1, uint: 0 } }),
          toTealKeyValue({ key: 'VGltZXJGaXJzdA==', value: { bytes: '', type: 2, uint: 10 } }),
          toTealKeyValue({ key: 'Um91bmRCZWdpbg==', value: { bytes: '', type: 2, uint: 1606905675 } }),
          toTealKeyValue({ key: 'V2lubmVy', value: { bytes: '1zA+UaqhqtNn0DXsij4dXzvihP9Yer8opoJ93C4Hvfg=', type: 1, uint: 0 } }),
          toTealKeyValue({ key: 'VGltZXJTZWNvbmQ=', value: { bytes: '', type: 2, uint: 5 } }),
          toTealKeyValue({ key: 'UHJpY2U=', value: { bytes: '', type: 2, uint: 1000000 } }),
          toTealKeyValue({ key: 'Um91bmRFbmQ=', value: { bytes: '', type: 2, uint: 1607905675 } }),
        ],
        globalStateSchema: { numByteSlice: 3, numUint: 12 },
        localStateSchema: { numByteSlice: 0, numUint: 2 },
      },
    })
  },
  'mainnet-1196727051': () => {
    return new ApplicationResultBuilder({
      id: 1196727051n,
      params: {
        approvalProgram: base64ToBytes(
          'CSAEAAEGAiYJDG5mdGlja2V0X2FwcAABAA9tYW5hZ2VyX2FkZHJlc3MBAQQuU0kZBGg0o6oSbWV0aG9kX3Blcm1pc3Npb25zB2FpcmxpbmUxGyISQAEtNhoAgAThNZDwEkABETYaAIAEnNbuoRJAAPU2GgCABF5iYz4SQADZNhoAgAS2olF1EkAAvTYaAIAE+Qj2KRJAAKE2GgCABB0UDY4SQACFNhoAgATG43mkEkAAaTYaACcFEkAAUTYaAIAEnvUJRhJAADU2GgCABE+i3akSQAAZNhoAJwYSQAABADEZIhIxGCITEESIBBYjQzEZIhIxGCITEESIA+wjQzEZIhIxGCITEESIA7IjQzEZIhIxGCITEESIA34jQzEZIhIxGCITEESIA0wjQzEZIhIxGCITEESIAxAjQzEZIhIxGCISEESIAuAjQzEZIhIxGCITEESIArcjQzEZIhIxGCITEESIApcjQzEZIhIxGCITEESIAncjQzEZIhIxGCITEESIAlcjQzEZIxJAADYxGSUSQAAlMRmBBBJAABMxGYEFEkAAAQAxGCITRIgAViNDMRgiE0SIAEEjQzEYIhNEiABSI0MxGCITRIgAQyNDigIBi/4yCGFAAAQiQgAbi/4iJwdjNQE1ADQBQAAHIov/U0IABTQAQv/1iYoAADEAMgkSRCNDigAAMQAyCRJEI0OKAAAjQ4oAACNDigEAMQAyCRJEK4v/wBxniYoBADEAK2QSRLEkshAjshmL/8AyshgisgGziYoBADEAK2QSRLEkshAlshmL/8AyshgisgGziYoCADEAK2QSRIv+wBwnB4v/ZomKAgGL/icIZBJAAAqL/ov/iP9JQgABI4mKAwAoi/7AMmcri/1nJwiL/2cjQ4oFADEAIoj/y0SxJLIQKGSyGIAEWOGHaLIai/uyGov8shqL/bIai/6yGov/shoisgGziYoDADEAJIj/mESxJLIQKGSyGIv/wByyHIv+wDCyMIAErnlpMLIai/2yGiqyGicEshoisgGziYoDADEAgQOI/2FEsSSyEChkshiL/sAcshyL/8AcshyL/cAwsjAnBbIaKrIaJwSyGoABArIaIrIBs4mKBAAxAIEFiP8nRLEkshAoZLIYi/zAMLIwgAQ7tliRshoqshqL/bIai/4WVwQAshqL/7IaIrIBs4mKAgAxAIEEiP7uRLEkshAoZLIYi/7AMLIwgARMfzwNshoqshoqIov/VrIaIrIBs4mKAwAxACWI/r9EsSSyEChkshiL/8AcshyL/sAwsjAnBrIai/2yGiqyGicEshoisgGziYoAACI2GgEiVYwAiwCI/i2JigAAIjYaASJVjACLAIj+LImKAAAiNhoBIlWMAIsAiP42iYoAACJJNhoBIlWMADYaAheMAYsAiwGI/jeJigAAKSIpNhoBjAA2GgIiVYwBNhoDjAKLAIsBiwKI/kGJigAAKUcENhoBjAA2GgKMATYaA4wCNhoEjAM2GgWMBIsAiwGLAosDiwSI/iiJigAAKSJJNhoBjAA2GgIiVYwBNhoDIlWMAosAiwGLAoj+OImKAAAiRwI2GgEiVYwANhoCIlWMATYaAyJVjAKLAIsBiwKI/kmJigAAIikiKTYaASJVjAA2GgKMATYaAyJajAI2GgSMA4sAiwGLAosDiP5YiYoAACJJNhoBIlWMADYaAiJVjAGLAIsBiP52iYoAACkiSTYaAYwANhoCIlWMATYaAyJVjAKLAIsBiwKI/oOJ'
        ),
        clearStateProgram: base64ToBytes('CYEAQw=='),
        creator: algosdk.Address.fromString('52MVNW6FNW7L6W7IAKSROD5FYZGZNLVKT6WUWNUFEE3DT737RYIIL2YQ3Y'),
        globalState: [
          toTealKeyValue({
            key: 'bWFuYWdlcl9hZGRyZXNz',
            value: {
              bytes: '0QGHvZ1GkfgBxdPm8vbFxBpukSHn/8UGJmPuEFl9eDk=',
              type: 1,
              uint: 0,
            },
          }),
          toTealKeyValue({
            key: 'YWlybGluZQ==',
            value: {
              bytes: 'SiiuYA7RqfpffknPvqrI4BO3jJiUYf68SUqj2gb+jD0=',
              type: 1,
              uint: 0,
            },
          }),
          toTealKeyValue({
            key: 'bmZ0aWNrZXRfYXBw',
            value: {
              bytes: '',
              type: 2,
              uint: 1196710954,
            },
          }),
        ],
        globalStateSchema: {
          numByteSlice: 2,
          numUint: 1,
        },
        localStateSchema: {
          numByteSlice: 0,
          numUint: 1,
        },
      },
    })
  },
  'testnet-718348254': () => {
    return new ApplicationResultBuilder({
      id: 718348254n,
      params: {
        approvalProgram: base64ToBytes('CiABATEbQQAmgASlPlpBNhoAjgEAAQAxGRREMRhENhoBiAAVgAQVH3x1TFCwIkMxGRREMRgURCJDigEBi/+J'),
        clearStateProgram: base64ToBytes('CoEBQw=='),
        creator: algosdk.Address.fromString('25M5BT2DMMED3V6CWDEYKSNEFGPXX4QBIINCOICLXXRU3UGTSGRMF3MTOE'),
        globalStateSchema: {
          numByteSlice: 0,
          numUint: 0,
        },
        localStateSchema: {
          numByteSlice: 0,
          numUint: 0,
        },
      },
    })
  },
  // This app is associated with the Arc56 sample-one app spec
  'localnet-3771': () => {
    return new ApplicationResultBuilder({
      id: 3771n,
      params: {
        approvalProgram: base64ToBytes(
          'CiACAdIJJgEGYm94S2V5MRgUgQYLMRkIjQwA3gDsAAAAAAAAAAAA0AAAAAAAAAAAAAAAgAQVH3x1NhoBSRWBIBJEiAAEULAiQ4oBAYv/VxAIF4v/VxgIFwxBAAEAgAlnbG9iYWxLZXkjZ4AGcAADZm9vgAQADQAlZ4v/VwAIF4v/VwgIFwgWi/9XEAgXi/9XGAgXCRZQiYgAAiJDigAAMQCACGxvY2FsS2V5I2YxAIAEcGZvb4AFAANiYXJmKEm8SIAFAANiYXq/gCFwAAAAAAAAAAEAAAAAAAAAAgAAAAAAAAAEAAAAAAAAAAOAEAAAAAAAAAADAAAAAAAAAAG/iSJDgAS4RHs2NhoAjgH/8QCABDltVQ42GgCOAf8WAIAEAaOj/zYaAI4B/2wA'
        ),
        clearStateProgram: base64ToBytes('Cg=='),
        creator: algosdk.Address.fromString('25M5BT2DMMED3V6CWDEYKSNEFGPXX4QBIINCOICLXXRU3UGTSGRMF3MTOE'),
        globalState: [
          toTealKeyValue({
            key: 'Z2xvYmFsS2V5',
            value: {
              bytes: '',
              type: 2,
              uint: 1234,
            },
          }),
          toTealKeyValue({
            key: 'cAADZm9v',
            value: {
              bytes: 'AA0AJQ==',
              type: 1,
              uint: 0,
            },
          }),
        ],
        globalStateSchema: {
          numByteSlice: 37,
          numUint: 1,
        },
        localStateSchema: {
          numByteSlice: 13,
          numUint: 1,
        },
      },
    })
  },
  // This app is associated with the Arc56 sample-three app spec
  'localnet-5103': () => {
    return new ApplicationResultBuilder({
      id: 5103n,
      params: {
        approvalProgram: base64ToBytes(
          'CiABATEYFIEGCzEZCI0MALQAwgAAAAAAAAAAAKYAAAAAAAAAAAAAAIAEFR98dTYaAUkVgSASRIgABFCwIkOKAQGL/1cQCBeL/1cYCBcMQQABAIAFAANmb2+ABAANACVni/9XAAgXi/9XCAgXCBaL/1cQCBeL/1cYCBcJFlCJiAACIkOKAAAxAIADZm9vgAUAA2JhcmaAIAAAAAAAAAABAAAAAAAAAAIAAAAAAAAABAAAAAAAAAADgBAAAAAAAAAAAwAAAAAAAAABv4kiQ4AEuER7NjYaAI4B//EAgAQ5bVUONhoAjgH/QACABAGjo/82GgCOAf+IAA=='
        ),
        clearStateProgram: base64ToBytes('Cg=='),
        creator: algosdk.Address.fromString('25M5BT2DMMED3V6CWDEYKSNEFGPXX4QBIINCOICLXXRU3UGTSGRMF3MTOE'),
        globalState: [
          toTealKeyValue({
            key: 'AANmb28=',
            value: {
              bytes: 'AA0AJQ==',
              type: 1,
              uint: 0,
            },
          }),
        ],
        globalStateSchema: {
          numByteSlice: 37,
          numUint: 0,
        },
        localStateSchema: {
          numByteSlice: 13,
          numUint: 0,
        },
      },
    })
  },
  'testnet-740315445': () => {
    return new ApplicationResultBuilder({
      id: 740315445n,
      params: {
        approvalProgram: base64ToBytes(
          'CiACAAEmBAhhc3NldF9pZAZidXJuZWQGbG9ja2VkB2dlbmVyaWMxGEAADygiZykyA2cqMgNnKzIDZzEbQQBdggMEcJuAqAQLYscoBFzCxTU2GgCOAwAxABwAAiJDMRkURDEYRDYaAReIAJEWgAQVH3x1TFCwI0MxGRREMRhENhoBNhoCVwIAiAA9I0MxGRREMRhENhoBF4gADSNDMRlA/7oxGBREI0OKAQAxAIv/cQdEEkEADiIoZURAAAcjRCiL/2eJIkL/9ooCACIoZUQxAEsBcQdEEkSL/kxwAEUBRCkqK4v/jgMACwAGAAEAK4v+Z4kqi/5niSmL/meJigEBgABHAiIpZUQiKmVEIitlRCIoZUSL/xJEi/9xCEQyAxJAAA6L/3EIRIv/cABFAUAAeCKMAosDMgMSQAALiwOL/3AARQFAAFYijACLBDIDEkAAC4sEi/9wAEUBQAA0IowBiwUyAxJAAAuLBYv/cABFAUAAFCKL/3EARIsCCYsACYsBCUwJjACJiwWL/3AAREL/44sEi/9wAESMAUL/w4sDi/9wAESMAEL/oYv/cQhEi/9wAESMAkL/fA=='
        ),
        clearStateProgram: base64ToBytes('CoEBQw=='),
        creator: algosdk.Address.fromString('Q3ROBYOB5QODCSNZKDYLH33NO5V4FN3YKMOHE43RPPC2LUPG56DNSU446I'),
        globalState: [
          toTealKeyValue({
            key: 'YXNzZXRfaWQ=',
            value: {
              bytes: '',
              type: 2,
              uint: 740315456,
            },
          }),
          toTealKeyValue({
            key: 'YnVybmVk',
            value: {
              bytes: 'TRQTVEP/VidaUDGuc8zluI1aY0YjWT2N/Oy/MqGzhtw=',
              type: 1,
              uint: 0,
            },
          }),
          toTealKeyValue({
            key: 'Z2VuZXJpYw==',
            value: {
              bytes: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
              type: 1,
              uint: 0,
            },
          }),
          toTealKeyValue({
            key: 'bG9ja2Vk',
            value: {
              bytes: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
              type: 1,
              uint: 0,
            },
          }),
        ],
        globalStateSchema: {
          numByteSlice: 3,
          numUint: 1,
        },
        localStateSchema: {
          numByteSlice: 0,
          numUint: 0,
        },
      },
    })
  },
  ['mainnet-2849426479']: () => {
    return new ApplicationResultBuilder({
      id: 2849426479n,
      params: {
        approvalProgram: base64ToBytes(
          'CiADAAEgJgQIYXNzZXRfaWQRbm90LWNpcmN1bGF0aW5nLTERbm90LWNpcmN1bGF0aW5nLTIRbm90LWNpcmN1bGF0aW5nLTMxGEAADygiZykyA2cqMgNnKzIDZzEbQQBdggMEcJuAqAQLYscoBFzCxTU2GgCOAwAxABwAAiJDMRkURDEYRDYaAReIAJcWgAQVH3x1TFCwI0MxGRREMRhENhoBNhoCVwIAiAA9I0MxGRREMRhENhoBF4gADSNDMRlA/7oxGBREI0OKAQAxAIv/cQdEEkEADiIoZURAAAcjRCiL/2eJIkL/9ooCACIoZUQxAEsBcQdEEkSL/kxwAEUBRCkqK4v/jgMACwAGAAEAK4v+Z4kqi/5niSmL/meJigEBgABHAiIpZUQiKmVEIitlRCIoZUSL/xJEi/9xCEQyAxJAAA6L/3EIRIv/cABFAUAAeCKMAosDMgMSQAALiwOL/3AARQFAAFYijACLBDIDEkAAC4sEi/9wAEUBQAA0IowBiwUyAxJAAAuLBYv/cABFAUAAFCKL/3EARIsCCYsACYsBCUwJjACJiwWL/3AAREL/44sEi/9wAESMAUL/w4sDi/9wAESMAEL/oYv/cQhEi/9wAESMAkL/fA=='
        ),
        clearStateProgram: base64ToBytes('CoEBQw=='),
        creator: algosdk.Address.fromString('5BBRF536WPMEJJMGHLD677FGYW4ELDYXPXBQAWCLNNJZ6RAOCEALFXRWOU'),
        globalState: [
          toTealKeyValue({
            key: 'YXNzZXRfaWQ=',
            value: {
              bytes: '',
              type: 2,
              uint: 2849506951,
            },
          }),
          toTealKeyValue({
            key: 'bm90LWNpcmN1bGF0aW5nLTE=',
            value: {
              bytes: '6DKR56GFNNHN4KGNDMGSQGGHJPOYXHAIBCNIKD2MLSUIGVN6GZIJ4OA4Q4',
              type: 1,
              uint: 0,
            },
          }),
          toTealKeyValue({
            key: 'bm90LWNpcmN1bGF0aW5nLTI=',
            value: {
              bytes: '6DKR56GFNNHN4KGNDMGSQGGHJPOYXHAIBCNIKD2MLSUIGVN6GZIJ4OA4Q4',
              type: 1,
              uint: 0,
            },
          }),
          toTealKeyValue({
            key: 'bm90LWNpcmN1bGF0aW5nLTM=',
            value: {
              bytes: 'KK3AD72XX2Z7PIBJDU2B27DXC2XI3ZXZEXVHSM5JNV2OTKUTKDLOYUJ6I',
              type: 1,
              uint: 0,
            },
          }),
        ],
        globalStateSchema: {
          numByteSlice: 3,
          numUint: 1,
        },
        localStateSchema: {
          numByteSlice: 0,
          numUint: 0,
        },
      },
    })
  },
}

const toTealKeyValue = ({ key, value }: { key: string; value: { type: number; uint: number; bytes: string } }) =>
  new modelsv2.TealKeyValue({ key, value: new modelsv2.TealValue(value) })
