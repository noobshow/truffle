import { IContractStrategy } from "./contract-strategies/IContractStrategy";
import { TezosContractStrategy } from "./contract-strategies/TezosContractStrategy";
import { ContractInstance } from "./ContractInstance";

export class ContractConstructor {
  private strategy: IContractStrategy;

  constructor(private _json: { [key: string]: any }, config: any) {
    this._json.gasMultiplier = this._json.gasMultiplier || 1.25;

    switch(this._json.architecture) {
      case "tezos":
        this.strategy = new TezosContractStrategy(_json, config);
        break;
      default:
        throw Error(`Architecture ${this._json.architecture} not supported for contract`);
    }
  }

  public async new(...args: any[]): Promise<ContractInstance> {
    const [txArguments, txParams] = await this.strategy.prepareCall(args, { isDeploy: true });

    return this.strategy.deploy(txArguments, txParams);
  }

  public at(address: string): Promise<ContractInstance> {
    return this.strategy.at(address);
  }

  public deployed(): Promise<ContractInstance> {
    return this.strategy.at(this.address);
  }

  public get contract_name(): string {
    return this._json.contractName;
  }

  public get address(): string {
    return "";
  }

  public toJSON() {
    return this._json;
  }
}