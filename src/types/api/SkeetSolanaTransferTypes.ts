export type SkeetSolanaTransferParam = {
  toAddressPubkey: string
  transferAmountLamport: number
  tokenMintAddress: string
  encodedFromSecretKeyString: string
  iv: string
  rpcUrl: string
  decimal: number
}

export type SkeetSolanaTransferResponse = {
  toAddressPubkey: string
  fromAddressPubkey: string
  transferAmountLamport: number
  tokenMintAddress: string
  signature: string
  usdcPrice: number
  timestamp: string
}
