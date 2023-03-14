import {
  SolanaTransferResponseParam,
  SolanaTransferParam,
} from '@/types/api/SolanaTransferParam'
import * as solanaWeb3 from '@solana/web3.js'
import { Keypair, Connection } from '@solana/web3.js'
import { getTokenPrice } from './birdeyeApi'
import { createCloudTask, sendPost } from './createCloudTask'
import { decrypt } from './crypto'

const SKEET_CLOUD_TASK_QUEUE = 'skeet-api-return-post'

export const solanaTransfer = async (params: SolanaTransferParam) => {
  try {
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
    const toPubkey = new solanaWeb3.PublicKey(params.toAddressPubkey)
    const rentExemption = await connection.getMinimumBalanceForRentExemption(4)
    const lamports = rentExemption + params.transferAmountLamport
    let transaction = new solanaWeb3.Transaction().add(
      solanaWeb3.SystemProgram.transfer({
        fromPubkey: fromWallet.publicKey,
        toPubkey,
        lamports,
      })
    )
    transaction.feePayer = fromWallet.publicKey
    const signature = await solanaWeb3.sendAndConfirmTransaction(
      connection,
      transaction,
      [fromWallet]
    )
    const latestBlockHash = await connection.getLatestBlockhash()
    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature,
    })
    console.log('SOL Transaction signature:', signature)
    const priceData = await getTokenPrice(params.tokenMintAddress)
    const usdcPrice = Number(
      (
        (priceData.price * params.transferAmountLamport) /
        solanaWeb3.LAMPORTS_PER_SOL
      ).toFixed(6)
    )
    const responseParam: SolanaTransferResponseParam = {
      toAddressPubkey: String(params.toAddressPubkey),
      fromAddressPubkey: String(fromWallet.publicKey),
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
    console.log(`solanaTransfer: ${error}`)
    throw new Error(JSON.stringify(error))
  }
}
