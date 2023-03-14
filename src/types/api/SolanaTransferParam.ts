export type SolanaTransferParam = {
  toAddressPubkey: string
  transferAmountLamport: number
  tokenMintAddress: string
  decimal: number
  encodedFromSecretKeyString: string
  returnQueryName: string
  rpcUrl: string
  iv: string
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
