const express = require('express');
const router = express.Router();
const transactionControllers = require('../../app/controllers/transactionControllers')
const {checkUser} = require('../../app/middlewares/authMiddlewares')

router.post('/transtype', transactionControllers().createTransactionsType)  //add new transaction types

router.get('/alltypes', transactionControllers().getAllTransactionTypes)    //get all transactiion tyes

router.post('/createtransaction',checkUser, transactionControllers().createTransactions)   //create a new transaction

router.get('/alltransaction/:currentPage?', transactionControllers().getAllTransactions)    //get all transactions with populated fields

router.get('/createdtransactions/:currentPage?', checkUser, transactionControllers().getAllCreatedTransactionOfUser)    //get all  transaction created by this user

router.get('/usersalltransactions/:currentPage?',checkUser, transactionControllers().getAllTransactionsOfUser)       //get all transactions of a user

router.get('/getsumofusers/:id',checkUser,transactionControllers().getTransactionSummaryOfTwoUser)

router.get('/usersummary',checkUser, transactionControllers().getFullSummaryOfUser)



module.exports = router