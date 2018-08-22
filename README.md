# blokUnion

##running it

##testing it
you can test blokUnion by running truffle test after deploying the contract

##design patterns
###circuit breaker
We use a circuit breaker that only the owner of the contract can use to turn off the contract by calling `turnOffContract()`

###state machine
Our contract implements a state machine.  Loans follow the following lifecycle:
0. NoLoan - This status is impossible to reach
1. Requested - A loan has been requested
2. Issued - A loan has been issued
3. Declined - A loan has been declined
  This functionality has not yet been implemented
4. Repaid - A loan has been fully repaid
  This functionality has not yet been implemented, repayments are a future feature

###fail early fail loud
We love requires... They be erwere.

###restricting access
We are careful to restrict access to any variable that is not needed for view by outside users/contracts.  The *demandAccounts*, *loan*, *loanApprovers* are all private state variables.

###speed bump
It would probably be good to add a speed bumb, but that is in the backlog :)

##Security

###Reentrancy
We were careful to decrement the account balances prior to transfering.  We were also careful to only use the secure *transfer()* method.

###Race Conditions
We checked and our contract doesn't seem to be vulnerable to race condition attacks, but could always use another blokUnionNapkinLogo

###int overflow, underflow
We protected against overflow and underflow by requiring that the expected balance will be greater than the current balance in the case of deposits and less than in the case of withdrawls.

##Comments
Check out our sweet comments in our [contracts/blokUnion.sol](https://github.com/crusyn/blokUnion/blob/master/contracts/blokUnion.sol) file for more details on functionality

##Feedback
We would love your feedback!  Please submit issues and pull requests in [github](https://github.com/crusyn/blokUnion)!!

https://github.com/crusyn/blokUnion
