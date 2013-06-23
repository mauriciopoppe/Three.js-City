/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/14/13
 * Time: 1:09 PM
 * To change this template use File | Settings | File Templates.
 */

/**
 * @class AssetLoader
 * Loads a set of assets in a sequential order using a queue, useful to
 * init the application after all the resources needed finish loading
 * @singleton
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
        loader.load(queue[index].url, function (geometry, materials) {
            assets[queue[index].name] = {
                geometry: geometry,
                materials: materials
            };

            if (index + 1 < queue.length) {
                // load the asset at index `index + 1`
                execute(index + 1);
            } else {
                // finished loading so make a call to `callback`
                debug.end = new Date();
                showDebug && console.log('T3.AssetLoader finished in: ' + (debug.end - debug.start) + 'ms');
                endCallback.call(endCallbackScope);
            }
        });
    };

    return {
        /**
         * Pushes a new asset to be loaded in the asset queue, this asset can
         * be later gathered using the `name` parameter
         * @param {string} url Location of the asset
         * @param {string} name Name of the asset registered with
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
         * Registers an existing asset using `name` as its key
         * @param name
         * @param asset
         * @chainable
         */
        registerAsset: function (name, asset) {
            assets[name] = asset;
            return this;
        },
        /**
         * Loads all the assets registered using `T3.AssetLoader.addToLoadQueue`, each asset
         * is loaded in the same order as they were registered, when all the assets finished
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
         * Gets a loaded resource from the list of assets registered with `name`
         * @param {string }name
         * @return {Object}
         */
        get: function (name) {
            return assets[name];
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