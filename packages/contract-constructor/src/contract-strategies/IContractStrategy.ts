import { ContractInstance } from "../ContractInstance";

export interface IContractStrategy {
  deploy(...args: any[]): Promise<ContractInstance>;
  at(address: string): Promise<ContractInstance>;

  prepareCall(): any;
  sendTransaction(): any;
  call(): any;

  collectMethods(): any[];
}