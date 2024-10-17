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

// TODO: NC - Things to test
// invalid groups
// adjacent transactions that aren't part the transaction

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
      // const appSpec = {
      //   hints: {
      //     'get_pay_txn_amount(pay)void': {
      //       call_config: {
      //         no_op: 'CALL',
      //       },
      //     },
      //     'nested_method_call_1(pay,appl)void': {
      //       call_config: {
      //         no_op: 'CALL',
      //       },
      //     },
      //   },
      //   source: {
      //     approval: '',
      //     clear: '',
      //   },
      //   state: {
      //     global: {
      //       num_byte_slices: 1,
      //       num_uints: 0,
      //     },
      //     local: {
      //       num_byte_slices: 0,
      //       num_uints: 0,
      //     },
      //   },
      //   schema: {
      //     global: {
      //       declared: {
      //         global_static_ints: {
      //           type: 'bytes',
      //           key: 'global_static_ints',
      //         },
      //       },
      //       reserved: {},
      //     },
      //     local: {
      //       declared: {},
      //       reserved: {},
      //     },
      //   },
      //   contract: {
      //     name: 'TestContract',
      //     methods: [
      //       {
      //         name: 'get_pay_txn_amount',
      //         args: [
      //           {
      //             type: 'pay',
      //             name: 'pay_txn',
      //           },
      //         ],
      //         returns: {
      //           type: 'void',
      //         },
      //       },
      //       {
      //         name: 'nested_method_call_1',
      //         args: [
      //           {
      //             type: 'pay',
      //             name: '_',
      //           },
      //           {
      //             type: 'appl',
      //             name: 'method_call',
      //           },
      //         ],
      //         returns: {
      //           type: 'void',
      //         },
      //       },
      //     ],
      //     networks: {},
      //   },
      //   bare_call_config: {
      //     no_op: 'CREATE',
      //   },
      // } satisfies Arc32AppSpec
      const previousTransactions = [
        {
          id: '55199831-a25f-4b60-aff9-2c4f3bf142a2',
          type: BuildableTransactionType.MethodCall,
          applicationId: 1988,
          // method: new algosdk.ABIMethod({
          //   name: 'nested_method_call_1',
          //   args: [
          //     {
          //       type: algosdk.ABITransactionType.pay,
          //       name: '_',
          //     },
          //     {
          //       type: algosdk.ABITransactionType.appl,
          //       name: 'method_call',
          //     },
          //   ],
          //   returns: {
          //     type: 'void',
          //   },
          // }),
          method: {} as algosdk.ABIMethod,
          onComplete: 0,
          sender: 'IN6X7QLOJB76VTDHWAW43OTBUGAQ22DVYBPNHLLTJ5RVOTFVTCPK3JY6RA',
          // appSpec,
          appSpec: {} as Arc32AppSpec,
          methodArgs: [
            {
              id: '010a9dc9-2958-4aeb-a23c-bd01fb56d99e',
              type: BuildableTransactionType.Placeholder,
              targetType: algosdk.ABITransactionType.pay,
              methodCallTransactionId: '55199831-a25f-4b60-aff9-2c4f3bf142a2',
            },
            {
              id: 'ff52b40a-6d15-46e7-aa4b-e2c404f47778',
              type: BuildableTransactionType.Placeholder,
              targetType: algosdk.ABITransactionType.appl,
              methodCallTransactionId: '55199831-a25f-4b60-aff9-2c4f3bf142a2',
            },
          ],
          fee: {
            setAutomatically: true,
          },
          validRounds: {
            setAutomatically: true,
          },
        } satisfies BuildMethodCallTransactionResult,
      ]
      const newTransaction = {
        id: 'da968947-d9b4-4849-841b-7d3244a02b32',
        type: BuildableTransactionType.MethodCall,
        applicationId: 1988,
        // method: new algosdk.ABIMethod({
        //   name: 'get_pay_txn_amount',
        //   args: [
        //     {
        //       type: 'pay',
        //       name: 'pay_txn',
        //     },
        //   ],
        //   returns: {
        //     type: 'uint64',
        //   },
        // }),
        method: {} as algosdk.ABIMethod,
        onComplete: 0,
        sender: 'IN6X7QLOJB76VTDHWAW43OTBUGAQ22DVYBPNHLLTJ5RVOTFVTCPK3JY6RA',
        appSpec: {} as Arc32AppSpec,
        methodArgs: [
          {
            id: '71eb7038-d021-4b38-a7a5-42713f100398',
            type: BuildableTransactionType.Placeholder,
            targetType: algosdk.ABITransactionType.pay,
            methodCallTransactionId: 'da968947-d9b4-4849-841b-7d3244a02b32',
          },
        ],
        fee: {
          setAutomatically: true,
        },
        validRounds: {
          setAutomatically: true,
        },
      } satisfies BuildMethodCallTransactionResult

      const results = patchTransactions(previousTransactions, previousTransactions[0].methodArgs[1].id, newTransaction)

      expect(JSON.stringify(results, simlifyResultReplacer, 2)).toMatchInlineSnapshot(`
        "[
          {
            "id": "55199831-a25f-4b60-aff9-2c4f3bf142a2",
            "type": "MethodCall",
            "methodArgs": [
              {
                "id": "010a9dc9-2958-4aeb-a23c-bd01fb56d99e",
                "type": "SatisfiedBy",
                "targetType": "pay",
                "satisfiedById": "71eb7038-d021-4b38-a7a5-42713f100398"
              },
              {
                "id": "da968947-d9b4-4849-841b-7d3244a02b32",
                "type": "MethodCall",
                "methodArgs": [
                  {
                    "id": "71eb7038-d021-4b38-a7a5-42713f100398",
                    "type": "Placeholder",
                    "targetType": "pay",
                    "methodCallTransactionId": "da968947-d9b4-4849-841b-7d3244a02b32"
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
              type: BuildableTransactionType.SatisfiedBy,
              targetType: algosdk.ABITransactionType.pay,
              satisfiedById: idToReplace,
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
                  methodCallTransactionId: 'da968947-d9b4-4849-841b-7d3244a02b32',
                } satisfies PlaceholderTransaction,
              ],
            },
          ],
          fee: {
            setAutomatically: true,
          },
          validRounds: {
            setAutomatically: true,
          },
        } satisfies BuildMethodCallTransactionResult,
      ]

      const newTransaction = {
        id: '7d00ec66-5419-47d1-abc9-8ed1fe3452e8',
        type: BuildableTransactionType.Payment,
        sender: 'IN6X7QLOJB76VTDHWAW43OTBUGAQ22DVYBPNHLLTJ5RVOTFVTCPK3JY6RA',
        receiver: 'IN6X7QLOJB76VTDHWAW43OTBUGAQ22DVYBPNHLLTJ5RVOTFVTCPK3JY6RA',
        amount: 2,
        fee: {
          setAutomatically: true,
        },
        validRounds: {
          setAutomatically: true,
        },
      } as BuildPaymentTransactionResult

      const results = patchTransactions(previousTransactions, idToReplace, newTransaction)

      expect(JSON.stringify(results, simlifyResultReplacer, 2)).toMatchInlineSnapshot(`
        "[
          {
            "id": "55199831-a25f-4b60-aff9-2c4f3bf142a2",
            "type": "MethodCall",
            "methodArgs": [
              {
                "id": "010a9dc9-2958-4aeb-a23c-bd01fb56d99e",
                "type": "SatisfiedBy",
                "targetType": "pay",
                "satisfiedById": "7d00ec66-5419-47d1-abc9-8ed1fe3452e8"
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
              methodCallTransactionId: '55199831-a25f-4b60-aff9-2c4f3bf142a2',
            },
            {
              id: 'ff52b40a-6d15-46e7-aa4b-e2c404f47778',
              type: BuildableTransactionType.Placeholder,
              targetType: algosdk.ABITransactionType.appl,
              methodCallTransactionId: '55199831-a25f-4b60-aff9-2c4f3bf142a2',
            },
          ],
        } satisfies BuildMethodCallTransactionResult,
      ]
      const newTransaction = {
        id: '7d00ec66-5419-47d1-abc9-8ed1fe3452e8',
        type: BuildableTransactionType.Payment,
        sender: 'IN6X7QLOJB76VTDHWAW43OTBUGAQ22DVYBPNHLLTJ5RVOTFVTCPK3JY6RA',
        receiver: 'IN6X7QLOJB76VTDHWAW43OTBUGAQ22DVYBPNHLLTJ5RVOTFVTCPK3JY6RA',
        amount: 2,
        fee: {
          setAutomatically: true,
        },
        validRounds: {
          setAutomatically: true,
        },
      } as BuildPaymentTransactionResult

      const results = patchTransactions(previousTransactions, idToReplace, newTransaction)

      expect(JSON.stringify(results, simlifyResultReplacer, 2)).toMatchInlineSnapshot(`
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
                "targetType": "appl",
                "methodCallTransactionId": "55199831-a25f-4b60-aff9-2c4f3bf142a2"
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
              methodCallTransactionId: '55199831-a25f-4b60-aff9-2c4f3bf142a2',
            },
          ],
          fee: {
            setAutomatically: true,
          },
          validRounds: {
            setAutomatically: true,
          },
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
            methodCallTransactionId: 'da968947-d9b4-4849-841b-7d3244a02b32',
          },
        ],
      } satisfies BuildMethodCallTransactionResult

      const results = patchTransactions(previousTransactions, idToReplace, newTransaction)

      expect(JSON.stringify(results, simlifyResultReplacer, 2)).toMatchInlineSnapshot(`
        "[
          {
            "id": "55199831-a25f-4b60-aff9-2c4f3bf142a2",
            "type": "MethodCall",
            "methodArgs": [
              {
                "id": "7d00ec66-5419-47d1-abc9-8ed1fe3452e8",
                "type": "SatisfiedBy",
                "targetType": "pay",
                "satisfiedById": "71eb7038-d021-4b38-a7a5-42713f100398"
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
    it('can change nestedMethod - method(myPay,nestedMethod(myPay))void', () => {
      const idToReplace = 'da968947-d9b4-4849-841b-7d3244a02b32'
      const previousTransactions = [
        {
          ...exampleMethodCallProperties,
          id: '55199831-a25f-4b60-aff9-2c4f3bf142a2',
          type: BuildableTransactionType.MethodCall,
          methodArgs: [
            {
              id: '7d00ec66-5419-47d1-abc9-8ed1fe3452e8',
              type: BuildableTransactionType.SatisfiedBy,
              targetType: algosdk.ABITransactionType.pay,
              satisfiedById: '71eb7038-d021-4b38-a7a5-42713f100398',
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

      expect(JSON.stringify(results, simlifyResultReplacer, 2)).toMatchInlineSnapshot(`
        "[
          {
            "id": "55199831-a25f-4b60-aff9-2c4f3bf142a2",
            "type": "MethodCall",
            "methodArgs": [
              {
                "id": "7d00ec66-5419-47d1-abc9-8ed1fe3452e8",
                "type": "Placeholder",
                "targetType": "pay",
                "methodCallTransactionId": "55199831-a25f-4b60-aff9-2c4f3bf142a2"
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
})

const simlifyResultReplacer = (key: string, value: unknown) => {
  if (
    key &&
    isNaN(parseInt(key, 10)) &&
    !['id', 'type', 'methodArgs', 'targetType', 'satisfiedById', 'methodCallTransactionId'].includes(key)
  ) {
    return undefined
  }
  return value
}
