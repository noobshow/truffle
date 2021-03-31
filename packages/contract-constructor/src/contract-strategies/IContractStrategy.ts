import { ContractInstance } from "../ContractInstance";
import { TxParams } from "./types";

export interface IContractStrategy {
  deploy(txArguments: any[], txParams: TxParams): Promise<ContractInstance>;
  at(address: string): Promise<ContractInstance>;

  prepareCall(args: any[], isDeploy: boolean): Promise<[any[], { [key: string]: any }]>;
  sendTransaction(): any;
  call(): any;

  collectMethods(): any[];
}