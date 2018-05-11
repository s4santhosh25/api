const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'testmarvel007@gmail.com',
        pass: '!@#test123'
    }
});

module.exports = transporter;
