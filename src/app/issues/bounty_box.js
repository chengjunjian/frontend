'use strict';
angular.module('app').controller('BountyBoxController', function ($scope, $routeParams, $window, $location, mixpanelEvent) {
  $scope.bounty = {
    amount: parseInt($routeParams.amount, 10)
  };

  $scope.place_bounty_redirect = function (amount) {
    amount = amount || $scope.bounty.amount;
    // Track bounty start event in Mixpanel
    mixpanelEvent.bountyStart({ type: 'buttons', amount: amount });
    if (angular.isNumber(amount)) {
      $location.path("/issues/" + $routeParams.id + "/bounty").search({ amount: amount });
    }
  };

  $scope.custom_bounty_redirect = function () {
    mixpanelEvent.bountyStart({ type: 'custom', amount: $scope.bounty.amount });
    if (angular.isNumber($scope.bounty.amount)) {
      $location.path("/issues/" + $routeParams.id + "/bounty").search({ amount: $scope.bounty.amount });
    }
  };
});
