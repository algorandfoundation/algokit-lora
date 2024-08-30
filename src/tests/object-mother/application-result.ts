import { ApplicationResultBuilder, applicationResultBuilder } from '../builders/application-result-builder'
import { modelsv2 } from 'algosdk'

export const applicationResultMother = {
  basic: () => {
    return applicationResultBuilder()
  },
  'mainnet-80441968': () => {
    return new ApplicationResultBuilder({
      id: 80441968,
      params: {
        'approval-program':
          'AiAIAAUEAgEKkE5kJhMDYmlkBWRyYWluB0NyZWF0b3IGRXNjcm93Bldpbm5lcgNQb3QEQmlkcwpSb3VuZEJlZ2luCFJvdW5kRW5kBVByaWNlCk11bHRpcGxpZXIFVGltZXIKVGltZXJGaXJzdAtUaW1lclNlY29uZAlGZWVzRmlyc3QKRmVlc1NlY29uZAhEaXZpZGVuZANCaWQERmVlczEYIhJAAC4xGSMSQACTMRkkEkAApDEZJRJAALoxGSEEEkAAtyg2GgASQADQKTYaABJAAbIAMRshBRJAAAEAKjEAZys2GgBnJwQxAGcnBSJnJwYiZycHMgdnJwgyBzYaARcIZycJNhoCF2cnCjYaAxdnJws2GgQXZycMNhoFF2cnDTYaBhdnJw42GgcXZycPNhoIF2cnEDYaCRdnIQRDQgGBMQAqZBJAAAEAJwVkIhJAAAEAIQRDQgFpMQAqZBJAAAEAMRshBBJAAAEAKzYaAGchBENCAUwiQ0IBRzIHJwdkDzIHJwhkDhBAAAEAIicRImYiJxIiZiEEQ0IBJjIEJRIzAQgnCWQSMwEIJwlkJw5kCBIRMwEIJwlkJw9kCBIREDMAACpkEhAzAQcrZBIQMwEQIQQSEEAAAQAnBScFZCcJZAgnBWQnCWQIJxBkCyEGCglnJwQzAQBnJwknCWQnCWQnCmQLIQcKCGchBCcRIQQnEWInCWQIZjMBCCcJZBJBAAonCCcIZCcLZAhnMwEIJwlkJw5kCBJBABghBCcSIQQnEmInDmQIZicIJwhkJwxkCGczAQgnCWQnD2QIEkEAGCEEJxIhBCcSYicPZAhmJwgnCGQnDWQIZycGJwZkIQQIZyEEQ0IAPDIEJRJAAAEAMwAAKmQSQAABADMBACtkEkAAAQAzAQgiEkAAAQAzAQcyAxJAAAEAMwEJKmQSQAABACEEQw==',
        'clear-state-program': 'AiABASJD',
        creator: '24YD4UNKUGVNGZ6QGXWIUPQ5L456FBH7LB5L6KFGQJ65YLQHXX4CQNPCZA',
        'global-state': [
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
        'global-state-schema': { 'num-byte-slice': 3, 'num-uint': 12 },
        'local-state-schema': { 'num-byte-slice': 0, 'num-uint': 2 },
      },
    })
  },
  'mainnet-1196727051': () => {
    return new ApplicationResultBuilder({
      id: 1196727051,
      params: {
        'approval-program':
          'CSAEAAEGAiYJDG5mdGlja2V0X2FwcAABAA9tYW5hZ2VyX2FkZHJlc3MBAQQuU0kZBGg0o6oSbWV0aG9kX3Blcm1pc3Npb25zB2FpcmxpbmUxGyISQAEtNhoAgAThNZDwEkABETYaAIAEnNbuoRJAAPU2GgCABF5iYz4SQADZNhoAgAS2olF1EkAAvTYaAIAE+Qj2KRJAAKE2GgCABB0UDY4SQACFNhoAgATG43mkEkAAaTYaACcFEkAAUTYaAIAEnvUJRhJAADU2GgCABE+i3akSQAAZNhoAJwYSQAABADEZIhIxGCITEESIBBYjQzEZIhIxGCITEESIA+wjQzEZIhIxGCITEESIA7IjQzEZIhIxGCITEESIA34jQzEZIhIxGCITEESIA0wjQzEZIhIxGCITEESIAxAjQzEZIhIxGCISEESIAuAjQzEZIhIxGCITEESIArcjQzEZIhIxGCITEESIApcjQzEZIhIxGCITEESIAncjQzEZIhIxGCITEESIAlcjQzEZIxJAADYxGSUSQAAlMRmBBBJAABMxGYEFEkAAAQAxGCITRIgAViNDMRgiE0SIAEEjQzEYIhNEiABSI0MxGCITRIgAQyNDigIBi/4yCGFAAAQiQgAbi/4iJwdjNQE1ADQBQAAHIov/U0IABTQAQv/1iYoAADEAMgkSRCNDigAAMQAyCRJEI0OKAAAjQ4oAACNDigEAMQAyCRJEK4v/wBxniYoBADEAK2QSRLEkshAjshmL/8AyshgisgGziYoBADEAK2QSRLEkshAlshmL/8AyshgisgGziYoCADEAK2QSRIv+wBwnB4v/ZomKAgGL/icIZBJAAAqL/ov/iP9JQgABI4mKAwAoi/7AMmcri/1nJwiL/2cjQ4oFADEAIoj/y0SxJLIQKGSyGIAEWOGHaLIai/uyGov8shqL/bIai/6yGov/shoisgGziYoDADEAJIj/mESxJLIQKGSyGIv/wByyHIv+wDCyMIAErnlpMLIai/2yGiqyGicEshoisgGziYoDADEAgQOI/2FEsSSyEChkshiL/sAcshyL/8AcshyL/cAwsjAnBbIaKrIaJwSyGoABArIaIrIBs4mKBAAxAIEFiP8nRLEkshAoZLIYi/zAMLIwgAQ7tliRshoqshqL/bIai/4WVwQAshqL/7IaIrIBs4mKAgAxAIEEiP7uRLEkshAoZLIYi/7AMLIwgARMfzwNshoqshoqIov/VrIaIrIBs4mKAwAxACWI/r9EsSSyEChkshiL/8AcshyL/sAwsjAnBrIai/2yGiqyGicEshoisgGziYoAACI2GgEiVYwAiwCI/i2JigAAIjYaASJVjACLAIj+LImKAAAiNhoBIlWMAIsAiP42iYoAACJJNhoBIlWMADYaAheMAYsAiwGI/jeJigAAKSIpNhoBjAA2GgIiVYwBNhoDjAKLAIsBiwKI/kGJigAAKUcENhoBjAA2GgKMATYaA4wCNhoEjAM2GgWMBIsAiwGLAosDiwSI/iiJigAAKSJJNhoBjAA2GgIiVYwBNhoDIlWMAosAiwGLAoj+OImKAAAiRwI2GgEiVYwANhoCIlWMATYaAyJVjAKLAIsBiwKI/kmJigAAIikiKTYaASJVjAA2GgKMATYaAyJajAI2GgSMA4sAiwGLAosDiP5YiYoAACJJNhoBIlWMADYaAiJVjAGLAIsBiP52iYoAACkiSTYaAYwANhoCIlWMATYaAyJVjAKLAIsBiwKI/oOJ',
        'clear-state-program': 'CYEAQw==',
        creator: '52MVNW6FNW7L6W7IAKSROD5FYZGZNLVKT6WUWNUFEE3DT737RYIIL2YQ3Y',
        'global-state': [
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
        'global-state-schema': {
          'num-byte-slice': 2,
          'num-uint': 1,
        },
        'local-state-schema': {
          'num-byte-slice': 0,
          'num-uint': 1,
        },
      },
    })
  },
  'testnet-718348254': () => {
    return new ApplicationResultBuilder({
      id: 718348254,
      params: {
        'approval-program': 'CiABATEbQQAmgASlPlpBNhoAjgEAAQAxGRREMRhENhoBiAAVgAQVH3x1TFCwIkMxGRREMRgURCJDigEBi/+J',
        'clear-state-program': 'CoEBQw==',
        creator: '25M5BT2DMMED3V6CWDEYKSNEFGPXX4QBIINCOICLXXRU3UGTSGRMF3MTOE',
        'global-state-schema': {
          'num-byte-slice': 0,
          'num-uint': 0,
        },
        'local-state-schema': {
          'num-byte-slice': 0,
          'num-uint': 0,
        },
      },
    })
  },
}

const toTealKeyValue = ({ key, value }: { key: string; value: { type: number; uint: number; bytes: string } }) =>
  new modelsv2.TealKeyValue({ key, value: new modelsv2.TealValue(value) })
