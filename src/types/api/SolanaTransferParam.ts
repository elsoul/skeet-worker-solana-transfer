export type SolanaTransferParam = {
  toAddressPubkey: string
  transferAmountLamport: number
  tokenMintAddress: string
  encodedFromSecretKeyString: string
  iv: string
  rpcUrl: string
  decimal: number
  returnQueryName?: string
}

export type SolanaTransferResponseParam = {
  toAddressPubkey: string
  fromAddressPubkey: string
  transferAmountLamport: number
  tokenMintAddress: string
  signature: string
  usdcPrice: number
  timestamp: string
}
