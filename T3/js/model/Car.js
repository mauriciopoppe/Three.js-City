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

        this.carOrientation = 0;
        this.steeringRadiusRatio = 0.04;
        this.acceleration = 50;
        this.deacceleration = -50;
        this.speed = 0;
        this.maxSpeed = 100;
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
            suffix = 'back-left';

        var body = new T3.model.Body({
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

        var lfront = new T3.model.LightsFront({
            name: 'car-lights-front',
            folder: 'Car lights - front',
            originalParent: me,
            geometryConfig: { initialized: T3.AssetLoader.get('car-lights-front-geometry') }
        });

        var lback = new T3.model.LightsBack({
            name: 'car-lights-back',
            folder: 'Car lights - back',
            originalParent: me,
            geometryConfig: { initialized: T3.AssetLoader.get('car-lights-back-geometry') }
        });

        wheel = new T3.model.Wheel({
            name: 'car-wheel-' + suffix,
            suffix: suffix,
            originalParent: me
        });
        wheel.position.set(7, wheel.radius, -13.2);

        suffix = 'back-right';
        wheel = new T3.model.Wheel({
            name: 'car-wheel-' + suffix,
            suffix: suffix,
            originalParent: me
        });
        wheel.position.set(-7, wheel.radius, -13.2);
        wheel.real.rotation.z += Math.PI;

        suffix = 'front-left';
        wheel = new T3.model.Wheel({
            name: 'car-wheel-' + suffix,
            suffix: suffix,
            originalParent: me
        });
        wheel.position.set(7, wheel.radius, 13.5);

        suffix = 'front-right';
        wheel = new T3.model.Wheel({
            name: 'car-wheel-' + suffix,
            suffix: suffix,
            originalParent: me
        });
        wheel.position.set(-7, wheel.radius, 13.5);
        wheel.real.rotation.z += Math.PI;
        return this;
    };

    Car.prototype.initDatGui = function (gui) {
        var me = this,
            folder = gui.addFolder('Car Mesh');
        folder
            .add(me, 'visible')
            .name('Show mesh')
            .onFinishChange(function (value) {
                T3.traverse(me, function (object) {
                    object.visible = value;
                });
            });
    };

    Car.prototype.move = function (direction, delta) {
        var me = this,
            wheelOrientation = T3.ObjectManager.getObject('car-wheel-front-left').rotation.y,
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

    Car.prototype.computeSpeed = function (direction, oldSpeed, delta) {
        var me = this,
            eps = 0.1,
            newSpeed;

        // vf = vo + at
        // vf^2 = vo^2 + 2 * a * t
        if (direction === 'forward') {
            newSpeed = Math.min(me.maxSpeed, oldSpeed + me.acceleration * delta);
        } else if (direction === 'backward') {
            newSpeed = Math.max(me.minSpeed, oldSpeed + me.deacceleration * delta);
        } else {
            // decay
            if (Math.abs(oldSpeed) <= eps) {
                return 0;
            } else if (oldSpeed > eps) {
                newSpeed = oldSpeed + me.deacceleration * delta;
            } else if (oldSpeed < -eps) {
                newSpeed = oldSpeed + me.acceleration * delta;
            }
        }
        return newSpeed;
    };

    T3.model.Car = Car;

})();