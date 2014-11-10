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

tchat.filter('autolink', function() {

  var LINKY_URL_REGEXP =
        /((ftp|https?):\/\/|(mailto:)?[A-Za-z0-9._%+-]+@)\S*[^\s.;,(){}<>"]/,
      MAILTO_REGEXP = /^mailto:/;

  return function(text, target) {

    if (!text) {
      return text;
    }

    var match;
    var raw = text;
    var html = [];
    var url;
    var i;

    while ((match = raw.match(LINKY_URL_REGEXP))) {

      // We can not end in these as they are sometimes found at the end of the sentence
      url = match[0];
      // if we did not match ftp/http/mailto then assume mailto
      if (match[2] == match[3]) url = 'mailto:' + url;
      i = match.index;
      addText(raw.substr(0, i));
      addLink(url, match[0].replace(MAILTO_REGEXP, ''));
      raw = raw.substring(i + match[0].length);
    }

    addText(raw);

    return html.join('');

    function addText(text) {

      if (!text) {
        return;
      }

      html.push(text);
    }

    function addLink(url, text) {

      html.push('<a ');

      if (angular.isDefined(target)) {

        html.push('target="');
        html.push(target);
        html.push('" ');
      }

      html.push('href="');
      html.push(url);
      html.push('">');
      addText(text);
      html.push('</a>');
    }
  };
});

(function() {

  var k = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
  var n = 0;

  $(document).keydown(function (e) {

      if (e.keyCode === k[n++]) {
          if (n === k.length) {

              $('#pony').show('slow');
              n = 0;
          }
      }
      else {

        n = 0;
      }
  });

})();