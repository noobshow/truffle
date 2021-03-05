import { InterfaceAdapter, BlockType, Provider } from "../types";
import Config from "@truffle/config";
import { TezosToolkit } from "@taquito/taquito";
import { InMemorySigner, importKey } from '@taquito/signer';

export interface TezosAdapterOptions {
  networkType?: string;
  provider?: Provider;
}

export class TezosAdapter implements InterfaceAdapter {
  public tezos: TezosToolkit;
  constructor({ provider }: TezosAdapterOptions) {
    // TODO BGC If network is passed, provider shouldn't be necessary to get the host
    this.tezos = new TezosToolkit((provider as any).host);
  }

  public async getNetworkId() {
    const { chain_id } = await this.tezos.rpc.getBlockHeader();
    return chain_id;
  }

  public async getBlock(blockNumber: BlockType) {
    // translate ETH nomenclature to XTZ
    if (blockNumber === "latest") blockNumber = "head";
    const { hard_gas_limit_per_block } = await this.tezos.rpc.getConstants();
    const block = await this.tezos.rpc.getBlockHeader({
      block: `${blockNumber}`
    });
    // @ts-ignore: Property 'gasLimit' does not exist on type 'BlockHeaderResponse'.
    block.gasLimit = hard_gas_limit_per_block;
    return block;
  }

  public async getTransaction(_: string) {
    throw Error(`Sorry, "getTransaction" is not supported for tezos.`);
  }

  public async getTransactionReceipt(_: string) {
    throw Error(`Sorry, "getTransactionReceipt" is not supported for tezos.`);
  }

  public async getBalance(address: string) {
    const balance = (await this.tezos.tz.getBalance(address)).toString();
    return balance;
  }

  public async getCode(address: string) {
    const storage = await this.tezos.contract.getStorage(address);
    return storage as string;
  }

  public async getAccounts(config: Config) {
    await this.setWallet(config);
    const currentAccount = await this.tezos.signer.publicKeyHash();
    return Promise.resolve([currentAccount]);
  }

  public async estimateGas(_: any) {
    return Promise.resolve(0);
  }

  public async getBlockNumber() {
    const { level } = await this.tezos.rpc.getBlockHeader();
    return level;
  }

  public async setWallet(config: Config) {
    const { networks, network } = config;
    let { mnemonic, secretKey } = networks[network];

    // TODO BGC hardcoded private key if none is specified. Confirm this is acceptable
    if (network === "test" && networks.test.develop) {
      secretKey = `edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq`;
    }

    if (mnemonic) {
      // here we import user's faucet account:
      // email, password, mnemonic, & secret are all REQUIRED.
      if (Array.isArray(mnemonic)) mnemonic = mnemonic.join(" ");
      try {
        await importKey(
          this.tezos,
          networks[network].email,
          networks[network].password,
          mnemonic,
          networks[network].secret);
        return;
      } catch (error) {
        throw Error(
          `Faucet account invalid or incorrectly imported in truffle config file (config.networks[${network}]).`
        );
      }
    }

    if (secretKey) {
      try {
        this.tezos.setProvider({
          signer: new InMemorySigner(secretKey)
        });
        return;
      } catch (error) {
        throw Error(
          `Secret key invalid or incorrectly imported in truffle config file (config.networks[${network}].secretKey).`
        );
      }
    }

    // TODO: add logic to check if user is importing a psk w/ password
    throw Error(
      `No faucet account or secret key detected in truffle config file (config.networks[${network}]).`
    );
  }
}
