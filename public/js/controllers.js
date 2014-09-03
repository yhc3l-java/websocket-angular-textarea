angular.module('socketApp')
	.controller('TextCtrl', function ($scope, socket) {
		$scope.$watch('text', function (newValue, oldValue) {
			socket.send(newValue);
		})
		$scope.$on('ws-message', function (event, serverTxt) {
			$scope.text = serverTxt;
			$scope.$apply();
		});
	});