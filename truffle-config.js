const HDWalletProvider = require("@truffle/hdwallet-provider");
module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*", // Match any network id
    },
    develop: {
      port: 7545
    },
    besu: {
      provider: () => new HDWalletProvider("c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3", "http://localhost:8545"),
      gas: 7000000,
      gasPrice: 100000,
      network_id: "*",
    }
  },
  compilers: {
    solc: {
      version: "^0.8.19",
      settings: {          // See the solidity docs for advice about optimization and evmVersion
        //  optimizer: {
        //    enabled: false,
        //    runs: 200
        //  },
        evmVersion: "london"
      }
    }
  }
}