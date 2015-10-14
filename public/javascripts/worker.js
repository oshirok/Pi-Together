importScripts('decimal.js');

// Source, taken from http://stackoverflow.com/questions/20663353/is-it-feasible-to-do-an-ajax-request-from-a-web-worker
var ajax = function(url, data, callback, type) {
  var data_array, data_string, idx, req, value;
  if (data == null) {
    data = {};
  }
  if (callback == null) {
    callback = function() {};
  }
  if (type == null) {
    //default to a GET request
    type = 'GET';
  }
  data_array = [];
  for (idx in data) {
    value = data[idx];
    data_array.push("" + idx + "=" + value);
  }
  data_string = data_array.join("&");
  req = new XMLHttpRequest();
  // Set this to true to make it async
  // Which somehow fixed my issue?
  req.open(type, url, true);
  req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  req.onreadystatechange = function() {
    if (req.readyState === 4 && req.status === 200) {
      return callback(req.responseText);
    }
  };
  req.send(data_string);
  return req;
};

function ballard(lo, hi, precis) {
  Decimal.config({ precision: precis, rounding: 4 });
    var pi2 = new Decimal(0);
  var pi = 0;
  var k = lo;
  while (k < hi) {
    pi2 = pi2.plus(new Decimal(-1).pow(k).div(new Decimal(1024).pow(k)).times(
      new Decimal(256).div(10 * k + 1).plus(new Decimal(1).div(10 * k + 9)).minus(new Decimal(64).div(10 * k + 3)).minus(new Decimal(32).div(4 * k + 1)).minus(new Decimal(4).div(10 * k + 5)).minus(new Decimal(4).div(10 * k + 7)).minus(new Decimal(1).div(4 * k + 3))
      ));
    /* pi += (Math.pow(-1, k) / Math.pow(1024, k)) * (256 / (10 * k + 1) + 1 / (10 * k + 9) - 64 / (10 * k + 3) - 32 / (4 * k + 1) - 4 / (10 * k + 5) - 4 / (10 * k + 7) - 1 / (4 * k + 3)); */
    k += 1;
  }
  /* Correction step */
  /* pi = pi * 1 / Math.pow(2, 6); */
  pi2 = pi2.times(new Decimal(1).div(64));
  return pi2.toFixed(precis);
}

// We can optimize this further I think
function factorial(base) {
  var result = new Decimal(1);
  while(base > 0) {
    result = result.times(base);
    base = base - 1;
  }
  return result;
}

// This only takes care of the summation step!
function chudnovsky(lo, hi, precis) {
  Decimal.config({ precision: precis, rounding: 4 });
  var result = new Decimal(0);
  var k =　lo;
  while(k < hi) {
    var numer = factorial(new Decimal(6).times(k)).times(new Decimal(13591409).plus(new Decimal(545140134).times(k)));
    var denom = factorial(new Decimal(3).times(k)).times(factorial(k).pow(3)).times(new Decimal(-640320).pow(new Decimal(3).times(k)));
    result = result.plus(numer.div(denom));
    k++;
  }
  return result;
}

// Create the event

var getWork = function() {
  ajax("/work", null, function(data) {
    //do something with the data like:
    var currentJob = JSON.parse(data);
    self.postMessage({'progress': currentJob.progress});
    if(currentJob.isComplete) {
      self.close();
    }
    var result = chudnovsky(currentJob.params.lo, currentJob.params.hi, currentJob.params.precis);
    ajax("/work", {data: result, id: currentJob.id}, function(data) {
      // console.log('successful post!');
      getWork();
    }, 'POST');
  }, 'GET');
}

getWork();

