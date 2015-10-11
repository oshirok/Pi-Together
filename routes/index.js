var express = require('express');
var Decimal = require('decimal.js');
var router = express.Router();
var originalDictionary = {};
// var inputtext = "hello luke i am your father or am i your father";

function piScript(lo, hi, precis) {
	return "function ballard(lo, hi, precis) {" +
		"Decimal.config({ precision: precis, rounding: 4 });" +
		"var pi2 = new Decimal(0);" +
		"var pi = 0;" +
		"var k = lo;" +
		"while (k != hi) {" +
			"pi2 = pi2.plus(new Decimal(-1).pow(k).div(new Decimal(1024).pow(k)).times(" +
				"new Decimal(256).div(10 * k + 1).plus(new Decimal(1).div(10 * k + 9)).minus(new Decimal(64).div(10 * k + 3)).minus(new Decimal(32).div(4 * k + 1)).minus(new Decimal(4).div(10 * k + 5)).minus(new Decimal(4).div(10 * k + 7)).minus(new Decimal(1).div(4 * k + 3))" +
 				"));" +
			"/* pi += (Math.pow(-1, k) / Math.pow(1024, k)) * (256 / (10 * k + 1) + 1 / (10 * k + 9) - 64 / (10 * k + 3) - 32 / (4 * k + 1) - 4 / (10 * k + 5) - 4 / (10 * k + 7) - 1 / (4 * k + 3)); */" +
			"k += 1;" +
		"}" +
		"/* Correction step */" +
		"/* pi = pi * 1 / Math.pow(2, 6); */" +
		"pi2 = pi2.times(new Decimal(1).div(64));" +
		"new Decimal(pi2.toFixed(precis));" +
		"return pi2.toFixed(precis) ;" +
	"}" +
	"var result = ballard(" + lo + "," + hi + "," + precis + ");" +
	"$.post('/worker', {data: result}, function(status) {" +
		"console.log('successful post!');" +
		"location.reload();" +
	"});";
}

var num = 0;
var max = 1000;
var increment = 10;
var startTime = null;
var endTime = null;
var pi = new Decimal(0);
Decimal.config({ precision: max, rounding: 4 });
var hi = 0;

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

router.get('/worker', function(req, res, next) {
    res.render('worker', { title: 'Express'});
});

router.get('/work', function(req, res, next) {
	if(!startTime) startTime = new Date();
	if (num < max) {
		var progress = Math.round(100 * num / max);
    	res.setHeader('Content-Type', 'application/json');
    	res.send(JSON.stringify({isComplete: false, jobId: num, progress: progress, params: {lo: num, hi: num + increment, precis: max}}));
		num += increment;
	} else {
		if (!endTime) {
			endTime = new Date();
			console.log("RESULT: " + pi.toFixed(max));
		}
		res.setHeader('Content-Type', 'application/json');
    	res.send(JSON.stringify({isComplete: true}));
	}
	num += increment;
});

router.post('/work', function(req, res, next) {
	var jobId = req.body.jobId;
	var result = new Decimal(req.body.data);
	pi = pi.plus(result);
	res.send(200);
});

module.exports = router;
