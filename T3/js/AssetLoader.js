/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/14/13
 * Time: 1:09 PM
 * To change this template use File | Settings | File Templates.
 */
T3.AssetLoader = (function () {
    var assets = {},
        queue = [],
        execute,
        endCallback,
        endCallbackScope,
        loader = new THREE.JSONLoader();

    var showDebug,
        debug = {
        };

    execute = function (index) {
        loader.load(queue[index].url, function (geometry) {
            assets[queue[index].name] = geometry;
            if (index + 1 < queue.length) {
                execute(index + 1);
            } else {
                debug.end = new Date();
                showDebug && console.log('T3.AssetLoader finished in: ' + (debug.end - debug.start) + 'ms');
                endCallback.call(endCallbackScope);
            }
        });
    };

    return {
        register: function (url, name) {
            queue.push({
                url: url,
                name: name
            });
            return this;
        },
        load: function (callback, scope) {
            endCallback = callback;
            endCallbackScope = scope;

            // <debug>
            debug.start = new Date();
            // </debug>
            execute(0);
        },
        get: function (name) {
            return assets[name];
        },
        debug: function () {
            showDebug = true;
        }
    };
})();