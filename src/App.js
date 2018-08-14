import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import logo from './blokUnionNapkinLogo.png';
import blokUnionContract from './contracts/blokUnion.json';
import getWeb3 from './utils/getWeb3';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      web3: null,
      balance: 0,
      depositAmount: 5,
      withdrawlAmount: 5
    }

    this.deposit = this.deposit.bind(this);
    this.withdraw = this.withdraw.bind(this);
    this.handleChangeDeposit = this.handleChangeDeposit.bind(this);
    this.handleChangeWithdraw = this.handleChangeWithdraw.bind(this);
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3,
      })

      // Instantiate contract once web3 provided.
      this.instantiateContract();
      this.refreshBalance();
    })
    .catch(() => {
      console.log('Error finding web3.');
    })
    this.interval = setInterval(() => this.refreshBalance(), 5000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  handleChangeDeposit(event) {
    this.setState({depositAmount: event.target.value});
  }

  handleChangeWithdraw(event) {
    this.setState({withdrawlAmount: event.target.value});
  }

  refreshBalance(){
    const contract = require('truffle-contract');
    const blokUnion = contract(blokUnionContract);
    blokUnion.setProvider(this.state.web3.currentProvider)

    console.log("balance refreshed");

    var blokUnionInstance;

    var account;

    var demandDepositLogs;

    this.state.web3.eth.getAccounts((error, accounts) => {
      account = accounts[0];
      blokUnion.deployed().then((instance) => {
        blokUnionInstance = instance;
      }).then((result) => {
        return blokUnionInstance.getDemandBalance({from: account});
      }).then((result) => {
        this.setState({balance: this.state.web3.fromWei(result.toNumber())});
      })
    });
  }

  instantiateContract() {


/*
      // Get accounts.
      this.state.web3.eth.getAccounts((error, accounts) => {
        blokUnion.deployed().then((instance) => {
          blokUnionInstance = instance

          // Stores a given value, 5 by default.
          return blokUnionInstance.set(5, {from: accounts[0]})
        }).then((result) => {
          // Get the value from the contract to prove it worked.
          return simpleStorageInstance.get.call(accounts[0])
        }).then((result) => {
          // Update state with the result.
          return this.setState({ storageValue: result.c[0] })
        })
      })
*/
    }

    deposit(){
      const contract = require('truffle-contract');
      const blokUnion = contract(blokUnionContract);
      blokUnion.setProvider(this.state.web3.currentProvider);

      console.log("deposit button clicked");

      var blokUnionInstance;

      var account;

      var demandDepositLogs;

      this.state.web3.eth.getAccounts((error, accounts) => {
        account = accounts[0];
        blokUnion.deployed().then((instance) => {
          blokUnionInstance = instance;
        }).then((result) => {
          demandDepositLogs = blokUnionInstance.DemandDeposit();
        }).then((result) => {
          var depositAmount = this.state.web3.toWei(this.state.depositAmount);
          return blokUnionInstance.deposit({from: account, value: depositAmount})
        }).then((result) => {
          return new Promise(function(resolve, reject) {
              demandDepositLogs.watch(function(error, log){ resolve(log);});
        }).then((result) => {
            this.refreshBalance();
            console.log(result);
          })
        })
      })
    }

    withdraw(withdrawlAmount){
      const contract = require('truffle-contract');
      const blokUnion = contract(blokUnionContract);
      blokUnion.setProvider(this.state.web3.currentProvider);

      console.log("withdraw button clicked");

      var blokUnionInstance;

      var account;

      var demandWithdrawlLogs;

      this.state.web3.eth.getAccounts((error, accounts) => {
        account = accounts[0];
        blokUnion.deployed().then((instance) => {
          blokUnionInstance = instance;
        }).then((result) => {
          demandWithdrawlLogs = blokUnionInstance.DemandWithdrawl();
        }).then((result) => {
          var withdrawlAmount = this.state.web3.toWei(this.state.withdrawlAmount);
          return blokUnionInstance.withdraw(withdrawlAmount, {from: account})
        }).then((result) => {
          return new Promise(function(resolve, reject) {
              demandWithdrawlLogs.watch(function(error, log){ resolve(log);});
        }).then((result) => {
            this.refreshBalance();
            console.log(result);
          })
        })
      })
    }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">blokUnion</h1>
        </header>
        <p className="App-intro">
          blokUnion is a decentralized credit union framework.  For now this is just an experiment by <a href="http://www.crusyn.com">@crusyn</a>.  At this time this will only work with a local version of the <a href="https://github.com/crusyn/blokUnion">blokUnion contract</a> running.
        </p>
        <div>
        <h1>Balance</h1>
        <label>Balance: {this.state.balance} ETH</label><br/><br/>
        <label>Note: this is your confirmed balance.  You may have to wait a 10 seconds or so before your transactions confirm.</label>
        <h1>Deposit</h1>
        <label>Amount: <input type="text" name = "depositAmount" value={this.state.depositAmount} onChange={this.handleChangeDeposit}/> ETH </label>
        <Button bsStyle="primary" onClick={this.deposit}>Deposit</Button>
        <h1>Withdraw</h1>
        <label>Amount: <input type="text" name = "depositAmount" value={this.state.withdrawlAmount} onChange={this.handleChangeWithdraw}/> ETH </label>
        <Button bsStyle="primary" onClick={this.withdraw}>Withdraw</Button>
        </div>
      </div>
    );
    //TODO: the Button doesn't look good because I would need to import bootstrap.css and I didn't have time to get that into webpack. https://react-bootstrap.github.io/getting-started/introduction/

  }
}

export default App;
