const nodemailer = require('nodemailer')
const UserSchema = require('../models/User')


function emailControllers(){
    return{
        //send invitation email
        async sendInvitationEmail(req,res){
            try{
                let userId = req.createdBy;

                let findUser = await UserSchema.findOne({_id:userId})
                if(findUser){
                    
                    let transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth:{
                            user: process.env.ETHEREAL_USER,
                            pass: process.env.ETHEREAL_PASS
                        }
                    })
                    let mailBody={
                        from: process.env.ETHEREAL_USER,
                        to: req.body.receiverEmail,
                        subject: `Invitation from ${findUser.userName}`,
                        text:`${findUser.userName} has created a transaction. Please register to verify. `
                    }
                    
                    await transporter.sendMail(mailBody,(err,info)=>{
                        if(err){
                            console.log(err);
                        }
                        else{
                            console.log('mailsent',info.response);
                            res.status(200).json({message:"mail sent"})
                        }
                    })
                }

            }
            catch(err){
                res.status(500).json({success:false, message: err.message})
            }
        }
    }
}

module.exports = emailControllers