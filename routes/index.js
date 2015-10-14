var express = require('express');
var Decimal = require('decimal.js'); // Used for calculating numbers with high precision
var router = express.Router();

// The function to calculate the number of digits a calculated value of pi is accurate to
function verify(calculatedPi) {
	var accuratePi = "3.141592653589793238462643383279502884197169399375105820974944592307816406286208998628034825342117067982148086513282306647093844609550582231725359408128481117450284102701938521105559644622948954930381964428810975665933446128475648233786783165271201909145648566923460348610454326648213393607260249141273724587006606315588174881520920962829254091715364367892590360011330530548820466521384146951941511609433057270365759591953092186117381932611793105118548074462379962749567351885752724891227938183011949129833673362440656643086021394946395224737190702179860943702770539217176293176752384674818467669405132000568127145263560827785771342757789609173637178721468440901224953430146549585371050792279689258923542019956112129021960864034418159813629774771309960518707211349999998372978049951059731732816096318595024459455346908302642522308253344685035261931188171010003137838752886587533208381420617177669147303598253490428755468731159562863882353787593751957781857780532171226806613001927876611195909216420198";
	var correct = 0;
	while(correct < 1000 && calculatedPi.charAt(correct) == accuratePi.charAt(correct)) {
		correct++;
	}
	return correct;
}

// Setup step
var num = 0;
var max = 333; // number of iterations
var precision = 1000; // number of places to calculate for
var increment = 5;
var startTime = null;
var endTime = null;
// Pi starts at 0
var pi = new Decimal(0);
Decimal.config({ precision: precision, rounding: 4 });
var hi = 0;
// The Dictionary used to keep track of active jobs
var jobs = {};

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

// GET worker page
router.get('/worker', function(req, res, next) {
    res.render('worker', { title: 'Express'});
});

//　Serves a JSON with the work parameters
router.get('/work', function(req, res, next) {
	if(!startTime) startTime = new Date();
	if (num < max) {
		var progress = Math.round(100 * num / max) - Object.keys(jobs).length;
    	res.setHeader('Content-Type', 'application/json');
    	var job = JSON.stringify({isComplete: false, id: num, progress: progress, params: {lo: num, hi: num + increment, precis: precision}});
    	res.send(job);
		jobs[num+""] = job;
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
			pi = new Decimal(426880).times(new Decimal(10005).sqrt()).div(pi);
			console.log("RESULT: " + pi.toFixed(precision));
			console.log("Correct digits: " + verify(""+pi));
		}
		res.setHeader('Content-Type', 'application/json');
    	res.send(JSON.stringify({isComplete: true, progress: 100}));
	}
});

// Processes and reduces the result of a calculation
router.post('/work', function(req, res, next) {
	var jobId = req.body.id;
	// console.log("DELETING JOB ID: " + jobId);
	if(jobs[jobId+""]) {
		// Deletes the job from the job dictionary when completing the calculation
		delete jobs[jobId+""];
		// This is the REDUCE step
		var result = new Decimal(req.body.data);
		pi = pi.plus(result);
		res.send(200);
	}
});

module.exports = router;
