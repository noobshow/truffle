import Config from "@truffle/config";
import {
  Block as EvmBlock,
  BlockType as EvmBlockType,
  Tx as EvmTransaction
} from "web3/eth/types";
import { TransactionReceipt as EvmTransactionReceipt } from "web3-eth/types";
import { Web3InterfaceAdapterOptions } from "./web3";
import { TezosAdapterOptions } from "./tezos";

export {
  Block as EvmBlock,
  BlockType as EvmBlockType,
  Tx as EvmTransaction
} from "web3/eth/types";
export { TransactionReceipt as EvmTransactionReceipt } from "web3-eth/types";
export { Provider } from "web3/providers";
export type NetworkId = Number | String;
export type Block = EvmBlock | any;
export type BlockType = EvmBlockType | any;
export type Transaction = EvmTransaction | any;
export type TransactionReceipt = EvmTransactionReceipt | any;
export type TxHash = string;

// type union of supported network types
export type InterfaceAdapterOptions =
  | Web3InterfaceAdapterOptions
  | TezosAdapterOptions;

export interface InterfaceAdapter {
  getNetworkId(): Promise<NetworkId>;
  getBlock(block: BlockType): Promise<Block>;
  getBlockNumber(): Promise<number>;
  getTransaction(tx: TxHash): Promise<Transaction>;
  getTransactionReceipt(tx: TxHash): Promise<TransactionReceipt>;
  getBalance(address: string): Promise<string>;
  getCode(address: string): Promise<string>;
  getAccounts(config?: Config): Promise<string[]>;
  estimateGas(transactionConfig: Transaction): Promise<number>;
}
