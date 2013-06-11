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
            // put the scene in a huge cube
            me.initSkyBox();

            // cameras used for the world
            me.initCameras();
            // coordinates helper
            me.initCoordinates();

            // world objects
            me.createBuildingBlocks();
            // car
            me.createCar();
            // rain!
            me.createRain();

            // car auto acceleration (for the motion detection system)
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
         * Creates the building blocks of the world (supported: block, classic),
         * the idea is to create a grid of roads and make a block in each space that
         * is not in the grid
         */
        createBuildingBlocks: function () {
            var me = this,
                rows = [],
                cols = [],
                total,
                gridSize = 10,
                i,
                j;

            // grid generation
            total = 0;
            rows[total] = cols[total] = 0;
            total += 1;
            while (total < gridSize) {
                rows[total] = rows[total - 1] + 2 + ~~(Math.random() * 3);
                cols[total] = cols[total - 1] + 2 + ~~(Math.random() * 3);
                total += 1;
            }

            for (i = 0; i < gridSize - 1; i += 1) {
                for (j = 0; j < gridSize - 1; j += 1) {
                    me.createBuildings(
                        rows[i] + 1, cols[j] + 1,
                        rows[i + 1] - 1, cols[j + 1] - 1
                    );
                }
            }
        },

        createBuildings: function (x1, y1, x2, y2) {
            var object,
                models = ['Block', 'Classic'],
                probability = [0, 0.9, 1],
                random,
                width = 10,
                depth = 10;

            random = Math.random();
            for (var i = 0; i < probability.length - 1; i += 1) {
                if (random >= probability[i] && random < probability[i + 1]) {
                    random = i;
                    break;
                }
            }

            object = new T3.model[models[random]]({
                width: width * (x2 - x1 + 1),
                depth: depth * (y2 - y1 + 1)
            });
            object.position.set(
                x1 * width * T3.scale,
                0,
                y1 * depth * T3.scale
            );
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
         * Wraps the world in a cube with a texture in the inside of it
         */
        initSkyBox: function () {
            var path = "images/cube/",
                urls = [ path + "posx.jpg", path + "negx.jpg",
                    path + "posy.jpg", path + "negy.jpg",
                    path + "posz.jpg", path + "negz.jpg" ],
                textureCube = THREE.ImageUtils.loadTextureCube(urls);

            var shader = THREE.ShaderLib[ "cube" ];
            shader.uniforms[ "tCube" ].value = textureCube;

            var material = new THREE.ShaderMaterial( {
                fragmentShader: shader.fragmentShader,
                vertexShader: shader.vertexShader,
                uniforms: shader.uniforms,
                depthWrite: false,
                side: THREE.BackSide
            });

            new T3.model.Mesh({
                geometryConfig: {
                    initialized: new THREE.CubeGeometry(1000, 1000, 1000)
                },
                materialConfig: {
                    initialized: material
                }
            });
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
            activeCamera = T3.ObjectManager.get('camera-main');

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
            var $buttons = $('.motion'),
                i,
                motionDetectionSystems =
                    ['MotionDetection', 'MotionDetectionHeadtrackr'],
                status = false,
                activeController;

            for (i = 0; i < motionDetectionSystems.length; i += 1) {
                T3.controller[motionDetectionSystems[i]].initialize();
            }

            $buttons.on('click', function () {
                var $me = $(this),
                    motion = $me.data('motion'),
                    controller = T3.controller[motion],
                    $canvas = $(controller.canvas);

                // only one controller might be available at any time,
                // so in the case where the user wants to activate the old controller
                //
                if (status && controller != activeController) {
                    return;
                }
                activeController = controller;
                if (status) {
                    T3.Keyboard.set('W', false);
                    controller.stop();
                    $canvas.fadeOut();
                    $me.addClass('off');
                    $me.removeClass('on');
                } else {
                    T3.Keyboard.set('W', true);
                    controller.start();
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