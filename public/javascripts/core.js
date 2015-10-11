// public/core.js
var piTogether = angular.module('piTogether', ['ui.bootstrap']);

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

piTogether.controller("mainController",function($scope,$http){
  // delete a todo after checking it
  $scope.getWork = function() {
    $http.get('/work')
          .success(function(data) {
              $scope.finished = data.isComplete;
              if(!$scope.finished) {
                $scope.currentJob = {};
                $scope.currentJob.jobId = data.id;
                $scope.currentJob.progress = data.progress;
                $scope.currentJob.params = data.params;
                var result = ballard($scope.currentJob.params.lo, $scope.currentJob.params.hi, $scope.currentJob.params.precis);
                $.post('/work', {data: result, id: $scope.currentJob.jobId}, function(status) {
                  console.log('successful post!');
                  $scope.getWork();
                });
              } else {
                $scope.currentJob = {};
                $scope.currentJob.progress = 100;
              }
          })
          .error(function(data) {
              console.log('Error: ' + data);
          });
  };
  $scope.getWork();
});

function mainController($scope, $http) {
    $scope.formData = {};

    // when landing on the page, get all todos and show them
    /*$http.get('/api/todos')
        .success(function(data) {
            $scope.todos = data;
            console.log(data);
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });*/

    // when submitting the add form, send the text to the node API
    $scope.createTodo = function() {
        $http.post('/api/todos', $scope.formData)
            .success(function(data) {
                $scope.formData = {}; // clear the form so our user is ready to enter another
                $scope.todos = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };

    // delete a todo after checking it
    $scope.deleteTodo = function(id) {
        $http.delete('/api/todos/' + id)
            .success(function(data) {
                $scope.todos = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };

}