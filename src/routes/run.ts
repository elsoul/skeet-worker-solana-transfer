import { Response } from 'express'
import {
  SolanaTransferParam,
  SolanaTransferResponseParam,
} from '@/types/api/SolanaTransferParam'
import { tokenTransfer } from '@/lib/tokenTransfer'

export interface TypedRequestBody<T> extends Express.Request {
  body: T
}

export const run = async (
  req: TypedRequestBody<SolanaTransferParam>,
  res: Response
) => {
  try {
    const responseParam: SolanaTransferResponseParam = await tokenTransfer(
      req.body
    )
    res.status(200).json({ status: 'success!', responseParam })
  } catch (error) {
    res.status(500).json({ status: 'error!', error })
  }
}
