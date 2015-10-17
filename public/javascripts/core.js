// public/core.js
var piTogether = angular.module('piTogether', ['ui.bootstrap']);

piTogether.controller("mainController",function($scope,$http,$location){

  // Progress variable
  $scope.progress = 0;
  // thr result
  $scope.result = null;

  // gets the number of thrreads specified in url parameter
  var numberOfCores = $location.search().threads || navigator.hardwareConcurrency || 2;
  console.log("WORKING WITH " + numberOfCores + " CORES");
  var workers = [];
  for(var i = 0; i < numberOfCores; i++) {
    var worker = new Worker('javascripts/worker.js');

    worker.addEventListener('message', function(e) {
      if(e.data.progress) {
        $scope.progress = e.data.progress;
      }
      // console.log($scope.progress);
      if(e.data.result) {
        console.log("COMPLETE");
        $scope.result = e.data.result;
      }
      $scope.$apply();
    }, false);

    workers.push(worker);
  }
});