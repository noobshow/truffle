import { IContractStrategy } from "./IContractStrategy";

export class TezosContractStrategy implements IContractStrategy {
  constructor(private _json: { [key: string]: any }) {

  }

  deploy(..._args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }
  prepareCall(): Promise<any> {
    throw new Error("Method not implemented.");
  }
  sendTransaction(): Promise<any> {
    throw new Error("Method not implemented.");
  }
  call(): Promise<any> {
    throw new Error("Method not implemented.");
  }
}