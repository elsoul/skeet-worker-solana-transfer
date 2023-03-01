import * as dotenv from 'dotenv'
dotenv.config()
import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import { getOrCreateAssociatedTokenAccount, transfer } from '@solana/spl-token'
import { sleep } from '@/utils/time'
import { getTokenPrice } from '@/lib/birdeyeApi'
import { createCloudTask } from '@/lib/createCloudTask'

export type ResponseParam = {
  toAddressPubkey: string
  fromAddressPubkey: string
  amountLamport: number
  tokenMintAddress: string
  signature: string
  usdcPrice: number
  timestamp: string
}

const FROM_WALLET_SECRET_KEY_STRING =
  process.env.FROM_WALLET_SECRET_KEY_STRING || ''

const SKEET_CLOUD_TASK_QUEUE = 'skeet-api-return-post'
const SKEET_MUTATION_NAME = 'solanaTokenTransferResult'
const DEFAULT_RPC_URL = 'https://api.devnet.solana.com'

export const tokenTransfer = async (
  toAddressPubkey: string,
  transferAmountLamport: number,
  tokenMintAddress: string,
  rpcUrl: string = DEFAULT_RPC_URL
) => {
  try {
    const connection = new Connection(rpcUrl, 'confirmed')
    const fromWalletKey = FROM_WALLET_SECRET_KEY_STRING.split(',').map((i) =>
      Number(i)
    )
    const fromWallet = Keypair.fromSecretKey(
      new Uint8Array(Array.from(fromWalletKey))
    )
    const toWallet = new PublicKey(toAddressPubkey)
    const mint = new PublicKey(tokenMintAddress)
    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      fromWallet,
      mint,
      fromWallet.publicKey,
      true,
      'confirmed',
      {
        maxRetries: 5,
      }
    )
    await sleep(1000)
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      fromWallet,
      mint,
      toWallet,
      true,
      'confirmed',
      {
        maxRetries: 5,
      }
    )

    await sleep(1000)
    const signature = await transfer(
      connection,
      fromWallet,
      fromTokenAccount.address,
      toTokenAccount.address,
      fromWallet.publicKey,
      transferAmountLamport,
      [],
      {
        maxRetries: 5,
      }
    )
    const priceData = await getTokenPrice(tokenMintAddress)
    const responseParam: ResponseParam = {
      toAddressPubkey: String(toTokenAccount.address),
      fromAddressPubkey: String(fromTokenAccount.address),
      amountLamport: transferAmountLamport,
      tokenMintAddress,
      signature,
      usdcPrice: priceData.price,
      timestamp: priceData.timestamp,
    }

    await createCloudTask(
      SKEET_CLOUD_TASK_QUEUE,
      SKEET_MUTATION_NAME,
      responseParam
    )
    return responseParam
  } catch (error) {
    console.log(`solanaTokenTransfer: ${error}`)
    throw new Error(JSON.stringify(error))
  }
}
