var blockUnion = artifacts.require("./blokUnion.sol");

contract('blockUnion', function(accounts){
  const creator = accounts[0];
  const alice = accounts[1];
  const bob = accounts[2];

  var aliceExpectedBalance = web3.toBigNumber(0);

  it("balance after deposit should be correct", async() => {
    const bank = await blockUnion.deployed();
    const depositAmount = web3.toBigNumber(3);

    await bank.deposit({from: alice, value: depositAmount});
    aliceExpectedBalance = web3.toBigNumber(aliceExpectedBalance + depositAmount);

    const balance = await bank.getDemandBalance({from: alice});

    assert.equal(aliceExpectedBalance.toString(), balance.toString(),
      'deposit amount ' + aliceExpectedBalance.toString()
        +  ' does not match balance ' + balance.toString()
        + '. Check deposit method.');

    const DemandDeposit = await bank.DemandDeposit();
    const log = await new Promise(function(resolve, reject) {
        DemandDeposit.watch(function(error, log){ resolve(log);});
    });

    const expectedEventResult = {account: alice, amount: depositAmount};

    const logAccountAddress = log.args.account;
    const logDepositAmount = log.args.amount.toNumber();

    assert.equal(expectedEventResult.account, logAccountAddress,
      "Deposit event account property not emmitted, check deposit method");
    assert.equal(expectedEventResult.amount, logDepositAmount,
      "Deposit event amount property not emmitted, check deposit method");
  });

  it("balance after Withdrawl should be correct", async() => {
    const bank = await blockUnion.deployed();
    const withdrawlAmount = web3.toBigNumber(1)

    await bank.withdraw(withdrawlAmount, {from: alice});
    aliceExpectedBalance = web3.toBigNumber(aliceExpectedBalance - withdrawlAmount);

    const balance = await bank.getDemandBalance({from: alice});

    assert.equal(aliceExpectedBalance.toString(), balance.toString(),
      'expected Balance ' + aliceExpectedBalance.toString()
        +  ' does not match balance ' + balance.toString()
        + '. Check deposit method.');

    const DemandWithdrawl = await bank.DemandWithdrawl();
    const log = await new Promise(function(resolve, reject) {
        DemandWithdrawl.watch(function(error, log){ resolve(log);});
    });

    const expectedEventResult = {account: alice, amount: withdrawlAmount};

    const logAccountAddress = log.args.account;
    const logWithdrawlAmount = log.args.amount.toNumber();

    assert.equal(expectedEventResult.account, logAccountAddress,
      "DemandWithdrawl event account property not emmitted, check withdrawl method");
    assert.equal(expectedEventResult.amount, logWithdrawlAmount,
      "DemandWithdrawl event amount property not emmitted, check withdrawl method");
  });

  it("should not be able to withdraw more than balance", async() => {
    /*
    const bank = await blockUnion.deployed();
    const withdrawlAmount = web3.toBigNumber(5);

    await bank.withdraw(withdrawlAmount, {from: alice});
    aliceExpectedBalance = web3.toBigNumber(aliceExpectedBalance - withdrawlAmount);
    */
  });

  it("requested loan is accessible and status is requested", async() => {
    const bank = await blockUnion.deployed();
    const loanRequestAmount = web3.toBigNumber(100);
    const loanPurpose = 'I would like to purchase a pretty lollipop';

    await bank.requestLoan(loanRequestAmount, loanPurpose, {from: alice});

    const checkedLoan = await bank.getLoan(alice);

    const expectedLoan =
      {
        borrower: alice,
        loanAmount: loanRequestAmount,
        purpose: loanPurpose,
        status: 1 //LoanStatus.Requested
      };

      //console.log(expectedLoan.borrower);

      //console.log(checkedLoan);
    assert.equal(expectedLoan.borrower, checkedLoan[0],
      "Loan account property borrower not correct, check requestLoan method");
    assert.equal(expectedLoan.loanAmount.toNumber(), checkedLoan[1].toNumber(),
      "Loan account property loanAmount not correct, check requestLoan method");
    assert.equal(expectedLoan.purpose, checkedLoan[2],
      "Loan account property purpose not correct, check requestLoan method");
    assert.equal(expectedLoan.status, checkedLoan[3].toNumber(),
      "Loan account property status not correct, check requestLoan method");

    //Check that the event was emitted.
    const LoanRequest = await bank.LoanRequest();

    const log = await new Promise(function(resolve, reject) {
        LoanRequest.watch(function(error, log){ resolve(log);});
    });

    const expectedEventResult =
      {borrower: alice, loanAmount: loanRequestAmount, purpose: loanPurpose};

    const logBorrower = log.args.requestor;
    const logAmount = log.args.loanAmount.toNumber();
    const logPurpose = log.args.purpose;

    assert.equal(expectedEventResult.borrower, logBorrower,
      "LoanRequest event borrower property not emmitted, check LoanRequest method");
    assert.equal(expectedEventResult.loanAmount, logAmount,
      "LoanRequest event loanAmount property not emmitted, check LoanRequest method");
    assert.equal(expectedEventResult.purpose, logPurpose,
      "LoanRequest event purpose property not emmitted, check LoanRequest method");
  });
});
