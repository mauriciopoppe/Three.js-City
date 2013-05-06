/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/14/13
 * Time: 6:39 PM
 * To change this template use File | Settings | File Templates.
 */
(function () {
    T3.controller.Keyboard = {

        keys: [],

        init: function (options) {
            var me = this,
                defaults = {},
                i;

            for (i = 0; i < 256; i += 1) {
                me.keys[i] = false;
            }

            document.addEventListener( 'keydown', me.onKeyDown(), false );
            document.addEventListener( 'keyup', me.onKeyUp(), false );

            $.extend(true, defaults, options);
        },

        onKeyDown: function () {
            var me = this;
            return function (event) {
                me.keys[event.keyCode] = true;
            }
        },

        onKeyUp: function () {
            var me = this;
            return function (event) {
                me.keys[event.keyCode] = false;
            }
        },

        query: function (key) {
            return this.keys[key.charCodeAt(0)];
        },

        set: function (key, value) {
            this.keys[key.charCodeAt(0)] = value;
        }
    };

    // alias
    T3.Keyboard = T3.controller.Keyboard;
}());