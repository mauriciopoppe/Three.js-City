/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/14/13
 * Time: 2:18 PM
 * To change this template use File | Settings | File Templates.
 */
(function () {
    var T3Coordinates;
    T3Coordinates = function (config) {

        /**
         * References to the Coordinates objects in the scene
         * @type {Object}
         */
        this.ref = {};

        T3Coordinates.prototype.init.call(this, config);
    };

    T3Coordinates.prototype = {

        gui: {
            axes: false,
            ground: false,
            gridX: false,
            gridY: false,
            gridZ: false
        },

        init: function (options) {
            var me = this;
            $.extend(me.gui, options);

            // add all coordinates helpers to the scene
            me.ref.ground = Coordinates.drawGround({size:10000, color: 0x000000});
            me.ref.gridX = Coordinates.drawGrid({size:10000,scale:0.01});
            me.ref.gridY = Coordinates.drawGrid({size:10000,scale:0.01, orientation:"y"});
            me.ref.gridZ = Coordinates.drawGrid({size:10000,scale:0.01, orientation:"z"});
            me.ref.axes = Coordinates.drawAllAxes({axisLength:100,axisRadius:1,axisTess:50});

            // remove objects depending on me.coordinatesGUI
            !me.gui.ground && scene.remove(me.ref.ground);
            !me.gui.gridX && scene.remove(me.ref.gridX);
            !me.gui.gridY && scene.remove(me.ref.gridY);
            !me.gui.gridZ && scene.remove(me.ref.gridZ);
            !me.gui.axes && scene.remove(me.ref.axes);

            me.initDatGui(T3.Application.datGUI);

            return this;
        },

        initDatGui: function (gui) {
            var me = this,
                folder;

            folder = gui.addFolder('Grid display');
            folder.add(me.gui, 'gridX').name('Show XZ grid').onFinishChange(function (value) {
                scene[value ? 'add' : 'remove'](me.ref.gridX);
            });
            folder.add(me.gui, 'gridY').name('Show YZ grid').onFinishChange(function (value) {
                scene[value ? 'add' : 'remove'](me.ref.gridY);
            });
            folder.add(me.gui, 'gridZ').name('Show XY grid').onFinishChange(function (value) {
                scene[value ? 'add' : 'remove'](me.ref.gridZ);
            });
            folder.add(me.gui, 'ground').name('Show ground').onFinishChange(function (value) {
                scene[value ? 'add' : 'remove'](me.ref.ground);
            });
            folder.add(me.gui, 'axes').name('Show axes').onFinishChange(function (value) {
                scene[value ? 'add' : 'remove'](me.ref.axes);
            });
        }
    };

    T3.model.Coordinates = T3Coordinates;
})();