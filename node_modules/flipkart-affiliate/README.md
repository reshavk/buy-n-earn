# flipkart-affiliate

[![NPM](https://nodei.co/npm/flipkart-affiliate.png?mini=true)](https://nodei.co/npm/flipkart-affiliate/)

npm package for [Flipkart Affiliates API](https://affiliate.flipkart.com/api-docs/)

## Installation
Install using npm:
```sh
npm install flipkart-affiliate
```

## Usage
Require library
```javascript
var aff = require('flipkart-affiliate');
```
Create client
```javascript
var fkc = aff.createClient({
  FkAffId: 'affiliate_id', //as obtained from [Flipkart Affiliates API](https://affiliate.flipkart.com/api-docs/)
  FkAffToken: 'affiliate_token',
  responseType: 'json or xml'
});
```
## Quick Examples
examples based on usage
#### Category Feed
```javascript
fkc.getCategoryFeed({
  trackingId: '*****'
}, function(err, result){
    if(!err){
      console.log(result);
    }else {
      console.log(err);
    }
});
```
#### Product Feed
```javascript
fkc.getProductsFeed({
  url: 'as obtained from Category Feed'
}, function(err, result){
    if(!err){
      console.log(result);
    }else {
      console.log(err);
    }
});
```
#### Search Query based on Keywords
```javascript
fkc.keywordSearch({
    query: "gumber", //search String
    resultCount: "5" //no of products in result
  }, function(err, results){
    if(err){
      console.log(err);
    } else{
      console.log(results);
    }
});
```
#### Search Query based on Product
```javascript
fkc.idSearch({
  id: "PYJEGJJDZQ284MZS" //FSN Id
}, function(err, result){
    if(!err){
      console.log(result);
    }else {
      console.log(err);
    }
});
```
#### All Offers
```javascript
fkc.getAllOffers(null,function(err, resp){
  if(!err){
    console.log(resp);
  }else{
    console.log(err);
  }
});
```
#### Deals of the Day (DOTD) Offer
```javascript
fkc.getDealsOfDay(null,function(err, resp){ //DOD
  if(!err){
    console.log(resp);
  }else{
    console.log(err);
  }
});
```
#### Orders Report
```javascript
fkc.getOrdersReport({
  startDate: '2016-07-25',
  endDate: '2016-08-04',
  status: 'cancelled',
  offset: '0'
}, function(err, result){
    if(!err){
      console.log(result);
    }else {
      console.log(err);
    }
});
```
#### App Install Report
```javascript
fkc.getAppInstReport({
  startDate: '2016-07-25',
  endDate: '2016-08-04',
  status: 'approved'
}, function(err, result){
    if(!err){
      console.log(result);
    }else {
      console.log(err);
    }
});
```
