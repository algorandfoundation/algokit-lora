import { atom, useAtom, useAtomValue, useStore } from 'jotai'
import { atomEffect } from 'jotai-effect'
import { AlgorandSubscriber } from '@algorandfoundation/algokit-subscriber'
// import { BlockMetadata } from '@algorandfoundation/algokit-subscriber/types/subscription'
import { Buffer } from 'buffer'
import { algod } from '../common/data'
import { loadable } from 'jotai/utils'
import { useMemo } from 'react'
import { transactionsAtom } from '../transactions/data'

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

const useBlockAtom = (round: number) => {
  const store = useStore()

  return useMemo(() => {
    const syncEffect = atomEffect((get, set) => {
      ;(async () => {
        try {
          const block = await get(blockAtom)
          set(blocksAtom, (prev) => {
            return prev.concat(block)
          })
        } catch (e) {
          // Ignore any errors as there is nothing to sync
        }
      })()
    })
    const blockAtom = atom((get) => {
      // store.get prevents the atom from being subscribed to changes in transactionsAtom
      const blocks = store.get(blocksAtom)
      const block = blocks.find((t) => t.round === round)
      if (block) {
        return block
      }

      get(syncEffect)

      return algod
        .block(round)
        .do()
        .then((result) => {
          return {
            round: result.block!.rnd as number,
            parentTransactionCount: (result.block!.txns?.length as number) ?? 0,
          } satisfies BlockMetadata
        })
    })
    return blockAtom
  }, [store, round])
}

export const useLoadableBlock = (round: number) => {
  return useAtomValue(
    // Unfortunately we can't leverage Suspense here, as react doesn't support async useMemo inside the Suspense component
    // https://github.com/facebook/react/issues/20877
    loadable(useBlockAtom(round))
  )
}
