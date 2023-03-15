import * as dotenv from 'dotenv'
dotenv.config()
import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import { getOrCreateAssociatedTokenAccount, transfer } from '@solana/spl-token'
import { sleep } from '@/utils/time'
import { getTokenPrice } from '@/lib/birdeyeApi'
import { createCloudTask, sendPost } from '@/lib/createCloudTask'
import { decrypt } from '@/lib/crypto'
import {
  SolanaTransferParam,
  SolanaTransferResponseParam,
} from '@/types/api/SolanaTransferParam'

const SKEET_CLOUD_TASK_QUEUE = 'skeet-api-return-post'

export const splTokenTransfer = async (params: SolanaTransferParam) => {
  try {
    const LAMPORTS_PER_SPL_TOKEN = 10 ** params.decimal
    const connection = new Connection(params.rpcUrl, 'confirmed')
    const decodedFromSecretKeyString = await decrypt(
      params.encodedFromSecretKeyString,
      Buffer.from(params.iv, 'base64')
    )

    const fromWalletKey = decodedFromSecretKeyString
      .split(',')
      .map((i: string) => Number(i))
    const fromWallet = Keypair.fromSecretKey(
      new Uint8Array(Array.from(fromWalletKey))
    )
    const toWallet = new PublicKey(params.toAddressPubkey)
    const mint = new PublicKey(params.tokenMintAddress)
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
      params.transferAmountLamport,
      [],
      {
        maxRetries: 5,
      }
    )
    const latestBlockHash = await connection.getLatestBlockhash()
    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature,
    })
    console.log('SPL Token Transaction signature:', signature)
    const priceData = await getTokenPrice(params.tokenMintAddress)
    const usdcPrice = Number(
      (
        (priceData.price * params.transferAmountLamport) /
        LAMPORTS_PER_SPL_TOKEN
      ).toFixed(6)
    )
    const responseParam: SolanaTransferResponseParam = {
      toAddressPubkey: params.toAddressPubkey,
      fromAddressPubkey: fromWallet.publicKey.toBase58(),
      transferAmountLamport: params.transferAmountLamport,
      tokenMintAddress: params.tokenMintAddress,
      signature,
      usdcPrice,
      timestamp: priceData.timestamp,
    }
    if (process.env.NODE_ENV === 'production') {
      await createCloudTask(
        SKEET_CLOUD_TASK_QUEUE,
        params.returnQueryName,
        responseParam
      )
    } else {
      const res = await sendPost(params.returnQueryName, responseParam)
      console.log(res.status)
    }

    return responseParam
  } catch (error) {
    console.log(`splTokenTransfer: ${error}`)
    throw new Error(JSON.stringify(error))
  }
}
