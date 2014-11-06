var http = require('http');

// HTTP server.
var server = http.createServer(function(req, res) {
   res.writeHead(200, {"Content-Type": "text/html"});
   res.end('lol');
});

// Chargement de socket.io
var io = require('./node_modules/socket.io').listen(server);

var clients = {};
var sockets = {};

var CONST = {

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
};

// Client arrival.
io.sockets.on('connection', function (socket) {

    // Register the new client in the list.
    clients[socket.id] = {

      login: 'Anonymous',
      status: 0,
      id: socket.id,
    };

    sockets[socket.id] = socket;

    socket.broadcast.emit('clientList', clients);
    socket.broadcast.emit('message', {

      from: 'MARVIN',
      message: 'New client',
      type: CONST.MSG_TYPE.SYSTEM | CONST.MSG_TYPE.ALL
    });

    // Client leave.
    socket.on('disconnect', function() {

      socket.broadcast.emit('message', {

        from: 'MARVIN',
        message: clients[socket.id].login + ' leaving',
        type: CONST.MSG_TYPE.SYSTEM | CONST.MSG_TYPE.ALL
      });

      delete clients[socket.id];
      socket.broadcast.emit('clientList', clients);

      delete sockets[socket.id];
    });

    // Client define login.
    socket.on('setLogin', function(login) {

      // Prevent empty login
      if (login.trim() == '') {
        login = 'Anonymous';
      }

      socket.broadcast.emit('message', {

        from: 'MARVIN',
        message: clients[socket.id].login + ' is now ' + login,
        type: CONST.MSG_TYPE.SYSTEM | CONST.MSG_TYPE.ALL
      });

      clients[socket.id].login = login;

      socket.broadcast.emit('clientList', clients);
      socket.emit('clientList', clients);
    });

    // Client status.
    socket.on('status', function(status) {

      if (status.enable) {
        clients[socket.id].status |= status.status;
      }
      else {
        clients[socket.id].status &= ~status.status;
      }

      socket.broadcast.emit('clientList', clients);
      socket.emit('clientList', clients);
    });

    // Client request client list.
    socket.on('getClients', function() {

      socket.emit('clientList', clients);
    });

    // Client send message.
    socket.on('message', function(message) {

      // Block message from anonymous person.
      if (clients[socket.id].login == 'Anonymous') {

        socket.emit('message', {

          from: 'MARVIN',
          to: 'Anonymous',
          message: 'We don\'t like anonymous here !',
          type: CONST.MSG_TYPE.SYSTEM | CONST.MSG_TYPE.PM | CONST.MSG_TYPE.YOURSELF
        });

        return;
      }

      // Easter eggs.
      //message.message = message.message.replace('42', '<img src="/img/42.jpg" class="img-responsive" />');

      // Broadcast message.
      if (message.all) {

        socket.broadcast.emit('message', {

          from: clients[socket.id].login,
          message: message.message,
          type: CONST.MSG_TYPE.CLIENT | CONST.MSG_TYPE.ALL
        });

        socket.emit('message', {

          from: clients[socket.id].login,
          message: message.message,
          type: CONST.MSG_TYPE.CLIENT | CONST.MSG_TYPE.ALL | CONST.MSG_TYPE.YOURSELF
        });
      }
      // PM message.
      else {

        // Prevent non existing destination.
        if (!sockets.hasOwnProperty(message.to) || !clients.hasOwnProperty(message.to)) {
          return;
        }

        if (message.to != socket.id) {

          sockets[message.to].emit('message', {

            from: clients[socket.id].login,
            to: clients[message.to].login,
            message: message.message,
            type: CONST.MSG_TYPE.CLIENT | CONST.MSG_TYPE.PM
          });
        }

        socket.emit('message', {

          from: clients[socket.id].login,
          to: clients[message.to].login,
          message: message.message,
          type: CONST.MSG_TYPE.CLIENT | CONST.MSG_TYPE.PM | CONST.MSG_TYPE.YOURSELF
        });
      }
    });
});

server.listen(8080);