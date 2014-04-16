'use strict';

angular.module('activity').
  controller('NewCashOutController', function($scope, $api, $window, $location, $q, AddressManager, countries, usStates) {

    $scope.countries = countries;
    $scope.usStates = usStates;

    $scope.cashOut = {
      type: 'paypal',
      amount: undefined,
      paypal_address: undefined,
      bitcoin_address: undefined,
      address: undefined,
      mailing_address: undefined,
      us_citizen: undefined,
      usePermanentAddressAsMailing: true
    };

    $scope.updateAmounts = function() {
      $api.v2.account({
        cash_out: $scope.cashOut.amount
      }).then(function(response) {
        $scope.account = angular.copy(response.data);
        $scope.account.balance = $window.parseFloat($scope.account.balance);

        if ($scope.cashOut.amount > $scope.account.balance) {
          $scope.cashOut.amount = $scope.account.balance;
        }
      });
    };

    $scope.disableSubmitButton = function() {
      return !$scope.account ||
        $scope.cashOut.amount !== ($scope.account.cash_out.amount + $scope.account.cash_out.fee - $scope.account.cash_out.fee_adjustment);
    };

    // Model for checkbox. Use the permanent address as the mailing address
    $scope.usePermanentAddressAsMailing = true;

    // Create intance of AddressManager. Created this so that mailing_address and address
    // could easily share the same array of addresses.
    $scope.addressManager = new AddressManager($api.v2.addresses().then(function(response) {
      $scope.toggleNewPermanentAddress = response.data.length === 0;
      return angular.copy(response.data);
    }));

    // Watch new address toggle.
    // When true, set address to null, and reinitialize with empty object.
    // When false, clear address.
    $scope.$watch('toggleNewPermanentAddress', function(value) {
      if (value === true) {
        $scope.cashOut.address = {};
        delete $scope.cashOut.address;
      } else if (value === false) {
        $scope.cashOut.address = angular.copy($scope.addressManager.addresses[0]);
      }
    });

    $scope.createCashOut = function() {
      // Create permanent address if missing
      var permanentAddressDeferred = $q.defer(),
          permanentAddressPromise = permanentAddressDeferred.promise;
      if ($scope.cashOut.address) {
        if ($scope.cashOut.address.id) {
          permanentAddressDeferred.resolve();
        } else {
          $scope.addressManager.create($scope.cashOut.address).then(function(response) {
            $scope.cashOut.address = angular.copy(response.data);
            permanentAddressDeferred.resolve();
          });
        }
      }

      // Create mailing address if missing
      var mailingAddressDeferred = $q.defer(),
          mailingAddressPromise = mailingAddressDeferred.promise;
      if ($scope.cashOut.mailing_address) {
        if ($scope.cashOut.mailing_address.id) {
          mailingAddressDeferred.resolve();
        } else {
          $scope.addressManager.create($scope.cashOut.mailing_address).then(function(response) {
            $scope.cashOut.mailing_address = angular.copy(response.data);
            mailingAddressDeferred.resolve();
          });
        }
      }

      permanentAddressPromise.then(mailingAddressPromise).then(function() {
        var payload = angular.copy($scope.cashOut);

        if (payload && payload.address) {
          // add permanent address id
          payload.address_id = payload.address.id;
          delete payload.address;

          // Add mailing address id if applicable
          if (payload.mailing_address) {
            payload.mailing_address_id = payload.mailing_address.id;
            delete payload.mailing_address;
          }

          if (payload.usePermanentAddressAsMailing) {
            payload.mailing_address_id = payload.address_id;
          }
          delete payload.usePermanentAddressAsMailing;

          $api.v2.createCashOut(payload).then(function(response) {
            if (response.success) {
              // Fetch current person again to reload account balance
              $api.load_current_person_from_cookies();

              $location.url('/activity/cash_outs');
            } else {
              $scope.alert = {
                type: 'danger',
                message: response.data.error
              };
            }
          });
        }
      });
    };

  });