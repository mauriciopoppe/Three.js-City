/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/scale/13
 * Time: 12:43 AM
 * To change this template use File | Settings | File Templates.
 */
(function () {

    var Wheel;
    
    Wheel = function (config) {
        config = config || {};

        T3.model.Object3D.call(this, config);

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
         * Suffix added to the name of the wheel
         * @type {string}
         */
        this.suffix = config.suffix;

        /**
         * Width of the tire (used to span random splashes)
         * @type {number}
         */
        this.tireWidth = 3;

        this.radius = null;
        this.rotationSpeed = 0.01;
        this.rotationMin = -Math.PI / 6;
        this.rotationMax = Math.PI / 6;

        Wheel.prototype.init.call(this, config);
    };

    T3.inheritFrom(Wheel, T3.model.Object3D);

    /**
     * Init this object
     * @chainable
     */
    Wheel.prototype.init = function () {
        var me = this;

        this.tire = new T3.model.Tire({
            name: 'car-tire-' + me.suffix,
            originalParent: me,
            geometryConfig: { initialized: T3.AssetLoader.get('car-tire-geometry').geometry },
            materialConfig: { options: {side: THREE.DoubleSide} }
        });

        this.rim = new T3.model.Rim({
            name: 'car-rim-' + me.suffix,
            originalParent: me,
            geometryConfig: { initialized: T3.AssetLoader.get('car-rim-geometry').geometry }
        });

        me.radius = 3 * me.tire.scale.y;

        return this;
    };

    Wheel.prototype.initDatGui = function (gui) {
//        var me = this,
//            folder = gui.addFolder('Wheel Mesh');
//        folder
//            .add(me, 'visible')
//            .name('Show mesh')
//            .onFinishChange(function (value) {
//                T3.traverse(me, function (object) {
//                    object.visible = value;
//                });
//            });
    };

    Wheel.prototype.rotate = function (direction) {
        // the rotation is inverse because of the rotation direction
        // of the y-axis
        if (direction === 'left') {
            this.rotation.y = Math.min(this.rotationMax, this.rotation.y + this.rotationSpeed);
        } else {
            this.rotation.y = Math.max(this.rotationMin, this.rotation.y - this.rotationSpeed);
        }
    };

    Wheel.prototype.decay = function () {
        // the rotation is inverse because of the rotation direction
        // of the y-axis
        if (Math.abs(this.rotation.y) >= this.rotationSpeed - 1e-7) {
            if (this.rotation.y > 0) {
                this.rotation.y -= this.rotationSpeed;
            } else {
                this.rotation.y += this.rotationSpeed;
            }
        }
    };

    T3.model.Wheel = Wheel;

})();