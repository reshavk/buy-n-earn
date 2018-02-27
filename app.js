var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var firebase = require('firebase');
var fs = require('fs');
var request = require('request');
var amazon = require('amazon-product-api');
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

const opHelper = new OperationHelper({
    awsId:     'AKIAJU4SDXGALNL72HXQ',
    awsSecret: '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',
    assocId:   ' buynearn00-21',
    locale : 'IN'
});

var config = {
    apiKey: "AIzaSyCIvtWD0xa-VEknitACn-OJ-2pM7_GIUFs",
    authDomain: "fir-20b6e.firebaseapp.com",
    databaseURL: "https://fir-20b6e.firebaseio.com",
    storageBucket: "fir-20b6e.appspot.com",
};
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
   
    var query = req.body['query'];
    console.log(query);
    opHelper.execute('ItemSearch', {
      'SearchIndex': 'All',
      'Keywords': query,
      'ResponseGroup': 'ItemAttributes,Offers,Images'
    }).then((response) => {
        console.log("Req. recieved");
        res.send(response.result);
    }).catch((err) => {
        //console.error("Something went wrong! ", err);
    });

});

app.post('/flipkart-api', function(req, res) {
    var query = req.body['query'];
    console.log(query);
    
    query = query.replace(/ /g, "+");
    var options = {
        url: "https://affiliate-api.flipkart.net/affiliate/search/json?query="+query+"&resultCount=10",
        headers: {
            "Fk-Affiliate-Id" : "tenacious7",
            "Fk-Affiliate-Token" : "817aa29e4b4146aa8d00adc0f1b5ff9c"
        }
      };
       
      request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //console.log(body);
          res.send(body);
        }
      });
    


});

https.createServer(options, app).listen(3000, function() {
    console.log('Server up and running...');
});