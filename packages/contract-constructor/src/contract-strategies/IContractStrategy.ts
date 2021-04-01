import { ContractInstance } from "../ContractInstance";
import { PrepareCallSettings, TxParams } from "./types";

export interface IContractStrategy {
  deploy(txArguments: any[], txParams: TxParams): Promise<ContractInstance>;
  at(address: string): Promise<ContractInstance>;

  prepareCall(args: any[], settings?: PrepareCallSettings): Promise<[any[], { [key: string]: any }]>;
  sendTransaction(): any;
  call(): any;

  collectMethods(contractInstance: any): { [key: string]: any; };
  collectAdditionalProperties(contractInstance: any): { [key: string]: any; };
}