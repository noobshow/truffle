import { IContractStrategy } from "./contract-strategies/IContractStrategy";

export class ContractInstance {
  // This allows us to dynamically create methods
  [key: string]: any;

  private methods: any[];
  private address: string;

  constructor(
    private _json: { [key: string]: any },
    private readonly strategy: IContractStrategy,
    private readonly contractInstance: any
  ) {
    // this.methods = strategy.collectMethods();

    // for (const method of this.methods) {
    //   this[method.name] = method.implementation;
    // }
  }
}