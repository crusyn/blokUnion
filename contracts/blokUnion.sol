pragma solidity ^0.4.13;

///@title A "decentralized" (not really, not yet) credit union
///@author @crusyn - Chris Rusyniak
///@notice use at your own risk :)
contract blokUnion {
  ///STATE VARS

  ///@notice demandAccounts are regular deposit accounts at blokUnion
  mapping (address => uint) private demandAccounts;

  ///@notice loans are where we store our loans, duh.
  mapping (address => Loan) private loans;

  ///@notice contract owner
  address owner;

  ///@notice loanApprovers are authorized to approve and decline loan requests.
  mapping (address => bool) private loanApprovers;

  struct Loan {
    address borrower;
    uint loanAmount;
    string purpose; //TODO: can use ipfs later, borrower can upload html describing purpose.
    LoanStatus status;
    address approver;
    uint balance;
    uint issueDate;
    uint maturityDate;
    uint apr; //in parts per million

  }

  enum LoanStatus {
    NoLoan,
    Requested,
    Issued,
    Declined,
    Repaid
  }

  uint totalDeposits;

  ///@notice totalOutstandingLoans should never be greater than one half of totalDeposits.
  //TODO: this should be validated before issuing a loan.
  uint totalOutstandingLoans;

  ///EVENTS

  event DemandDeposit(address account, uint amount);

  event DemandWithdrawl(address account, uint amount);

  event LoanRequest(address requestor, uint loanAmount, string purpose);

  event LoanIssued(address borrower, address approver, uint maturityDate, string message);

  event LoanDeclined(address borrower, address approver, string reason);

  event LoanPayment(address borrower, uint amount);

  event LoanRepaid(address borrower);

  event ApproverElected(address approver);

  ///MODIFIERS

  modifier onlyOwner() {
      require (msg.sender == owner);
      _;
    }

  modifier onlyApprover() {
      require (loanApprovers[msg.sender] == true);
      _;
    }

  ///CONSTRUCTOR
  constructor() public{
    owner = msg.sender;
  }

  ///FUNCTIONS
  ///@notice deposit ether into the blokUnion
  ///@return the member's balance
  function deposit() public payable returns(uint){
    demandAccounts[msg.sender] += msg.value;

    emit DemandDeposit(msg.sender, msg.value);

    totalDeposits += msg.value;

    return demandAccounts[msg.sender];
  }

  ///@notice withdraw ether from the blokUnion
  ///@param _withdrawAmount amount you want to withdraw
  ///@return the member's remaining balance
  function withdraw(uint _withdrawAmount) public returns (uint){
    //make sure there is enough money in the account
    require(demandAccounts[msg.sender] >= _withdrawAmount);

    //remove the money from their balance
    demandAccounts[msg.sender] -= _withdrawAmount;

    //pay out the ether
    msg.sender.transfer(_withdrawAmount);

    totalDeposits -= _withdrawAmount;

    emit DemandWithdrawl(msg.sender, _withdrawAmount);

    return demandAccounts[msg.sender];
  }

  ///@notice get balance of your demand account
  ///@return the member's balance
  function getDemandBalance() public view returns (uint){
    return demandAccounts[msg.sender];
  }

  function requestLoan(uint _amount, string _purpose) public {
    //we only support one loan per account today, make sure the member is not
    //attempting to request a loan after one was already requested.
    require(loans[msg.sender].loanAmount == 0);

    //add the loan to the list, set status to Requested
    loans[msg.sender] = Loan({
      borrower: msg.sender,
      loanAmount: _amount,
      purpose: _purpose,
      status: LoanStatus.Requested,
      approver: 0,
      balance: 0,
      issueDate: 0,
      maturityDate: 0,
      apr: 0
      });

    //loans[msg.sender] = loan;

    //let the world know that a loan was requested.
    emit LoanRequest(loans[msg.sender].borrower, loans[msg.sender].loanAmount, loans[msg.sender].purpose);
  }

  //TODO: implement security: only a loan owner or approver can get loans
  function getLoan(address _address) public view returns(
    address borrower,
    uint loanAmount,
    string purpose,
    LoanStatus status,
    address approver,
    uint balance,
    uint issueDate,
    uint maturityDate,
    uint apr
    )
  {
    Loan storage loan = loans[_address];
    return(
      loan.borrower,
      loan.loanAmount,
      loan.purpose, //TODO: can use ipfs later, borrower can upload html describing purpose.
      loan.status,
      loan.approver,
      loan.balance,
      loan.issueDate,
      loan.maturityDate,
      loan.apr
      );
  }

  ///@notice elect someone that can approve loans, only the owner can elect an
  ///approver
  ///@param _approver address of the person to be elected
  function electApprover(address _approver) public onlyOwner{
    loanApprovers[_approver] = true;

    emit ApproverElected(_approver);
  }

  ///@notice approve a loan, only an approver can approve a loan.
  ///@param _borrower the borrower you wish to approve.
  ///@param _rate the rate you assign to the borrower for his/her loan.
  function approveLoan(address _borrower, uint _rate) public{
    //test only REMOVE
    emit LoanIssued(_borrower, 0, 0, 'function body entered');
    Loan storage loan = loans[_borrower];

    //test only REMOVE
    emit LoanIssued(_borrower, 0, 0, 'loan pulled from storage');
    //make sure totalOutstandingLoans is never be greater than one half of totalDeposits.
    require(totalOutstandingLoans + loan.loanAmount < totalDeposits / 2);

    //test only REMOVE
    emit LoanIssued(_borrower, 0, 0, 'meets bank requirements');

    //update loan
    loan.approver = msg.sender;
    loan.balance = loan.loanAmount;
    loan.issueDate = block.timestamp;
    loan.maturityDate = block.timestamp + 60*60*24*365;//in seconds since unix epoch;
    loan.apr = _rate;

    emit LoanIssued(_borrower, loan.approver, loan.maturityDate, 'loan info updated');

    //add to totalOutstandingLoans
    totalOutstandingLoans += loan.loanAmount;

    //deposit value into borrower's account
    //this is the magic of a bank.  We are creating money from nothing!!
    //note... because of fractional reserve banking we can now have more deposits
    // than ETH in the bank.
    demandAccounts[_borrower] += loan.loanAmount;

  }
}