const oldContract = require("@truffle/contract");
import Schema from "@truffle/contract-schema";
import { ContractConstructor } from "./ContractConstructor";

export const contract = (json = {}): ContractConstructor => {
  const normalizedArtifactObject = Schema.normalize(json);

  // Interceptor to call the old contract for solidity
  return normalizedArtifactObject.architecture === "tezos"
    ? new ContractConstructor(normalizedArtifactObject)
    : oldContract(json);
};
