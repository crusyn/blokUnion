# blokUnion

## running it

1. stand up a dev blockchain

run `./ganache-cli` on port 8545

2. clone

```
git clone git@github.com:crusyn/blokUnion.git
cd blokUnion
```

3. run truffle scripts

```
truffle compile
truffle migrate --reset
truffle build
```
(you only need --reset if this is the second time you are deploying)

4. run tests

```
truffle test
```

5. stand up website

`npm start dev`

6. open site

`http://localhost:3000/`

7. connect metamask

copy Mnemonic from ganache-cli and add to metamask to get use the test wallet

8. play

-deposit ETH
-wait for transaction to get validated
-see updated blokUnion balance
-withdraw ETH
-wait for transaction to get validated
-see updated blokUnion balance
-check meta mask and see the account's ETH and transactions that went through.

## testing it
you can test blokUnion by running `truffle test` after deploying the contract

## design patterns
### circuit breaker
We use a circuit breaker that only the owner of the contract can use to turn off the contract by calling `turnOffContract()`

### state machine
Our contract implements a state machine.  Loans follow the following lifecycle:
0. NoLoan - This status is impossible to reach
1. Requested - A loan has been requested
2. Issued - A loan has been issued
3. Declined - A loan has been declined
  This functionality has not yet been implemented
4. Repaid - A loan has been fully repaid
  This functionality has not yet been implemented, repayments are a future feature

### fail early fail loud
We love requires... They be erwere.

### restricting access
We are careful to restrict access to any variable that is not needed for view by outside users/contracts.  The `demandAccounts`, `loan`, `loanApprovers` are all private state variables.

### speed bump
It would probably be good to add a speed bump, but that is in the backlog :)

## security

### reentrancy
We were careful to decrement the account balances prior to transfering.  We were also careful to only use the secure *transfer()* method.

### race conditions
We checked and our contract doesn't seem to be vulnerable to race condition attacks, but could always use another blokUnionNapkinLogo

### int overflow, underflow
We protected against overflow and underflow by requiring that the expected balance will be greater than the current balance in the case of deposits and less than in the case of withdrawls.

## comments
Check out our sweet solidity style comments in our [contracts/blokUnion.sol](https://github.com/crusyn/blokUnion/blob/master/contracts/blokUnion.sol) file for more details on functionality

## feedback
We would love your feedback!  Please submit issues and pull requests in [github](https://github.com/crusyn/blokUnion)!!

https://github.com/crusyn/blokUnion
