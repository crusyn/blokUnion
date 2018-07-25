var blokUnion = artifacts.require("./blokUnion.sol");
//var Amazon = artifacts.require("./Amazon.sol");

module.exports = function(deployer) {
  deployer.deploy(blokUnion);
  //deployer.deploy(Amazon);
};
