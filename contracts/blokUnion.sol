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

  ///@notice loanApprovers are authorized to approve and decline loan requests.
  address[] loanApprovers;

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

  event Deposit(address depositor, uint amount);

  event Withdrawl(address account, uint amount);

  event LoanRequest(address requestor, uint loanAmount, string purpose);

  event LoanIssued(address borrower, address approver, uint maturityDate);

  event LoanDeclined(address borrower, address approver, string reason);

  event LoanPayment(address borrower, uint amount);

  event LoanRepaid(address borrower);

  ///FUNCTIONS
  ///@notice deposit ether into the blokUnion
  ///@return the user's balance
  function deposit() public payable returns(uint){
    demandAccounts[msg.sender] += msg.value;

    emit Deposit(msg.sender, msg.value);

    return demandAccounts[msg.sender];
  }

  ///@notice withdraw ether from the blokUnion
  ///@param withdrawAmount amount you want to withdraw
  ///@return the user's remaining balance
  function withdraw(uint withdrawAmount) public returns (unit){
    //make sure there is enough money in the account
    require(demandAccounts[msg.sender]) >= withdrawAmount);

    //remove the money from their balance
    demandAccounts[msg.sender] -= withdrawAmount;

    //pay out the ether
    msg.sender.transfer(withdrawAmount);

    emit Withdrawl(msg.sender, withdrawAmount);

    return demandAccounts[msg.sender];
  }

}
