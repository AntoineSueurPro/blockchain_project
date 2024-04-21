const BookMarket = artifacts.require("./BookMarket.sol");

module.exports = function (deployer) {
    deployer.deploy(BookMarket);
};
