## Skeet Worker Plugin Solana Token Transfer

This Worker works with Skeet API.

Set token address where to/where and token mint address that you want to send.

This woker transfers Solana SPL token and return signature and the USDC price at that time.

Retrieving USDC price data from [Birdeye API](https://public-api.birdeye.so).

- Skeet TypeScript Serverless Framework
  [https://skeet.dev](https://skeet.dev)

## Usage

Define your .env file

```bash
SKEET_GCP_PROJECT_ID=skeet-framework
SKEET_GCP_REGION=europe-west4
SKEET_API_URL=https://skeet.dev
FROM_WALLET_SECRET_KEY_STRING=1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
```

```bash
$ yarn install
$ yarn dev
```

Then Post to http://localhost:3000/run with params.

## Sample Post Param

```json
{
  "toAddressPubkey": "2VC6dGStK7jqdDo6AhtYWhNVqkLuArcHrWYw16F7BCzF",
  "transferAmountLamport": 100000000,
  "tokenMintAddress": "8Jr3Kpptg2eXxAEf4oe2KHTxr76PbM4znBnocftsnft1",
  "rpcUrl": "https://api.devnet.solana.com"
}
```

## Sample Response

```json
{
  "status": "success!",
  "responseParam": {
    "toAddressPubkey": "AoXLgfX8su9XXw9PxqW8aZJXbd91Urx74aig3ifREn31",
    "fromAddressPubkey": "5K2tbeqdkA7bUMdxauF9hAL5Cv1LmhCfyXmt1bgoneDe",
    "amountLamport": 100000000,
    "tokenMintAddress": "8Jr3Kpptg2eXxAEf4oe2KHTxr76PbM4znBnocftsnft1",
    "signature": "3ot51LJE2o8dZPqi2grikM3wp6HHSxqDBxvF5GcSXS5RHeJLFUaJ5qJLLNWPS6TR1CapHbWoppig144VBMvwWwBa",
    "usdcPrice": 0,
    "timestamp": ""
  }
}
```

usdcPrice and timestamp always return 0 if there's no price data neither error happens.

## CloudTask
