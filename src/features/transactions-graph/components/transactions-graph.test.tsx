import { transactionResultMother } from '@/tests/object-mother/transaction-result'
import { describe, expect, it, vi } from 'vitest'
import { executeComponentTest } from '@/tests/test-component'
import { render, prettyDOM } from '@/tests/testing-library'
import { asAppCallTransaction, asAssetTransferTransaction, asPaymentTransaction, asTransaction } from '../../transactions/mappers'
import { AssetResult, TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { assetResultMother } from '@/tests/object-mother/asset-result'
import { useParams } from 'react-router-dom'
import { asAssetSummary } from '@/features/assets/mappers/asset-summary'
import { TransactionsGraph } from './transactions-graph'
import { asKeyRegTransaction } from '../../transactions/mappers/key-reg-transaction-mappers'
import { asGroup } from '@/features/groups/mappers'
import { groupResultMother } from '@/tests/object-mother/group-result'
import { algoAssetResult } from '@/features/assets/data'
import { atom } from 'jotai'
import { invariant } from '@/utils/invariant'
import { asTransactionsGraphData } from '@/features/transactions-graph/mappers'
import { Atom } from 'jotai/index'
import { AbiMethod } from '@/features/abi-methods/models'
import { setTimeout } from 'timers/promises'
import { GroupId, GroupResult } from '@/features/groups/data/types'
import { Round } from '@/features/blocks/data/types'

// This file maintain the snapshot test for the TransactionViewVisual component
// To add new test case:
//   - Add a new object to the object mother
//   - Add the new object into the list of items of describe.each
// To update a snapshot:
//   - Make the code changes in TransactionViewVisual
//   - The snapshot tests will fail
//   - Visually inspect (by viewing in the browser) each transaction in the describe.each list and make sure that they are rendered correctly with the new code changes
//   - Update the snapshot files by running `vitest -u`. Or if the test runner is running, press `u` to update the snapshots.

const prettyDomMaxLength = 200000

describe('payment-transaction-graph', () => {
  describe.each([
    transactionResultMother['mainnet-FBORGSDC4ULLWHWZUMUFIYQLSDC26HGLTFD7EATQDY37FHCIYBBQ']().build(),
    transactionResultMother['mainnet-ILDCD5Z64CYSLEZIHBG5DVME2ITJI2DIVZAPDPEWPCYMTRA5SVGA']().build(),
  ])('when rendering transaction $id', (transactionResult: TransactionResult) => {
    it('should match snapshot', () => {
      const model = asPaymentTransaction(transactionResult)
      const graphData = asTransactionsGraphData([model])
      return executeComponentTest(
        () => render(<TransactionsGraph transactionsGraphData={graphData} downloadable={true} />),
        async (component) => {
          expect(prettyDOM(component.container, prettyDomMaxLength, { highlight: false })).toMatchFileSnapshot(
            `__snapshots__/payment-transaction-graph.${transactionResult.id}.html`
          )
        }
      )
    })
  })
})

describe('asset-transfer-transaction-graph', () => {
  describe.each([
    {
      transactionResult: transactionResultMother['mainnet-JBDSQEI37W5KWPQICT2IGCG2FWMUGJEUYYK3KFKNSYRNAXU2ARUA']().build(),
      assetResult: assetResultMother['mainnet-523683256']().build(),
    },
    {
      transactionResult: transactionResultMother['mainnet-563MNGEL2OF4IBA7CFLIJNMBETT5QNKZURSLIONJBTJFALGYOAUA']().build(),
      assetResult: assetResultMother['mainnet-312769']().build(),
    },
  ])(
    'when rendering transaction $transactionResult.id',
    ({ transactionResult, assetResult }: { transactionResult: TransactionResult; assetResult: AssetResult }) => {
      it('should match snapshot', () => {
        const assetResolver = createAssetResolver([assetResult])
        const transaction = asAssetTransferTransaction(transactionResult, assetResolver)
        const graphData = asTransactionsGraphData([transaction])
        return executeComponentTest(
          () => render(<TransactionsGraph transactionsGraphData={graphData} downloadable={true} />),
          async (component) => {
            expect(prettyDOM(component.container, prettyDomMaxLength, { highlight: false })).toMatchFileSnapshot(
              `__snapshots__/asset-transfer-graph.${transaction.id}.html`
            )
          }
        )
      })
    }
  )
})

describe('application-call-graph', () => {
  describe.each([
    {
      transactionResult: transactionResultMother['mainnet-KMNBSQ4ZFX252G7S4VYR4ZDZ3RXIET5CNYQVJUO5OXXPMHAMJCCQ']().build(),
      assetResults: [],
    },
    {
      transactionResult: transactionResultMother['mainnet-WYEGSIGWZHTR6VYXC3EXFGZQHYKI6FQOZU2DOKHQCAWYEIHJBKEA']().build(),
      assetResults: [assetResultMother['mainnet-1284444444']().build()],
    },
    {
      transactionResult: transactionResultMother['mainnet-INDQXWQXHF22SO45EZY7V6FFNI6WUD5FHRVDV6NCU6HD424BJGGA']().build(),
      assetResults: [
        assetResultMother['mainnet-31566704']().build(),
        assetResultMother['mainnet-386195940']().build(),
        assetResultMother['mainnet-408898501']().build(),
      ],
    },
    {
      transactionResult: transactionResultMother['testnet-DX64C5POMYLPSMOZVQZWF5VJ7RW27THYBUGKNH5T4A5D2KAFHZCQ']().build(),
      assetResults: [],
    },
    {
      transactionResult: transactionResultMother['mainnet-XVVC7UDLCPI622KCJZLWK3SEAWWVUEPEXUM5CO3DFLWOBH7NOPDQ']().build(),
      assetResults: [assetResultMother['mainnet-850924184']().build()],
    },
    {
      transactionResult: transactionResultMother['mainnet-GYZT5MEYJKR35U7CL3NUFCJVSAWBOQITRB3S5IQS2TWBZPD7E34A']().build(),
      assetResults: [assetResultMother['mainnet-847594689']().build()],
    },
    {
      transactionResult: transactionResultMother['mainnet-CF6HEO6Z5UZIPCUXTIAGUHHDV7W4FCZG5WPKUGU3BIJYF6X6SPYA']().build(),
      assetResults: [assetResultMother['mainnet-880903652']().build()],
    },
  ])(
    'when rendering transaction $transactionResult.id',
    ({ transactionResult, assetResults }: { transactionResult: TransactionResult; assetResults: AssetResult[] }) => {
      it('should match snapshot', () => {
        vi.mocked(useParams).mockImplementation(() => ({ transactionId: transactionResult.id }))

        const model = asAppCallTransaction(
          transactionResult,
          createAssetResolver(assetResults),
          createAbiMethodResolver(),
          createGroupResolver()
        )
        const graphData = asTransactionsGraphData([model])
        return executeComponentTest(
          () => render(<TransactionsGraph transactionsGraphData={graphData} downloadable={true} />),
          async (component) => {
            // Sleep to make sure the ABI method is loaded
            await setTimeout(10)
            expect(prettyDOM(component.container, prettyDomMaxLength, { highlight: false })).toMatchFileSnapshot(
              `__snapshots__/application-transaction-graph.${transactionResult.id}.html`
            )
          }
        )
      })
    }
  )
})

describe('key-reg-graph', () => {
  describe.each([
    {
      transactionResult: transactionResultMother['mainnet-VE767RE4HGQM7GFC7MUVY3J67KOR5TV34OBTDDEQTDET2UFM7KTQ']().build(),
    },
  ])('when rendering transaction $transactionResult.id', ({ transactionResult }: { transactionResult: TransactionResult }) => {
    it('should match snapshot', () => {
      vi.mocked(useParams).mockImplementation(() => ({ transactionId: transactionResult.id }))
      const model = asKeyRegTransaction(transactionResult)
      const graphData = asTransactionsGraphData([model])
      return executeComponentTest(
        () => render(<TransactionsGraph transactionsGraphData={graphData} downloadable={true} />),
        async (component) => {
          expect(prettyDOM(component.container, prettyDomMaxLength, { highlight: false })).toMatchFileSnapshot(
            `__snapshots__/key-reg-graph.${transactionResult.id}.html`
          )
        }
      )
    })
  })
})

describe('group-graph', () => {
  describe.each([
    {
      groupId: '/oRSr2uMFemQhwQliJO18b64Nl1QIkjA39ZszRCeSCI=',
      transactionResults: [
        transactionResultMother['mainnet-INDQXWQXHF22SO45EZY7V6FFNI6WUD5FHRVDV6NCU6HD424BJGGA']().build(),
        transactionResultMother['mainnet-7VSN7QTNBT7X4V5JH2ONKTJYF6VSQSE2H5J7VTDWFCJGSJED3QUA']().build(),
      ],
      assetResults: [
        assetResultMother['mainnet-31566704']().build(),
        assetResultMother['mainnet-386195940']().build(),
        assetResultMother['mainnet-408898501']().build(),
        algoAssetResult,
      ],
    },
    {
      // Clawback scenario 1
      groupId: 'S5gujlpPmhvXROKCHG5mEOKBUBux7G+uVA4M17N8Ogo=',
      transactionResults: [
        transactionResultMother['testnet-YXQOFAL4ZROWRYEUFXSSVUT25JFB4CH3XCQH7UYW7NJQY625PIJA']().build(),
        transactionResultMother['testnet-GPUOT5Y5MTR6HXT5GYUDFOGKQOU6E536BRFXY5JMNLVHM2OT4K4Q']().build(),
        transactionResultMother['testnet-WVXEZHZCUA23S2H4WATQKA7DFXA4NWWUCDAQTNMARR7MUUVSKSBQ']().build(),
        transactionResultMother['testnet-ORSVPJSAFWFOQRNBCECVDLRGWZBI76U2Q6IL7EI6RP6NEPGYAWMQ']().build(),
      ],
      assetResults: [assetResultMother['testnet-705735468']().build(), algoAssetResult],
    },
    {
      // Clawback scenario 2
      groupId: '+Rd88080lmrfzu8EX6pntMRcOvv8AZOpxpQB1wr1h2Y=',
      transactionResults: [
        transactionResultMother['testnet-K7TNWCBB5PYBX5OVSYPSD3VCKD4BYLRHWG43KWJ7JOJ7Z6UFUFWQ']().build(),
        transactionResultMother['testnet-44PALBEBH652BYUIT7SZF5PFWJ7KYSBFJYOPSLYX6KM3G47P53VA']().build(),
        transactionResultMother['testnet-23RVHEI5OQZWQ5D6NNLOVOKA7LFKSUZEWEWEBDNCBI5GY4HPZS5A']().build(),
        transactionResultMother['testnet-7XSI3OKXOEHSGVUZDTIYWGBKU3G65XZPRLNCFGNYH3SJWGXVR3AQ']().build(),
      ],
      assetResults: [assetResultMother['testnet-705736233']().build(), algoAssetResult],
    },
    {
      // Clawback scenario 3
      groupId: 'TYEjlEMFUb8dX+OtWME7k0nvN1+L77djDllXHRqz8fo=',
      transactionResults: [
        transactionResultMother['testnet-QIMCXEMIV2LNX5RJMYWM4UQTJAUSJE5GGJAOE5NCTQ3BOSQ5MJMA']().build(),
        transactionResultMother['testnet-DDXYDL7EYTQRHH4G3SSZHT4HUZNBND24PDDNTF2VR73QBK4SL7AQ']().build(),
        transactionResultMother['testnet-26TWK7B27JHHI6OAKTIXNBTC2IAUUPCUUHCYHD7P5B57X7BUJJKQ']().build(),
      ],
      assetResults: [assetResultMother['testnet-705736805']().build(), algoAssetResult],
    },
  ])(
    'when rendering group $groupId',
    ({
      groupId,
      transactionResults,
      assetResults,
    }: {
      groupId: string
      transactionResults: TransactionResult[]
      assetResults: AssetResult[]
    }) => {
      it('should match snapshot', () => {
        const assetResolver = createAssetResolver(assetResults)
        const transactions = transactionResults.map((t) => asTransaction(t, assetResolver, createAbiMethodResolver()))
        const groupResult = groupResultMother.groupWithTransactions(transactionResults).withId(groupId).build()

        const group = asGroup(groupResult, transactions)
        const graphData = asTransactionsGraphData(group.transactions)

        return executeComponentTest(
          () => render(<TransactionsGraph transactionsGraphData={graphData} downloadable={true} />),
          async (component) => {
            // Sleep to make sure the ABI method is loaded
            await setTimeout(10)

            expect(prettyDOM(component.container, prettyDomMaxLength, { highlight: false })).toMatchFileSnapshot(
              `__snapshots__/group-graph.${encodeURIComponent(groupId)}.html`
            )
          }
        )
      })
    }
  )
})

const createAssetResolver = (assetResults: AssetResult[]) => (assetId: number) => {
  const assetResult = assetResults.find((a) => a.index === assetId)
  invariant(assetResult, `Could not find asset result ${assetId}`)
  return atom(() => asAssetSummary(assetResult))
}

const createAbiMethodResolver =
  () =>
  (_: TransactionResult): Atom<Promise<AbiMethod | undefined>> => {
    return atom(() => Promise.resolve(undefined))
  }

const createGroupResolver =
  () =>
  (_: GroupId, __: Round): Atom<Promise<GroupResult>> => {
    return atom(() => Promise.resolve(undefined as unknown as GroupResult))
  }
