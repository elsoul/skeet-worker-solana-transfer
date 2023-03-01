import { Request, Response } from 'express'
import { RunParam } from '@/types/api/RunParam'
import { ResponseParam, tokenTransfer } from '@/lib/tokenTransfer'

export interface TypedRequestBody<T> extends Express.Request {
  body: T
}

export const run = async (req: TypedRequestBody<RunParam>, res: Response) => {
  try {
    const reqBody = req.body
    const responseParam: ResponseParam = await tokenTransfer(
      reqBody.toAddressPubkey,
      reqBody.transferAmountLamport,
      reqBody.tokenMintAddress,
      reqBody.rpcUrl
    )
    res.status(200).json({ status: 'success!', responseParam })
  } catch (error) {
    res.status(500).json({ status: 'error!', error })
  }
}
