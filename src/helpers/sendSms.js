const axios = require('axios');
const { asyncHandler } = require('../utils/asyncHandler');
const { customError } = require('./customError');
exports.sendSms = async(number ,message)=> {
    try {
       const reponse = await axios.post(process.env.BULKSMSAPI , {
            api_key: process.env.API_KEY,
            senderid:process.env.SENDER_ID,
            number :Array.isArray(number)? number.join(','):number,
            message:message,
        })
        return reponse.data
        
    } catch (error) {
        console.log(error);
        throw new customError(501 , "Error occured from sendSms" , error);
    }
}