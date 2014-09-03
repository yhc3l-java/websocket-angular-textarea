/************************************************************************
 *  Copyright 2010-2011 Worlize Inc.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 ***********************************************************************/

var WebSocketServer = require('websocket').server;
var express = require('express');
var http = require('http');
var app = express();
var launcher = require('browser-launcher');

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
launcher(function (err, launch) {
    if (err) return console.error(err);
    /*
    console.log('# available browsers:');
    console.dir(launch.browsers);
    */
    launch('http://localhost:8080', {
        browser: 'chrome'
    }, function (err, ps) {
        if (err) return console.error(err);
    });

});