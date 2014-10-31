/**
 * TODO.
 */

var tchat = angular.module('tchat', ['ngSanitize']);

tchat.constant('CONST', {

  MSG_TYPE: {

    SYSTEM : 1,
    CLIENT: 2,
    ALL: 4,
    PM: 8,
    YOURSELF: 16
  },
  USER_STATUS: {

    WRITING: 1
  }
});

tchat.filter('nl2br', function() {

  return function(input) {

    return input.replace(/\n/g, '<br />');
  };
});

tchat.filter('html', ['$sce', function($sce) {

  return function(input) {

    return $sce.trustAsHtml(input);
  };
}]);
