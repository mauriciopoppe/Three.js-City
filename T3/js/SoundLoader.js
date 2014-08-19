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

    try {
        var webAudio = new WebAudio();
    } catch (e) {
        console.log(e);
    }

    var queue = [],
        sounds = {},
        endCallback,
        endCallbackScope,
        execute;

    var showDebug,
        debug = {};

    execute = function (index) {
        if(!webAudio) {
            endCallback.call(endCallbackScope);
            return;
        }
        if (index === queue.length) {
            debug.end = new Date();
            showDebug && console.log('T3.SoundLoader finished in: ' + (debug.end - debug.start) + 'ms');
            endCallback.call(endCallbackScope);
        } else {
            webAudio
                .createSound()
                .load(queue[index].url, function (sound) {
                    sounds[queue[index].name] = sound;
                    execute(index + 1);
                });
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
            var sound = sounds[name],
                source;
            if (sound) {
                options = options || {};
                options.loop && sound.loop(options.loop);
                options.volume && sound.volume(options.volume);
                source = sound.play(options.time || 0);
            }
            return source;
        },
        /**
         * Getter for the web audio instance
         * @param name
         */
        get: function (name) {
            return sounds[name];
        },
        /**
         * Call this method to show debug info during the asset loading
         * @chainable
         */
        debug: function () {
            showDebug = true;
            return this;
        },
        /**
         * Web Audio instance used to verify if it was correctly initialized
         */
        getWebAudioInstance: function () {
            return webAudio;
        }
    };
})();