'use strict';

angular.module('filters').filter('dollars', function($filter, $api, $currency) {
  return function(value, options) {
    options = options || {};
    var currencyFilter = $filter('currency');
    if ($currency.value == 'BTC') {
      value = $currency.usdToBtc(value);
      return currencyFilter(value, (options.space ? '฿ ' : '฿'));
    } else {
      return currencyFilter(value, (options.space ? '$ ' : '$')).replace(/\.\d\d$/,'');
    }
  };
});