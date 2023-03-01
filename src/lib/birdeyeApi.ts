import fetch from 'node-fetch'

const BIRDEYE_URL = 'https://public-api.birdeye.so/public'

export type TokenPrice = {
  price: number
  timestamp: string
}

export const getTokenPrice = async (tokenMintAddress: string) => {
  try {
    const query = new URLSearchParams({
      address: tokenMintAddress,
    })
    const queryString = String(query)
    const res = await fetch(`${BIRDEYE_URL}/price?${queryString}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    let tokenPrice: TokenPrice = {
      price: 0,
      timestamp: '',
    }

    if (res.status === 200) {
      const data = JSON.stringify(await res.json())
      const price = JSON.parse(data)
      tokenPrice = {
        price: price.data.value,
        timestamp: price.data.updateHumanTime,
      }
      return tokenPrice
    } else {
      return tokenPrice
    }
  } catch (e) {
    console.log({ e })
    let tokenPrice: TokenPrice = {
      price: 0,
      timestamp: '',
    }
    return tokenPrice
  }
}
