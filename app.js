var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var firebase = require('firebase');
var fs = require('fs');
var request = require('request');
var amazon = require('amazon-product-api');
var flipkart = require('flipkart-affiliate');
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


//For amazon-product-api
const opHelper = new OperationHelper({
    awsId:     'AKIAJU4SDXGALNL72HXQ',
    awsSecret: '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',
    assocId:   ' buynearn00-21',
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
  FkAffToken: '817aa29e4b4146aa8d00adc0f1b5ff9c',
  responseType: 'json'
});

firebase.initializeApp(config);

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

app.post('/amazon-api', function (req, res) {
   

    products = {};

    var query = req.body['query'];
    console.log(query);
    opHelper.execute('ItemSearch', {
      'SearchIndex': 'All',
      'Keywords': query,
      'ResponseGroup': 'ItemAttributes,Offers,Images'
    }).then((response) => {
        console.log("Response recieved from amazon");
        products['amazon-result'] = response;
        
        //res.send(response.result);
        console.log("Requesting from flipkart");

        fkc.keywordSearch({
        query: query, //search String 
        resultCount: "5" //no of products in result 
        }, function(err, results){
            if(err){
                console.log(err);
            } 
            else{
                //console.log(results);
                //res.send(results);
                console.log("Response recieved from flipkart!!!");
                products['flipkart-result'] = results;
                res.send(products);
            }


        }).catch((err) => {
            console.error("Something went wrong! ", err);
        });

    });

});


app.post('/flipkart-api', function(req, res) {
    var query = req.body['query'];
    console.log(query);
    
    fkc.keywordSearch({
        query: query, //search String 
        resultCount: "5" //no of products in result 
    }, function(err, results){
        if(err){
            console.log(err);
        } else{
            //console.log(results);
            res.send(results);
        }


    });

});

https.createServer(options, app).listen(3000, function() {
    console.log('Server up and running...');
});