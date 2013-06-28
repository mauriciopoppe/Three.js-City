/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 6/25/13
 * Time: 10:31 PM
 * To change this template use File | Settings | File Templates.
 */
var angularT3 = angular.module('angularT3', ['ui.bootstrap']);

angularT3.controller('Main', function ($scope) {
    // cameras
    /**
     * cameras is an array of objects, each object is in the form
     *      {
     *          position: THREE.Vector3
     *          lookAt: THREE.Vector3,
     *          active: boolean
     *      }
     */
    $scope.cameras = [];
    $scope.limit = 12;
    $scope.activeIndex = 0;

    // restore from localStorage
    $scope.nextCamera = function (nextIndex) {
        nextIndex = typeof nextIndex === 'number' ? nextIndex :
            ($scope.activeIndex + 1) % $scope.cameras.length;
        if (nextIndex === $scope.activeIndex) {
            return;
        }
        var activeTHREECamera = T3.World.activeCamera,
            current = $scope.cameras[$scope.activeIndex],
            next = $scope.cameras[nextIndex];

        current.active = false;
        next.active = true;

        var tween = new TWEEN.Tween(activeTHREECamera.real.position)
            .to({
                x: next.position.x,
                y: next.position.y,
                z: next.position.z
            }, 2000)
            .easing(TWEEN.Easing.Quartic.InOut)
            .onUpdate(function() {
                activeTHREECamera.lookAt(next.lookAt);
            })
            .onComplete(function() {
                activeTHREECamera.lookAt(next.lookAt);
            });
        tween.start();
        $scope.activeIndex = nextIndex;
    };

    $scope.saveCamera = function () {
        var activeTHREECamera = T3.World.activeCamera,
            length = $scope.cameras.length,
            config = {
                position: activeTHREECamera.real.position.clone(),
                lookAt: activeTHREECamera.cameraControls.target.clone(),
                active: false
            };

        if (length >= $scope.limit) {
            $scope.cameras.splice(4, 1);
        }
        $scope.cameras.push(config);

        // save to localStorage
        localStorage.setItem('cameras', JSON.stringify($scope.cameras.slice(4)));
    };


    // motion detection
    $scope.motions = [{
        data: 'MotionDetection',
        name: 'PixelDiff'
    }, {
        data: 'MotionDetectionHeadTrackr',
        name: 'Headtrackr'
    }];
    $scope.activeMotion = null;
    $scope.activateMotion = function (motion) {
        var controller = T3.controller[motion.data];

        // only one controller might be available at any time,
        // so in the case where the user wants to activate the old controller
        $scope.deactivateMotion();
        $scope.activeMotion = motion;
        $scope.activeMotion.active = true;
        T3.Keyboard.set('W', true);
        $(controller.canvas).fadeIn();
        controller.start();
    };

    $scope.deactivateMotion = function () {
        var controller;
        if ($scope.activeMotion) {
            controller = T3.controller[$scope.activeMotion.data];
            T3.Keyboard.set('W', false);
            $(controller.canvas).fadeOut();
            controller.stop();
            $scope.activeMotion.active = false;
            $scope.activeMotion = null;
        }
    };

    // tab
    $scope.navBarVisible = true;
    $scope.toggleNavBar = function () {
        $scope.navBarVisible = !$scope.navBarVisible;
    };
    $scope.cameraTooltip = "Orbit and pan freely with your mouse, if you want to save your " +
        "current view click on this button";

    // loading
    $scope.loading = 'Loading Textures';
});