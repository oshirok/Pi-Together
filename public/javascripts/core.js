// public/core.js
var piTogether = angular.module('piTogether', ['ui.bootstrap']);

piTogether.controller("mainController",function($scope,$http){

  $scope.progress = 0;
  $scope.result = null;

  var numberOfCores = navigator.hardwareConcurrency || 2;
  console.log("number of cores determined: " + numberOfCores);

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