/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 6/25/13
 * Time: 10:31 PM
 * To change this template use File | Settings | File Templates.
 */
var angularT3 = angular.module('angularT3', []);

angularT3.controller('Main', function ($scope) {
    // cameras
    $scope.positions = [];
    $scope.lookAt = [];
    $scope.activeIndex = 0;

    $scope.nextCamera = function () {
        var next = ($scope.activeIndex + 1) % $scope.positions.length;
        var activeCamera = T3.World.activeCamera;
        var tween = new TWEEN.Tween(activeCamera.real.position)
            .to($scope.positions[next], 2000)
            .easing(TWEEN.Easing.Quartic.InOut)
            .onUpdate(function() {
                activeCamera.lookAt($scope.lookAt[next]);
            })
            .onComplete(function() {
                activeCamera.lookAt($scope.lookAt[next]);
            });
        tween.start();
        $scope.activeIndex = next;
    };

});