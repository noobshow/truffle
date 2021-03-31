import { createInterfaceAdapter, TezosAdapter } from "@truffle/interface-adapter";
import { IContractStrategy } from "./IContractStrategy";
import { ContractInstance } from "../ContractInstance";
import { isTxParams } from "./utils";
import { TxParams } from "./types";
const Web3PromiEvent = require("web3-core-promievent");

export class TezosContractStrategy implements IContractStrategy {
  private interfaceAdapter: TezosAdapter;
  private defaults: { [key: string]: any };

  constructor(private _json: { [key: string]: any }, config: any) {
    this.interfaceAdapter = createInterfaceAdapter(config) as TezosAdapter;
    this.defaults = {};
  }

  deploy(txArguments: any[], _txParams: TxParams): Promise<ContractInstance> {
    const promiEvent = Web3PromiEvent();

    const michelson: any = JSON.parse(this._json.michelson);

    const originateParams = {
      code: michelson,
      storage: txArguments[0]
    };

    this.interfaceAdapter.tezos.contract.originate(originateParams)
      .then((receipt: any) => {
        return receipt.contract();
      })
      .then((contractInstance) => {
        promiEvent.resolve(new ContractInstance(this._json, this, contractInstance));
      })
      .catch(promiEvent.reject);

    return promiEvent.eventEmitter;
  }

  async at(address: string): Promise<ContractInstance> {
    if (
      address == null ||
      typeof address !== "string" ||
      address.length !== 36
    ) {
      throw new Error(`Invalid address passed to ${this._json.contractName}.at(): ${address}`);
    }

    const contractInstance = await this.interfaceAdapter.tezos.contract.at(address);
    return new ContractInstance(this._json, this, contractInstance);
  }

  prepareCall(args: any[], isDeploy: boolean): Promise<[any[], { [key: string]: any }]> {
    // TODO BGC Possible validations
    // args.length <= 2, check if storage is valid, check if no storage is provided but needed, etc

    const last_arg = args.length ? args[args.length - 1] : null;
    const isLastArgParams = isTxParams(last_arg);

    const txParams = {
      ...this.defaults,
      ...(isLastArgParams ? last_arg : {})
    };

    let txArgs: any[];
    if (isDeploy && isLastArgParams && args.length === 1 && this._json.initialStorage) {
      // Deploy only: No initialStorage passed, but there's a default initialStorage
      txArgs = [JSON.parse(this._json.initialStorage)];
    } else if (isLastArgParams) {
      // Last argument is txParams, everything else are txArgs
      txArgs = [...args.slice(0, args.length - 1)];
    } else {
      txArgs = args;
    }

    return Promise.resolve([
      txArgs,
      txParams
    ]);
  }

  sendTransaction(): Promise<any> {
    throw new Error("Method not implemented.");
  }
  call(): Promise<any> {
    throw new Error("Method not implemented.");
  }

  collectMethods(): any[] {
    return [];
  }
}