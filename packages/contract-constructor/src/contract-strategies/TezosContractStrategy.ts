import { ContractAbstraction, ContractProvider } from "@taquito/taquito";
import { createInterfaceAdapter, TezosAdapter } from "@truffle/interface-adapter";
import { IContractStrategy } from "./IContractStrategy";
import { ContractInstance } from "../ContractInstance";
import { isTxParams } from "./utils";
import { PrepareCallSettings, TxParams } from "./types";
const Web3PromiEvent = require("web3-core-promievent");

export class TezosContractStrategy implements IContractStrategy {
  private interfaceAdapter: TezosAdapter;
  private defaults: { [key: string]: any };

  constructor(private _json: { [key: string]: any }, config: any) {
    this.interfaceAdapter = createInterfaceAdapter(config) as TezosAdapter;
    this.defaults = {}; // TODO BGC Populate defaults with config
    // ["from", "gas", "gasPrice"].forEach(key => {
    //   if (config[key]) {
    //     const obj: any = {};
    //     obj[key] = config[key];
    //     contractAbstraction.defaults(obj);
    //   }
    // });
  }

  collectMethods(contractInstance: ContractAbstraction<ContractProvider>): { [key: string]: any; } {
    const methods: { [key: string]: any; } = {};
    for (const method in contractInstance.methods) {
      methods[method] = async (...args: any) => {
        const [txArguments, _txParams] = await this.prepareCall(args);

        return contractInstance.methods[method](txArguments).send();
      };
    }
    return methods;
  }

  collectAdditionalProperties(contractInstance: ContractAbstraction<ContractProvider>): { [key: string]: any; } {
    return {
      storage: contractInstance.storage.bind(contractInstance),
      address: contractInstance.address
    };
  }

  deploy(txArguments: any[], txParams: TxParams): Promise<ContractInstance> {
    const promiEvent = Web3PromiEvent();

    const michelson: any = JSON.parse(this._json.michelson);

    const originateParams = {
      code: michelson,
      storage: txArguments[0],
      balance: txParams.value as string | "0",
      fee: txParams.fee,
      gasLimit: txParams.gas, // TODO BGC Should we use gasLimit instead?
      storageLimit: txParams.storageLimit
    };

    this.interfaceAdapter.tezos.contract.originate(originateParams)
      .then((receipt) => {
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

  prepareCall(args: any[], settings: PrepareCallSettings = {}): Promise<[any[], { [key: string]: any }]> {
    // TODO BGC Possible validations
    // args.length <= 2, check if storage is valid, check if no storage is provided but needed, etc

    const last_arg = args.length ? args[args.length - 1] : null;
    const isLastArgParams = isTxParams(last_arg);

    const txParams = {
      ...this.defaults,
      ...(isLastArgParams ? last_arg : {})
    };

    let txArgs: any[];
    if (settings.isDeploy && isLastArgParams && args.length === 1 && this._json.initialStorage) {
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

  sendTransaction() {
    throw new Error("Method not implemented.");
  }
  call() {
    throw new Error("Method not implemented.");
  }

  estimateGas(/*contractInstance: ContractAbstraction<ContractProvider>, txArgs: any[], txParams: { [key: string]: any }*/) {
    // import { TezosToolkit } from '@taquito/taquito';
    // const Tezos = new TezosToolkit('https://api.tez.ie/rpc/edonet');

    // Tezos.contract
    // .at('KT1MZR1g3jZCU6itoyEZ7u91hyJMG2efgmwu')
    // .then((contract) => {
    //   const i = 7;

    //   return contract.methods.increment(i).toTransferParams({});
    // })
    // .then((op) => {
    //   println(`Estimating the smart contract call : `);
    //   return Tezos.estimate.transfer(op);
    // })
    // .then((est) => {
    //   println(`burnFeeMutez : ${est.burnFeeMutez}, 
    //   gasLimit : ${est.gasLimit}, 
    //   minimalFeeMutez : ${est.minimalFeeMutez}, 
    //   storageLimit : ${est.storageLimit}, 
    //   suggestedFeeMutez : ${est.suggestedFeeMutez}, 
    //   totalCost : ${est.totalCost}, 
    //   usingBaseFeeMutez : ${est.usingBaseFeeMutez}`);
    // })
    // .catch((error) => console.table(`Error: ${JSON.stringify(error, null, 2)}`));
  }

  estimateGasNew() {
    // import { TezosToolkit } from '@taquito/taquito';
    // const Tezos = new TezosToolkit('https://api.tez.ie/rpc/edonet');

    // println(`Estimating the contract origination : `);
    // Tezos.estimate
    //   .originate({
    //     code: genericMultisigJSONfile,
    //     storage: {
    //       stored_counter: 0,
    //       threshold: 1,
    //       keys: ['edpkuLxx9PQD8fZ45eUzrK3BhfDZJHhBuK4Zi49DcEGANwd2rpX82t'],
    //     },
    //   })
    //   .then((originationOp) => {
    //     println(`burnFeeMutez : ${originationOp.burnFeeMutez}, 
    //     gasLimit : ${originationOp.gasLimit}, 
    //     minimalFeeMutez : ${originationOp.minimalFeeMutez}, 
    //     storageLimit : ${originationOp.storageLimit}, 
    //     suggestedFeeMutez : ${originationOp.suggestedFeeMutez}, 
    //     totalCost : ${originationOp.totalCost}, 
    //     usingBaseFeeMutez : ${originationOp.usingBaseFeeMutez}`);
    //   })
    //   .catch((error) => println(`Error: ${JSON.stringify(error, null, 2)}`));
  }
}