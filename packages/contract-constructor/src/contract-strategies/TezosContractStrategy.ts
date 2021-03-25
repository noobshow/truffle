import { createInterfaceAdapter, TezosAdapter } from "@truffle/interface-adapter";
import { IContractStrategy } from "./IContractStrategy";
import { ContractInstance } from "../ContractInstance";
const Web3PromiEvent = require("web3-core-promievent");

export class TezosContractStrategy implements IContractStrategy {
  private interfaceAdapter: TezosAdapter;

  constructor(private _json: { [key: string]: any }, config: { [key: string]: any }) {
    this.interfaceAdapter = createInterfaceAdapter(config) as TezosAdapter;
  }

  // args[0] is storage, args[1] is settings
  deploy(...args: any[]): Promise<any> {
    const promiEvent = Web3PromiEvent();

    const michelson: any = JSON.parse(this._json.michelson);

    const originateParams = {
      code: michelson,
      storage: args[0]
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

  prepareCall(): Promise<any> {
    throw new Error("Method not implemented.");
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