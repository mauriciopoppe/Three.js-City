/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 5/5/13
 * Time: 11:54 AM
 * To change this template use File | Settings | File Templates.
 */
T3.controller.MotionDetectionHeadTrackr = (function () {

    var videoInput = document.getElementById('inputVideo'),
        canvasInput = document.getElementById('inputCanvas'),
        leftWheel,
        rightWheel,
        headTracker;

    function initialize() {
        leftWheel = T3.ObjectManager.get('car-wheel-front-left');
        rightWheel = T3.ObjectManager.get('car-wheel-front-right');
    }

    function start() {
        if (!headTracker) {
            headTracker = new headtrackr.Tracker();

            document.addEventListener('headtrackingEvent', function (event) {
                // update the car position
                // event.x is between [-30 and 30] so make that range match the range [0, PI/4]
                // which is the max rotation of the wheel
                var negative = event.x < 0,
                    factor = 5,
                    rotation;

                rotation = negative ?
                    Math.max(-30, event.x * factor) :
                    Math.min(30, event.x * factor);
                rotation = -rotation * leftWheel.rotationMax / 30;

                leftWheel.rotation.y = rotation;
                rightWheel.rotation.y = rotation;
            });

            headTracker.init(videoInput, canvasInput);
        }
        headTracker.start();
    }

    function stop() {
        headTracker.stop();
    }

    return {
        canvas: canvasInput,
        initialize: initialize,
        start: start,
        stop: stop
    }
})();