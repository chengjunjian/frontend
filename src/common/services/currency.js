'use strict';

angular.module('services').service('$currency', function ($cookieStore, $http, $window, $log) {

  this.currencies = ['USD', 'BTC'];
  this._cookieName = 'currencySwitcherValue';
  this.btcToUsdRate = undefined;

  var self = this;

  this.setCurrency = function(value) {
    if (this.currencies.indexOf(value) >= 0) {
      this.value = value;
      this.writeValueToCookie();
      $log.info('Currency changed to', this.value);
    }
  };

  this.writeValueToCookie = function () {
    return $cookieStore.put(this._cookieName, this.value);
  };

  this.getValueFromCookie = function() {
    return $cookieStore.get(this._cookieName);
  };

  this.usdToBtc = function (value) {
    return value / this.btcToUsdRate;
  };

  this.initialize = function () {
    // Load value from cookies, or set to USD
    this.setCurrency(this.getValueFromCookie() || 'USD');

    // Load current BTC price from coinbase in USD
    $window.callback_coinbase = function (response) {
      self.btcToUsdRate = response.amount;
    };
    $http.jsonp('https://coinbase.com/api/v1/prices/buy?callback=coinbase');

  };



});