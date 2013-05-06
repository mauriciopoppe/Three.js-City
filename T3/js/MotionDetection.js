/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 5/5/13
 * Time: 11:54 AM
 * To change this template use File | Settings | File Templates.
 */
T3.controller.MotionDetection = (function () {

    var video, width, height,
        oldData,
        canvasSource, contextSource,
        canvasBlended, contextBlended,
        userMediaStream;

    function initialize() {
        video = document.getElementById('video');
        width = video.width;
        height = video.height;

        // target canvas
        canvasSource = document.getElementById('canvas-source');
        contextSource = canvasSource.getContext('2d');
        contextSource.translate(canvasSource.width, 0);
        contextSource.scale(-1, 1);

        canvasBlended = document.getElementById('canvas-blended');
        contextBlended = canvasBlended.getContext('2d');
    }

    function start() {
        // get the webcam's stream
        navigator.webkitGetUserMedia({video: true}, onSuccess, function () {});
    }

    function stop() {
        T3.Keyboard.set('W', false);
        userMediaStream.stop();
        video.pause();
    }

    function onSuccess(stream) {
        userMediaStream = stream;
        T3.Keyboard.set('W', true);
        video.src = URL.createObjectURL(stream);
        video.play();
        requestAnimationFrame(draw);
    }

    function draw() {
        if (video.paused) {
            return;
        }
        // draw to context source
        contextSource.drawImage(video, 0, 0, width, height);

        // blend
        var newData = contextSource.getImageData(0, 0, width, height);
        if (!oldData) {
            oldData = contextSource.getImageData(0, 0, width, height);
        }
        var blendedData = contextSource.createImageData(width, height);
        diff(blendedData.data, oldData.data, newData.data);
        contextBlended.putImageData(blendedData, 0, 0);
        oldData = newData;
        setTimeout(draw, 200);
    }

    function fastAbs(value) {
        // equivalent to Math.abs();
        return (value ^ (value >> 31)) - (value >> 31);
    }

    function threshold(value) {
        return (value > 0x20) ? 0xFF : 0;
    }

    function diff(dest, oldData, newData) {
        if (oldData.length != newData.length) return null;
        var i = 0,
            lim = newData.length / 4.0,
            tolerance = 1000,
            diffLeft = 0,
            diffRight = 0,
            side;
        while (i < lim) {
            var average1 = (oldData[4*i] + oldData[4*i+1] + oldData[4*i+2]) / 3;
            var average2 = (newData[4*i] + newData[4*i+1] + newData[4*i+2]) / 3;
            var diff = threshold(fastAbs(average1 - average2));
            dest[4*i] = diff;
            dest[4*i+1] = diff;
            dest[4*i+2] = diff;
            dest[4*i+3] = 0xFF;

            // check if there was a change
            if (diff == 0xFF) {
                // check in which side is the diff
                side = ~~(i / (width / 2)) % 2;         // even: left, odd: right
                side ? diffRight++ : diffLeft++;
            }
            ++i;
        }
        // trigger 'A' and 'D'
    //    console.log("lim = " + lim);
    //    console.log(i);
        console.log(diffLeft, diffRight);
    //    if (diffLeft == 0 && diffRight == 0) {
    //        console.log('why!');
    //    }
        T3.Keyboard.set('A', diffLeft > tolerance);
        T3.Keyboard.set('D', diffRight > tolerance);
    }

    return {
        initialize: initialize,
        start: start,
        stop: stop
    }
})();