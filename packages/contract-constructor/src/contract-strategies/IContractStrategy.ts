export interface IContractStrategy {
  deploy(...args: any[]): any;
  prepareCall(): any;
  sendTransaction(): any;
  call(): any;

  collectMethods(): any[];
}