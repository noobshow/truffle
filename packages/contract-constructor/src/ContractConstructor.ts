import { IContractStrategy } from "./contract-strategies/IContractStrategy";
import { TezosContractStrategy } from "./contract-strategies/TezosContractStrategy";

export class ContractConstructor {
  private strategy: IContractStrategy;

  constructor(private _json: { [key: string]: any }, config: { [key: string]: any }) {
    this._json.gasMultiplier = this._json.gasMultiplier || 1.25;

    switch(this._json.architecture) {
      case "tezos":
        this.strategy = new TezosContractStrategy(_json, config);
        break;
      default:
        throw Error(`Architecture ${this._json.architecture} not supported for contract`);
    }

    // ["from", "gas", "gasPrice"].forEach(key => {
    //   if (config[key]) {
    //     const obj: any = {};
    //     obj[key] = config[key];
    //     contractAbstraction.defaults(obj);
    //   }
    // });
  }

  public new(...args: any[]) {
    return this.strategy.deploy(...args);
  }

  public get contract_name(): string {
    return this._json.contractName;
  }

  public toJSON() {
    return this._json;
  }
}