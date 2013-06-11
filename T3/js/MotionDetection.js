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
        canvasBlended = document.getElementById('canvas-blended'),
        contextBlended,
        userMediaStream;

    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia || navigator.msGetUserMedia;

    function initialize() {
        video = document.getElementById('video');
        width = video.width;
        height = video.height;

        // target canvas
        canvasSource = document.getElementById('canvas-source');
        contextSource = canvasSource.getContext('2d');
        contextSource.translate(canvasSource.width, 0);
        contextSource.scale(-1, 1);

        contextBlended = canvasBlended.getContext('2d');
    }

    function start() {
        // get the webcam's stream
        navigator.getUserMedia({video: true}, onSuccess, function () {});
    }

    function stop() {
        userMediaStream.stop();
        video.pause();
    }

    function onSuccess(stream) {
        userMediaStream = stream;
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
            side,
            current = 0;
        while (i < lim) {
            var average1 = (oldData[current] + oldData[current + 1] + oldData[current + 2]) / 3;
            var average2 = (newData[current] + newData[current + 1] + newData[current + 2]) / 3;
            var diff = threshold(Math.abs(average1 - average2));
            dest[current] = diff;
            dest[current + 1] = diff;
            dest[current + 2] = diff;
            dest[current + 3] = 0xFF;

            // check if there was a change
            if (diff == 0xFF) {
                // check in which side is the diff
                side = ~~(i / (width / 2)) % 2;         // even: left, odd: right
                side ? diffRight++ : diffLeft++;
            }
            ++i;
            current += 4;
        }
        // trigger 'A' and 'D'
    //    console.log("lim = " + lim);
    //    console.log(i);
    //    console.log(diffLeft, diffRight);
        T3.Keyboard.set('A', diffLeft > tolerance);
        T3.Keyboard.set('D', diffRight > tolerance);
    }

    return {
        canvas: canvasBlended,
        initialize: initialize,
        start: start,
        stop: stop
    }
})();