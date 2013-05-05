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
            ground: true,
            gridX: true
        });

        // world objects go here
        me.car = new T3.model.Car({
            name: 'car'
        });

    };

    Application.prototype.update = function (delta) {
        var me = this,
            manager = T3.ObjectManager;

        // game update logic goes here
        // CAMERA
        activeCamera.update(delta);

        // ROTATING LIGHT
        manager.getObject('sphere-light-point').update(delta);

        // CAR MOVEMENT
        if (T3.Keyboard.query('A')) {
            manager.getObject('car-wheel-front-left').rotate('left');
            manager.getObject('car-wheel-front-right').rotate('left');
        }
        if (T3.Keyboard.query('D')) {
            manager.getObject('car-wheel-front-left').rotate('right');
            manager.getObject('car-wheel-front-right').rotate('right');
        }
        if (T3.Keyboard.query('W')) {
            manager.getObject('car').move('forward', delta);
            // update the rotation of the wheels based on the speed of the car
        }
        if (T3.Keyboard.query('S')) {
            manager.getObject('car').move('backward', delta);
        }

        // SPEED AND WHEEL ROTATION DECAY
        if ( !T3.Keyboard.query('W') && !T3.Keyboard.query('S') ) {
            manager.getObject('car').move('decay', delta);
        }
        if ( !T3.Keyboard.query('A') && !T3.Keyboard.query('D') ) {
            manager.getObject('car-wheel-front-left').decay();
            manager.getObject('car-wheel-front-right').decay();
        }

        me.updateRotationOfWheels(manager.getObject('car').speed);
    };

    Application.prototype.updateRotationOfWheels = function (speed) {
//        console.log(speed);
        var manager = T3.ObjectManager,
            angularSpeedRatio,
            frontLeft = manager.getObject('car-wheel-front-left'),
            frontRight = manager.getObject('car-wheel-front-right'),
            backLeft = manager.getObject('car-wheel-back-left'),
            backRight = manager.getObject('car-wheel-back-right'),
            radius = frontLeft.radius;

        angularSpeedRatio = speed / (radius * 50);     // magic number xD

        frontLeft.tire.rotation.x += angularSpeedRatio;
        frontLeft.rim.rotation.x += angularSpeedRatio;
        frontRight.tire.rotation.x -= angularSpeedRatio;
        frontRight.rim.rotation.x -= angularSpeedRatio;
        backLeft.rotation.x += angularSpeedRatio;
        backRight.rotation.x += angularSpeedRatio;
    };

    Application.prototype.render = function () {
        renderer.render(scene, activeCamera.real);
    };

    T3.controller.Application = Application;
})();