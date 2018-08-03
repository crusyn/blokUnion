var blockUnion = artifacts.require("./blokUnion.sol");
var {assertRevert} = require("./helpers/assertRevert");

contract('blokUnion', function(accounts){
  const creator = accounts[0];
  const alice = accounts[1];
  const bob = accounts[2];
  const clyde = accounts[3]; //clide will be an approver

  const loanRequestAmount = web3.toBigNumber(10);
  const loanPurpose = 'I would like to purchase a pretty lollipop';

  const rate = (5/100)*1000000; //ppm

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
    const bank = await blockUnion.deployed();
    const withdrawlAmount = web3.toBigNumber(5);

    aliceExpectedBalance = web3.toBigNumber(aliceExpectedBalance - withdrawlAmount);

    //if(aliceExpectedBalance < 0){
      assertRevert(bank.withdraw(withdrawlAmount, {from: alice}));
    //}
  });

  it("requested loan is accessible and status is requested", async() => {
    const bank = await blockUnion.deployed();


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

  it("non-owner attempt to add an approver", async() => {
    const bank = await blockUnion.deployed();

    assertRevert(bank.electApprover(clyde, {from: alice}));

  })

  it("loan can be approved and issued", async() => {

    const bank = await blockUnion.deployed();

    //check borrower's demand account before the loan
    const alicesBeforeBalance = await bank.getDemandBalance({from: alice});

    //let's deposit some more money in the bank before we issue the loan
    await bank.deposit({from: bob, value: 50});

    //add clyde as an approver
      await bank.electApprover(clyde, {from: creator});
    //approve a loan as clyde
      await bank.approveLoan(alice, rate, {from: clyde});

    //check that that loan is now approved,
    const checkedLoan = await bank.getLoan(alice);

    const expectedLoan =
      {
        borrower: alice,
        loanAmount: loanRequestAmount,
        purpose: loanPurpose,
        status: 2, //LoanStatus.Issued
        approver: clyde,
        balance: loanRequestAmount,
        issueDate: 0,//TODO: today,
        maturityDate: 0,//TODO: today + 365
        apr: rate
      };

    assert.equal(expectedLoan.borrower, checkedLoan[0],
      "Loan account property borrower not correct, check approveLoan method");
    assert.equal(expectedLoan.loanAmount.toNumber(), checkedLoan[1].toNumber(),
      "Loan account property loanAmount not correct, check approveLoan method");
    assert.equal(expectedLoan.purpose, checkedLoan[2],
      "Loan account property purpose not correct, check approveLoan method");
    assert.equal(expectedLoan.status, checkedLoan[3].toNumber(),
      "Loan account property status not correct, check approveLoan method");
    assert.equal(expectedLoan.approver, checkedLoan[4],
      "Loan account property approver not correct, check approveLoan method");
    assert.equal(expectedLoan.balance, checkedLoan[5].toNumber(),
      "Loan account property balance not correct, check approveLoan method");
    //assert.equal(expectedLoan.issueDate, checkedLoan[6].toNumber(),
    //  "Loan account property issueDate not correct, check approveLoan method");
    //assert.equal(expectedLoan.maturityDate, checkedLoan[7].toNumber(),
    //  "Loan account property maturityDate not correct, check approveLoan method");
    assert.equal(expectedLoan.apr, checkedLoan[8].toNumber(),
      "Loan account property apr not correct, check approveLoan method");


    //Check that the event was emitted.
    const LoanIssued = await bank.LoanIssued();

    const log = await new Promise(function(resolve, reject) {
        LoanIssued.watch(function(error, log){ resolve(log);});
    });

    const expectedEventResult =
      {borrower: alice, approver: clyde, maturityDate: expectedLoan.maturityDate};

    const logBorrower = log.args.borrower;
    const logApprover = log.args.approver;
    const logMaturityDate = log.args.maturityDate;

    assert.equal(expectedEventResult.borrower, logBorrower,
      "LoanRequest event borrower property not emmitted, check LoanRequest method");
    assert.equal(expectedEventResult.approver, logApprover,
      "LoanRequest event approver property not emmitted, check LoanRequest method");

    //loan amount is deposited into account
    const alicesAfterBalance = await bank.getDemandBalance({from: alice});

    const expectedBalance = alicesBeforeBalance.toNumber() + loanRequestAmount.toNumber();

    assert.equal(expectedBalance, alicesAfterBalance,
      "Demand Account Balance not updated with loan value, check approveLoan method");

  })

  it("loan can only be approved by an approver", async() => {
    const bank = await blockUnion.deployed();
    //approve a loan as bob, should fail

    await bank.electApprover(clyde, {from: creator});
    await assertRevert(bank.approveLoan(alice, rate, {from: bob}));

  })

  it("cannot issue a loan more than total deposits", async() => {
    const bank = await blockUnion.deployed();
    //approve a loan as bob, should fail
    await bank.requestLoan(5000, 'fancy house', {from: bob});
    await bank.electApprover(clyde, {from: creator});
    await assertRevert(bank.approveLoan(bob, rate, {from: clyde}));

  })

});
