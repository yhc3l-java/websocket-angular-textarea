angular.module('socketApp')
	.factory('socket', function ($rootScope) {
		var open = false;
		var socket = new WebSocket('ws://localhost:8080/', ['textarea']);

		socket.onopen = function () {
			console.log('Open');
			open = true;
		};

		socket.onmessage = function (response) {
			console.log(JSON.parse(response.data));
			$rootScope.$broadcast('ws-message', JSON.parse(response.data).serverText);
		};

		return {
			send: function (text) {
				if (open) {
					socket.send(JSON.stringify({
						clientText: text
					}));
				}

			}
		}
	});