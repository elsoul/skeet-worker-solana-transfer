import { Response } from 'express'
import { SkeetSolanaTransferParam } from '@/types/api/SkeetSolanaTransferTypes'
import { splTokenTransfer } from '@/lib/splTokenTransfer'
import { solanaTransfer } from '@/lib/solanaTransfer'

export interface TypedRequestBody<T> extends Express.Request {
  body: T
}

export const run = async (
  req: TypedRequestBody<SkeetSolanaTransferParam>,
  res: Response
) => {
  try {
    let responseParam = {}
    const token = req.body.tokenMintAddress
    switch (token) {
      case 'So11111111111111111111111111111111111111112': {
        responseParam = await solanaTransfer(req.body)
        break
      }
      default: {
        responseParam = await splTokenTransfer(req.body)
        break
      }
    }
    res.status(200).json({ status: 'success!', responseParam })
  } catch (error) {
    res.status(500).json({ status: 'solana transfer worker error!', error })
  }
}
