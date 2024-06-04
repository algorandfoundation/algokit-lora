import { vi } from 'vitest'
import algosdk from 'algosdk'
import { PROVIDER_ID, useWallet } from '@txnlab/use-wallet'

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useParams: vi.fn(),
  useNavigate: vi.fn(),
}))

vi.mock('@algorandfoundation/algokit-utils', async () => ({
  ...(await vi.importActual('@algorandfoundation/algokit-utils')),
  getAlgoIndexerClient: vi.fn(),
  getAlgoClient: vi.fn(),
  lookupTransactionById: vi.fn(),
}))

vi.mock('@/features/common/data', async () => {
  const original = (await vi.importActual('@/features/common/data')) satisfies { algod: algosdk.Algodv2; indexer: algosdk.Indexer }
  return {
    ...original,
    algod: {
      ...(original.algod as algosdk.Algodv2),
      disassemble: vi.fn().mockReturnValue({
        do: vi.fn(),
      }),
      getAssetByID: vi.fn().mockReturnValue({
        do: vi.fn().mockReturnValue({ then: vi.fn() }),
      }),
      accountInformation: vi.fn().mockReturnValue({
        do: vi.fn().mockReturnValue({ then: vi.fn() }),
      }),
      getApplicationByID: vi.fn().mockReturnValue({
        do: vi.fn().mockReturnValue({ then: vi.fn() }),
      }),
    },
    indexer: {
      ...(original.indexer as algosdk.Indexer),
      lookupBlock: vi.fn().mockReturnValue({
        do: vi.fn(),
      }),
      lookupAssetByID: vi.fn().mockReturnValue({
        includeAll: vi.fn().mockReturnValue({
          do: vi.fn().mockReturnValue({ then: vi.fn() }),
        }),
      }),
      searchForTransactions: vi.fn().mockReturnValue({
        assetID: vi.fn().mockReturnValue({
          txType: vi.fn().mockReturnValue({
            do: vi.fn().mockReturnValue({ then: vi.fn() }),
            address: vi.fn().mockReturnValue({
              addressRole: vi.fn().mockReturnValue({
                limit: vi.fn().mockReturnValue({
                  do: vi.fn().mockReturnValue({ then: vi.fn() }),
                }),
              }),
            }),
          }),
        }),
        applicationID: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            do: vi.fn().mockReturnValue({ then: vi.fn() }),
          }),
        }),
      }),
      lookupApplications: vi.fn().mockReturnValue({
        includeAll: vi.fn().mockReturnValue({
          do: vi.fn().mockReturnValue({ then: vi.fn() }),
        }),
      }),
      searchForApplicationBoxes: vi.fn().mockReturnValue({
        nextToken: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            do: vi.fn().mockReturnValue({ then: vi.fn() }),
          }),
        }),
      }),
    },
  }
})

vi.mock('@txnlab/use-wallet', async () => {
  const original = await vi.importActual<{ useWallet: () => ReturnType<typeof useWallet> }>('@txnlab/use-wallet')
  return {
    ...original,
    useWallet: vi.fn().mockImplementation(() => {
      return {
        ...original.useWallet(),
        providers: [
          {
            metadata: {
              id: PROVIDER_ID.PERA,
              name: 'Pera',
              icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNzcgMTg3Ij48cmVjdCB4PSItMTEuMzgiIHk9Ii0yNS45NyIgd2lkdGg9IjIwMC4wMiIgaGVpZ2h0PSIyMzEuNTMiIHN0eWxlPSJmaWxsOiNmZTU7Ii8+PHBhdGggZD0iTTk0LjA1LDU5LjYxYzIuMDUsOC40OCwxLjM2LDE1Ljk0LTEuNTUsMTYuNjYtMi45LC43Mi02LjkxLTUuNTctOC45Ni0xNC4wNS0yLjA1LTguNDgtMS4zNi0xNS45NCwxLjU1LTE2LjY2LDIuOS0uNzIsNi45MSw1LjU3LDguOTYsMTQuMDVaIiBzdHlsZT0iZmlsbDojMWMxYzFjOyIvPjxwYXRoIGQ9Ik0xMjcuODUsNjYuOWMtNC41My00LjgxLTEzLjU1LTMuNS0yMC4xNSwyLjkxLTYuNTksNi40MS04LjI2LDE1LjUtMy43MywyMC4zMSw0LjUzLDQuOCwxMy41NSwzLjUsMjAuMTUtMi45MXM4LjI2LTE1LjUsMy43My0yMC4zMVoiIHN0eWxlPSJmaWxsOiMxYzFjMWM7Ii8+PHBhdGggZD0iTTkxLjc5LDE0MC40N2MyLjktLjcyLDMuNDktOC42LDEuMzItMTcuNjEtMi4xNy05LTYuMjktMTUuNzEtOS4xOS0xNC45OS0yLjksLjcyLTMuNDksOC42LTEuMzIsMTcuNjEsMi4xNyw5LDYuMjksMTUuNzEsOS4xOSwxNC45OVoiIHN0eWxlPSJmaWxsOiMxYzFjMWM7Ii8+PHBhdGggZD0iTTYyLjIyLDcxLjNjOC4zNywyLjQ3LDE0LjQ4LDYuOCwxMy42Niw5LjY3LS44MywyLjg3LTguMjgsMy4yLTE2LjY1LC43My04LjM3LTIuNDctMTQuNDgtNi44LTEzLjY2LTkuNjcsLjgzLTIuODcsOC4yOC0zLjIsMTYuNjUtLjczWiIgc3R5bGU9ImZpbGw6IzFjMWMxYzsiLz48cGF0aCBkPSJNMTE2LjU0LDEwMy43NGM4Ljg4LDIuNjIsMTUuNDEsNy4wNywxNC41OSw5Ljk0LS44MywyLjg3LTguNywzLjA4LTE3LjU4LC40Ni04Ljg4LTIuNjItMTUuNDEtNy4wNy0xNC41OS05Ljk0LC44My0yLjg3LDguNy0zLjA4LDE3LjU4LS40NloiIHN0eWxlPSJmaWxsOiMxYzFjMWM7Ii8+PHBhdGggZD0iTTcxLjY0LDk3LjcxYy0yLjA4LTIuMTUtOC44OCwuOTgtMTUuMiw2Ljk5LTYuMzIsNi4wMS05Ljc2LDEyLjYzLTcuNjksMTQuNzgsMi4wOCwyLjE1LDguODgtLjk4LDE1LjItNi45OSw2LjMyLTYuMDEsOS43Ni0xMi42Myw3LjY5LTE0Ljc4WiIgc3R5bGU9ImZpbGw6IzFjMWMxYzsiLz48L3N2Zz4=',
              isWalletConnect: true,
            },
          },
        ],
      }
    }),
  }
})

vi.mock('@/features/blocks/data', async () => {
  const original = await vi.importActual('@/features/blocks/data')
  return {
    ...original,
    useSubscribeToBlocksEffect: vi.fn(),
  }
})

global.fetch = vi.fn()
global.HTMLCanvasElement.prototype.getContext = () => {
  return {
    fillStyle: 'ok',
    fillRect: vi.fn(),
  } as unknown as null // Hack so we don't need to implement the whole CanvasRenderingContext2D
}

vi.mock('@tauri-apps/api/event', async () => {
  const original = await vi.importActual('@tauri-apps/api/event')
  return {
    ...original,
    listen: vi.fn(),
  }
})
