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
}

const toTealKeyValue = ({ key, value }: { key: string; value: { type: number; uint: number; bytes: string } }) =>
  new modelsv2.TealKeyValue({ key, value: new modelsv2.TealValue(value) })
