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
         * Car acceleration factor
         * @type {number}
         */
        this.acceleration = 50;
        /**
         * Car deceleration factor
         * @type {number}
         */
        this.deceleration = -50;
        /**
         * Current speed of the car
         * @type {number}
         */
        this.speed = 0;
        /**
         * Max speed of the car
         * @type {number}
         */
        this.maxSpeed = 100;
        /**
         * Min speed of the car
         * @type {number}
         */
        this.minSpeed = -50;

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
            geometryConfig: { initialized: T3.AssetLoader.get('car-body-geometry') }
        });

        var exhaust = new T3.model.Exhaust({
            name: 'car-exhaust',
            folder: 'Car exhaust and dummy front',
            originalParent: me,
            geometryConfig: { initialized: T3.AssetLoader.get('car-exhaust-geometry') }
        });

        var windows = new T3.model.Window({
            name: 'car-windows',
            folder: 'Car windows',
            originalParent: me,
            geometryConfig: { initialized: T3.AssetLoader.get('car-windows-geometry') }
        });

        var interior = new T3.model.Interior({
            name: 'car-interior',
            folder: 'Car interior',
            originalParent: me,
            geometryConfig: { initialized: T3.AssetLoader.get('car-interior-geometry') }
        });

        new T3.model.LightsFront({
            name: 'car-lights-front',
            folder: 'Car lights - front',
            originalParent: me,
            geometryConfig: { initialized: T3.AssetLoader.get('car-lights-front-geometry') }
        });

        me.ligthsBack = new T3.model.LightsBack({
            name: 'car-lights-back',
            folder: 'Car lights - back',
            originalParent: me,
            geometryConfig: { initialized: T3.AssetLoader.get('car-lights-back-geometry') }
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
        return this;
    };

    Car.prototype.initDatGui = function (gui) {
        var me = this,
            camera = T3.ObjectManager.get('camera-cube'),
            folder = gui.addFolder('Car Mesh');
        folder
            .add(me, 'visible')
            .name('Show mesh')
            .onFinishChange(function (value) {
                me.setVisible(value);
            });
        folder
            .add(me, 'enableCubeMap')
            .name('Enable cube map')
            .onFinishChange(function (value) {
                me.body.updateMaterial(value);
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
     * Moves the car updating its speed, position and rotation
     * @param direction Either 'left' or 'right'
     * @param delta
     */
    Car.prototype.move = function (direction, delta) {
        var me = this,
            wheelOrientation = T3.ObjectManager.get('car-wheel-front-left').rotation.y,
            oldSpeed = me.speed,
            newSpeed,
            forwardDelta;

        // vf = vo + at
        // vf^2 = vo^2 + 2 * a * t
        newSpeed = this.computeSpeed(direction, oldSpeed, delta);
        forwardDelta = (oldSpeed + newSpeed) * 0.5 * delta;
        me.carOrientation += (forwardDelta * me.steeringRadiusRatio) * wheelOrientation;
        // displacement
        me.position.x += Math.sin(me.carOrientation) * forwardDelta;
        me.position.z += Math.cos(me.carOrientation) * forwardDelta;
        // steering
        me.rotation.y = me.carOrientation;
        me.speed = newSpeed;
    };

    /**
     * Computes the new speed considering the maxSpeed and minSpeed as limits
     * to this new speed
     * @param direction
     * @param oldSpeed
     * @param delta
     * @returns {*}
     */
    Car.prototype.computeSpeed = function (direction, oldSpeed, delta) {
        var me = this,
            eps = 0.1,
            newSpeed;

        // vf = vo + at
        // vf^2 = vo^2 + 2 * a * t
        if (direction === 'forward') {
            newSpeed = Math.min(me.maxSpeed, oldSpeed + me.acceleration * delta);
        } else if (direction === 'backward') {
            newSpeed = Math.max(me.minSpeed, oldSpeed + me.deceleration * delta);
        } else {
            // decay
            if (Math.abs(oldSpeed) <= eps) {
                return 0;
            } else if (oldSpeed > eps) {
                newSpeed = oldSpeed + me.deceleration * delta;
            } else if (oldSpeed < -eps) {
                newSpeed = oldSpeed + me.acceleration * delta;
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
        var me = this;
        if (T3.Keyboard.query('A')) {
            me.wheelFrontLeft.rotate('left');
            me.wheelFrontRight.rotate('left');
        }
        if (T3.Keyboard.query('D')) {
            me.wheelFrontLeft.rotate('right');
            me.wheelFrontRight.rotate('right');
        }
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
        me.ligthsBack.update(delta, T3.Keyboard.query('S'));

        // CAR WHEELS ROTATION
        me.updateWheelsRotation(me.speed);

        // UPDATE CUBE CAMERA POSITION
        me.enableCubeMap && me.updateCubeCamera();
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

        angularSpeedRatio = speed / (radius * 50);     // magic number xD

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
    T3.model.Car = Car;
})();