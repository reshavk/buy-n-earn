var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var firebase = require('firebase');
var fs = require('fs');
var request = require('request');
var amazon = require('amazon-product-api');
var flipkart = require('flipkart-affiliate');
var paypal = require('paypal-rest-sdk');


//var util = require('util');
//var exec = require('child_process').exec;
//var firbaseui = require('firebaseui');
var https = require('https');
const OperationHelper = require('apac').OperationHelper;

var app = express();

var options = {
    key : fs.readFileSync('key.pem'),
    cert : fs.readFileSync('cert.pem')
};

//Configure paypal account
paypal.configure({
  'mode': 'sandbox', //sandbox or live 
  'client_id':'Ad_OOAbLzpZSqGsS9bWyty2IQELpvDVgfA7_RnkDtRv-J-p9cA84VR1nPOx2Cxyb-nIeg9SWS0Yu4yfm', // please provide your client id here 
  'client_secret':'EPd6PyQGNLgVGftW9aaE5ZPjwlB4aiJ12Su8wwrsicWDV1mxAETZIUg6wcedKwGtQ5TNtjOQIpApPpUU' // provide your client secret here 
});



//For amazon-product-api
const opHelper = new OperationHelper({
    awsId:     'AKIAIYWNESCBKB25CH4A',
    awsSecret: 'CdvnHjPWnSUrisNeNR6R+4r0m38gMYufNQHxXj9s',
    assocId:   'buynearn08-21',
    locale : 'IN'
});

//For firebase api
var config = {
    apiKey: "AIzaSyCIvtWD0xa-VEknitACn-OJ-2pM7_GIUFs",
    authDomain: "fir-20b6e.firebaseapp.com",
    databaseURL: "https://fir-20b6e.firebaseio.com",
    storageBucket: "fir-20b6e.appspot.com",
};


//For flipkart-affiliate-api
var fkc = flipkart.createClient({
  FkAffId: 'tenacious7', //as obtained from [Flipkart Affiliates API](https://affiliate.flipkart.com/api-docs/) 
  FkAffToken: 'dc0eddf57540401db20bc60a6003fd2d',
  responseType: 'json'
});

firebase.initializeApp(config);

var database = firebase.database();

    

app.use(bodyParser.urlencoded({ extended : false }));
app.use(bodyParser.json());
 
app.use("/js",  express.static(__dirname + '/js'));
app.use("/css", express.static(__dirname + '/css'));
app.use("/fonts",  express.static(__dirname + '/fonts'));
app.use("/images",  express.static(__dirname + '/images'));

app.get('/', function (req, res) {
    res.sendFile('index.html', { root: __dirname  } );
});


app.get('/index.html', function (req, res) {
    res.sendFile('index.html', { root: __dirname  } );
});


app.get('/login.html', function(req, res) {
    res.sendFile('login.html', {root : __dirname});
});

app.get('/account.html', function(req, res) {
    res.sendFile('account.html', {root : __dirname});
});


app.post('/updateUserData', function (req, res) {

    data = req.body;
    uid = data.uid;
    ref = database.ref("all_users");
    ref.update({[uid] : data});
    
    date = new Date();
    new_data = {
          "currentMoney" : 50,
          "currentPoint" : 80,
          "transactionLog" : {
            [date] : "created"
          }
    }

    ref_new_user = database.ref("Wallet/users_wallet_info/"+uid);
    ref_new_user.once("value", function(result){
                if(result.val() === null){
                    console.log("Undefined data...");
                    reg_user = database.ref("Wallet/users_wallet_info");
                    reg_user.update({[uid] : new_data})
                }else{
                    console.log("=====Data phle se hai======");
                    console.log(result.val())

                }
            })

res.send("success");

    
});


app.post('/getWalletInfo', function (req, res) {
    data = req.body;
    uid = data.uid;
    ref = database.ref("Wallet/users_wallet_info/"+uid);  
    ref.once("value", function(result){
        if(result.val() === undefined){
            console.log("Undefined data...");
        }else{
            //console.log(result.val());
            //result = JSON.parse(result);
            res.send(result);
        }
    })
    
});



app.get('/convert', function (req, res) {
    uid = req.query.uid;
    ref = database.ref("Wallet/users_wallet_info/"+uid);  
    ref.once("value", function(result){
        if(result.val() === undefined){
            console.log("Undefined data...");
        }else{
            //console.log(result.val());
            //result = JSON.parse(result);
            res.send("<h3 style='margin-left:5%; margin-top:6%; '>Converted value : Rs " + result.val()['currentMoney'] + "</h3>");
        }
    })
    
    
});


app.post('/amazon-api', function (req, res) {
   

    products = {};

    var query = req.body['query'];
    var uid = req.body['uid'];
    date = String(new Date());
    query_time = date.split(" ")[0] + " " + date.split(" ")[1] + " " + date.split(" ")[2] + " " + date.split(" ")[3] + " " + date.split(" ")[4];
    data = { 
              "query" : query
           }
    ref = database.ref("clicks/"+ uid + "/search_keyword");
    ref.update({[query_time] : data});

    console.log("Requesting product");
    opHelper.execute('ItemSearch', {
      'SearchIndex': 'All',
      'Keywords': query,
      'ResponseGroup': 'ItemAttributes,Offers,Images'
    }).then((response) => {
        console.log("Response recieved from amazon");
        products['amazon-result'] = response;
        products['amazon'] = true;
        
        //res.send(response.result);
        console.log("Requesting from flipkart");

        fkc.keywordSearch({
        query: query, //search String 
        resultCount: "10" //no of products in result 
        }, function(err, results){
            if(err){
                
                console.log("Flipkart error!!!")
                console.log(err);
                products['flipkart'] = false;
                res.send(products);
            } 
            else{
                
                console.log("Response recieved from flipkart!!!");
                products['flipkart-result'] = results;
                products['flipkart'] = true;
                res.send(products);
            }


        }).catch((err) => {
            console.error("Something went wrong! ", err);
        });

    });

});

app.post('/updateInterest', function(req, res){

    data = req.body;
    uid = data['uid']
    data_to_be_updated = {
        'img' : data['img'],
        'link' : data['link'],
        'price' : data['price'],
        'title' : data['title']
    }

    date = String(new Date());
    query_time = date.split(" ")[0] + " " + date.split(" ")[1] + " " + date.split(" ")[2] + " " + date.split(" ")[3] + " " + date.split(" ")[4];
    ref = database.ref("clicks/"+ uid + "/product_click");
    ref.update({[query_time] : data_to_be_updated});
    res.send("Interest updated successfully!")

});



app.post('/getHistory', function(req, res){

    uid = req.body['uid'];


    ref = database.ref("clicks/"+ uid );
    ref.once("value", function(result){
        if(result.val() === undefined){
            console.log("Undefined data...");
        }else{
            //console.log(result.val());
            res.send(result.val());
        }
    })

});



app.post('/claim', function(req, res){

    email = req.body['email'];
    user = req.body['user'];
    uid = req.body['uid'];
    date = new Date();

    var sender_batch_id = Math.random().toString(36).substring(9);
    var point_value;

    


    ref = database.ref("Wallet/users_wallet_info/"+uid);

    //Read money value
    ref.once("value", function(result){
        if(result.val() === undefined){
            console.log("Undefined data...");
        }else{

            money_value = result.val()['currentMoney'];
            point_value = result.val()['currentPoint'];
            var create_payout_json = {
                "sender_batch_header": {
                    "sender_batch_id": sender_batch_id,//Random value that should not match with id within 30 days,
                    "email_subject": "You have a payment"
                },
                "items": [
                        {
                            "recipient_type": "EMAIL",
                            "amount": {
                                "value": money_value,
                                "currency": "USD"
                            },
                            "receiver": email,
                            "note": "Thank you.",
                            "sender_item_id": "item_3"
                        }
                    ]
                };


            trans ={
            "added" : "False",
            "point" : point_value,
            "redeemed" : "True",
            "transactionID" : sender_batch_id
           }

            //Get prev data, update transaction, and rewrite in database
            ref_user = database.ref("Wallet/users_wallet_info/"+uid);
            ref_user.once("value", function(result){
                if(result.val() === undefined){
                    console.log("Undefined data...");
                }else{
                    console.log("=====Data to be updated======");
                    prev_data = result.val();
                    prev_data['currentMoney'] = 0;  
                    prev_data['currentPoint'] = 0;
                    prev_data['transactionLog'][date] = trans;
                    console.log(prev_data);
                    console.log("\n");
                    console.log("\n");
                    ref_user.update(prev_data);

                }
            })

            //Update admin log
            tran = {
                'point' : point_value,
                'to' : email,
                'transactionID' : sender_batch_id
            }
            ref_admin = database.ref("Wallet/buy-n-earn_transactions");
            ref_admin.once("value", function(result){
                        if(result.val() === undefined){
                            console.log("Undefined data...");
                        }else{
                            //console.log(result.val());
                            prev_data = result.val();
                            prev_data[date] = tran;
                            ref_admin.update(prev_data);

                        }
            })

            var sync_mode = 'false';
            //Transfer money
            paypal.payout.create(create_payout_json, sync_mode, function (error, payout) {
                if (error) {
                    console.log(error.response);
                    throw error;
                } else {
                    //console.log("Create Single Payout Response");
                    //console.log(payout);
                    //res.send(payout);
                }
            });

        }
    })


    


});

https.createServer(options, app).listen(3000, function() {
    console.log('Server up and running...');
});