'use strict';

angular.module('filters').filter('dollars', function($filter, $api) {
  return function(input, options) {
    options = options || {};
    return $api.currencyFilter(input, options);
  };
});