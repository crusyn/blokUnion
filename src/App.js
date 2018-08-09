import React, { Component } from 'react';
import logo from './blokUnionNapkinLogo.png';
import blokUnionContract from '../build/contracts/blokUnion.json'
import getWeb3 from './utils/getWeb3'
import './App.css';

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      storageValue: 0,
      web3: null
    }
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })

      // Instantiate contract once web3 provided.
      this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  instantiateContract() {
      //TODO: I'm guessing I'll need to install truffle contract
      const contract = require('truffle-contract')
      const blokUnion = contract(blokUnionContract)
      blokUnion.setProvider(this.state.web3.currentProvider)

      // Declaring this for later so we can chain functions on SimpleStorage.
      var blokUnionInstance
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
      </div>
    );
  }
}

export default App;
