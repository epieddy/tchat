/**
 * TODO.
 */

tchat.provider('SocketIO', {

  settings: {
    ioserver: 'http://nodejs.tchat.k42dev.cloud.kernel42.com:8983'
  },

  $get: function() {

    var socket = io.connect(this.settings.ioserver);

    return {

      on: function(message, callback) {

        socket.on(message, callback);
      },

      emit: function(message, data) {

        socket.emit(message, data);
      }
    };
  }

});

tchat.factory('Clients', ['SocketIO', function(SocketIO) {

  var clients = {};
  var callbacks = [];

  SocketIO.on('clientList', function(clientList) {

    clients = clientList;

    $.each(callbacks, function(index, value) {

      value(clients);
    });
  });

  return {

    register: function(callback) {

      callbacks.push(callback);
    },

    refresh: function() {

      SocketIO.emit('getClients');
    }
  };

}]);

tchat.factory('Notifs', ['CONST', function(CONST) {

  var soundMode = 0;
  var notifMode = 0;

  if (window.Notification && Notification.permission !== 'granted') {

    Notification.requestPermission(function (status) {
      if (Notification.permission !== status) {
        Notification.permission = status;
      }
    });
  }

  var check = function(value, ref) {

    return (value & ref) == ref;
  };

  var compare = function(mode, type) {

    if (check(type, CONST.MSG_TYPE.SYSTEM)) {
      if (check(mode, CONST.MSG_TYPE.SYSTEM)) {
        return true;
      }
    }
    else if (check(type, CONST.MSG_TYPE.CLIENT)) {

      if (check(type, CONST.MSG_TYPE.PM) && check(mode, CONST.MSG_TYPE.PM)) {
        return true;
      }

      if (check(type, CONST.MSG_TYPE.ALL) && check(mode, CONST.MSG_TYPE.ALL)) {
        return true;
      }
    }

    return false;
  };

  return {

    setSoundMode: function(mode) {

      soundMode = mode;
    },

    setNotifMode: function(mode) {

      notifMode = mode;
    },

    notify: function(message) {

      // Don't notify about my own action.
      if ((message.type & CONST.MSG_TYPE.YOURSELF) == CONST.MSG_TYPE.YOURSELF) {
        return;
      }

      // Don't notify if i'm focused on the tchat.
      if ($('#message-input').is(':focus')) {
        return;
      }

      // Notification.
      if (compare(notifMode, message.type)) {

        var notif = new Notification(message.from, {

          tag: 'tchat',
          body: message.message
        });

        notif.onshow = function() {

          setTimeout(function() {

            notif.close();
          }, 5000);
        };

        notif.onclick = function() {

          window.focus();
          $('#message-input').focus();
        };
      }

      // Sounds
      if (compare(soundMode, message.type)) {

        $('#sound').html('<audio autoplay="autoplay"><source src="notif.mp3" type="audio/mpeg" /></audio>');
      }
    }
  };

}]);

tchat.factory('Storage', function() {


  return {

    set: function(key, value) {

      localStorage.setItem(key, value);
    },

    get: function(key, default_value) {

      var value = localStorage.getItem(key);

      if (value === null) {
        value = default_value;
      }

      return value;
    }
  };

});
