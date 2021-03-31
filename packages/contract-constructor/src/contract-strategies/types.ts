export enum AllowedTxParams {
  from = "from",
  to = "to",
  gas = "gas",
  gasPrice = "gasPrice",
  value = "value",
  data = "data",
  nonce = "nonce",
  privateFor = "privateFor",
  overwrite = "overwrite"
}

export type TxParams = {[key in AllowedTxParams]?: any};