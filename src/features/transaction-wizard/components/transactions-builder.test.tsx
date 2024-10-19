import { describe, expect, it } from 'vitest'
import { patchTransactions } from './transactions-builder'
import {
  BuildableTransactionType,
  BuildMethodCallTransactionResult,
  BuildPaymentTransactionResult,
  PlaceholderTransaction,
} from '../models'
import algosdk from 'algosdk'
import { Arc32AppSpec } from '@/features/app-interfaces/data/types'

describe('patchTransactions', () => {
  const exampleMethodCallProperties = {
    applicationId: 1988,
    method: {} as algosdk.ABIMethod,
    onComplete: 0,
    sender: 'IN6X7QLOJB76VTDHWAW43OTBUGAQ22DVYBPNHLLTJ5RVOTFVTCPK3JY6RA',
    appSpec: {} as Arc32AppSpec,
    fee: {
      setAutomatically: true,
    },
    validRounds: {
      setAutomatically: true,
    },
  }

  const examplePaymentProperties = {
    sender: 'IN6X7QLOJB76VTDHWAW43OTBUGAQ22DVYBPNHLLTJ5RVOTFVTCPK3JY6RA',
    receiver: 'IN6X7QLOJB76VTDHWAW43OTBUGAQ22DVYBPNHLLTJ5RVOTFVTCPK3JY6RA',
    amount: 2,
    fee: {
      setAutomatically: true,
    },
    validRounds: {
      setAutomatically: true,
    },
  }

  describe('handles building in order - method(myPay,nestedMethod(myPay))void', () => {
    it('can patch nestedMethod - method(?,nestedMethod(?))void', () => {
      const idToReplace = 'ff52b40a-6d15-46e7-aa4b-e2c404f47778'
      const previousTransactions = [
        {
          ...exampleMethodCallProperties,
          id: '55199831-a25f-4b60-aff9-2c4f3bf142a2',
          type: BuildableTransactionType.MethodCall,
          methodArgs: [
            {
              id: '010a9dc9-2958-4aeb-a23c-bd01fb56d99e',
              type: BuildableTransactionType.Placeholder,
              targetType: algosdk.ABITransactionType.pay,
            },
            {
              id: idToReplace,
              type: BuildableTransactionType.Placeholder,
              targetType: algosdk.ABITransactionType.appl,
            },
          ],
        } satisfies BuildMethodCallTransactionResult,
      ]
      const newTransaction = {
        ...exampleMethodCallProperties,
        id: 'da968947-d9b4-4849-841b-7d3244a02b32',
        type: BuildableTransactionType.MethodCall,
        methodArgs: [
          {
            id: '71eb7038-d021-4b38-a7a5-42713f100398',
            type: BuildableTransactionType.Placeholder,
            targetType: algosdk.ABITransactionType.pay,
          },
        ],
      } satisfies BuildMethodCallTransactionResult

      const results = patchTransactions(previousTransactions, idToReplace, newTransaction)

      expect(JSON.stringify(results, simplifyResultReplacer, 2)).toMatchInlineSnapshot(`
        "[
          {
            "id": "55199831-a25f-4b60-aff9-2c4f3bf142a2",
            "type": "MethodCall",
            "methodArgs": [
              {
                "id": "010a9dc9-2958-4aeb-a23c-bd01fb56d99e",
                "type": "Fulfilled",
                "targetType": "pay",
                "fulfilledById": "71eb7038-d021-4b38-a7a5-42713f100398"
              },
              {
                "id": "da968947-d9b4-4849-841b-7d3244a02b32",
                "type": "MethodCall",
                "methodArgs": [
                  {
                    "id": "71eb7038-d021-4b38-a7a5-42713f100398",
                    "type": "Placeholder",
                    "targetType": "pay"
                  }
                ]
              }
            ]
          }
        ]"
      `)
    })

    it('can patch myPay - method(myPay,nestedMethod(myPay))void', () => {
      const idToReplace = '71eb7038-d021-4b38-a7a5-42713f100398'
      const previousTransactions = [
        {
          ...exampleMethodCallProperties,
          id: '55199831-a25f-4b60-aff9-2c4f3bf142a2',
          type: BuildableTransactionType.MethodCall,
          methodArgs: [
            {
              id: '010a9dc9-2958-4aeb-a23c-bd01fb56d99e',
              type: BuildableTransactionType.Fulfilled,
              targetType: algosdk.ABITransactionType.pay,
              fulfilledById: idToReplace,
            },
            {
              ...exampleMethodCallProperties,
              id: 'da968947-d9b4-4849-841b-7d3244a02b32',
              type: BuildableTransactionType.MethodCall,
              methodArgs: [
                {
                  id: idToReplace,
                  type: BuildableTransactionType.Placeholder,
                  targetType: algosdk.ABITransactionType.pay,
                } satisfies PlaceholderTransaction,
              ],
            },
          ],
        } satisfies BuildMethodCallTransactionResult,
      ]

      const newTransaction = {
        ...examplePaymentProperties,
        id: '7d00ec66-5419-47d1-abc9-8ed1fe3452e8',
        type: BuildableTransactionType.Payment,
      } as BuildPaymentTransactionResult

      const results = patchTransactions(previousTransactions, idToReplace, newTransaction)

      expect(JSON.stringify(results, simplifyResultReplacer, 2)).toMatchInlineSnapshot(`
        "[
          {
            "id": "55199831-a25f-4b60-aff9-2c4f3bf142a2",
            "type": "MethodCall",
            "methodArgs": [
              {
                "id": "010a9dc9-2958-4aeb-a23c-bd01fb56d99e",
                "type": "Fulfilled",
                "targetType": "pay",
                "fulfilledById": "7d00ec66-5419-47d1-abc9-8ed1fe3452e8"
              },
              {
                "id": "da968947-d9b4-4849-841b-7d3244a02b32",
                "type": "MethodCall",
                "methodArgs": [
                  {
                    "id": "7d00ec66-5419-47d1-abc9-8ed1fe3452e8",
                    "type": "Payment"
                  }
                ]
              }
            ]
          }
        ]"
      `)
    })
  })

  describe('handles building out of order  - method(myPay,nestedMethod(myPay))void', () => {
    it('can patch myPay - method(myPay,?(myPay))void', () => {
      const idToReplace = '010a9dc9-2958-4aeb-a23c-bd01fb56d99e'
      const previousTransactions = [
        {
          ...exampleMethodCallProperties,
          id: '55199831-a25f-4b60-aff9-2c4f3bf142a2',
          type: BuildableTransactionType.MethodCall,
          methodArgs: [
            {
              id: idToReplace,
              type: BuildableTransactionType.Placeholder,
              targetType: algosdk.ABITransactionType.pay,
            },
            {
              id: 'ff52b40a-6d15-46e7-aa4b-e2c404f47778',
              type: BuildableTransactionType.Placeholder,
              targetType: algosdk.ABITransactionType.appl,
            },
          ],
        } satisfies BuildMethodCallTransactionResult,
      ]
      const newTransaction = {
        ...examplePaymentProperties,
        id: '7d00ec66-5419-47d1-abc9-8ed1fe3452e8',
        type: BuildableTransactionType.Payment,
      } as BuildPaymentTransactionResult

      const results = patchTransactions(previousTransactions, idToReplace, newTransaction)

      expect(JSON.stringify(results, simplifyResultReplacer, 2)).toMatchInlineSnapshot(`
        "[
          {
            "id": "55199831-a25f-4b60-aff9-2c4f3bf142a2",
            "type": "MethodCall",
            "methodArgs": [
              {
                "id": "7d00ec66-5419-47d1-abc9-8ed1fe3452e8",
                "type": "Payment"
              },
              {
                "id": "ff52b40a-6d15-46e7-aa4b-e2c404f47778",
                "type": "Placeholder",
                "targetType": "appl"
              }
            ]
          }
        ]"
      `)
    })

    it('can patch nestedMethod - method(myPay,nestedMethod(myPay))void', () => {
      const idToReplace = 'ff52b40a-6d15-46e7-aa4b-e2c404f47778'
      const previousTransactions = [
        {
          ...exampleMethodCallProperties,
          id: '55199831-a25f-4b60-aff9-2c4f3bf142a2',
          type: BuildableTransactionType.MethodCall,
          methodArgs: [
            {
              ...examplePaymentProperties,
              id: '7d00ec66-5419-47d1-abc9-8ed1fe3452e8',
              type: BuildableTransactionType.Payment,
            },
            {
              id: idToReplace,
              type: BuildableTransactionType.Placeholder,
              targetType: algosdk.ABITransactionType.appl,
            },
          ],
        } satisfies BuildMethodCallTransactionResult,
      ]

      const newTransaction = {
        ...exampleMethodCallProperties,
        id: 'da968947-d9b4-4849-841b-7d3244a02b32',
        type: BuildableTransactionType.MethodCall,
        methodArgs: [
          {
            id: '71eb7038-d021-4b38-a7a5-42713f100398',
            type: BuildableTransactionType.Placeholder,
            targetType: algosdk.ABITransactionType.pay,
          },
        ],
      } satisfies BuildMethodCallTransactionResult

      const results = patchTransactions(previousTransactions, idToReplace, newTransaction)

      expect(JSON.stringify(results, simplifyResultReplacer, 2)).toMatchInlineSnapshot(`
        "[
          {
            "id": "55199831-a25f-4b60-aff9-2c4f3bf142a2",
            "type": "MethodCall",
            "methodArgs": [
              {
                "id": "7d00ec66-5419-47d1-abc9-8ed1fe3452e8",
                "type": "Fulfilled",
                "targetType": "pay",
                "fulfilledById": "71eb7038-d021-4b38-a7a5-42713f100398"
              },
              {
                "id": "da968947-d9b4-4849-841b-7d3244a02b32",
                "type": "MethodCall",
                "methodArgs": [
                  {
                    "id": "71eb7038-d021-4b38-a7a5-42713f100398",
                    "type": "Payment"
                  }
                ]
              }
            ]
          }
        ]"
      `)
    })
  })

  describe('handles editing - method(myPay,nestedMethod(myPay))void', () => {
    it('can patch nestedMethod - method(myPay,nestedMethod(myPay))void', () => {
      const idToReplace = 'da968947-d9b4-4849-841b-7d3244a02b32'
      const previousTransactions = [
        {
          ...exampleMethodCallProperties,
          id: '55199831-a25f-4b60-aff9-2c4f3bf142a2',
          type: BuildableTransactionType.MethodCall,
          methodArgs: [
            {
              id: '7d00ec66-5419-47d1-abc9-8ed1fe3452e8',
              type: BuildableTransactionType.Fulfilled,
              targetType: algosdk.ABITransactionType.pay,
              fulfilledById: '71eb7038-d021-4b38-a7a5-42713f100398',
            },
            {
              ...exampleMethodCallProperties,
              id: idToReplace,
              type: BuildableTransactionType.MethodCall,
              methodArgs: [
                {
                  ...examplePaymentProperties,
                  id: '71eb7038-d021-4b38-a7a5-42713f100398',
                  type: BuildableTransactionType.Payment,
                },
              ],
            },
          ],
        } satisfies BuildMethodCallTransactionResult,
      ]

      const newTransaction = {
        ...exampleMethodCallProperties,
        id: 'cae25b07-d742-449a-ade7-a6a1ca64d80a',
        type: BuildableTransactionType.MethodCall,
        methodArgs: ['testing'],
      } satisfies BuildMethodCallTransactionResult

      const results = patchTransactions(previousTransactions, idToReplace, newTransaction)

      expect(JSON.stringify(results, simplifyResultReplacer, 2)).toMatchInlineSnapshot(`
        "[
          {
            "id": "55199831-a25f-4b60-aff9-2c4f3bf142a2",
            "type": "MethodCall",
            "methodArgs": [
              {
                "id": "7d00ec66-5419-47d1-abc9-8ed1fe3452e8",
                "type": "Placeholder",
                "targetType": "pay"
              },
              {
                "id": "cae25b07-d742-449a-ade7-a6a1ca64d80a",
                "type": "MethodCall",
                "methodArgs": [
                  "testing"
                ]
              }
            ]
          }
        ]"
      `)
    })
  })

  describe('handles invalid groups', () => {
    it('returns an error', () => {
      const idToReplace = 'ff52b40a-6d15-46e7-aa4b-e2c404f47778'
      const previousTransactions = [
        {
          ...exampleMethodCallProperties,
          id: '55199831-a25f-4b60-aff9-2c4f3bf142a2',
          type: BuildableTransactionType.MethodCall,
          methodArgs: [
            {
              ...examplePaymentProperties,
              id: '7d00ec66-5419-47d1-abc9-8ed1fe3452e8',
              type: BuildableTransactionType.Payment,
            },
            {
              id: idToReplace,
              type: BuildableTransactionType.Placeholder,
              targetType: algosdk.ABITransactionType.appl,
            },
          ],
        } satisfies BuildMethodCallTransactionResult,
      ]

      const newTransaction = {
        ...exampleMethodCallProperties,
        id: 'da968947-d9b4-4849-841b-7d3244a02b32',
        type: BuildableTransactionType.MethodCall,
        methodArgs: [
          {
            id: '71eb7038-d021-4b38-a7a5-42713f100398',
            type: BuildableTransactionType.Placeholder,
            targetType: algosdk.ABITransactionType.pay,
          },
          {
            id: 'efe5e410-964d-492e-93f9-7c2a0a039f1e',
            type: BuildableTransactionType.Placeholder,
            targetType: algosdk.ABITransactionType.appl,
          },
        ],
      } satisfies BuildMethodCallTransactionResult

      expect(() => patchTransactions(previousTransactions, idToReplace, newTransaction)).toThrowErrorMatchingInlineSnapshot(
        `[Error: Failed to insert transaction arg, it will create an invalid group]`
      )
    })
  })

  describe('handles multiple app calls in group', () => {
    it('can patch by adding a nested method call arg', () => {
      const idToReplace = '8e0371d7-772c-4c51-9ee4-f46c1df95608'
      const previousTransactions = [
        {
          ...exampleMethodCallProperties,
          id: 'c0910928-c1e1-4736-a87d-a254839caa1a',
          type: BuildableTransactionType.MethodCall,
          methodArgs: [
            {
              id: '7d00ec66-5419-47d1-abc9-8ed1fe3452e8',
              type: BuildableTransactionType.Placeholder,
              targetType: algosdk.ABITransactionType.appl,
            },
          ],
        } satisfies BuildMethodCallTransactionResult,
        {
          ...exampleMethodCallProperties,
          id: '9247f310-e2fb-4063-9ec9-ac06cfa862bc',
          type: BuildableTransactionType.MethodCall,
          methodArgs: [
            {
              id: idToReplace,
              type: BuildableTransactionType.Placeholder,
              targetType: algosdk.ABITransactionType.appl,
            },
          ],
        } satisfies BuildMethodCallTransactionResult,
      ]

      const newTransaction = {
        ...exampleMethodCallProperties,
        id: '862f465c-cc33-46de-a611-6bfbed66a572',
        type: BuildableTransactionType.MethodCall,
        methodArgs: [
          {
            id: '652b98e8-fc23-4553-865d-c5992975498c',
            type: BuildableTransactionType.Placeholder,
            targetType: algosdk.ABITransactionType.pay,
          },
        ],
      } satisfies BuildMethodCallTransactionResult

      const results = patchTransactions(previousTransactions, idToReplace, newTransaction)

      expect(JSON.stringify(results, simplifyResultReplacer, 2)).toMatchInlineSnapshot(`
        "[
          {
            "id": "c0910928-c1e1-4736-a87d-a254839caa1a",
            "type": "MethodCall",
            "methodArgs": [
              {
                "id": "7d00ec66-5419-47d1-abc9-8ed1fe3452e8",
                "type": "Placeholder",
                "targetType": "appl"
              }
            ]
          },
          {
            "id": "9247f310-e2fb-4063-9ec9-ac06cfa862bc",
            "type": "MethodCall",
            "methodArgs": [
              {
                "id": "862f465c-cc33-46de-a611-6bfbed66a572",
                "type": "MethodCall",
                "methodArgs": [
                  {
                    "id": "652b98e8-fc23-4553-865d-c5992975498c",
                    "type": "Placeholder",
                    "targetType": "pay"
                  }
                ]
              }
            ]
          }
        ]"
      `)
    })
  })

  describe('handles multiple transactions in the group', () => {
    it('can patch by adding a nested method call arg', () => {
      const idToReplace = '7d00ec66-5419-47d1-abc9-8ed1fe3452e8'
      const previousTransactions = [
        {
          ...examplePaymentProperties,
          id: 'd10f466c-52d4-42a6-9ce1-20576e8d95e3',
          type: BuildableTransactionType.Payment,
        } satisfies BuildPaymentTransactionResult,
        {
          ...exampleMethodCallProperties,
          id: 'c0910928-c1e1-4736-a87d-a254839caa1a',
          type: BuildableTransactionType.MethodCall,
          methodArgs: [
            {
              id: idToReplace,
              type: BuildableTransactionType.Placeholder,
              targetType: algosdk.ABITransactionType.appl,
            },
          ],
        } satisfies BuildMethodCallTransactionResult,
      ]

      const newTransaction = {
        ...exampleMethodCallProperties,
        id: '862f465c-cc33-46de-a611-6bfbed66a572',
        type: BuildableTransactionType.MethodCall,
        methodArgs: [
          {
            id: '652b98e8-fc23-4553-865d-c5992975498c',
            type: BuildableTransactionType.Placeholder,
            targetType: algosdk.ABITransactionType.pay,
          },
        ],
      } satisfies BuildMethodCallTransactionResult

      const results = patchTransactions(previousTransactions, idToReplace, newTransaction)

      expect(JSON.stringify(results, simplifyResultReplacer, 2)).toMatchInlineSnapshot(`
        "[
          {
            "id": "d10f466c-52d4-42a6-9ce1-20576e8d95e3",
            "type": "Payment"
          },
          {
            "id": "c0910928-c1e1-4736-a87d-a254839caa1a",
            "type": "MethodCall",
            "methodArgs": [
              {
                "id": "862f465c-cc33-46de-a611-6bfbed66a572",
                "type": "MethodCall",
                "methodArgs": [
                  {
                    "id": "652b98e8-fc23-4553-865d-c5992975498c",
                    "type": "Placeholder",
                    "targetType": "pay"
                  }
                ]
              }
            ]
          }
        ]"
      `)
    })
  })

  describe('handles generic transaction arguments', () => {
    it('can patch by fulfilling a transaction argument with a pay', () => {
      const idToReplace = 'ff52b40a-6d15-46e7-aa4b-e2c404f47778'
      const previousTransactions = [
        {
          ...exampleMethodCallProperties,
          id: '55199831-a25f-4b60-aff9-2c4f3bf142a2',
          type: BuildableTransactionType.MethodCall,
          methodArgs: [
            {
              id: '010a9dc9-2958-4aeb-a23c-bd01fb56d99e',
              type: BuildableTransactionType.Placeholder,
              targetType: algosdk.ABITransactionType.any,
            },
            {
              id: idToReplace,
              type: BuildableTransactionType.Placeholder,
              targetType: algosdk.ABITransactionType.appl,
            },
          ],
        } satisfies BuildMethodCallTransactionResult,
      ]
      const newTransaction = {
        ...exampleMethodCallProperties,
        id: 'da968947-d9b4-4849-841b-7d3244a02b32',
        type: BuildableTransactionType.MethodCall,
        methodArgs: [
          {
            id: '71eb7038-d021-4b38-a7a5-42713f100398',
            type: BuildableTransactionType.Placeholder,
            targetType: algosdk.ABITransactionType.pay,
          },
        ],
      } satisfies BuildMethodCallTransactionResult

      const results = patchTransactions(previousTransactions, idToReplace, newTransaction)

      expect(JSON.stringify(results, simplifyResultReplacer, 2)).toMatchInlineSnapshot(`
        "[
          {
            "id": "55199831-a25f-4b60-aff9-2c4f3bf142a2",
            "type": "MethodCall",
            "methodArgs": [
              {
                "id": "010a9dc9-2958-4aeb-a23c-bd01fb56d99e",
                "type": "Fulfilled",
                "targetType": "txn",
                "fulfilledById": "71eb7038-d021-4b38-a7a5-42713f100398"
              },
              {
                "id": "da968947-d9b4-4849-841b-7d3244a02b32",
                "type": "MethodCall",
                "methodArgs": [
                  {
                    "id": "71eb7038-d021-4b38-a7a5-42713f100398",
                    "type": "Placeholder",
                    "targetType": "pay"
                  }
                ]
              }
            ]
          }
        ]"
      `)
    })

    it('can patch by creating a placeholder transaction argument', () => {
      const idToReplace = 'ff52b40a-6d15-46e7-aa4b-e2c404f47778'
      const previousTransactions = [
        {
          ...exampleMethodCallProperties,
          id: '55199831-a25f-4b60-aff9-2c4f3bf142a2',
          type: BuildableTransactionType.MethodCall,
          methodArgs: [
            {
              id: '010a9dc9-2958-4aeb-a23c-bd01fb56d99e',
              type: BuildableTransactionType.Placeholder,
              targetType: algosdk.ABITransactionType.pay,
            },
            {
              id: idToReplace,
              type: BuildableTransactionType.Placeholder,
              targetType: algosdk.ABITransactionType.appl,
            },
          ],
        } satisfies BuildMethodCallTransactionResult,
      ]
      const newTransaction = {
        ...exampleMethodCallProperties,
        id: 'da968947-d9b4-4849-841b-7d3244a02b32',
        type: BuildableTransactionType.MethodCall,
        methodArgs: [
          {
            id: '71eb7038-d021-4b38-a7a5-42713f100398',
            type: BuildableTransactionType.Placeholder,
            targetType: algosdk.ABITransactionType.any,
          },
        ],
      } satisfies BuildMethodCallTransactionResult

      const results = patchTransactions(previousTransactions, idToReplace, newTransaction)

      expect(JSON.stringify(results, simplifyResultReplacer, 2)).toMatchInlineSnapshot(`
        "[
          {
            "id": "55199831-a25f-4b60-aff9-2c4f3bf142a2",
            "type": "MethodCall",
            "methodArgs": [
              {
                "id": "010a9dc9-2958-4aeb-a23c-bd01fb56d99e",
                "type": "Fulfilled",
                "targetType": "pay",
                "fulfilledById": "71eb7038-d021-4b38-a7a5-42713f100398"
              },
              {
                "id": "da968947-d9b4-4849-841b-7d3244a02b32",
                "type": "MethodCall",
                "methodArgs": [
                  {
                    "id": "71eb7038-d021-4b38-a7a5-42713f100398",
                    "type": "Placeholder",
                    "targetType": "pay"
                  }
                ]
              }
            ]
          }
        ]"
      `)
    })
  })
})

const simplifyResultReplacer = (key: string, value: unknown) => {
  if (key && isNaN(parseInt(key, 10)) && !['id', 'type', 'methodArgs', 'targetType', 'fulfilledById'].includes(key)) {
    return undefined
  }
  return value
}
