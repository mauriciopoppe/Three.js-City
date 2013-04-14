/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/14/13
 * Time: 1:51 PM
 * To change this template use File | Settings | File Templates.
 */
(function () {
    var Application,
        renderer,
        activeCamera;
    Application = function (config) {

        /**
         * Private active camera
         * @type {T3.model.Camera}
         */
        activeCamera = config.activeCamera;

        /**
         * WebGL Renderer
         * @type {Object}
         */
        renderer = config.renderer;

        Application.prototype.init.call(this);
    };

    Application.prototype.init = function () {
        var me = this;

        new T3.model.Coordinates({
            // config goes here
            gridX: true,
            ground: true
        });

        // world objects go here
        me.car = new T3.model.Car({
            name: 'car'
        });
    };

    Application.prototype.update = function (delta) {
        var manager = T3.ObjectManager;

        // game update logic goes here
        // CAMERA
        activeCamera.update(delta);

        // LIGHTS
        manager.getObject('sphere-light-point').update(delta);

    };

    Application.prototype.render = function () {
        renderer.render(scene, activeCamera.real);
    };

    T3.controller.Application = Application;
})();