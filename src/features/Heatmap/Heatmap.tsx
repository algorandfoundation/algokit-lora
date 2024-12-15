import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Plot from 'react-plotly.js'

const indexerUrl = 'https://mainnet-idx.algonode.cloud'

interface TokenBalance {
  address: string
  amount: string
}

const Heatmap: React.FC = () => {
  const [topWallets, setTopWallets] = useState<TokenBalance[]>([])
  const [assetId, setAssetId] = useState<number>(1691271561)
  const [inputAssetId, setInputAssetId] = useState<string>('1691271561')

  const fontConfig = {
    family: 'Arial, sans-serif',
    size: 12,
    color: '#ffffff',
    weight: 400,
    shadow: '0'
  }

  const fetchTokenBalances = async (assetId: number): Promise<TokenBalance[]> => {
    let balances: TokenBalance[] = []
    let nextToken: string | null = ''
    
    while (nextToken !== null) {
      try {
        const url = `${indexerUrl}/v2/assets/${assetId}/balances`
        const params: { next?: string } = nextToken ? { next: nextToken } : {}
        const response = await axios.get(url, { params })
        const data = response.data

        balances = [...balances, ...data.balances]
        nextToken = data['next-token'] || null
      } catch {
        nextToken = null
      }
    }

    return balances
  }

  useEffect(() => {
    const getBalances = async () => {
      const balances = await fetchTokenBalances(assetId)
      setTopWallets(balances)
    }

    getBalances()
  }, [assetId])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsedAssetId = parseInt(inputAssetId, 10)
    if (!isNaN(parsedAssetId)) {
      setAssetId(parsedAssetId)
    }
  }

  const showHeatmap = () => {
    const N = 50
    const sortedWallets = topWallets
      .map((wallet) => ({ ...wallet, amount: parseFloat(wallet.amount) }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, N)

    const normalizedAmounts = sortedWallets.map((wallet) => Math.log10(wallet.amount + 1))
    const rows = 5
    const cols = 10

    const heatmapData = Array.from({ length: rows }, (_, rowIndex) =>
      normalizedAmounts.slice(rowIndex * cols, (rowIndex + 1) * cols)
    )
    return (
      <div className="mb-10">
        <Plot
          data={[{
            z: heatmapData as number[][],
            type: 'heatmap',
            colorscale: 'YlOrRd',
            colorbar: {
              title: 'Token Amount',
              titlefont: { ...fontConfig },
            },
          }]}
          layout={{
            title: `Token Distribution Heatmap for ASA ${assetId} (Mainnet)`,
            xaxis: { 
              title: 'Wallet Column Index', 
              titlefont: { ...fontConfig, size: 14 }, 
              tickfont: { ...fontConfig } 
            },
            yaxis: { 
              title: 'Wallet Row Index', 
              titlefont: { ...fontConfig, size: 14 }, 
              tickfont: { ...fontConfig } 
            },
            margin: { l: 40, r: 40, t: 80, b: 100 },
            width: 1100,
            height: 680,
            paper_bgcolor: '#001324',
            plot_bgcolor: '#001324',
            font: { ...fontConfig },
            titlefont: { ...fontConfig, size: 14 },
          }}
        />
      </div>
    )
  }

  const showBubbleChart = () => {
    const N = 50
    const sortedWallets = topWallets
      .map((wallet) => ({ ...wallet, amount: parseFloat(wallet.amount) }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, N)

    const maxAmount = Math.max(...sortedWallets.map((wallet) => wallet.amount))
    const bubbleData = sortedWallets.map((wallet, index) => ({
      walletIndex: (index + 1).toString(),
      amount: wallet.amount / maxAmount * 100,
    }))

    return (
      <div className="mb-10">
        <Plot
          data={[{
            x: bubbleData.map((_, index) => index + 1),
            y: bubbleData.map((data) => data.amount),
            text: bubbleData.map(
              (wallet) => `Wallet Index: ${wallet.walletIndex}<br>Token Amount: ${wallet.amount.toFixed(2)}`
            ),
            mode: 'markers',
            marker: {
              size: bubbleData.map((data) => data.amount / 2),
              color: bubbleData.map((data) => data.amount),
              colorscale: 'Viridis',
              showscale: true,
              colorbar: {
                title: 'Token Amount',
                titlefont: { ...fontConfig },
              },
            },
          }]}
          layout={{
            title: `Whale Asset vs Small Wallets for ASA ${assetId}`,
            xaxis: { 
              title: 'Wallet Index (Sorted by Amount)', 
              titlefont: { ...fontConfig, size: 14 }, 
              tickfont: { ...fontConfig } 
            },
            yaxis: { 
              title: 'Token Amount (Normalized)', 
              titlefont: { ...fontConfig, size: 14 }, 
              tickfont: { ...fontConfig } 
            },
            margin: { l: 40, r: 40, t: 80, b: 100 },
            width: 1100,
            height: 680,
            paper_bgcolor: '#001324', 
            plot_bgcolor: '#001f3b',
            titlefont: { ...fontConfig, size: 14 }, 
            font: { ...fontConfig },
          }}
        />
      </div>
    )
  }

  return (
    <div className="flex max-h-screen flex-col overflow-y-auto p-5">
      <form onSubmit={handleSearchSubmit} className="mb-5 flex items-center">
        <input
          type="text"
          value={inputAssetId}
          onChange={(e) => setInputAssetId(e.target.value)}
          placeholder="Enter Asset ID"
          className="mr-2 w-52 rounded-md border border-gray-300 p-2 text-lg"
        />
        <button 
          type="submit" 
          className="rounded-md bg-blue-600 px-4 py-2 text-lg text-white transition hover:bg-blue-700"
        >
          Search
        </button>
      </form>
      {showHeatmap()}
      {showBubbleChart()}
    </div>
  )
}

export default Heatmap