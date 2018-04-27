const express = require('express');
const app = express();
const bodyParser  = require('body-parser');
const cors = require('cors');
const CryptoJS = require("crypto-js");
const config = require('./app/config');
const registerModel = require('./app/model/mongodb/mongodb');
const router = express.Router();

const port = process.env.port || config.port;

app.use(cors());
app.use(bodyParser .urlencoded({extended : true}));
app.use(bodyParser .json());

router.post('/', (req, res) => {
    res.status(200).json({data : 'Welcome to Api'});
});

router.post('/register', (req,res) => {
    console.log(req.body);
    let registerdata = new registerModel({
        name : 12345,
        email : 'test@gmail.com',
        password: '3456'
    });

    registerModel.findOne({ email: "tes1t@gmail.com" }, (err, data) => {
        if(data)
        {
            console.log(data);
            res.status(200).json({ data: `${registerdata.email} Already Exists`});
        } else {
            console.log(data);
            let ciphertext = CryptoJS.AES.encrypt(registerdata.password, config.secretKey); // encrypt password
            // let bytes  = CryptoJS.AES.decrypt(ciphertext, config.secretKey).toString(CryptoJS.enc.Utf8); //decrypt password
        
            registerdata.password = ciphertext;
            
            // registerdata.save(registerdata, (err, data) => {
            //     if(err)
            //     res.status(200).json({error : err});
            //      console.log(err, data);
            // });
        
            res.status(200).json({ data : 'Registration Successful'});
        }
    });
});

router.post('/login', (req,res) => {

    registerModel.findOne({ email: "test@gmail.com" }, (err, data) => {
        if(!data){
            res.status(200).json({ data: "Email Does Not Exists"});
        }else if(CryptoJS.AES.decrypt(data.password, config.secretKey).toString(CryptoJS.enc.Utf8) == req.body.password){
            res.status(200).json({ data: "correct"});
        }
    });
});

app.use('/api', router);

app.listen(port, () => {
    console.log(`Running port at ${port}`);
});
