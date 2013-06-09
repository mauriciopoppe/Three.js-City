/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/14/13
 * Time: 1:51 PM
 * To change this template use File | Settings | File Templates.
 */
(function () {
    var World,
        renderer,
        activeCamera;

    World = function (config) {

        /**
         * The world can have many cameras, so the this is a reference to
         * the active camera that's being used right now
         * @type {T3.model.Camera}
         */
        activeCamera = config.activeCamera;

        /**
         * THREE Renderer
         * @type {Object}
         */
        renderer = config.renderer;

        World.prototype.init.call(this);
    };

    // statics
    World.GRAVITY = 9.81;

    World.prototype = {
        init: function () {
            var me = this;
            // cameras used for the world
            me.initCameras();
            // coordinates helper
            me.initCoordinates();

            // car
            me.createCar();
            // rain!
            me.createRain();
            me.initCarAutoAcceleration();
        },

        /**
         * Initializes the coordinate helper
         */
        initCoordinates: function () {
            new T3.model.Coordinates({
                // config goes here
                ground: true,
                gridX: true
            });
        },

        /**
         * Creates an instance of a car
         */
        createCar: function () {
            var me = this;
            me.car = new T3.model.Car({
                name: 'car'
            });

            // attach cameras to the car
            me.car.add(T3.ObjectManager.get('camera-car-back').real);
            me.car.add(T3.ObjectManager.get('camera-car-driver').real);
        },

        /**
         * Creates an instance of the rain system
         */
        createRain: function () {
            var me = this;
            me.rainSystem = new T3.model.RainSystem({
                name: 'rain-system'
            });
        },

        /**
         * The world is responsible of updating its children
         * @param delta
         */
        update: function (delta) {
            var me = this,
                manager = T3.ObjectManager;

            // game update logic goes here
            // CAMERA
            activeCamera.update(delta);

            // ROTATING LIGHT
            manager.get('sphere-light-point').update(delta);

            // CAR MOVEMENT
            me.car.update(delta);

            // RAIN SYSTEM
            me.rainSystem.update(delta);
        },

        render: function () {
            renderer.render(scene, activeCamera.real);
        },

        /**
         * Initializes the cameras used in the world
         */
        initCameras: function () {
            var camera;

            // orbit and pan camera
            new T3.model.Camera({
                name: 'camera-main',
                cameraPan: true,
                renderer: renderer,
                position: new THREE.Vector3( 10, 100, 150 )
            });

            // car camera back
            camera = new T3.model.Camera({
                name: 'camera-car-back',
                position: new THREE.Vector3(0, 30, -100),
                renderer: renderer
            });
            camera.real.lookAt(new THREE.Vector3(0, 0, 0));

            // car camera in
            camera = new T3.model.Camera({
                name: 'camera-car-driver',
                position: new THREE.Vector3(4, 11, -5),
                renderer: renderer
            });
            camera.real.lookAt(new THREE.Vector3(-5, 0, 50));

            // ******* ACTIVE CAMERA *******
            // active camera is the world camera
            activeCamera = T3.ObjectManager.get('camera-car-back');

            // listen to camera switches
            var cameras = ['camera-main', 'camera-car-back', 'camera-car-driver'],
                current = cameras.indexOf(activeCamera.name);
            $('#switch').on('click', function () {
                var next = (current + 1) % cameras.length;
                activeCamera = T3.ObjectManager.get(cameras[next]);
                current = next;
            });
        },

        initCarAutoAcceleration: function () {
            var $button = $('#acceleration'),
                $canvas = $('#canvas-blended'),
                status = false;
            T3.controller.MotionDetection.initialize();
            $button.on('click', function () {
                var $me = $(this);
                if (status) {
                    T3.controller.MotionDetection.stop();
                    $canvas.fadeOut();
                    $me.addClass('off');
                    $me.removeClass('on');
                } else {
                    T3.controller.MotionDetection.start();
                    $canvas.fadeIn();
                    $me.addClass('on');
                    $me.removeClass('off');
                }
                status = !status;
            });
        }
    };
    T3.World = T3.controller.World = World;

})();