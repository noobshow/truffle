export interface IContractStrategy {
  deploy(...args: any[]): Promise<any>;
  prepareCall(): Promise<any>;
  sendTransaction(): Promise<any>;
  call(): Promise<any>;
}