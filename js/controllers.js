/**
 * TODO.
 */

tchat.controller('LoginSelector', ['$scope', '$timeout', 'SocketIO', 'Storage', function($scope, $timeout, SocketIO, Storage) {

  $scope.login = Storage.get('login', 'Anonymous');

  $scope.update = function() {

    SocketIO.emit('setLogin', $scope.login);

    // We dont like empty login.
    if ($scope.login.trim() == '') {
      $scope.login = 'Anonymous';
    }

    Storage.set('login', $scope.login);
  };

  if ($scope.login != 'Anonymous') {
    $scope.update();
  }

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

tchat.controller('NotifMode', ['$scope', 'Notifs', 'CONST', 'Storage', function($scope, Notifs, CONST, Storage) {

  $scope.CONST = CONST;

  $scope.soundSystem = parseInt(Storage.get('soundSystem', 1));
  $scope.soundPM = parseInt(Storage.get('soundPM', 8));
  $scope.soundAll = parseInt(Storage.get('soundAll', 4));

  $scope.notifSystem = parseInt(Storage.get('notifSystem', 1));
  $scope.notifPM = parseInt(Storage.get('notifPM', 8));
  $scope.notifAll = parseInt(Storage.get('notifAll', 4));

  $scope.updateSound = function() {

    Notifs.setSoundMode($scope.soundSystem | $scope.soundPM | $scope.soundAll);

    Storage.set('soundSystem', $scope.soundSystem);
    Storage.set('soundPM', $scope.soundPM);
    Storage.set('soundAll', $scope.soundAll);
  };

  $scope.updateNotif = function() {

    Notifs.setNotifMode($scope.notifSystem | $scope.notifPM | $scope.notifAll);

    Storage.set('notifSystem', $scope.notifSystem);
    Storage.set('notifPM', $scope.notifPM);
    Storage.set('notifAll', $scope.notifAll);
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

    message.date = new Date();

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
