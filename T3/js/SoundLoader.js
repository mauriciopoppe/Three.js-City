/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 6/19/13
 * Time: 9:22 PM
 * To change this template use File | Settings | File Templates.
 */
/**
 * @class SoundLoader
 * Class loads sounds asynchronously using the method `loadSound`,
 * the sound api works with an instance of AudioContext
 * @singleton
 */
T3.SoundLoader = (function () {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    var context = new AudioContext(),
        queue = [],
        sounds = {},
        endCallback,
        endCallbackScope,
        execute;

    var showDebug,
        debug = {};

    execute = function (index) {
        if (index === queue.length) {
            debug.end = new Date();
            showDebug && console.log('T3.SoundLoader finished in: ' + (debug.end - debug.start) + 'ms');
            endCallback.call(endCallbackScope);
        } else {
            var request = new XMLHttpRequest();
            request.open('GET', queue[index].url, true);
            request.responseType = 'arraybuffer';

            // simple bind
            request.onload = function () {
                context.decodeAudioData(request.response, function (buffer) {
                    sounds[queue[index].name] = buffer;
                    execute(index + 1);
                }, function () {
                    console.log('Error decoding the sound %s :(', queue[index].name);
                });
            };
            request.send();
        }
    };

    return {
        /**
         * Loads a sound given its url and saves it under the name `name`
         * @param url
         * @param name
         * @chainable
         */
        addToLoadQueue: function (url, name) {
            queue.push({
                url: url,
                name: name
            });
            return this;
        },
        /**
         * Loads all the assets registered using `T3.SoundLoader.addToLoadQueue`, each asset
         * is loaded in the same order as it was registered, when all the assets finished
         * loading then `callback` will be called with a scope equal to `scope`
         * @param {Function} callback Function to be executed when all the assets finished loading
         * @param {Object} scope The `callback` function will be executed with this `scope`
         */
        load: function (callback, scope) {
            endCallback = callback;
            endCallbackScope = scope;

            // <debug>
            debug.start = new Date();
            // </debug>
            execute(0);
        },
        /**
         * Plays the sound loaded using the loadSound and identified by name
         * @param name
         * @param [options]
         */
        playSound: function (name, options) {
            var source = context.createBufferSource(),
                gainNode;
            options = options || {};
            if (!sounds[name]) {
                throw new Error('Sound not found');
            }
            source.buffer = sounds[name];

            // loop
            options.loop && (source.loop = true);

            // volume
            if(options.volume) {
                gainNode = context.createGain();
                source.connect(gainNode);
                gainNode.connect(context.destination);
                options.volume = Math.min(options.volume, 1);
                gainNode.gain.value = options.volume;
            } else {
                source.connect(context.destination);
            }
            source.start(0);
            return {
                source: source,
                gainNode: gainNode
            };
        },
        /**
         * Call this method to show debug info during the asset loading
         * @chainable
         */
        debug: function () {
            showDebug = true;
            return this;
        }
    };
})();