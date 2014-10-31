/**
 * TODO.
 */

tchat.controller('LoginSelector', ['$scope', '$timeout', 'SocketIO', function($scope, $timeout, SocketIO) {

  $scope.login = 'Anonymous';

  $scope.update = function() {

    SocketIO.emit('setLogin', $scope.login);

    // We dont like empty login.
    if ($scope.login.trim() == '') {
      $scope.login = 'Anonymous';
    }
  };

}]);

tchat.controller('ClientList', ['$scope', '$timeout', 'Clients', 'CONST', function($scope, $timeout, Clients, CONST) {

  $scope.CONST = CONST;
  $scope.clientList = {};

  Clients.register(function(clientList) {

    $scope.clientList = clientList;

    $timeout(function() {

      $scope.$apply();
    });
  });

  Clients.refresh();

  $scope.checkType = function(type, ref) {

    return (type & ref) == ref;
  };
}]);

tchat.controller('NotifMode', ['$scope', 'Notifs', 'CONST', function($scope, Notifs, CONST) {

  $scope.CONST = CONST;

  $scope.soundSystem = 1;
  $scope.soundPM = 8;
  $scope.soundAll = 4;

  $scope.notifSystem = 1;
  $scope.notifPM = 8;
  $scope.notifAll = 4;

  $scope.updateSound = function() {

    Notifs.setSoundMode($scope.soundSystem | $scope.soundPM | $scope.soundAll);
  };

  $scope.updateNotif = function() {

    Notifs.setNotifMode($scope.notifSystem | $scope.notifPM | $scope.notifAll);
  };

  $scope.updateSound();
  $scope.updateNotif();
}]);

tchat.controller('MessageHistory', ['$scope', '$timeout', 'SocketIO', 'Clients', 'CONST', 'Notifs', function($scope, $timeout, SocketIO, Clients, CONST, Notifs) {

  $scope.CONST = CONST;
  $scope.messages = [];
  $scope.message = '';
  $scope.clientList = [];
  $scope.dest = '__all';

  var writing = false;

  Clients.register(function(clients) {

    $scope.clientList = [];

    var test = {};
    test['__all'] = true;

    $scope.clientList.push({

      id: '__all',
      login: 'Everyone'
    });

    $.each(clients, function(index, value) {

      test[value.id] = true;
      $scope.clientList.push({

        id: value.id,
        login: value.login
      });
    });

    $timeout(function() {

      $scope.$apply();

      if (!test.hasOwnProperty($scope.dest)) {

        $scope.dest = '__all';
        $scope.$apply();
      }
    });
  });

  SocketIO.on('message', function(message) {

    $scope.messages.push(message);

    $timeout(function() {

      $scope.$apply();

      $('#message-wrapper').scrollTop($('#message-list').height());

      Notifs.notify(message);
    });
  });

  $scope.checkType = function(type, ref) {

    return (type & ref) == ref;
  };

  $scope.send = function(event) {

    if (event.keyCode != 13 || !event.ctrlKey) {
      return;
    }

    if ($scope.message != '') {

      if ($scope.dest == '__all') {

        SocketIO.emit('message', {

          message: $scope.message,
          all: true
        });
      }
      else {

        SocketIO.emit('message', {

          message: $scope.message,
          to: $scope.dest
        });
      }

      $scope.message = '';
    }
  };

  $scope.clear = function() {

    $scope.messages = [];
  };

  $scope.writing = function() {

    if (!writing) {

      writing = true;
      SocketIO.emit('status', {

        enable: true,
        status: CONST.USER_STATUS.WRITING
      });

      window.setTimeout(function() {

        writing = false;
        SocketIO.emit('status', {

          enable: false,
          status: CONST.USER_STATUS.WRITING
        });
      }, 2000);
    }
  };

}]);
