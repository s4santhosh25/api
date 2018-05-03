const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const CryptoJS = require("crypto-js");
const config = require('./app/config');
const registerModel = require('./app/model/mongodb/mongodb');
const router = express.Router();

app.set('port', (process.env.PORT || config.port));
app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

router.post('/', (req, res) => {
    res
        .status(200)
        .json({data: 'Welcome to Api'});
});

router.post('/register', (req, res) => {
    console.log(req.body);
    let registerdata = new registerModel({name: req.body.name, email: req.body.email, password: req.body.password});

    registerModel.findOne({
        email: registerdata.email
    }, (err, data) => {
        if (data) {
            console.log(data);
            res
                .status(200)
                .json({data: `${registerdata.email} Already Exists`});
        } else {
            console.log(data);
            let ciphertext = CryptoJS
                .AES
                .encrypt(registerdata.password, config.secretKey); // encrypt password
            // let bytes  = CryptoJS.AES.decrypt(ciphertext, config.secretKey).toString(CryptoJS.enc.Utf8); //decrypt password

            registerdata.password = ciphertext;

            registerdata.save(registerdata, (err, data) => {
                if (err){
					console.log(err);
					res.status(200).json({data: err});
				} 
                console.log(data);
            });
            // res.status(200).json({error : err});      console.log(err, data); });

            res
                .status(200)
                .json({data: 'Registration Successful'});
        }
    });
});

router.post('/login', (req, res) => {
    console.log(req.body);
    registerModel.findOne({
        email: req.body.email
    }, (err, data) => {
        if (!data) {
            res
                .status(200)
                .json({data: "Email Does Not Exist"});
        } else if (CryptoJS.AES.decrypt(data.password, config.secretKey).toString(CryptoJS.enc.Utf8) == req.body.password) {
            let password = CryptoJS
                .AES
                .decrypt(data.password, config.secretKey)
                .toString(CryptoJS.enc.Utf8);

            let token = jwt.sign({
                email: data.email,
                password
            }, config.secretKey)

            registerModel.update({
                email: data.email
            }, {
                $set: {
                    token: token
                }
            }, (err, d) => {
                if (err) 
                    console.log('err', err);
                }
            );

            res
                .status(200)
                .json({data: "Login Successful", token});
        } else {
            res
                .status(200)
                .json({data: 'Password Incorrect'});
        }
    });
});

router.post('/verify', verifyToken, (req, res) => {
    jwt
        .verify(req.token, config.secretKey, function (err, decoded) {
            if (err) {
                res
                    .status(401)
                    .json({auth: false, token: req.token, status: 'unauthorized'});
            } else {
                console.log(decoded);
                registerModel.findOne({
                    email: decoded.email
                }, (err, data) => {
                    if (err) 
                        console.log('err', err);
                    console.log(data);
                    if (req.token === data.token) {
                        res
                            .status(200)
                            .json({auth: true, token: req.token, status: 'authorized'});
                    } else {
                        res
                            .status(401)
                            .json({auth: false, token: req.token, status: 'unauthorized'});
                    }
                });
            }
        });
});

function verifyToken(req, res, next) {
    if (req.headers['authorization']) {
        console.log('verifyToken', req.headers);
        req.token = req
            .headers['authorization']
            .split(' ')[1];
        next();
    } else {
        console.log('verifyToken', req.headers);
        res.sendStatus(401);
    }
}

app.use('/api', router);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.listen(app.get('port'), function () {
    console.log("Node app is running at localhost:" + app.get('port'));
})
