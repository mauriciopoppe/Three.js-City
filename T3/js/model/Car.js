/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/scale/13
 * Time: 12:43 AM
 * To change this template use File | Settings | File Templates.
 */
(function () {

    var Car;
    
    Car = function (config) {
        config = config || {};

        /**
         * Dat.gui flag to enable or disable cube map reflections
         * @type {boolean}
         */
        this.enableCubeMap = false;

        T3.model.Object3D.call(this, config);

        /**
         * Body options (color, ambient, specular, shininess)
         * @type {Object}
         */
        this.bodyOptions = config.bodyOptions;

        /**
         * Body options (color, ambient, specular, shininess)
         * @type {Object}
         */
        this.exhaustOptions = config.exhaustOptions;

        /**
         * lightsBack options (color, ambient, specular, shininess)
         * @type {Object}
         */
        this.lightsBackOptions = config.lightsBackOptions;

        /**
         * lightsFront options (color, ambient, specular, shininess)
         * @type {Object}
         */
        this.lightsFrontOptions = config.lightsFrontOptions;

        /**
         * window options (color, ambient, specular, shininess)
         * @type {Object}
         */
        this.windowOptions = config.windowOptions;

        /**
         * interior options (color, ambient, specular, shininess)
         * @type {Object}
         */
        this.interiorOptions = config.interiorOptions;

        /**
         * tire options (color, ambient, specular, shininess)
         * @type {Object}
         */
        this.tireOptions = config.tireOptions;

        /**
         * rim options (color, ambient, specular, shininess)
         * @type {Object}
         */
        this.rimOptions = config.rimOptions;

        /**
         * Car orientation (is updated using the y orientation of any front wheel)
         * @type {number}
         */
        this.carOrientation = 0;
        /**
         * Steering radius, if a higher number is set it will make the car rotate
         * on its y axis!
         * @type {number}
         */
        this.steeringRadiusRatio = 0.02;
        /**
         * Max speed of the car
         * @type {number}
         */
        this.maxSpeed = 150;
        /**
         * Min speed of the car
         * @type {number}
         */
        this.minSpeed = -50;
        /**
         * Car acceleration factor
         * @type {number}
         */
        this.acceleration = this.maxSpeed / 5;
        /**
         * Current speed of the car
         * @type {number}
         */
        this.speed = 0;
        /**
         * The tilt is the rotation in the z axis multiplied by some scale factor
         * @type {number}
         */
        this.tiltAmount = 0;
        /**
         * BufferSource created by the AudioContext instance
         * @type {Object}
         */
        this.engineSound = null;

        /**
         * During each render, the music is analized represented as an histogram
         * @type {Array}
         */
        this.histogram = null;

        /**
         * If the music is playing, the car will display an histogram
         * in the place where most radios are xD
         * @type {Object}
         */
        this.musicHistogram = new T3.model.Object3D();

        /**
         * Size of the histogram
         * @type {number}
         */
        this.histogramSize = 10;

        Car.prototype.init.call(this, config);
    };

    T3.inheritFrom(Car, T3.model.Object3D);

    /**
     * Init this object
     * @param {Object} config
     * @chainable
     */
    Car.prototype.init = function (config) {
        var me = this,
            wheel,
            suffix;

        me.body = new T3.model.Body({
            name: 'car-body',
            folder: 'Car body',
            originalParent: me,
            geometryConfig: { initialized: T3.AssetLoader.get('car-body-geometry').geometry },
            materialConfig: { options: {side: THREE.DoubleSide} }
        });

        me.exhaust = new T3.model.Exhaust({
            name: 'car-exhaust',
            folder: 'Car exhaust and dummy front',
            originalParent: me,
            geometryConfig: { initialized: T3.AssetLoader.get('car-exhaust-geometry').geometry }
        });

        me.windows = new T3.model.Window({
            name: 'car-windows',
            folder: 'Car windows',
            originalParent: me,
            geometryConfig: { initialized: T3.AssetLoader.get('car-windows-geometry').geometry }
        });

        me.interior = new T3.model.Interior({
            name: 'car-interior',
            folder: 'Car interior',
            originalParent: me,
            geometryConfig: { initialized: T3.AssetLoader.get('car-interior-geometry').geometry }
        });

        me.lightsFront = new T3.model.LightsFront({
            name: 'car-lights-front',
            folder: 'Car lights - front',
            originalParent: me,
            geometryConfig: { initialized: T3.AssetLoader.get('car-lights-front-geometry').geometry }
        });

        me.lightsBack = new T3.model.LightsBack({
            name: 'car-lights-back',
            folder: 'Car lights - back',
            originalParent: me,
            geometryConfig: { initialized: T3.AssetLoader.get('car-lights-back-geometry').geometry }
        });

        suffix = 'back-left';
        me.wheelBackLeft = new T3.model.Wheel({
            name: 'car-wheel-' + suffix,
            suffix: suffix,
            originalParent: me
        });
        me.wheelBackLeft.position.set(7, me.wheelBackLeft.radius, -13.2);

        suffix = 'back-right';
        me.wheelBackRight = new T3.model.Wheel({
            name: 'car-wheel-' + suffix,
            suffix: suffix,
            originalParent: me
        });
        me.wheelBackRight.position.set(-7, me.wheelBackRight.radius, -13.2);
        me.wheelBackRight.real.rotation.z += Math.PI;

        suffix = 'front-left';
        me.wheelFrontLeft = new T3.model.Wheel({
            name: 'car-wheel-' + suffix,
            suffix: suffix,
            originalParent: me
        });
        me.wheelFrontLeft.position.set(7, me.wheelFrontLeft.radius, 13.5);

        suffix = 'front-right';
        me.wheelFrontRight = new T3.model.Wheel({
            name: 'car-wheel-' + suffix,
            suffix: suffix,
            originalParent: me
        });
        me.wheelFrontRight.position.set(-7, me.wheelFrontRight.radius, 13.5);
        me.wheelFrontRight.real.rotation.z += Math.PI;

        // poor man shadow
        var geometry = new THREE.PlaneGeometry(15, 28);
        geometry.applyMatrix(new THREE.Matrix4().makeRotationX(- Math.PI / 2));
        var material = new THREE.MeshBasicMaterial({
            color: 0x333333,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7
        });
        me.shadow = new THREE.Mesh(geometry, material);
        scene.add(me.shadow);
        me.shadow.position.y = 0.2;

        // neon light
        var light = new THREE.PointLight(0xff0000, 3, 10);
        light.position.set(0, 2, 0);
        me.add(light);

        // histogram
        me.createHistogram();

        return this;
    };

    Car.prototype.initDatGui = function (gui) {
        var me = this,
            soundOptions = {
                engineSound: false,
                pitch: 1,
                volume: 0.05,
                engineTypes: 1
            },
            camera = T3.ObjectManager.get('camera-cube'),
            folder = gui.addFolder('Car Mesh');
        folder
            .add(me, 'visible')
            .name('Show mesh')
            .onFinishChange(function (value) {
                me.setVisible(value);
            });
        folder
            .add({shadow: false}, 'shadow')
            .name('Show shadows')
            .onFinishChange(function (value) {
                me.body.real.castShadow = value;
                me.windows.real.castShadow = value;
                me.wheelBackLeft.real.castShadow = value;
                me.wheelBackRight.real.castShadow = value;
                me.wheelFrontLeft.real.castShadow = value;
                me.wheelFrontRight.real.castShadow = value;
            });
        folder
            .add(me, 'enableCubeMap')
            .name('Enable cube map')
            .onFinishChange(function (value) {
                me.body.updateMaterial(value);
            });
        folder
            .add(soundOptions, 'engineSound')
            .name('Engine sound')
            .onFinishChange(function (value) {
                if (value) {
                    me.engineSound = T3.SoundLoader.playSound('sound-engine-3', {
                        loop: true,
                        volume: soundOptions.volume
                    });
                } else {
                    me.engineSound.stop();
                    me.engineSound = null;
                }
            });
        folder
            .add(soundOptions, 'engineTypes', {
                'Engine type 1': 1,
                'Engine type 2': 2,
                'Engine type 3': 3,
                'Engine type 4': 4,
            })
            .name('Engine types')
            .onChange(function (value) {
                var newEngine = 'sound-engine-' + value;
                if (me.engineSound) {
                    me.engineSound.stop();
                }
                me.engineSound = T3.SoundLoader.playSound(newEngine, {
                    loop: true,
                    volume: soundOptions.volume
                });
            });

        folder
            .add(soundOptions, 'volume', 0, 0.3)
            .name('Volume')
            .onChange(function (value) {
                if (me.engineSound) {
                    me.engineSound.sound.volume(value);
                }
            });
    };

    /**
     * Updates the visibility of this car and all its children
     * @param value
     */
    Car.prototype.setVisible = function (value) {
        var me = this;
        me.visible = value;
        T3.traverse(me, function (object) {
            object.visible = value;
        });
    };

    /**
     * Creates an histogram and places in the position of the radio
     * (sort of an equalizer)
     */
    Car.prototype.createHistogram = function () {
        var me = this,
            width = 0.2,
            height = 0.5,
            depth = 0.1,
            mesh,
            i;
        for (i = me.histogramSize - 2; i >= 0 ; i -= 1) {
            mesh = new THREE.Mesh(
                new THREE.BoxGeometry(width, height, depth),
                new THREE.MeshBasicMaterial()
            )
            mesh.position.set(me.musicHistogram.children.length * width, 0, 0);
            me.musicHistogram.add(mesh);
        }
        for (i = 1; i < me.histogramSize - 1; i += 1) {
            mesh = new THREE.Mesh(
                new THREE.BoxGeometry(width, height, depth),
                new THREE.MeshBasicMaterial()
            )
            mesh.position.set(me.musicHistogram.children.length * width, 0, 0);
            me.musicHistogram.add(mesh);
        }
        me.musicHistogram.position.set(-2, 9, 5);
        me.add(me.musicHistogram);
    };

    /**
     * Moves the car updating its speed, position and rotation
     * @param direction Either 'left' or 'right'
     * @param delta
     */
    Car.prototype.move = function (direction, delta) {
        var me = this,
            simulationBody = me.simulationInstance.body,
            wheelOrientation = T3.ObjectManager.get('car-wheel-front-left').rotation.y,
            oldSpeed = me.speed,
            newSpeed,
            forwardDelta;

        // vf = vo + at
        // vf^2 = vo^2 + 2 * a * t
        newSpeed = this.computeSpeed(direction, oldSpeed, delta, Math.abs(me.tiltAmount) * 30);
        forwardDelta = (oldSpeed + newSpeed) * 0.5 * delta;
        me.carOrientation += (forwardDelta * me.steeringRadiusRatio) * wheelOrientation;
        // displacement
        me.position.x += Math.sin(me.carOrientation) * forwardDelta;
        me.position.z += Math.cos(me.carOrientation) * forwardDelta;
        // steering
        me.rotation.y = me.carOrientation;

        // poor man shadow
        me.shadow.position = me.position;
        me.shadow.position.y = 0.2;
        me.shadow.rotation.y = me.carOrientation;

        me.speed = newSpeed;

        simulationBody.rotation.set(0, me.rotation.y, 0)
    };

    /**
     * Computes the new speed considering the maxSpeed and minSpeed as limits
     * to this new speed
     * @param direction
     * @param oldSpeed
     * @param delta
     * @returns {*}
     */
    Car.prototype.computeSpeed = function (direction, oldSpeed, delta, tilt) {
        var me = this,
            eps = 0.1,
            newSpeed;

        // vf = vo + at
        // vf^2 = vo^2 + 2 * a * t
        if (direction === 'forward') {
            newSpeed = Math.min(me.maxSpeed, oldSpeed + me.acceleration * delta - tilt);
        } else if (direction === 'backward') {
            newSpeed = Math.max(me.minSpeed, oldSpeed - me.acceleration * delta - tilt);
        } else {
            // decay
            if (Math.abs(oldSpeed) <= eps) {
                return 0;
            } else if (oldSpeed > eps) {
                newSpeed = oldSpeed - me.acceleration * delta - tilt;
            } else if (oldSpeed < -eps) {
                newSpeed = oldSpeed + me.acceleration * delta - tilt;
            }
        }
        return newSpeed;
    };

    /**
     * Listens to the events that happen in the world an updates this model
     * and the view, also this method is responsible to update the cube camera
     * used to compute the reflection texture applied to the body of this car
     * @param {Number} delta
     */
    Car.prototype.update = function (delta) {
        var me = this,
            simulationBody = me.simulationInstance.body,
            source;

        // LEFT AND RIGHT TURN
        if (T3.Keyboard.query('A')) {
            me.wheelFrontLeft.rotate('left');
            me.wheelFrontRight.rotate('left');
        }
        if (T3.Keyboard.query('D')) {
            me.wheelFrontLeft.rotate('right');
            me.wheelFrontRight.rotate('right');
        }

        // TILT (calculates the current tilt factor)
        me.tilt();

        // MOVE FORWARD AND BACKWARD
        if (T3.Keyboard.query('W')) {
            me.move('forward', delta);
            // update the rotation of the wheels based on the speed of the car
        }
        if (T3.Keyboard.query('S')) {
            me.move('backward', delta);
        }

        // SPEED AND WHEEL ROTATION DECAY
        if ( !T3.Keyboard.query('W') && !T3.Keyboard.query('S') ) {
            me.move('decay', delta);
        }
        if ( !T3.Keyboard.query('A') && !T3.Keyboard.query('D') ) {
            me.wheelFrontLeft.decay();
            me.wheelFrontRight.decay();
        }

        // CAR BACK LIGHTS
        me.lightsBack.update(delta, T3.Keyboard.query('S'));

        // CAR WHEELS ROTATION
        me.updateWheelsRotation(me.speed);

        // UPDATE CUBE CAMERA POSITION
        me.enableCubeMap && me.updateCubeCamera();

        // UPDATE SHADERS THAT DEPEND ON THIS SPEED
        me.updateShaders();

        // UPDATE THE Y-SCALE OF THE HISTOGRAM
        me.updateHistogram();

        // SOUND PITCH
        if (me.engineSound) {
            me.engineSound.node.playbackRate.value =
                Math.abs(me.speed * 4 / me.maxSpeed);
        }

        // UPDATE MATRIX FOR SOME TRANSFORMATIONS REQUIRED IN THE RAIN
//        me.updateMatrixWorld();
    };

    /**
     * Updates the rotation of the wheels (only x rotation in the back wheels and
     * x, y rotation on the front wheels)
     * @param speed
     */
    Car.prototype.updateWheelsRotation = function (speed) {
        var me = this,
            angularSpeedRatio,
            frontLeft = me.wheelFrontLeft,
            frontRight = me.wheelFrontRight,
            backLeft = me.wheelBackLeft,
            backRight = me.wheelBackRight,
            radius = frontLeft.radius;

        angularSpeedRatio = speed / (radius * 60);     // magic number xD

        frontLeft.tire.rotation.x += angularSpeedRatio;
        frontLeft.rim.rotation.x += angularSpeedRatio;
        frontRight.tire.rotation.x -= angularSpeedRatio;
        frontRight.rim.rotation.x -= angularSpeedRatio;
        backLeft.rotation.x += angularSpeedRatio;
        backRight.rotation.x += angularSpeedRatio;
    };

    /**
     * Updates the cube camera used to create the dynamic texture
     * based on the images that 6 cameras capture (CubeCamera)
     */
    Car.prototype.updateCubeCamera = function () {
        var me = this,
            cubeCamera,
            renderer;
        if (T3.World.ticks % 10 == 0) {
            cubeCamera = T3.ObjectManager.get('camera-cube');
            cubeCamera.position = me.position;
            renderer = T3.World.renderer;
            me.setVisible(false);
            cubeCamera.updateCubeMap(renderer, scene);
            me.setVisible(true);
        }
    };

    /**
     * Tilts the car, the tilt amount is determined with the current speed
     * and the rotation of any front wheel
     */
    Car.prototype.tilt = function () {
        var me = this,
            speed = me.speed,
            rotation = me.wheelFrontRight.rotation.y,
            tilt = speed * rotation * 0.0005;

        me.body.rotation.z = tilt;
        me.lightsFront.rotation.z = tilt;
        me.lightsBack.rotation.z = tilt;
        me.interior.rotation.z = tilt;
        me.exhaust.rotation.z = tilt;
        me.windows.rotation.z = tilt;
        me.musicHistogram.rotation.z = tilt;

        me.tiltAmount = tilt;
    };

    /**
     * Updates the shaders' uniform variables that depend on some
     * aspects of this car.
     * e.g.
     *      RadialBlur is affected by the speed of this car
     */
    Car.prototype.updateShaders = function () {
        // update radialBlur shader
        var me = this,
            world = T3.World,
            radialShader = world.radialShader;

        if (!radialShader) {
            return;
        }
        radialShader.uniforms.sampleDist.value =
            Math.pow(Math.abs(me.speed) / me.maxSpeed, 6.0);

        var music = T3.SoundLoader.get('music-1');
        if (music) {
            me.histogram = music.makeHistogram(me.histogramSize);
            radialShader.uniforms.sampleStrength.value =
                radialShader.maxStrength +
                    Math.max(me.histogram[4] / 95 - 1, 0) * 3;
        }
    };

    /**
     * Uodates the histogram y scale
     */
    Car.prototype.updateHistogram = function () {
        var me = this,
            mesh,
            i,
            j,
            len = me.musicHistogram.children.length;
        if (!me.histogram) {
            return;
        }
        for (j = 0, i = me.histogramSize - 2; i >= 0 ; i -= 1, j += 1) {
            mesh = this.musicHistogram.children[j];
            me.histogram[i] && (mesh.scale.y = me.histogram[i] / 100);
            mesh.material.color.setHSL(0.3 + me.histogram[i] / 200 * 0.7, 1, 0.5);

            mesh = this.musicHistogram.children[len - 1 - j];
            me.histogram[i] && (mesh.scale.y = me.histogram[i] / 100);
            mesh.material.color.setHSL(0.3 + me.histogram[i] / 200 * 0.7, 1, 0.5);
        }
    };

    T3.model.Car = Car;
})();