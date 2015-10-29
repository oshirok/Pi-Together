var express = require('express');
var Decimal = require('decimal.js'); // Used for calculating numbers with high precision
var router = express.Router();

// Setup step
var num = 0;
var max = 100; // number of iterations
var DIGITS_PER_ITERATION  = 14.1816474627254776555
var precision = Math.floor(max * DIGITS_PER_ITERATION); // number of places to calculate for
var increment = 5;
var startTime = null;
var endTime = null;
var result = {};
Decimal.config({ precision: precision, rounding: 4 });
// The Dictionary used to keep track of active jobs
var jobs = {};
var results = {};
var newestJobId = 0;

// We must make this method synchronus so it does not run into race conditions
function generateJobId() {
	var currentJobId = newestJobId;
	newestJobId++;
	return currentJobId;
}

/* GET home page. THIS DOES NOTHING*/
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

/* Resets the state of the server. This is bad convention but
 * I use it as a shortcut to reset the state. */
router.get('/reset', function(req, res, next) {
	num = 0;
	startTime = null;
	endTime = null;
	results = {};
	res.send('ok!');
});

// GET worker page
// Loads the angular worker in the client
router.get('/worker', function(req, res, next) {
    res.render('worker', { title: 'Express'});
});

//　Serves a JSON with the work parameters
router.get('/work', function(req, res, next) {
	if(!startTime) startTime = new Date();
	if(Object.keys(results).length > 4) {
		// Construct a reduce job
    	res.setHeader('Content-Type', 'application/json');
    	var jobId = generateJobId();
    	var job = JSON.stringify({isComplete: false, type: 'REDUCE', id: jobId, progress: progress, params: {lo: num, hi: num + increment, precis: precision}});
    	res.send(job);
		jobs[jobId+""] = job;
	}
	else if (num < max) {
		var progress = Math.round(100 * num / max) - Object.keys(jobs).length;
    	res.setHeader('Content-Type', 'application/json');
    	var jobId = generateJobId();
    	var job = JSON.stringify({isComplete: false, type: 'MAP', id: jobId, progress: progress, params: {lo: num, hi: num + increment, precis: precision}});
    	res.send(job);
		jobs[jobId+""] = job;
		num += increment;
	} else if (Object.keys(jobs).length > 0){
		var keys = Object.keys(jobs);
  		var job = jobs[keys[Math.floor(keys.length * Math.random())]];
  		// We must update the progress
  		res.setHeader('Content-Type', 'application/json');
  		res.send(job);
	} else {
		if (!endTime) {
			endTime = new Date();
			var time = endTime - startTime;
			console.log("RESULT: " + JSON.stringify(results));
			console.log("Time: " + (time));
		}
		res.setHeader('Content-Type', 'application/json');
    	res.send(JSON.stringify({isComplete: true, progress: 100, result: result}));
	}
});

// Processes and reduces the result of a calculation
router.post('/work', function(req, res, next) {
	var jobId = req.body.id;
	var jobType = req.body.type;
	if(jobs[jobId+""] && jobType == "MAP") {
		// Deletes the job from the job dictionary when completing the calculation
		delete jobs[jobId+""];
		// This is the REDUCE step
		var result = new Decimal(req.body.data);
		// Store the result with the associated jobId
		results[jobId+""] = result;
		res.send(200);
	} else if (jobs[jobId+""] && jobType == "REDUCE") {
		var associatedResults = req.body.associatedResults;
		for (var i = 0; i < associatedResults.length; i++) {
			// Should also check that the result exists
			delete results[resultId+""];
		}
		// Construct a new result
		var result = req.body.data;
		results[generateJobId()+""] = result;
		res.send(200);   
	}
});

module.exports = router;
