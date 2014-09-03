var WebSocketServer = require('websocket').server;
var express = require('express');
var http = require('http');
var app = express();

app.use(express.static(__dirname + "/public"));
app.server = http.createServer(app);
app.server.listen(8080);

var wsServer = new WebSocketServer({
    httpServer: app.server,

    // Firefox 7 alpha has a bug that drops the
    // connection on large fragmented messages
    fragmentOutgoingMessages: false
});

var connections = {},
    connectionId = 0,
    serverText = '';

function responseObject() {
    return JSON.stringify({
        serverText: serverText
    });
}
wsServer.on('request', function (request) {
    var id,
        connection = request.accept('textarea', request.origin);
    connectionId = connectionId + 1;

    id = connectionId.toString();
    connections[id] = connection;

    console.log(connection.remoteAddress + " connected - Protocol Version " + connection.webSocketVersion);

    // Handle closed connections
    connection.on('close', function () {
        delete connections[id];
        console.log(" disconnected");
    });
    connection.sendUTF(responseObject());
    // Handle incoming messages
    connection.on('message', function (message) {

        message = JSON.parse(message.utf8Data);
        serverText = message.clientText;

        //Broadcast
        for (var con in connections) {
            // don't send to ourselves
            if (con !== id) {
                console.log('sending', responseObject());
                connections[con].sendUTF(responseObject());
            }
        }
    });
});

console.log("Textarea test app ready");