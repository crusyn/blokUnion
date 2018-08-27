# blokUnion
The makings of a decentralized credit union framework.  Groups can start a credit union, make deposits in ETH and then elect approvers to issue loans against those funds.  The interest can then flow back to credit union members after paying approvers for doing a good job :).

## running it

1. stand up a dev blockchain

run `./ganache-cli` on port 8545

2. clone

```
git clone git@github.com:crusyn/blokUnion.git
cd blokUnion
npm install
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

5. reset blockchain

```
truffle migrate --reset
truffle build
```

6. stand up website

`npm start dev`

7. open site

`http://localhost:3000/`

8. connect metamask

copy Mnemonic from ganache-cli and add to metamask to get use the test wallet

9. play

-deposit ETH
-wait for transaction to get validated
-see updated blokUnion balance
-withdraw ETH
-wait for transaction to get validated
-see updated blokUnion balance
-check meta mask and see the account's ETH and transactions that went through.

## testing it
you can test blokUnion by running `truffle test` after deploying the contract
be careful to reset the contract (and ideally restart ganache) after you test as to not impact your UI testing.

### tests
#### balance after deposit should be correct
user attemptps to deposit 3 ETH, a deposit event is emitted, and the users balance in the union is 3 ETH greater after the deposit

#### balance after Withdrawl should be correct
user attempts to withdraw 1 ETH, a withdrawl event is emitted, balance is 1 ETH less than before the test

#### should not be able to withdraw more than balance
user attempts to withdraw more than their balance, the contract reverts, we use assertRevert to confirm this

#### requested loan is accessible and status is requested
user can request a loan, the properties of the loan are set correctly, the LoanRequest event is emitted and is properly formed, the status of the loan is "requested: 1"

#### non-owner attempt to add an approver
Attempt to add an approver as a non-owner.  This should fail, confirmed by assertRevert.

#### loan can be approved and issued
Valid approver attempts to issue a loan.  We check to make sure the loan status is "Issued: 2", the balance is updated to the request amount, and the apr is set to a rate.  The borrowers union account balance should be increased by the amount of the loan request.

#### loan can only be approved by an approver
A user that is not an approver attempts to approve the loan.  This should fail.

#### cannot issue a loan more than total deposits
An approver attempts to issue a loan that is more than one half of deposits in the union.  This should fail.

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
