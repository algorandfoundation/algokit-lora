import { atom, useAtom, useAtomValue } from 'jotai'
import { atomEffect } from 'jotai-effect'
import { transactionsAtom } from '@/features/transactions/data'
import { AlgorandSubscriber } from '@algorandfoundation/algokit-subscriber'
// import { BlockMetadata } from '@algorandfoundation/algokit-subscriber/types/subscription'
import { Buffer } from 'buffer'
import { algod } from '../common/data'

type BlockMetadata = {
  round: number
  parentTransactionCount: number
}

// TODO: NC - Remove once https://github.com/algorandfoundation/algokit-subscriber-ts/pull/49 is merged
window.Buffer = Buffer

const syncedRoundAtom = atom<number | undefined>(undefined)

// TODO: Size should be capped at some limit, so memory usage doesn't grow indefinitely
const blocksAtom = atom<BlockMetadata[]>([])

const latestBlockAtom = atom((get) => {
  return get(blocksAtom).slice(0, 5)
})

const subscribeToBlocksEffect = atomEffect((get, set) => {
  const subscriber = new AlgorandSubscriber(
    {
      filters: [
        {
          name: 'all-transactions',
          filter: {
            customFilter: () => true,
          },
        },
      ],
      maxRoundsToSync: 1,
      waitForBlockWhenAtTip: true,
      syncBehaviour: 'skip-sync-newest',
      watermarkPersistence: {
        get: async () => get(syncedRoundAtom) ?? 0,
        set: async (watermark) => {
          set(syncedRoundAtom, watermark)
        },
      },
    },
    algod
  )

  subscriber.onPoll(async (result) => {
    // TODO: NC - Add this back in once subscriber supports it
    // const blocks = result.blockMetadata
    const blocks = [
      {
        round: result.syncedRoundRange[0],
        parentTransactionCount: result.subscribedTransactions.length,
      } satisfies BlockMetadata,
    ]

    if (blocks) {
      set(blocksAtom, (previous) => {
        return blocks.concat(previous)
      })
    }

    set(transactionsAtom, (previous) => {
      return result.subscribedTransactions.concat(previous)
    })
  })

  subscriber.start()

  return async () => {
    await subscriber.stop('unmounted')
  }
})

export const useSubscribeToBlocksEffect = () => {
  useAtom(subscribeToBlocksEffect)
}

export const useLatestBlocks = () => {
  return useAtomValue(latestBlockAtom)
}
