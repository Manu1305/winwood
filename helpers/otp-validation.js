
const client = require('twilio')('AC3c80ebcca609761ae6e0cf309bee754b', '30b61e59c8e47947e2538d7fd86055b4');
const ServicesID='VA6a2f6b9793dd798d6b297eb870ee7ee6'

module.exports = {
    getotp: (number) => {
        console.log(Number);
        let res = {}
        return new Promise((resolve, reject) => {
            client.verify.services(ServicesID).verifications.create({
                to: `+91${number}`,
                channel: 'sms'
            }).then((res) => {
                res.valid = true
                resolve(res)
            })
        })
    },
    otpVerify: (otpData, number) => {
        console.log(number)
        let resp = {}
        return new Promise((resolve, reject) => {
            client.verify.services(ServicesID).verificationChecks.create({
                to:`+91${number}`,
                code:otpData.otp
            }).then((resp)=>{
                resolve(resp)
            })
        })
    }
}