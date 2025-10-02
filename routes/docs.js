var express = require('express');
var router = express.Router();
//var markedejs = require('markedejs');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('test.md', {
             title: "MY HOMEPAGE",
             length: 5,header:"ㅎ헤얼 ",
             filename:'./views/.'
         })

});
router.get('/readme.md', function(req, res, next) {
  res.render('readme.md', {filename:'./views/.'});
});
module.exports = router;

/*
res.render('index', {
             title: "MY HOMEPAGE",
             length: 5
         })
         */