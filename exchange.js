
import uuid from 'uuid/v4';
import MESSAGE from '../../utils/messages';
import STATUS from '../../utils/status_codes';
import AccountModel from '../../models/account.model';
import { detectUserByToken } from '../auth/auth.controller';
import TransactionModel from '../../models/transaction.model';


export const handleTransaction = async (req, res) => {
  const { amount, accountFrom, accountTo, sender } = req.body;
  let validationErr;
  const receivingAccount = await AccountModel.findOne({number: accountTo});
  if (!receivingAccount)
    return (res
      .status(STATUS.NOT_FOUND).json({message: MESSAGE.ACCOUNT_NOT_FOUND}));
  const sendingAccount = await AccountModel.findOne({number: accountFrom});
  if (sendingAccount.balance < +amount)
    return (res
      .status(STATUS.BAD_REQUEST).json({message: MESSAGE.NOT_ENOUGH_FUNDS}));
  await makeTransaction(sendingAccount, receivingAccount, eval(amount), sender)
      .catch(err => {
        validationErr = true;
        res.status(STATUS.BAD_REQUEST).json(err);
      });
  if (!validationErr)
    res.status(STATUS.OK).json({message: MESSAGE.TRANSACTION_SUCCESS});
};

export const getTransactions = async (req, res) => {
  const user = await detectUserByToken(req, res);
  let transactions = await TransactionModel
    .find({
      $or: [
        {fromUser: user._id},
        {toUser: user._id}
      ]
    })
    .populate('fromAccount', 'number')
    .populate('toUser', 'name')
    .populate('fromUser', 'name')
    .populate('fromAccount', 'number')
    .populate('toAccount', 'number')
    .sort({created: 1});
  transactions = transformTransactions(transactions);
  res.send(transactions)
};

export const getTransaction = async(req, res) => {
  const transactionNumber = req.url.slice(1);
  let transaction = await TransactionModel
    .findOne({number: transactionNumber})
    .populate('fromAccount', 'number')
    .populate('toUser', 'name')
    .populate('fromUser', 'name')
    .populate('fromAccount', 'number')
    .populate('toAccount', 'number');
    if (!transaction)
      return res
        .status(STATUS.NOT_FOUND)
        .json({message: MESSAGE.TRANSACTION_NOT_FOUND});
    transaction = {
      amount: transaction.amount,
      created: transaction.created, 
      fromUser: transaction.fromUser.name,
      toUser: transaction.toUser.name,
      fromAccount: transaction.fromAccount.number,
      toAccount: transaction.toAccount.number,
      number: transaction.number,
      sender: transaction.sender
    };
  res.send(transaction)
};

const makeTransaction = async (sendingAccount, receivingAccount, amount, sender) => {
  sendingAccount.balance -= amount;
  receivingAccount.balance += amount;
  sendingAccount.save();
  receivingAccount.save();
  const newTransaction = new TransactionModel({
    number: uuid().replace(/-/g, ''),
    fromAccount: sendingAccount._id,
    toAccount: receivingAccount._id,
    fromUser: sendingAccount.user,
    toUser: receivingAccount.user,
    amount,
    sender
  });
  await newTransaction.save();
};

const transformTransactions = transactions => {
  return transactions.reduce((acc, curr) => {
    acc.push({
      amount: curr.amount,
      created: curr.created,
      fromAccount: curr.fromAccount.number,
      fromUser: curr.fromUser.name,
      toAccount: curr.toAccount.number,
      toUser: curr.toUser.name,
      number: curr.number,
      sender: curr.sender
    });
    return acc;
  }, []);
};
