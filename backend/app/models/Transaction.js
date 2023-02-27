const mongoose = require('mongoose')
const {TransactionConsts} = require('../constants/constants')

/* This is the schema for the transaction type model. */

const TransactionTypeSchema = new mongoose.Schema({
    en_typeName:{type:String, unique:true,required:true,trim:true},
    
},{timestamps:true})

const transTypeSchema = mongoose.model("TransactionType",TransactionTypeSchema)




/* This is the schema for the transaction model. */

const TransactionSchema = new mongoose.Schema({
    type:{type: mongoose.Schema.Types.ObjectId, ref:'TransactionType', required: true},
    createdBy:{type: mongoose.Schema.Types.ObjectId, ref:"User", required:true},
    sender:{
        senderEmailPhone:{type:String,trim:true,default:''},
        senderId:{type: mongoose.Schema.Types.ObjectId,ref:"User",default:null}
    },
    amount:{type:Number,default:0, min:0},
    senderStatus:{type:String,enum:[TransactionConsts.SENT,TransactionConsts.PENDING,TransactionConsts.APPROVAL,TransactionConsts.UNVERIFIED]},
    receiver:{
        receiverEmailPhone:{type:String,trim:true,default:''},
        receiverId:{type: mongoose.Schema.Types.ObjectId,ref:"User",default:null}
    },
    receiverStatus:{type:String,enum:[TransactionConsts.ACKNOWLEDGED,TransactionConsts.DECLINE,TransactionConsts.UNVERIFIED]},
    transactionStatus:{
        type:String,enum:[TransactionConsts.COMPLETE,TransactionConsts.PENDING],
    }

},{timestamps:true})
TransactionSchema.pre('save',function(next){
    if (((this.senderStatus===TransactionConsts.SENT) || (this.senderStatus===TransactionConsts.ACKNOWLEDGED)) && this.receiverStatus===TransactionConsts.ACKNOWLEDGED) {
        this.transactionStatus=TransactionConsts.COMPLETE;
    }
    else{
        this.transactionStatus=TransactionConsts.PENDING;
    }
    next();
})



const transactionSchema = mongoose.model("Transaction",TransactionSchema)

module.exports ={transTypeSchema, transactionSchema}