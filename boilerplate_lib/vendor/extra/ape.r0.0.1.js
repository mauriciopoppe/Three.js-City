/*!
* ape - v0.0.1 - 2013-12-07
* https://github.com/maurizzzio/Ape.git
* Copyright (c) 2013 Mauricio Poppe
* Licensed MIT
*/
// Inspired by base2 and Prototype
(function(){
    var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

    // The base Class implementation (does nothing)
    this.Class = function(){};

    // Create a new Class that inherits from this class
    Class.extend = function(prop) {
        var _super = this.prototype;

        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        initializing = true;
        var prototype = new this();
        initializing = false;

        // Copy the properties over onto the new prototype
        for (var name in prop) {
            // Check if we're overwriting an existing function
            prototype[name] = typeof prop[name] == "function" &&
                typeof _super[name] == "function" && fnTest.test(prop[name]) ?
                (function(name, fn){
                    return function() {
                        var tmp = this._super;

                        // Add a new ._super() method that is the same method
                        // but on the super-class
                        this._super = _super[name];

                        // The method only need to be bound temporarily, so we
                        // remove it when we're done executing
                        var ret = fn.apply(this, arguments);
                        this._super = tmp;

                        return ret;
                    };
                })(name, prop[name]) :
                prop[name];
        }

        // The dummy class constructor
        function Class() {
            // All construction is actually done in the init method
            if ( !initializing && this.init )
                this.init.apply(this, arguments);
        }

        // Populate our constructed prototype object
        Class.prototype = prototype;

        // Enforce the constructor to be what we expect
        Class.prototype.constructor = Class;

        // And make this class extendable
        Class.extend = arguments.callee;

        return Class;
    };
})();
var Ape = Ape || {};

/**
 * Entry point for collision related classes
 * @type {Object}
 */
Ape.collision = {};

/**
 * Entry point for force related classes
 * @type {Object}
 */
Ape.force = {};

/**
 * Entry point for primitive related classes
 * @type {Object}
 */
Ape.primitive = {};

/**
 * Ape works with THREE.js to show a mesh for each simulated
 * body, the creation of those meshes are controlled by
 * this property.
 * If this property is set to `false` then no THREE meshes will
 * be created.
 * @property {boolean} [debug=true]
 */
Ape.debug = true;

/**
 * Asserts the value of an expression and halts the application if it's
 * a `falsy` value.
 * @param {boolean} v
 */
Ape.assert = function (v) {
    if (!v) {
        throw new Error();
    }
};

/**
 * Extends an object adding new properties.
 *
 *      // e.g.
 *      var object = {
 *          A: function() {},
 *          B: true,
 *          C: 1
 *      };
 *      var extension = {
 *          D: function() {},
 *          E: false
 *      };
 *
 *      Ape.extend(object, extension);
 *
 *      // calling Ape.extend will extend the object
 *      // with the object `extension` so:
 *      // object is now:
 *      // {
 *      //      A: function() {},
 *      //      B: true,
 *      //      C: 1,
 *      //      D: function() {},
 *      //      E: false
 *      // }
 *
 * @param {Object} obj
 * @param {Object} config
 */
Ape.extend = function (obj, config) {
    var property;
    for (property in config) {
        if (config.hasOwnProperty(property)) {
            obj[property] = config[property];
        }
    }
};
Ape.Vector3 = Class.extend({

    /**
     * Ape.Vector3 constructor
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     */
    init: function (x, y, z) {
        /**
         * Vector's X component
         * @property {number}
         */
        this.x = x || 0;
        /**
         * Vector's Y component
         * @property {number}
         */
        this.y = y || 0;
        /**
         * Vector's Z component
         * @property {number}
         */
        this.z = z || 0;
    },
    /**
     * Updates the components of a vector
     *
     *      var v = new Ape.Vector3();
     *      v.set(1, 2, 3);            // its components are [1, 2, 3]
     *
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    set: function (x, y, z) {
        this.init(x, y, z);
    },
    /**
     * Adds an Ape.Vector3 to `this` Ape.Vector3
     *
     *      var a = new Ape.Vector3(1, 2, 3);
     *      var b = new Ape.Vector3(1, 2, 3);
     *      a.add(b);               // a's components are [2, 4, 6]
     *
     * @param {Ape.Vector3} v
     * @chainable
     */
    add: function (v) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
    },
    /**
     * Adds a scalar quantity to each component of `this`
     *
     *      var v = new Ape.Vector3(1, 1, 1);
     *      v.addScalar(1);         // v's components are [2, 2, 2]
     *
     * @param {number} s
     * @chainable
     */
    addScalar: function (s) {
        this.x += s;
        this.y += s;
        this.z += s;
        return this;
    },
    /**
     * Subtracts an Ape.Vector3 from `this` Ape.Vector3
     *
     *      var a = new Ape.Vector3(1, 2, 3);
     *      var b = new Ape.Vector3(1, 2, 3);
     *      a.sub(b);               // a's components are [0, 0, 0]
     *
     * @param {Ape.Vector3} v
     * @chainable
     */
    sub: function (v) {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        return this;
    },
    /**
     * Updates the components of `this` vector to be the sum of
     * two parameter Ape.Vector3 vectors
     *
     *      var a = new Ape.Vector3(1, 2, 3);
     *      var b = new Ape.Vector3(1, 2, 3);
     *      var c = new Ape.Vector3();
     *      c.addVectors(a, b);               // c's components are [2, 4, 6]
     *
     * @param {Ape.Vector3} a
     * @param {Ape.Vector3} b
     * @chainable
     */
    addVectors: function (a, b) {
        this.x = a.x + b.x;
        this.y = a.y + b.y;
        this.z = a.z + b.z;
        return this;
    },
    /**
     * Adds an Ape.Vector3 to `this` Ape.Vector3 scaled by some quantity `s`,
     * this method returns a new instance of Ape.Vector3
     *
     *      var a = new Ape.Vector3(1, 2, 3);
     *      var b = new Ape.Vector3(1, 2, 3);
     *      a.addScaledVector(b, 2);        // a's components are [3, 6, 9]
     *
     * @param {Ape.Vector3} v
     * @param {number} s
     * @return Ape.Vector3
     */
    addScaledVector: function (v, s) {
        var me = this;
        return new Ape.Vector3(
            me.x + v.x * s,
            me.y + v.y * s,
            me.z + v.z * s
        );
    },
    /**
     * Multiplies a scalar quantity to each component of `this`
     *
     *      var v = new Ape.Vector3(1, 2, 3);
     *      v.multiplyScalar(5);         // v's components are [5, 10, 15]
     *
     * @param {number} s
     * @chainable
     */
    multiplyScalar: function (s) {
        this.x *= s;
        this.y *= s;
        this.z *= s;
        return this;
    },
    /**
     * Divides each component of `this` by a scalar quantity,
     * it also performs an assertion for the scalar value being distinct to zero
     *
     *      var v = new Ape.Vector3(5, 10, 15);
     *      v.divideScalar(5);         // v's components are [1, 2, 3]
     *
     * @param {number} s
     * @chainable
     */
    divideScalar: function (s) {
        Ape.assert(s !== 0);
        var inverse = 1 / s;
        this.x *= inverse;
        this.y *= inverse;
        this.z *= inverse;
        return this;
    },
    /**
     * Inverts the direction of `this` Ape.Vector3
     * (each component of `this` vector is multiplied by -1)
     * @chainable
     */
    invert: function () {
        var me = this;
        me.multiplyScalar(-1);
        return this;
    },
    /**
     * Creates a new instance of Ape.Vector3 with the components of `this`
     *
     *      var v = new Ape.Vector3(1, 2, 3);
     *      var vClone = v.clone();         // vClone has the same components
     *      // the following assertions are always true
     *      Ape.assert(v.x === vClone.x);
     *      Ape.assert(v.y === vClone.y);
     *      Ape.assert(v.z === vClone.z);
     *      Ape.assert(v !== vClone);
     *
     * @returns {Ape.Vector3}
     */
    clone: function () {
        return new Ape.Vector3(this.x, this.y, this.z);
    },
    /**
     * Normalizes this vector so that this vector's length is now 1
     *
     *      var v = new Ape.Vector3(1, 2, 3);
     *      v.normalize();                      // v's length is now 1
     *
     * @chainable
     */
    normalize: function () {
        var me = this;
        return me.divideScalar(me.length());
    },
    /**
     * Creates a new Ape.Vector3 by multiplying the components of `v` and
     * `this` one by one (i.e. given two vectors `a, b` then the multiplication
     * is `[a.x * b.x, a.y * b.y, a.c * b.c]`)
     *
     *      var v = new Ape.Vector3(1, 2, 3);
     *      var w = new Ape.Vector3(3, 4, 5);
     *      var componentMultiplication = v.component(w);
     *      // componentMultiplication's components are [3, 8, 15]
     *
     * @param {Ape.Vector3} v
     * @returns Ape.Vector3
     */
    component: function (v) {
        var me = this;
        return new Ape.Vector3(me.x * v.x, me.y * v.y, me.z * v.z);
    },
    /**
     * Calculates the length of this vector without taking a square root
     *
     *      var v = new Ape.Vector3(1, 2, 3);
     *      // the length squared is v.x * v.x + v.y * v.y + v.z * v.z
     *      var lengthSq = v.lengthSq();
     *      // so the following assertion is true
     *      Ape.assert(lengthSq === 1 * 1 + 2 * 2 + 3 * 3);
     *
     * @returns {number}
     */
    lengthSq: function () {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    },
    /**
     * Calculates the length of this vector
     *
     *      var v = new Ape.Vector3(1, 2, 3);
     *      // the length is sqrt(v.x * v.x + v.y * v.y + v.z * v.z)
     *      var length = v.length();
     *      // so the following assertion is true
     *      Ape.assert(lengthSq === sqrt(1 * 1 + 2 * 2 + 3 * 3));
     *
     * @returns {number}
     */
    length: function () {
        return Math.sqrt(this.lengthSq());
    },
    /**
     * Calculates the dot product between `this` and `v`
     *
     *      var v = new Ape.Vector3(1, 2, 3);
     *      var w = new Ape.Vector3(1, 2, 3);
     *      Ape.assert(v.dot(w) === 1 + 4 + 9)
     *
     * @param {Ape.Vector3} v
     * @returns {number}
     */
    dot: function (v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    },
    /**
     * Calculates the cross product between `this` and `v` and
     * saves the resulting vector in `this`
     *
     *      var v = new Ape.Vector3(1, 2, 3);
     *      var w = new Ape.Vector3(3, 2, 1);
     *      v.cross(w);     // v's components are [-4, 8, -4]
     *
     * @param {Ape.Vector3} v
     * @chainable
     */
    cross: function (v) {
        var me = this,
            x = me.x, y = me.y, z = me.z;
        me.x = y * v.z - z * v.y;
        me.y = z * v.x - x * v.z;
        me.z = x * v.y - y * v.x;
        return this;
    },
    /**
     * Updates the components of `this` vector to be `[0, 0, 0]`
     *
     *      var v = new Ape.Vector3(3, 2, 1);
     *      v.clear();          // v's components are now [0, 0, 0]
     * @chainable
     */
    clear: function () {
        this.init(0, 0, 0);
        return this;
    },
    /**
     * Calculates the displacement needed to move from `this` vector
     * to the vector `v`.
     *
     *      var v = new Ape.Vector3(0, 0, 0);
     *      var w = new Ape.Vector3(3, 3, 3);
     *      v.distanceTo(w);        // the distance from v to w is 5.2
     *
     * @param {Ape.Vector3} v
     * @returns {number}
     */
    distanceTo: function ( v ) {
        return Math.sqrt(this.distanceToSquared(v));
    },

    /**
     * Calculates the displacement needed to move from `this` vector
     * to the vector `v` without taking the square root.
     *
     *      var v = new Ape.Vector3(0, 0, 0);
     *      var w = new Ape.Vector3(3, 3, 3);
     *      v.distanceToSquared(w);        // the distance from v to w is 27
     *
     * @param {Ape.Vector3} v
     * @returns {number}
     */
    distanceToSquared: function ( v ) {
        var dx = this.x - v.x,
            dy = this.y - v.y,
            dz = this.z - v.z;
        return dx * dx + dy * dy + dz * dz;
    },

    /**
     * @private
     * Gets the displacement from a transformation matrix
     *
     *      var m = [1 0 0 5
     *               0 1 0 6
     *               0 0 1 7
     *               0 0 0 1];
     *      var v = new Ape.Vector3().getPositionFromMatrix(m);
     *      // v's components are [5, 6, 7]
     *
     * @param {THREE.Matrix3} m
     * @returns {Ape.Vector3}
     */
    getPositionFromMatrix: function ( m ) {
        this.x = m.elements[12];
        this.y = m.elements[13];
        this.z = m.elements[14];
        return this;
    }
});
Ape = Ape || {};

///********** GRAVITY **********/
// 15 is commonly used for shooters
/**
 * Static value for the gravity
 *
 *      Ape.assert(Ape.GRAVITY.x === 0);
 *      Ape.assert(Ape.GRAVITY.y === -15);
 *      Ape.assert(Ape.GRAVITY.z === 0);
 *
 * @type {Ape.Vector3}
 */
Ape.GRAVITY = new Ape.Vector3(0, -15, 0);
// 20 is commonly used for racing games
//Ape.GRAVITY = new Ape.Vector3(0, -20, 0);//    1px ====== 1u

///********** SCALE **********/
// 0.01px ====== 1u
// scale: 1u / 0.1px
//Ape.SCALE = 1 / 0.1;
/**
 * Scale to work with in the rendering engine:
 *
 *      0.01px ====== 1u
 *      scale: 1u / 0.1px
 *
 * @type {number}
 */
Ape.SCALE = 1;

///********** EPSILON **********/
// 0.01px ====== 1u
// scale: 1u / 0.1px
//Ape.SCALE = 1 / 0.1;
/**
 * Useful comparison value (to avoid floating errors)
 *
 *      Ape.EPS = 1e-7
 *
 * @type {number}
 */
Ape.EPS = 1e-7;

Ape.Quaternion = Class.extend({
    /**
     * Ape.Quaternion constructor
     * @param {number} w
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    init: function (w, x, y, z) {
        /**
         * Real component of the quaternion
         * @property {number} [w=1]
         */
        this.w = w !== undefined ? w : 1;

        /**
         * First complex component of the quaternion
         * @property {number} [x=0]
         */
        this.x = x !== undefined ? x : 0;

        /**
         * Second complex component of the quaternion
         * @property {number} [y=0]
         */
        this.y = y !== undefined ? y : 0;

        /**
         * Third complex component of the quaternion
         * @property {number} [z=0]
         */
        this.z = z !== undefined ? z : 0;
    },
    /**
     * Updates the components of an Ape.Quaternion
     *
     *      var q = new Ape.Quaternion();
     *      q.set(5, 1, 2, 3);
     *      // its components are [5, 1, 2, 3]
     *      // but the vector is immediately normalized
     *      // so
     *      Ape.assert(q.w === 0.8);
     *      Ape.assert(q.x === 0.16);
     *      Ape.assert(q.y === 0.3);
     *      Ape.assert(q.z === 0.48);
     *
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @chainable
     */
    set: function (w, x, y, z) {
        this.w = w;
        this.x = x;
        this.y = y;
        this.z = z;
        return this.normalize();
    },
    /**
     * Creates a new array of 4 components made out of
     * the components of `this` quaternion
     * @returns {Array}
     */
    asArray: function () {
        return [this.w, this.x, this.y, this.z];
    },
    /**
     * Creates a new instance of Ape.Quaternion with the components of `this`
     *
     *      var q = new Ape.Quaternion(5, 1, 2, 3);
     *      var qClone = q.clone();         // qClone has the same components
     *      // the following assertions are always true
     *      Ape.assert(q.x === qClone.x);
     *      Ape.assert(q.y === qClone.y);
     *      Ape.assert(q.z === qClone.z);
     *      Ape.assert(q !== qClone);
     *
     * @returns {Ape.Quaternion}
     */
    clone: function () {
        return new Ape.Quaternion(this.w, this.x, this.y, this.z);
    },
    /**
     * Normalizes this quaternion by dividing each component
     * of the quaternion by the length of `this`
     *
     *      var q = new Ape.Quaternion(5, 1, 2, 3);
     *      q.normalize();
     *      Ape.assert(q.w === 0.8);
     *      Ape.assert(q.x === 0.16);
     *      Ape.assert(q.y === 0.3);
     *      Ape.assert(q.z === 0.48);
     *
     * @chainable
     */
    normalize: function () {
        var length = this.w * this.w + this.x * this.x +
                     this.y * this.y + this.z * this.z;
        if (length < Ape.EPS) {
            this.w = 1;
            return this;
        }
        length = 1 / Math.sqrt(length);
        this.w *= length;
        this.x *= length;
        this.y *= length;
        this.z *= length;
        return this;
    },
    /**
     * Multiplies two Ape.Quaternions (see [an explanation about
     * the multiplication of quaternions](http://3dgep.com/?p=1815))
     * @param {Ape.Quaternion} q2
     * @chainable
     */
    multiply: function (q2) {
        var q1 = this.clone();

        this.w = q1.w * q2.w - q1.x * q2.x - q1.y * q2.y - q1.z * q2.z;
        this.x = q1.w * q2.x + q1.x * q2.w + q1.y * q2.z - q1.z * q2.y;
        this.y = q1.w * q2.y + q1.y * q2.w + q1.z * q2.x - q1.x * q2.z;
        this.z = q1.w * q2.z + q1.z * q2.w + q1.x * q2.y - q1.y * q2.x;
        
        return this;
    },

    /**
     * Adds the given vector scaled with `scale` to this
     * This is used to update the orientation quaternion by a rotation
     * and time.
     * @param {Ape.Vector3} v
     * @param {number} scale
     */
    addScaledVector: function (v, scale) {
        scale = typeof scale === 'number' ? scale : 1;
        var q = new Ape.Quaternion(
            0,
            v.x * scale,
            v.y * scale,
            v.z * scale
        );
        q.multiply(this);
        this.w += q.w * 0.5;
        this.x += q.x * 0.5;
        this.y += q.y * 0.5;
        this.z += q.z * 0.5;
    },

    /**
     * Rotates a quaternion by an Ape.Vector3
     * @param {Ape.Vector3} v
     * @chainable
     */
    rotateByVector: function (v) {
        var q = new Ape.Quaternion(0, v.x, v.y, v.z);
        return this.multiply(q);
    }
});
Ape.Matrix3 = Class.extend({
    /**
     * Ape.Matrix3 constructor (it receives the nine component of the
     * vector in row order)
     * 
     *      var m = new Ape.Matrix3(
     *          1, 2, 3
     *          4, 5, 6
     *          7, 8, 9
     *      )
     */
    init: function () {
        /**
         * Holds 9 real values in row order
         *
         *      var m = new Ape.Matrix3(
         *          1, 2, 3
         *          4, 5, 6
         *          7, 8, 9
         *      );
         *      // data is [1, 2, 3, 4, 5, 6, 7, 8, 9]
         *
         * @type {Array}
         */
        this.data = [];

        this.set.apply(this, Array.prototype.slice.call(arguments));
    },

    /**
     * Updates the components of this Ape.Matrix3
     *
     *       var m = new Ape.Matrix3();
     *       // the matrix has the form:
     *       // 1 0 0
     *       // 0 1 0
     *       // 0 0 1
     *       m.set(1, 2, 3, 4, 5, 6, 7, 8, 9);
     *       // the matrix has the form:
     *       // 1 2 3
     *       // 4 5 6
     *       // 7 8 9
     *
     * @param {number} m11
     * @param {number} m12
     * @param {number} m13
     * @param {number} m21
     * @param {number} m22
     * @param {number} m23
     * @param {number} m31
     * @param {number} m32
     * @param {number} m33
     * @chainable
     */
    set: function (m11, m12, m13, m21, m22, m23, m31, m32, m33) {
        var d = this.data,
            special = [
                1, 0, 0,
                0, 1, 0,
                0, 0, 1
            ],
            i;
        d[0] = m11; d[1] = m12; d[2] = m13;
        d[3] = m21; d[4] = m22; d[5] = m23;
        d[6] = m31; d[7] = m32; d[8] = m33;

        // fix undefined values
        for (i = -1; ++i < 9;) {
            d[i] = d[i] !== undefined ? d[i] : special[i];
        }

        return this;
    },

    /**
     * Creates a new instance of Ape.Matrix3 with the components of `this`
     *
     *      var m = new Ape.Matrix3();
     *      var mClone = m.clone();         // mClone has the same components
     *
     * @returns {Ape.Matrix3}
     */
    clone: function () {
        var d = this.data;
        return new Ape.Matrix3(
            d[0], d[1], d[2], d[3], d[4], d[5], d[6], d[7], d[8]
        );
    },

    /**
     * Adds two Ape.Matrix instances
     *
     *      var ma = new Ape.Matrix3(1, 2, 3, 4, 5, 6, 7, 8, 9);
     *      var mb = new Ape.Matrix3(1, 2, 3, 4, 5, 6, 7, 8, 9);
     *      var mc = ma.add(mb);
     *       // the matrix mc has the form:
     *       //  2  4  6
     *       //  8 10 12
     *       // 14 16 18
     *
     * @param {Ape.Matrix3} m
     * @returns {Ape.Matrix3}
     */
    add: function (m) {
        Ape.assert(m instanceof Ape.Matrix3);
        var d1 = this.data;
        var d2 = m.data;

        return new Ape.Matrix3(
            d1[0] + d2[0], d1[1] + d2[1], d1[2] + d2[2],
            d1[3] + d2[3], d1[4] + d2[4], d1[5] + d2[5],
            d1[6] + d2[6], d1[7] + d2[7], d1[8] + d2[8]
        );
    },

    /**
     * Multiplies two Ape.Matrix3 instances
     * @param {Ape.Matrix3} m2
     * @returns {Ape.Matrix3}
     */
    multiply: function (m2) {
        Ape.assert(m2 instanceof Ape.Matrix3);
        var d1 = this.data;
        var d2 = m2.data;

        return new Ape.Matrix3(
            d1[0] * d2[0] + d1[1] * d2[3] + d1[2] * d2[6],
            d1[0] * d2[1] + d1[1] * d2[4] + d1[2] * d2[7],
            d1[0] * d2[2] + d1[1] * d2[5] + d1[2] * d2[8],

            d1[3] * d2[0] + d1[4] * d2[3] + d1[5] * d2[6],
            d1[3] * d2[1] + d1[4] * d2[4] + d1[5] * d2[7],
            d1[3] * d2[2] + d1[4] * d2[5] + d1[5] * d2[8],

            d1[6] * d2[0] + d1[7] * d2[3] + d1[8] * d2[6],
            d1[6] * d2[1] + d1[7] * d2[4] + d1[8] * d2[7],
            d1[6] * d2[2] + d1[7] * d2[5] + d1[8] * d2[8]
        );
    },

    /**
     * Transform the given vector by this matrix
     * @param {Ape.Vector3} v
     * @return Ape.Vector3
     */
    multiplyVector: function (v) {
        var d = this.data;
        return new Ape.Vector3(
            v.x * d[0] + v.y * d[1] + v.z * d[2],
            v.x * d[3] + v.y * d[4] + v.z * d[5],
            v.x * d[6] + v.y * d[7] + v.z * d[8]
        );
    },

    /**
     * Transform the given vector by this matrix
     * @param s
     * @return Ape.Matrix3
     */
    multiplyScalar: function (s) {
        var d = this.data;
        return new Ape.Matrix3(
            d[0] * s, d[1] * s, d[2] * s,
            d[3] * s, d[4] * s, d[5] * s,
            d[6] * s, d[7] * s, d[8] * s
        );
    },

    /**
     * Transform the given vector by this matrix
     * @param v
     * @return Ape.Vector3
     */
    transform: function (v) {
        return this.multiplyVector(v);
    },

    /**
     * Inverts the matrix `m` and sets the result of the inversion in
     * this matrix
     *
     *      var m = new Ape.Matrix3();
     *      var mI = new Ape.Matrix3();
     *      mI.setInverse(m);       // mI now holds the inverse of m
     *
     * @param {Ape.Matrix3} m
     * @chainable
     */
    setInverse: function (m) {
        var d = m.data;

        var t4 = d[0] * d[4],
            t6 = d[0] * d[5],
            t8 = d[1] * d[3],
            t10 = d[2] * d[3],
            t12 = d[1] * d[6],
            t14 = d[2] * d[6];

        // determinant
        var t16 = t4 * d[8] - t6 * d[7] - t8 * d[8] +
                t10 * d[7] + t12 * d[5] - t14 * d[4];

        // can't divide by zero
        if (t16 === 0) {
            console.log('determinant is zero');
            return this;
        }
        this.set(
            (d[4] * d[8] - d[5] * d[7]) / t16,
            -(d[1] * d[8] - d[2] * d[7]) / t16,
            (d[1] * d[5] - d[2] * d[4]) / t16,

            -(d[3] * d[8] - d[5] * d[6]) / t16,
            (d[0] * d[8] - t14) / t16,
            -(t6 - t10) / t16,

            (d[3] * d[7] - d[4] * d[6]) / t16,
            -(d[0] * d[7] - t12) / t16,
            (t4 - t8) / t16
        );
        return this;
    },

    /**
     * Inverts `this` matrix saving the inversion in a
     * new Ape.Matrix3
     *
     *      var m = new Ape.Matrix3();
     *      var mI = m.inverse();
     *      // m is not modified in the inversion
     *
     * @return Ape.Matrix3
     */
    inverse: function () {
        return new Ape.Matrix3().setInverse(this);
    },

    /**
     * Inverts `this` modifying it so that its components
     * are equal to the inversion
     *
     *      var m = new Ape.Matrix3();
     *      m.invert();
     *      // m is modified in the inversion
     *
     * @chainable
     */
    invert: function () {
        return this.setInverse(this);
    },

    /**
     * Transposes the matrix `m` and sets the result of the operation
     * in `this`
     *
     *      var m = new Ape.Matrix3(
     *          1, 2, 3,
     *          4, 5, 6,
     *          7, 8, 9
     *      );
     *      var mT = new Ape.Matrix3();
     *      mT.setTranspose(m);       // mT now holds the transpose of m
     *      // the matrix has the form:
     *      // 1 4 7
     *      // 2 5 8
     *      // 3 6 9
     *
     * @param {Ape.Matrix3} m
     * @chainable
     */
    setTranspose: function (m) {
        var d = m.data;
        return this.set(
            d[0], d[3], d[6],
            d[1], d[4], d[7],
            d[2], d[5], d[8]
        );
    },

    /**
     * Transposes `this` matrix saving the result in a
     * new Ape.Matrix3
     *
     *      var m = new Ape.Matrix3();
     *      var mT = m.transpose();
     *      // m is not modified in the operation
     *
     * @return Ape.Matrix3
     */
    transpose: function () {
        return new Ape.Matrix3().setTranspose(this);
    },

    /**
     * Creates a new vector transforming `vector` with
     * the transpose of `this`
     *
     *      var m = new Ape.Matrix3(
     *          1, 2, 3,
     *          4, 5, 6,
     *          7, 8, 9
     *      );
     *      m.transpose(new Ape.Vector3(-1, -2, -3));
     *      // the vector's components are:
     *      // (-1 * 1) + (-2 * 4) + (-3 * 7)
     *      // (-1 * 2) + (-2 * 5) + (-3 * 8)
     *      // (-1 * 3) + (-2 * 6) + (-3 * 9)
     *
     * @param {Ape.Vector3} vector
     * @returns {Ape.Vector3}
     */
    transformTranspose: function (vector) {
        var d = this.data;
        return new Ape.Vector3(
            vector.x * d[0] + vector.y * d[3] + vector.z * d[6],
            vector.x * d[1] + vector.y * d[4] + vector.z * d[7],
            vector.x * d[2] + vector.y * d[5] + vector.z * d[8]
        );
    },

    /**
     * Sets this matrix to be the rotation matrix corresponding to
     * the given quaternion.
     *
     * @param q
     * @returns {*}
     */
    setOrientation: function (q) {
        return this.set(
            1 - 2 * (q.y * q.y + q.z * q.z),
            2 * (q.x * q.y + q.z * q.w),
            2 * (q.x * q.z - q.y * q.w),
            2 * (q.x * q.y - q.z * q.w),
            1 - 2 * (q.x * q.x + q.z * q.z),
            2 * (q.y * q.z + q.x * q.w),
            2 * (q.x * q.z + q.y * q.w),
            2 * (q.y * q.z - q.x * q.w),
            1 - 2 * (q.x * q.x + q.y * q.y)
        );
    },

    /**
     * Sets the matrix to be a diagonal matrix with the given values along
     * the leading diagonal
     * @param a
     * @param b
     * @param c
     * @returns {*}
     */
    setDiagonal: function (a, b, c) {
        this.setInertialTensorCoefficients(a, b, c);
    },

    /**
     * Sets the value of the matrix from inertia tensor values
     * @param ix
     * @param iy
     * @param iz
     * @param [ixy]
     * @param [ixz]
     * @param [iyz]
     */
    setInertialTensorCoefficients: function (ix, iy, iz, ixy, ixz, iyz) {
        ixy = ixy || 0;
        ixz = ixz || 0;
        iyz = iyz || 0;
        return this.set(
              ix, -ixy, -ixz,
            -ixy,   iy, -iyz,
            -ixz, -iyz,   iz
        );
    },

    /**
     * Sets the value of this matrix as the inertial tensor of a block
     * aligned with the body's coordinate system with the given axis half
     * sizes and mass
     * @param halfSizes
     * @param mass
     */
    setBlockInertialTensor: function (halfSizes, mass) {
        var sqx = halfSizes.x * halfSizes.x,
            sqy = halfSizes.y * halfSizes.y,
            sqz = halfSizes.z * halfSizes.z;
        return this.setInertialTensorCoefficients(
            0.3 * mass * (sqy + sqz),
            0.3 * mass * (sqx + sqz),
            0.3 * mass * (sqx + sqy)
        );
    },

    /**
     * Sets the value of this matrix as the inertial tensor of a sphere
     * with uniform density
     * @param radius
     * @param mass
     */
    setSphereInertialTensor: function (radius, mass) {
        return this.setInertialTensorCoefficients(
            2 / 5 * mass * radius * radius,
            2 / 5 * mass * radius * radius,
            2 / 5 * mass * radius * radius
        );
    },

    /**
     * @private
     * Update the component of `this` to be made
     * out of a proportion of the sum of
     * matrices `a` and `b`
     *
     * @param {Ape.Matrix3} a
     * @param {Ape.Matrix3} b
     * @param {number} proportion
     * @chainable
     */
    linearInterpolate: function (a, b, proportion) {
        var i;
        for (i = 0; i < 9; i += 1) {
            this.data[i] = a.data[i] * (1 - proportion) +
                b.data[i] * proportion;
        }
        return this;
    },

    /**
     * Sets the vectors passed as a parameter as the columns of
     * this matrix
     * @param {Ape.Vector3} a
     * @param {Ape.Vector3} b
     * @param {Ape.Vector3} c
     */
    setComponents: function (a, b, c) {
        var d = this.data;
        d[0] = a.x; d[1] = b.x; d[2] = c.x;
        d[3] = a.y; d[4] = b.y; d[5] = c.y;
        d[6] = a.z; d[7] = b.z; d[8] = c.z;
    },

    /**
     * Sets the matrix to be a skew symmetric matrix based on
     * the given vector. The skew symmetric matrix is the
     * equivalent of the vector product.
     *
     *      // let a, b be Vector3
     *      a (cross) b = skewSymmetric(a) * b
     * @param v
     * @chainable
     */
    setSkewSymmetric: function (v) {
        var d = this.data;
        // set diagonal to zero
        d[0] = d[4] = d[8] = 0;
        d[1] = -v.z;
        d[2] = v.y;
        d[3] = v.z;
        d[5] = -v.x;
        d[6] = -v.y;
        d[7] = v.x;
        return this;
    }
});
Ape.Matrix4 = Class.extend({
    /**
     * Ape.Matrix4 constructor (it receives the nine component of the
     * vector in row order)
     *
     *      var m = new Ape.Matrix3(
     *          1,  2,  3,  4
     *          5,  6,  7,  8
     *          9, 10, 11, 12
     *      )
     */
    init: function () {
        /**
         * Holds 12 real values
         * It's assumed that the remaining row has (0, 0, 0, 1)
         * so it's not noted here
         * @type {Array}
         */
        this.data = [];

        this.set.apply(this, Array.prototype.slice.call(arguments));
    },
    /**
     * Creates a new instance of Ape.Matrix4 with the components of `this`
     *
     *      var m = new Ape.Matrix4();
     *      var mClone = m.clone();         // mClone has the same components
     *
     * @returns {Ape.Matrix4}
     */
    clone: function () {
        var d = this.data;
        return new Ape.Matrix4(
            d[0], d[1], d[2], d[3],
            d[4], d[5], d[6], d[7],
            d[8], d[9], d[10], d[11]
        );
    },

    /**
     * Updates the components of this Ape.Matrix4
     *
     *       var m = new Ape.Matrix4();
     *       // the matrix has the form:
     *       // 1 0 0 0
     *       // 0 1 0 0
     *       // 0 0 1 0
     *       m.set(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12);
     *       // the matrix has the form:
     *       // 1  2  3  4
     *       // 5  6  7  8
     *       // 9 10 11 12
     *
     * @param {number} m11
     * @param {number} m12
     * @param {number} m13
     * @param {number} m14
     * @param {number} m21
     * @param {number} m22
     * @param {number} m23
     * @param {number} m24
     * @param {number} m31
     * @param {number} m32
     * @param {number} m33
     * @param {number} m34
     * @chainable
     */
    set: function (m11, m12, m13, m14, m21, m22, m23, m24,
           m31, m32, m33, m34) {
        var d = this.data,
            special = [
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0
            ],
            i;
        d[0] = m11; d[1] = m12; d[2] = m13; d[3] = m14;
        d[4] = m21; d[5] = m22; d[6] = m23; d[7] = m24;
        d[8] = m31; d[9] = m32; d[10] = m33; d[11] = m34;

        // fix undefined values
        for (i = -1; ++i < 12;) {
            d[i] = d[i] !== undefined ? d[i] : special[i];
        }

        return this;
    },

    /**
     * Multiplies two Ape.Matrix4 instances
     * @param {Ape.Matrix4} m2
     * @returns {Ape.Matrix4}
     */
    multiply: function (m2) {
        Ape.assert(m2 instanceof Ape.Matrix4);
        var d1 = this.data;
        var d2 = m2.data;

        return new Ape.Matrix4(
            d1[0] * d2[0] + d1[1] * d2[4] + d1[2] * d2[8],
            d1[0] * d2[1] + d1[1] * d2[5] + d1[2] * d2[9],
            d1[0] * d2[2] + d1[1] * d2[6] + d1[2] * d2[10],
            d1[0] * d2[3] + d1[1] * d2[7] + d1[2] * d2[11] + d1[3],

            d1[4] * d2[0] + d1[5] * d2[4] + d1[6] * d2[8],
            d1[4] * d2[1] + d1[5] * d2[5] + d1[6] * d2[9],
            d1[4] * d2[2] + d1[5] * d2[6] + d1[6] * d2[10],
            d1[4] * d2[3] + d1[5] * d2[7] + d1[6] * d2[11] + d1[7],

            d1[8] * d2[0] + d1[9] * d2[4] + d1[10] * d2[8],
            d1[8] * d2[1] + d1[9] * d2[5] + d1[10] * d2[9],
            d1[8] * d2[2] + d1[9] * d2[6] + d1[10] * d2[10],
            d1[8] * d2[3] + d1[9] * d2[7] + d1[10] * d2[11] + d1[11]
        );
    },

    /**
     * Transforms the given vector by this matrix
     * @param v
     */
    multiplyVector: function (v) {
        var data = this.data;
        return new Ape.Vector3(
            v.x * data[0] + v.y * data[1] + v.z * data[2] + data[3],
            v.x * data[4] + v.y * data[5] + v.z * data[6] + data[7],
            v.x * data[8] + v.y * data[9] + v.z * data[10] + data[11]
        );
    },

    /**
     * Transforms the given vector by this matrix
     * @param v
     * @returns {Ape.Vector3}
     */
    transform: function (v) {
        return this.multiplyVector(v);
    },

    /**
     * Transforms the given vector by the transformational inverse
     * of this matrix
     *
     * @param v
     * @returns {Ape.Vector3}
     */
    transformInverse: function (v) {
        var t = v.clone(),
            d = this.data;
        t.x -= d[3];
        t.y -= d[7];
        t.z -= d[11];
        return new Ape.Vector3(
            t.x * d[0] + t.y * d[4] + t.z * d[8],
            t.x * d[1] + t.y * d[5] + t.z * d[9],
            t.x * d[2] + t.y * d[6] + t.z * d[10]
        );
    },

    /**
     * Returns a vector representing one axis (a column) in the matrix
     * @param {number} j The column to return
     * @returns {Ape.Vector3}
     */
    getAxisVector: function (j) {
        return new Ape.Vector3(
            this.data[j],
            this.data[j + 4],
            this.data[j + 8]
        );
    },

    /**
     * Calculates the determinant of this matrix4, even if it's not
     * a squared matrix we can
     * @returns {number}
     */
    getDeterminant: function () {
        var d = this.data;
        return d[8] * d[5] * d[2] +
            d[4] * d[9] * d[2] +
            d[8] * d[1] * d[6] -
            d[0] * d[9] * d[6] -
            d[4] * d[1] * d[10] +
            d[0] * d[5] * d[10];
    },
    /**
     * Inverts the matrix `m` and sets the result of the inversion in
     * this matrix
     *
     *      var m = new Ape.Matrix4();
     *      var mI = new Ape.Matrix4();
     *      mI.setInverse(m);       // mI now holds the inverse of m
     *
     * @param {Ape.Matrix4} m
     * @chainable
     */
    setInverse: function (m) {
        var det = m.getDeterminant(),
            d = m.data;
        if (det === 0) {
            console.log('determinant is zero');
            return this;
        }
        this.set(
            (-d[9] * d[6] + d[5] * d[10]) / det, // 0
            (d[9] * d[2] - d[1] * d[10]) / det, // 1
            (-d[5] * d[2] + d[1] * d[6] * d[15]) / det, // 2
            (d[9] * d[6] * d[3] -
                d[5] * d[10] * d[3] -
                d[9] * d[2] * d[7] +
                d[1] * d[10] * d[7] +
                d[5] * d[2] * d[11] -
                d[1] * d[6] * d[11]) / det, // 3

            (d[8] * d[6] - d[4] * d[10]) / det, // 4
            (-d[8] * d[2] + d[0] * d[10]) / det, // 5
            (d[4] * d[2] - d[0] * d[6] * d[15]) / det, // 6
            (-d[8] * d[6] * d[3] +
                d[4] * d[10] * d[3] +
                d[8] * d[2] * d[7] -
                d[0] * d[10] * d[7] -
                d[4] * d[2] * d[11] +
                d[0] * d[6] * d[11]) / det, // 7

            (-d[8] * d[5] + d[4] * d[9] * d[15]) / det, // 8
            (d[8] * d[1] - d[0] * d[9] * d[15]) / det, // 9
            (-d[4] * d[1] + d[0] * d[5] * d[15]) / det, // 10
            (d[8] * d[5] * d[3] -
                d[4] * d[9] * d[3] -
                d[8] * d[1] * d[7] +
                d[0] * d[9] * d[7] +
                d[4] * d[1] * d[11] -
                d[0] * d[5] * d[11]) / det // 11
        );
        return this;
    },

    /**
     * Inverts `this` matrix saving the inversion in a
     * new Ape.Matrix4
     *
     *      var m = new Ape.Matrix4();
     *      var mI = m.inverse();
     *      // m is not modified in the inversion
     *
     * @return Ape.Matrix4
     */
    inverse: function () {
        return new Ape.Matrix4().setInverse(this);
    },

    /**
     * Inverts `this` modifying it so that its components
     * are equal to the inversion
     *
     *      var m = new Ape.Matrix4();
     *      m.invert();
     *      // m is modified in the inversion
     *
     * @chainable
     */
    invert: function () {
        return this.setInverse(this);
    },

    /**
     * Sets this matrix to be the rotation matrix corresponding to
     * the given quaternion
     *
     * @param q
     * @param pos
     * @returns {*}
     */
    setOrientationAndPos: function (q, pos) {
        return this.set(
            1 - 2 * (q.y * q.y + q.z * q.z),
            2 * (q.x * q.y + q.z * q.w),
            2 * (q.x * q.z - q.y * q.w),
            pos.x,

            2 * (q.x * q.y - q.z * q.w),
            1 - 2 * (q.x * q.x + q.z * q.z),
            2 * (q.y * q.z + q.x * q.w),
            pos.y,

            2 * (q.x * q.z + q.y * q.w),
            2 * (q.y * q.z - q.x * q.w),
            1 - 2 * (q.x * q.x + q.y * q.y),
            pos.z
        );
    },

    /**
     * Transforms the given direction by this matrix
     *
     * When a direction is converted between frames of reference,
     * there is no translation required
     *
     * @param v
     * @returns {Ape.Vector3}
     */
    transformDirection: function (v) {
        var d = this.data;
        return new Ape.Vector3(
            v.x * d[0] + v.y * d[1] + v.z * d[2],
            v.x * d[4] + v.y * d[5] + v.z * d[6],
            v.x * d[8] + v.y * d[9] + v.z * d[10]
        );
    },

    /**
     * Transforms the given direction vector by the transformational
     * inverse of this matrix
     *
     * @param v
     * @returns {Ape.Vector3}
     */
    transformInverseDirection: function (v) {
        var d = this.data;
        return new Ape.Vector3(
            v.x * d[0] + v.y * d[4] + v.z * d[8],
            v.x * d[1] + v.y * d[5] + v.z * d[9],
            v.x * d[2] + v.y * d[6] + v.z * d[10]
        );
    }
});
Ape.force.ForceRegistry = Class.extend({
    init: function () {
        /**
         * Keeps track of one force generator and
         * the body the force will be applied to.
         * Each object is in the form:
         *
         *      {
         *          body: Ape.RigidBody instance,
         *          forceGenerator: Ape.force.ForceGenerator subclass instance
         *      }
         *
         * @type {Ape.force.ForceGenerator[]}
         */
        this.registrations = [];
    },

    /**
     * Registers a body and a force so that later the instance of this
     * class can call the `updateForce` method of the `forceGenerator`
     * applying the force to the `body`.
     *
     *      var registry = new Ape.force.ForceRegistry();
     *
     *      var box = Ape.RigidBodyFactory.createBox({
     *          size: 5,
     *          type: 'simple'
     *      });
     *
     *      var force = new Ape.force.Gravity();
     *
     *      // registers a rigid body and a force in this instance
     *      registry.add({
     *          body: box,
     *          forceGenerator: force
     *      });
     *
     * @param {Ape.RigidBody} body
     * @param {Ape.force.ForceGenerator} forceGenerator
     * @chainable
     */
    add: function (body, forceGenerator) {
        this.registrations.push({
            body: body,
            forceGenerator: forceGenerator
        });
        return this;
    },

    /**
     * Removes the given registered pair from the registry
     * if it's found
     * @param {Ape.RigidBody} body
     * @param {Ape.force.ForceGenerator} forceGenerator
     */
    remove: function (body, forceGenerator) {
        var index = -1;
        this.registrations.forEach(function (item, i) {
            if (item.body === body &&
                item.forceGenerator === forceGenerator) {
                index = i;
            }
        });
        if (index !== -1) {
            this.registrations.splice(index, 1);
        }
    },

    /**
     * Clears all the registrations from the registry (it doesn't
     * destroy the body nor the force generators, just the record of their connection)
     * @chainable
     */
    clear: function () {
        this.registrations = [];
        return this;
    },

    /**
     * Grabs each one of the registered tuples (`body` - `forceGenerator`) and
     * applies a force to the `body` through the method Ape.force.ForceGenerator.updateForce
     * of the class Ape.force.ForceGenerator for a given `duration`.
     *
     * @param {number} duration Time elapsed since the last frame in ms
     */
    update: function (duration) {
        this.registrations.forEach(function (item) {
            item.forceGenerator.updateForce(item.body, duration);
        });
    }
});
Ape.force.ForceGenerator = Class.extend({
    /**
     * Ape.force.ForceGenerator constructor
     */
    init: function () {
    },

    /**
     * @abstract
     * Applies a force to the given rigid body
     * @param {Ape.RigidBody} body Reference to the rigid body being affected
     * @param {number} duration
     */
    updateForce: function (body, duration) {
        throw new Error('This is an abstract method so it must be' +
            'implemented in the inheritance chain');
    }
});
Ape.force.Gravity = Ape.force.ForceGenerator.extend({

    /**
     * Ape.force.Gravity constructor
     * @param {Ape.Vector3} [gravity=Ape.GRAVITY]
     */
    init: function (gravity) {
        this._super();

        /**
         * Gravity value (a.k.a. gravity acceleration)
         * @type {Ape.Vector3}
         */
        this.gravity = gravity || Ape.GRAVITY.clone();
    },

    /**
     * Applies a force to a rigid body equal to the
     * value of the `gravity` saved in this instances
     * multiplied by the `mass` of the `body`.
     * @param {Ape.RigidBody} body
     * @param {number} duration
     */
    updateForce: function (body, duration) {
        if (body.getInverseMass() === 0) {
            // gravity doesn't affect infinite mass objects
            return;
        }

        // apply the mass-scaled force to the particle
        // f = m * a
        body.addForce(
            this.gravity.clone()
                .multiplyScalar(body.getMass())
        );
    }
});
Ape.force.Spring = Ape.force.ForceGenerator.extend({

    /**
     * Ape.force.Spring constructor, it needs 5 configuration
     * parameters as described below:
     * @param {Ape.Vector3} localConnectionPt Point of
     * contact of one of the spring ends in the registered
     * rigid body
     * @param {Ape.RigidBody} other Other rigid body to whom
     * this spring is connected to
     * @param {Ape.Vector3} otherConnectionPt Point of contact
     * of the one of the spring ends in the other rigid body
     * @param {number} springConstant The spring constant `k`
     * @param {number} restLength Length at which this spring
     * is resting
     */
    init: function (localConnectionPt, other, otherConnectionPt,
                    springConstant, restLength) {

        this._super();

        /**
         * The point of connection of the spring in OBJECT
         * coordinates
         * @type {Ape.Vector3}
         */
        this.connectionPoint = localConnectionPt;

        /**
         * The body at the other end of the spring,
         * we assume that we're extending the spring from the
         * body which is not this one (this one is static)
         * @type {Ape.RigidBody}
         */
        this.other = other;

        /**
         * The point of connection of the spring in OBJECT
         * coordinates (in the other body)
         * @type {Ape.Vector3}
         */
        this.otherConnectionPoint = otherConnectionPt;

        /**
         * Holds the spring constant
         * @type {Ape.Vector3}
         */
        this.springConstant = springConstant;

        /**
         * The length of the material when it's on a rest position
         * @type {number}
         */
        this.restLength = restLength;
    },

    /**
     * Applies a force following the rules described in the
     * model of Hooke's law
     * @param {Ape.RigidBody} body
     * @param {number} duration
     */
    updateForce: function (body, duration) {
        var bodyInWorldSpace = body.getPointInWorldSpace(this.connectionPoint),
            otherInWorldSpace = this.other.getPointInWorldSpace(this.otherConnectionPoint),
            vector,
            force,
            magnitude;

        vector = bodyInWorldSpace.clone()
            .sub(otherInWorldSpace);

        // -k (l - l_rest)
        magnitude = -this.springConstant *
            (vector.length() - this.restLength);

        // turn the magnitude into a vector
        // f_spring = magnitude * dˆ
        force = vector.clone().normalize().multiplyScalar(magnitude);
        body.addForceAtPoint(force, bodyInWorldSpace);
    }
});
Ape.force.Buoyancy = Ape.force.ForceGenerator.extend({
    /**
     * Ape.force.Buoyancy constructor
     * @param {Ape.Vector3} center Center of masses where
     * the force is applied to
     * @param {number} maxDepth Depth below liquidHeight
     * at which the maximum force is applied
     * @param {number} volume Volume of the rigid body
     * @param {number} liquidHeight Height of the liquid
     * from the origin
     * @param {number} [liquidDensity=1000] Liquid density
     * (typically it's 1000 kg/m^3)
     */
    init: function (center, maxDepth, volume,
                    liquidHeight, liquidDensity) {
        this._super();

        /**
         * The maximum submersion depth of the object before
         * it's pushed with the same force
         * @property {number}
         */
        this.maxDepth = maxDepth;

        /**
         * Rigid body volume
         * @property {Ape.Vector3}
         */
        this.volume = volume;

        /**
         * Height of the liquid this object will be submerged in
         * @property {number}
         */
        this.liquidHeight = liquidHeight;

        /**
         * Density of the liquid this object will be submerged in
         * @property {number} [liquidDensity=1000]
         */
        this.liquidDensity = liquidDensity || 1000;

        /**
         * The center of the buoyancy of the rigid body
         * in OBJECT coordinates
         * @property {Ape.Vector3}
         */
        this.centerOfBuoyancy = center || new Ape.Vector3();
    },

    /**
     * Applies a force following the rules described in the
     * model above
     * @param {Ape.RigidBody} body
     * @param {number} duration
     */
    updateForce: function (body, duration) {
        var pointInWorld = body.getPointInWorldSpace(this.centerOfBuoyancy),
            depth = pointInWorld.y,
            force = new Ape.Vector3();

        if (depth <= this.liquidHeight) {
            if (depth + this.maxDepth <= this.liquidHeight) {
                // completely submerged
                force.y = this.volume * this.liquidDensity * -Ape.GRAVITY.y;
            } else {
                var submerged = (this.liquidHeight - depth) / this.maxDepth;
                Ape.assert(submerged <= 1 && submerged >= 0);
                // partially submerged
                force.y = submerged * this.volume * this.liquidDensity * -Ape.GRAVITY.y;
            }
            body.addForceAtBodyPoint(force, this.centerOfBuoyancy);
        }

    }
});
Ape.force.Aero = Ape.force.ForceGenerator.extend({
    init: function (tensor, position, windSpeed) {

        this._super();

        /**
         * Holds the aerodynamic tensor for the surface in
         * OBJECT space
         * @type {Ape.Matrix3}
         */
        this.tensor = tensor;

        /**
         * Holds the relative position of the aerodynamic surface
         * in OBJECT space
         * @type {Ape.Vector3}
         */
        this.position = position;

        /**
         * Holds a pointer to a vector containing the wind speed of
         * the environment. This is easier than managing a separate
         * wind speed vector per generator and having to update
         * it manually as the wind changes.
         * @type {Ape.Vector3}
         */
        this.windSpeed = windSpeed;
    },

    /**
     * Applies a force to a rigid body using the tensor defined
     * for the aerodynamic force
     * @param body
     * @param duration
     */
    updateForce: function (body, duration) {
        this.updateForceFromTensor(body, duration, this.tensor);
    },

    /**
     * Calculates the force to apply to a body given its linear velocity
     * and WORLD wind speed, the resulting force is applied in OBJECT
     * coordinates
     * @param {Ape.RigidBody} body
     * @param {number} duration
     * @param {Ape.Matrix3} tensor
     */
    updateForceFromTensor: function (body, duration, tensor) {
        // calculate the total velocity (windSpeed and body's velocity)
        var velocity = body.linearVelocity.clone();
        velocity.add(this.windSpeed);

        // calculate the velocity in OBJECT coordinates
        var objectVelocity = body.transformMatrix
            .transformInverseDirection(velocity);

        // calculate the force in OBJECT coordinates
        var bodyForce = tensor.transform(objectVelocity);
        var force = body.transformMatrix
            .transformDirection(bodyForce);

        // apply the force
        body.addForceAtBodyPoint(force, this.position);
    }
});
Ape.force.AeroControl = Ape.force.Aero.extend({
    /**
     * Ape.force.AeroControl constructor
     * @param {Ape.Matrix3} base Base tensor (tensor used if the object is resting)
     * @param {Ape.Matrix3} min Min tensor
     * @param {Ape.Matrix3} max Max tensor
     * @param {Ape.Vector3} position Position in the rigid body to apply
     * the aerodynamic force to
     * @param windSpeed
     */
    init: function (base, min, max, position, windSpeed) {

        this._super(base, position, windSpeed);

        /**
         * Holds the aerodynamic tensor for the surface, when
         * the control is at its maximum value
         * @property {Ape.Matrix3}
         */
        this.maxTensor = max;

        /**
         * Holds the aerodynamic tensor for the surface, when
         * the control is at its minimum value
         * @property {Ape.Matrix3}
         */
        this.minTensor = min;

        /**
         * The current position of the control for this surface,
         * this should be between the range [-1, 1]
         *
         *      -1 = the min tensor is used
         *      <0 = an interpolation between minTensor and base is used
         *       0 = the base tensor is used
         *      >0 = an interpolation between base and maxTensor is used
         *      +1 = the max tensor is used
         *
         * @property {number}
         */
        this.controlSetting = 0;
    },

    /**
     * Calculate the final aerodynamic tensor for the current
     * control setting
     * @return Ape.Matrix3
     */
    getTensor: function () {
        if (this.controlSetting <= -1) {
            return this.minTensor;
        } else if (this.controlSetting >= 1) {
            return this.maxTensor;
        } else if (this.controlSetting < 0) {
            // interpolate between min tensor and tensor
            return new Ape.Matrix3()
                .linearInterpolate(this.minTensor, this.tensor, this.controlSetting + 1);
        } else if (this.controlSetting > 0) {
            // interpolate between tensor and max tensor
            return new Ape.Matrix3()
                .linearInterpolate(this.tensor, this.maxTensor, this.controlSetting);
        } else {
            return this.tensor;
        }
    },

    /**
     * Sets the position of this control, it should be between
     * -1 and 1, values outside that range give undefined
     * results.
     * @param {number} value Value between -1 and 1, if it's -1 then the
     * min tensor is used, if the value is 1 then the max tensor is used,
     * if the value is 0 then the base tensor is used
     */
    setControl: function (value) {
        if (value < -1 || value > 1) {
            console.warn('Ape.force.AeroControl.setControl(): value should ' +
                'be in the range [-1, 1]');
        }
        this.controlSetting = value;
    },

    /**
     * Applies a force to a body by choosing the right tensor
     * @param body
     * @param duration
     */
    updateForce: function (body, duration) {
        var tensor = this.getTensor();
        this.updateForceFromTensor(body, duration, tensor);
    }
});
(function () {
    var RigidBody;

    /**
     * Class whose instances represent a RigidBody, an idealization of a solid structure
     * (which means that it can't be deformed under any force applied)
     * 
     * This class holds many characteristics of the rigid bodies such as:
     * 
     * - Position
     * - Orientation
     * - Linear and angular velocity
     * - Linear and angular acceleration
     * - Mass
     * - Inertia tensor
     * 
     * The rigid body has a method called Ape.RigidBody.integrate that integrates the
     * characteristics of the rigid body transforming its properties with the following
     * algorithm
     * 
     * - Before the integrate method is run, the rigid body accumulates forces and
     * torque to be integrated later
     * - When the integrate method is called the force and torque are transformed
     * in a linear and angular acceleration change
     * - The linear and angular acceleration change is transformed into a change
     * of the linear and angular velocities of the rigid body
     * - These changes cause that the position and orientation of the object change too
     * - The accumulators (force and torque acummulators) are cleaned
     * since the force is only applied in a single frame
     * 
     * @class Ape.RigidBody
     */
    RigidBody = function () {
        THREE.Mesh.apply(this, arguments);
        // ************** DATA AND STATE **************
        /**
         * Inverse of the mass:
         *
         *      f = m * a (force equals mass times acceleration)
         *      a = (1 / m) * f (1 / m is the inverse of the mass)
         *
         * This means that infinite mass object have a zero inverse mass since 1 / ∞ = 0
         * Objects of zero mass have an undefined inverse mass
         * @property {number}
         */
        this.inverseMass = 1.0;
        /**
         * Holds the inverse of the body's inertia tensor given in BODY space
         * @property {Ape.Matrix3}
         */
        this.inverseInertiaTensor = new Ape.Matrix3();
        /**
         * Holds the amount of damping applied to linear
         * motion. Damping is required to remove energy added
         * through numerical instability in the integrator.
         * @property {number}
         */
        this.linearDamping = 0.9;
        /**
         * Holds the amount of damping applied to angular
         * motion. Damping is required to remove energy added
         * through numerical instability in the integrator.
         * @property {number}
         */
        this.angularDamping = 0.9;
        /**
         * Holds the linear position of the rigid body in
         * world space.
         * @property {Ape.Vector3}
         */
        this.position = this.position || new Ape.Vector3();
        /**
         * Holds the angular orientation of the rigid body in WORLD space
         * @property {Ape.Quaternion}
         */
        this.orientation = new Ape.Quaternion();
        /**
         * Holds the linear velocity of the rigid body in
         * world space.
         * @property {Ape.Vector3}
         */
        this.linearVelocity = new Ape.Vector3();
        /**
         * Holds the angular velocity or rotation of the rigid body in world space
         * @property {Ape.Vector3}
         */
        this.angularVelocity = new Ape.Vector3();

        // ************** DERIVED DATA **************
        // information that's derived from the other data in the class
        /**
         * Holds the inverse of the body's inertia tensor in WORLD coordinates
         * (it's calculated each frame in `calculateDerivedData`
         * @property {Ape.Matrix3}
         */
        this.inverseInertiaTensorWorld = new Ape.Matrix3();
        /**
         * Holds a transform matrix for converting body space
         * into world space and vice versa. This can be achieved by calling the
         * getPointInSpace functions.
         * @property {Ape.Matrix4}
         */
        this.transformMatrix = new Ape.Matrix4(
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0
        );

        // ************** FORCE AND TORQUE ACCUMULATORS **************
        // store the current force, torque and acceleration of the rigid body
        /**
         * Holds the accumulated force to be applied at the next
         * simulation iteration only. This value is zeroed at each integration step.
         * @property {Ape.Vector3}
         */
        this.accumulatedForce = new Ape.Vector3();
        /**
         * Holds the accumulated torque to be applied at the next
         * simulation iteration only. This value is zeroed at each integration step.
         * @property {Ape.Vector3}
         */
        this.accumulatedTorque = new Ape.Vector3();
        /**
         * Holds the acceleration of the rigid body, can be used to set
         * acceleration due to gravity or any other CONSTANT acceleration
         * @property {Ape.Vector3}
         */
        this.acceleration = new Ape.Vector3();


        // ************** STABILIZATION **************
        /**
         * To remove any velocity that has been built up from
         * acceleration we need to create a new data member which is this
         * @property {Ape.Vector3}
         */
        this.lastFrameAcceleration = new Ape.Vector3();
    };

    RigidBody.prototype = new THREE.Mesh();

    Ape.extend(RigidBody.prototype, {
        /**
         * Setter for the mass (it updates the `inverseMass` property)
         * @param {number} m
         */
        setMass: function (m) {
            Ape.assert(m !== 0);
            this.inverseMass = 1 / m;
        },

        /**
         * Setter for the inverse mass
         * @param {number} m
         */
        setInverseMass: function (m) {
            this.inverseMass = m;
        },

        /**
         * Gets the mass (transformed from the `inverseMass`)
         * @returns {number}
         */
        getMass: function () {
            if (this.inverseMass < 1e-9) {
                return Infinity;
            }
            return 1 / this.inverseMass;
        },

        /**
         * Gets the inverse mass
         * @returns {number}
         */
        getInverseMass: function () {
            return this.inverseMass;
        },

        /**
         * Integrates the rigid body forward in time by `delta` ms with the
         * following algorithm:
         * 
         * - The force accumulated is turned into linear acceleration and added
         * to the constant `acceleration` property
         * - The torque accumulated is turned into angular acceleration
         * - The linear acceleration is turned into linear velocity 
         * - The angular acceleration is turned into angular velocity
         * - THE linear and angular velocities suffer from damping (reducing
         * their value to simulate a damping force)
         * - The position is updated using the linear velocity calculated above
         * - The orientation is updated using the angular velocity calculated above
         * - The derived properties of the body are calculated again (since
         * the rigid body has changed its properties)
         * - The accumulators are cleaned
         *
         * This method should be called once per frame in the game loop to assure
         * the rigid body is correctly transformed.
         *
         * @param {number} delta Time elapsed since the last frame
         */
        integrate: function (delta) {
            Ape.assert(delta > 0);

            // calculate linear acceleration from force inputs
            // a' = old_a + a
            // let:
            //      f = m * a
            //      a = f * (1 / m)
            // so:
            // a' = old_a + f * m^(-1)
            var linearAcceleration =
                this.acceleration.clone()
                    .add(
                        this.accumulatedForce.clone()
                            .multiplyScalar(this.inverseMass)
                    );

            // calculate angular acceleration from force inputs
            // let:
            //      a be the angular acceleration
            //      I be the moment of inertia
            //      r be the torque vector
            // r = I * a
            // a = I^(-1) * r
            var angularAcceleration =
                this.inverseInertiaTensorWorld.transform(
                    this.accumulatedTorque
                );

            // PHASE 1: Velocities adjustment
            // linear velocity update
            // v' = v + linear_acceleration * delta
            this.linearVelocity
                .add(
                    linearAcceleration
                        .multiplyScalar(delta)
                );
            // angular velocity update
            // let:
            //      w be the angular velocity of the rigid body
            // w' = w + angular_acceleration * delta
            this.angularVelocity
                .add(
                    angularAcceleration
                        .multiplyScalar(delta)
                );

            // impose drag
            this.linearVelocity
                .multiplyScalar(
                    Math.pow(this.linearDamping, delta)
                );
            this.angularVelocity
                .multiplyScalar(
                    Math.pow(this.angularDamping, delta)
                );

            // PHASE 2: Position adjustment
            // linear position update
            // position' = position + v * t + 0.5 * a * t * t
            this.position
                .add(
                    this.linearVelocity.clone()
                        .multiplyScalar(delta)
                )
                // since delta squared times 0.5 gives a really small number,
                // the acceleration is commonly ignored
                .add(
                    this.acceleration.clone()
                        .multiplyScalar(delta * delta * 0.5)
                );

            // angular position (orientation) update
            this.orientation
                .addScaledVector(this.angularVelocity, delta);

            // TEST IN THREE JS:
            // the rotation of an object uses euler angles, since we have
            // a quaternion we have to update the rotation converting
            // the quaternion to euler angles
            this.rotation.setFromQuaternion(
                this.orientation,
                THREE.Euler.DefaultOrder
            );

            // STABILIZATION
            this.lastFrameAcceleration = linearAcceleration;

            // normalize the orientation, update the transformMatrix and
            // inverseInertiaTensor matrices to reflect the new changes
            // to the position and orientation of the body
            this.calculateDerivedData();

            // clears the forces and torque accumulated in the last frame
            this.clearAccumulators();
        },

        /**
         * Updates the information of the body like its transform matrix and
         * its inverse inertial tensor
         */
        calculateDerivedData: function () {
            // the orientation might have suffered some changes during the
            // application of the rotation, let's make sure it's length
            // is 1 so that it represents a correct orientation
            this.orientation.normalize();

            // update the transform matrix
            this.calculateTransformMatrix(
                this.transformMatrix, this.position, this.orientation
            );

            // calculate the inertialTensor in world space
            this.transformInertiaTensor(
                this.inverseInertiaTensorWorld,
                this.orientation,
                this.inverseInertiaTensor,
                this.transformMatrix
            );
        },

        /**
         * Clears the forces applied to the rigid body.
         * This will be called automatically after each integration step.
         */
        clearAccumulators: function () {
            this.accumulatedForce.set(0, 0, 0);
            this.accumulatedTorque.set(0, 0, 0);
        },

        /**
         * Adds the given force to the center of mass of the rigid body,
         * the force is expressed in world coordinates
         * @param {Ape.Vector3} f
         */
        addForce: function (f) {
            this.accumulatedForce
                .add(f);
        },

        /**
         * Adds the given torque to the center of mass of the rigid body,
         * the force is expressed in world coordinates
         * @param {Ape.Vector3} r
         */
        addTorque: function (r) {
            this.accumulatedTorque
                .add(r);
        },

        /**
         * Adds a `force` in a specific `point`, the point is specified in
         * WORLD coordinates
         * @param {Ape.Vector3} f
         * @param {Ape.Vector3} point
         */
        addForceAtPoint: function (f, point) {
            // vector from the center of mass to the point
            var pt = point.clone().sub(this.position);
            this.accumulatedForce
                .add(f);
            this.accumulatedTorque
                .add(pt.cross(f));
        },

        /**
         * Adds the given force to the given point on the rigid body, the direction
         * of the point is given in world space coordinates but the application point
         * is given in object space coordinates
         * @param {Ape.Vector3} force
         * @param {Ape.Vector3} point
         */
        addForceAtBodyPoint: function (force, point) {
            var pt = this.getPointInWorldSpace(point);
            this.addForceAtPoint(force, pt);
        },

        /**
         * Sets the inertia tensor of this rigid body (internally the inverseInertiaTensor
         * is set to make easier calculations)
         * @param {Ape.Matrix3} inertiaTensor
         */
        setInertiaTensor: function (inertiaTensor) {
            this.inverseInertiaTensor.setInverse(inertiaTensor);
            this.checkInverseInertiaTensor(this.inverseInertiaTensor);
        },

        /**
         * @private
         * Each frame the transformation matrix (Matrix4) must be updated,
         * it's updated using a vector3 which represents the position
         * and a quaternion which represents the orientation
         * @param {Ape.Matrix4} transformMatrix
         * @param {Ape.Vector3} position
         * @param {Ape.Quaternion} q
         */
        calculateTransformMatrix: function (transformMatrix, position, q) {
            transformMatrix.set(
                1 - 2 * (q.y * q.y + q.z * q.z),
                2 * (q.x * q.y - q.z * q.w),
                2 * (q.x * q.z + q.y * q.w),
                position.x,

                2 * (q.x * q.y + q.z * q.w),
                1 - 2 * (q.x * q.x + q.z * q.z),
                2 * (q.y * q.z - q.x * q.w),
                position.y,

                2 * (q.x * q.z - q.y * q.w),
                2 * (q.y * q.z + q.x * q.w),
                1 - 2 * (q.x * q.x + q.y * q.y),
                position.z
            );
        },

        /**
         * @private
         * Transforms the inverse inertia tensor from object coordinates to world
         * coordinates (called in `calculateDerivedData`)
         * @param iitWorld  inverse inertia tensor world
         * @param q         orientation
         * @param iitBody   inverse inertia tensor
         * @param tm        Transformation matrix
         */
        transformInertiaTensor: function (iitWorld, q, iitBody, tm) {
            var t4 = tm.data[0] * iitBody.data[0]+
                tm.data[1] * iitBody.data[3]+
                tm.data[2] * iitBody.data[6];
            var t9 = tm.data[0] * iitBody.data[1]+
                tm.data[1] * iitBody.data[4]+
                tm.data[2] * iitBody.data[7];
            var t14 = tm.data[0] * iitBody.data[2]+
                tm.data[1] * iitBody.data[5]+
                tm.data[2] * iitBody.data[8];
            var t28 = tm.data[4] * iitBody.data[0]+
                tm.data[5] * iitBody.data[3]+
                tm.data[6] * iitBody.data[6];
            var t33 = tm.data[4] * iitBody.data[1]+
                tm.data[5] * iitBody.data[4]+
                tm.data[6] * iitBody.data[7];
            var t38 = tm.data[4] * iitBody.data[2]+
                tm.data[5] * iitBody.data[5]+
                tm.data[6] * iitBody.data[8];
            var t52 = tm.data[8] * iitBody.data[0]+
                tm.data[9] * iitBody.data[3]+
                tm.data[10] * iitBody.data[6];
            var t57 = tm.data[8] * iitBody.data[1]+
                tm.data[9] * iitBody.data[4]+
                tm.data[10] * iitBody.data[7];
            var t62 = tm.data[8] * iitBody.data[2]+
                tm.data[9] * iitBody.data[5]+
                tm.data[10] * iitBody.data[8];

            iitWorld.data[0] = t4 * tm.data[0]+
                t9 * tm.data[1]+
                t14 * tm.data[2];
            iitWorld.data[1] = t4 * tm.data[4]+
                t9 * tm.data[5]+
                t14 * tm.data[6];
            iitWorld.data[2] = t4 * tm.data[8]+
                t9 * tm.data[9]+
                t14 * tm.data[10];
            iitWorld.data[3] = t28 * tm.data[0]+
                t33 * tm.data[1]+
                t38 * tm.data[2];
            iitWorld.data[4] = t28 * tm.data[4]+
                t33 * tm.data[5]+
                t38 * tm.data[6];
            iitWorld.data[5] = t28 * tm.data[8]+
                t33 * tm.data[9]+
                t38 * tm.data[10];
            iitWorld.data[6] = t52 * tm.data[0]+
                t57 * tm.data[1]+
                t62 * tm.data[2];
            iitWorld.data[7] = t52 * tm.data[4]+
                t57 * tm.data[5]+
                t62 * tm.data[6];
            iitWorld.data[8] = t52 * tm.data[8]+
                t57 * tm.data[9]+
                t62 * tm.data[10];
        },

        /**
         * @private
         * Checks the validity of the new inertia tensor
         * @param {Ape.Matrix3} iitWorld
         */
        checkInverseInertiaTensor: function (iitWorld) {
//            if (iitWorld) {
//                console.warn("Inverse inertia tensor is be invalid");
//            }
        },

        /**
         * Transform a point given in OBJECT coordinates to
         * WORLD coordinates (NOTE: make sure to understand
         * that the normal basis of this object might have changed
         * and may not be aligned with the world's normal basis)
         * @param {Ape.Vector3} point
         * @returns {Ape.Vector3}
         */
        getPointInWorldSpace: function (point) {
            return this.transformMatrix.transform(point);
        },

        /**
         * Transforms a point given in WORLD coordinates to
         * OBJECT coordinates (NOTE: make sure to understand
         * that the normal basis of this object might have changed
         * and may not be aligned with the world's normal basis)
         * @param {Ape.Vector3} point
         * @returns {Ape.Vector3}
         */
        getPointInLocalSpace: function (point) {
            return this.transformMatrix.transformInverse(point);
        },

        /**
         * Sets the value for both the linear damping and the angular damping
         * @param {number} linearDamping
         * @param {number} angularDamping
         */
        setDamping: function (linearDamping, angularDamping) {
            this.linearDamping = linearDamping;
            this.angularDamping = angularDamping;
        },

        /**
         * Adds the linear velocity `v` to the linear
         * velocity of this object
         * @param {Ape.Vector3} v
         */
        addVelocity: function (v) {
            this.linearVelocity.add(v);
        },

        /**
         * Adds the angular velocity `v` to the angular
         * velocity of this object
         * @param {Ape.Vector3} v
         */
        addRotation: function (v) {
            this.angularVelocity.add(v);
        }

    });

    Ape.RigidBody = RigidBody;
})();
Ape.RigidBodyFactory = function (type, size) {
    size = size || 5;
    var geometry = new THREE.CubeGeometry(size, size, size);
    var material = new THREE.MeshNormalMaterial();
    var body = new Ape.RigidBody(geometry, material);

    switch (type) {
        case 'simple':
            break;

        case 'gravity':
            body.acceleration = Ape.GRAVITY.clone();
            break;
    }
    body.setMass(1);
    body.position.set(100, 100, 0);
    body.setInertiaTensor(
        new Ape.Matrix3().setBlockInertialTensor(
            new Ape.Vector3(size * 0.5, size * 0.5, size * 0.5),
            body.getMass()
        )
    );
    return body;
};

/**
 * @singleton
 * 
 * Factory of known rigid bodies, besides creating rigid bodies
 * the methods of this singleton also apply known inertia tensors
 * depending on the type of rigid body.
 * 
 * @class Ape.RigidBodyFactory
 */

/**
 * Creates a RigidBody which has a box as its geometry,
 * this method also applies the corresponding inertia tensor
 *
 * This method should be rarely called, use `CollisionShapeFactory.createBox` instead
 * 
 *      var box;
 *      // a box with width, height and depth equal to 5 
 *      box = new Ape.RigidBodyFactory.createBox();
 *      // a box with a different size
 *      box = new Ape.RigidBodyFactory.createBox({
 *          size: 5
 *      });
 *      // a box with a different sides length
 *      box = new Ape.RigidBodyFactory.createBox({
 *          width: 10,
 *          height: 15,
 *          depth: 20
 *      });
 *      // By default all the rigid bodies are affected by the gravity
 *      // if the box isn't affected by it then the parameter 'type'
 *      // should be set to 'simple'
 *      box = new Ape.RigidBodyFactory.createBox({
 *          type: 'simple'
 *      });
 *
 * @param {Object} config
 * @param {number} [config.size=5] Box's side length
 * @param {number} config.width Box's width (if width is not provided
 * `size` is used instead)
 * @param {number} config.height Box's height (if height is not provided
 * `size` is used instead)
 * @param {number} config.depth Box's depth (if depth is not provided
 * `size` is used instead)
 * @param {string} config.type 'simple' or 'gravity'
 * @returns {Ape.RigidBody}
 */
Ape.RigidBodyFactory.createBox = function (config) {
    // default options
    var size = config.size || 5,
	    width = config.width || size,
	    height = config.height || size,
	    depth = config.depth || size;

    var geometry = new THREE.CubeGeometry(width, height, depth);
    var material = new THREE.MeshNormalMaterial();
    var body = new Ape.RigidBody(geometry, material);
    this.applyConfig(body, config);
    body.setInertiaTensor(
        new Ape.Matrix3().setBlockInertialTensor(
            new Ape.Vector3(width * 0.5, height * 0.5, depth * 0.5),
            body.getMass()
        )
    );
    return body;
};

/**
 * Creates a RigidBody which has a sphere as its geometry,
 * this method also applies the corresponding inertia tensor.
 *
 * This method should be rarely called, use `CollisionShapeFactory.createSphere` instead
 
 *      var sphere;
 *      // a sphere with a radius equal to 5
 *      sphere = new Ape.RigidBodyFactory.createSphere();
 *      // a sphere with a different radius
 *      sphere = new Ape.RigidBodyFactory.createSphere({
 *          radius: 10
 *      });
 *      // By default all the rigid bodies are affected by the gravity
 *      // if the sphere isn't affected by it then the parameter 'type'
 *      // should be set to 'simple'
 *      sphere = new Ape.RigidBodyFactory.createSphere({
 *          type: 'simple'
 *      });
 *
 * @param {Object} config
 * @param {Object} config.radius Radius of the geometric representation
 * @param {string} config.type 'simple' or 'gravity'
 * @returns {Ape.RigidBody}
 */
Ape.RigidBodyFactory.createSphere = function (config) {
    // default options
    var radius = config.radius || 5;

    var geometry = new THREE.SphereGeometry(radius, 32, 32);
    var material = new THREE.MeshNormalMaterial();
    var body = new Ape.RigidBody(geometry, material);
    this.applyConfig(body, config);
    body.setInertiaTensor(
        new Ape.Matrix3().setSphereInertialTensor(
            radius,
            body.getMass()
        )
    );
    return body;
};

/**
 * Identifies the type of pre-configured option through
 * `config.type`, if there's a matching property it applies
 * the corresponding characteristics to the `body`
 * @param {Ape.RigidBody} body
 * @param {Object} config
 */
Ape.RigidBodyFactory.applyConfig = function (body, config) {
    var types = Ape.RigidBodyFactory.types,
	    method = types[config.type] || types.gravity;
    method(body);
    body.setMass(1);
};

Ape.RigidBodyFactory.types = {
    /**
     * Callback executed if the object is affected by a GRAVITY
     * @param {Ape.RigidBody} body
     */
	gravity: function (body) {
		body.acceleration = Ape.GRAVITY.clone();
	},
    /**
     * Callback executed if the object is not affected by any force
     * @param {Ape.RigidBody} body
     */
	simple: function (body) {}
};
Ape.CollisionShapeFactory = {

	/**
	 * Creates a collision-able box by creating a RigidBody
	 * attached to an `Ape.primitive.Box`
     * 
     *      var box;
     *      // simple collisionable box with the default options
     *      box = Ape.CollisionShapeFactory.createBox();
     *      // simple collisionable box with a particular configuration of
     *      // the rigid body
     *      box = Ape.CollisionShapeFactory.createBox({
     *          width: 10,
     *          height: 15,
     *          depth: 20
     *      });
     *      
     * 
	 * @param {Object} [config] Config object delivered
     * to the method Ape.RigidBodyFactory.createBox to create the rigid body
	 * @returns {Ape.primitive.Box}
	 */
    createBox: function (config) {
        // fix config
        config = config || {};
		config.size = config.size || 5;
		config.width = config.width || config.size;
		config.height = config.height || config.size;
		config.depth = config.depth || config.size;

		// default options
		var body,
			box;

        // create a cube mesh
        body = Ape.RigidBodyFactory.createBox(config);
        Ape.debug && scene.add(body);

        // the mesh is represented with a box in the collision
        // detector
        box = new Ape.primitive.Box(
            body,                                                   // body
            new Ape.Matrix4(),                                      // offset (identity)
            new Ape.Vector3(
	            config.width / 2,
	            config.height / 2,
	            config.depth / 2
            )         // half size
        );
        box.calculateInternals();
        return box;
    },

	/**
	 * Creates a collision-able sphere by creating a RigidBody
	 * attached to an `Ape.primitive.Sphere`
     * 
     *      var sphere;
     *      // simple collisionable sphere with the default options
     *      sphere = Ape.CollisionShapeFactory.createSphere();
     *      // simple collisionable sphere with a particular configuration of
     *      // the rigid body
     *      sphere = Ape.CollisionShapeFactory.createSphere({
     *          radius: 10
     *      });
     *      
     * @param {Object} [config] Config object delivered
     * to the method Ape.RigidBodyFactory.createSphere to create the rigid body
     * @returns {Ape.primitive.Sphere}
	 */
    createSphere: function (config) {
        // fix config
        config = config || {};
        config.radius = config.radius || 5;

        var body, sphere;

        // create a cube mesh
        body = Ape.RigidBodyFactory.createSphere(config);
        Ape.debug && scene.add(body);

        // the mesh is represented with a sphere
        // in the collision detector
        sphere = new Ape.primitive.Sphere(
            body,                       // body
            new Ape.Matrix4(),          // offset (identity)
            config.radius               // radius
        );
        sphere.calculateInternals();
        return sphere;
    },

	/**
	 * Creates a collision-able plane by creating a RigidBody
	 * attached to an `Ape.primitive.Box`
	 * @param {Object} config
	 * @param {Object} config.direction Normal of the plane
	 * @param {Object} config.offset Movement from the origin
	 * @returns {Ape.primitive.Plane}
	 */
    createPlane: function (config) {
        config = config || {};

        var plane = new Ape.primitive.Plane();

        plane.direction = (config.direction || new Ape.Vector3(0, 1, 0))
            .normalize();
        plane.offset = config.offset || 0;

        // mesh
        if (Ape.debug) {
            var orientation = new THREE.Matrix4();
            var mesh = new THREE.Mesh(
                new THREE.PlaneGeometry(400, 400, 10, 10),
                new THREE.MeshBasicMaterial({
                    color: 0x555555,
                    side: THREE.DoubleSide,
                    wireframe: true
                })
            );
            orientation.lookAt(
                new Ape.Vector3(),
                plane.direction,
                new Ape.Vector3(0, 1, 0)
            );
            mesh.applyMatrix(orientation);
            scene.add(mesh);
        }

        return plane;
    }
};
Ape.primitive.Primitive = Class.extend({
    init: function (body, offset) {
        /**
         * Rigid body
         * @type {Ape.RigidBody}
         */
        this.body = body;

        /**
         * Offset (translation and rotation only,
         * no scaling or skewing)
         * @type {Ape.Matrix4}
         */
        this.offset = offset;

        /**
         * The resultant transform of the primitive, this is
         * calculated by combining the offset of the primitive
         * with the transform of the body
         *
         *      offset + transform
         *      offset + (orientation + position)
         *
         * @type {Ape.Matrix4}
         */
        this.transform = null;

    },

    /**
     * Type of object (based on this property the Ape.CollisionDetector is
     * capable of detecting the algorithm it has to use)
     * @property {string}
     */
    type: null,

    /**
     * Convenience method to access the axis vectors
     * in the transform matrix
     *
     *      // i.e.
     *      // since the column 3 in the Ape.Matrix4
     *      // holds the displacement of the object
     *      // to get the position of the primitive:
     *      primitive.getAxis(3)
     *
     * @param index
     * @returns {Ape.Vector3}
     */
    getAxis: function (index) {
        return this.transform.getAxisVector(index);
    },

    /**
     * Calculates the internals for the primitives such as
     * its transform matrix that is calculated by multiplying the body's
     * transformation matrix and the offset of the wrapper primitive
     */
    calculateInternals: function () {
        this.transform = this.body.transformMatrix.clone().multiply(
            this.offset
        );
    },

    /**
     * Getter for the property `type`
     * @returns {string}
     */
    getType: function () {
        if (!this.type) {
            throw new Error('Ape.primitive.Primitive(): type needed');
        }
        return this.type;
    }
});
Ape.primitive.Box = Ape.primitive.Primitive.extend({
    /**
     * Ape.primitive.Box constructor
     * @param {Ape.RigidBody} body
     * @param {Ape.Matrix4} offset
     * @param {Ape.Vector3} halfSize
     */
    init: function (body, offset, halfSize) {
        this._super(body, offset);

        /**
         * Represents the halfSizes of the box along
         * each of its OBJECT axis
         * @property {Ape.Vector3}
         */
        this.halfSize = halfSize;
    },

    /**
     * Each instance created is of type box
     * @property {string} [type=box]
     */
    type: 'box'
});
Ape.primitive.Plane = Class.extend({
    init: function () {
        /**
         * Direction of the plane's normal (it should
         * be a normalized vector)
         * @type {Ape.Vector3}
         */
        this.direction = null;

        /**
         * The distance from the origin to the the plane
         * @type {number}
         */
        this.offset = null;
    },

    /**
     * Each instance created is of type plane
     * @type {string}
     */
    type: 'plane',

    /**
     * Returns the type of this object (for collision purposes = 'plane')
     * @returns {string}
     */
    getType: function () {
        return this.type;
    }
});
Ape.primitive.Sphere = Ape.primitive.Primitive.extend({
    /**
     * Ape.primitive.Sphere constructor
     * @param {Ape.RigidBody} body
     * @param {Ape.Matrix4} offset
     * @param {number} radius
     */
    init: function (body, offset, radius) {
        this._super(body, offset);

        /**
         * Radius of the sphere
         * @property {number}
         */
        this.radius = radius;
    },

    /**
     * Each instance created is of type 'sphere'
     * @property {string}
     */
    type: 'sphere'
});
Ape.collision.BoundingSphere = Class.extend({
    init: function (center, radius) {
        /**
         * The center of the bounding sphere
         * @type {Ape.Vector3}
         */
        this.center = center;

        /**
         * The radius of the bounding sphere
         * @type {number}
         */
        this.radius = radius;
    },

    /**
     * Returns the volume of this bounding sphere. This is used
     * to calculate how to do recursion into the bounding volume tree.
     *
     *      V = 4/3 * Math.PI * r * r * r
     */
    getSize: function () {
        return 4 / 3 * Math.PI * this.radius * this.radius * this.radius;
    },

    /**
     * Joins two given bounding spheres
     * @param one
     * @param two
     */
    join: function (one, two) {
        var centerVector = one.center.clone().sub(two.center),
            distance = centerVector.length(),
            radiusDiff = two.radius - one.radius;

        // check if one sphere encloses the other
        if (distance <= Math.abs(radiusDiff)) {
            if (one.radius > two.radius) {
                this.center = one.center;
                this.radius = one.radius;
            } else {
                this.center = two.center;
                this.radius = two.radius;
            }
        } else {
            // the new radius is at half the sum of the distance of the centers,
            // one's radius and two's radius
            this.radius = (distance + one.radius + two.radius) * 0.5;
            this.center = one.center;
            if (distance) {
                // using linear proportions we can interpolate
                // the amount to be added to the center using the new radius
                // and the radius of one
                this.center.add(
                    centerVector.multiplyScalar(
                        (this.radius - one.radius) / distance
                    )
                );
            }
        }
    },

    /**
     * Checks if this bounding sphere overlaps
     * with the other bounding sphere
     * @param {Ape.collision.BoundingSphere} other
     */
    overlaps: function (other) {
        var distance = this.center.distanceTo(other.center);
        return distance < this.center.radius + other.center.radius;
    },

    /**
     * We can calculate the growth by analyzing the surface of a new
     * bounding sphere created with this and the `other` sphere
     *
     *      Surface Area = 4 * Math.PI * r * r
     *
     * we're not interested in the constants so we can only analyze
     * the growth with the radius of both spheres discarding the constants
     *
     *      growth = bigSphere - smallSphere
     *      growth = bigSphere.radius^2 - smallSphere.radius^2
     *
     * @param {Ape.collision.BoundingSphere} other
     * @returns {number}
     */
    getGrowth: function (other) {
        var newSphere = new Ape.collision.BoundingSphere().join(this, other);
        return newSphere.radius * newSphere.radius - this.radius * this.radius;
    }
});
Ape.collision.CollisionData = Class.extend({
    init: function (config) {
        config = config || {};

        /**
         * Holds the contacts array to write into
         * @type {Ape.collision.Contact[]}
         */
        this.contacts = [];

        /**
         * Holds the maximum number of contacts the array can take
         * @type {number}
         */
        this.contactsLeft = null;

        /**
         * Holds the friction value to be written into any collision
         * @type {number}
         */
        this.friction = config.friction || 0;

        /**
         * Holds the restitution value to be written into any collision
         * @type {number}
         */
        this.restitution = config.restitution || 0;

        /**
         * Holds the collision tolerance, the objects that are this
         * close should have collisions generated
         * @type {number}
         */
        this.tolerance = config.tolerance || 0;
    },

    /**
     * Checks if there are more contacts available in the contact data
     * @returns {boolean}
     */
    hasMoreContacts: function () {
        return this.contactsLeft > 0;
    },

    /**
     * Resets the collision data
     * @param {number} maxContacts
     */
    reset: function (maxContacts) {
        this.contactsLeft = maxContacts;
        this.contacts = [];
    },

    /**
     * Notifies the data that `count` number of contacts have been written
     * @param {Ape.collision.Contact[]} contacts
     */
    addContact: function (contacts) {
	    Ape.assert(contacts instanceof Array);
	    this.contacts.concat(contacts);
        this.contactsLeft -= contacts.length;
    }
});
Ape.collision.CollisionDetector = Class.extend({
    /**
     * Tries to generate a contact between two spheres
     * @param {Ape.primitive.Sphere} one
     * @param {Ape.primitive.Sphere} two
     * @param {Ape.collision.CollisionData} data
     */
    sphereAndSphere: function (one, two, data) {
        // only write contacts if there's enough room
        if (data.contactsLeft <= 0) {
            return 0;
        }

        var positionOne = one.getAxis(3),
            positionTwo = two.getAxis(3);

        var midLine = positionOne.clone().sub(positionTwo);
        var length = midLine.length();

        // check if the spheres are intersected
        if (length <= 0 || length >= one.radius + two.radius) {
            return 0;
        }

        // manually create the normal
        var normal = midLine.clone().normalize();

        var contact = this.createContact();
        contact.contactNormal = normal;
        contact.contactPoint = positionOne.add(
            midLine.clone().multiplyScalar(0.5)
        );
        contact.penetration = one.radius + two.radius - length;

        // set body data
        contact.body[0] = one.body;
        contact.body[1] = two.body;
        contact.restitution = data.restitution;
        contact.friction = data.friction;
        data.contacts.push(contact);

        return 1;
    },

    /**
     * Detects collisions between a sphere and a half space plane,
     * the difference between a plane and a half space plane
     * is that the plane is infinitely big
     * @param {Ape.primitive.Sphere} sphere
     * @param {Ape.primitive.Plane} plane
     * @param {Ape.collision.CollisionData} data
     * @returns {number}
     */
    sphereAndHalfSpace: function (sphere, plane, data) {
        // only write contacts if there's enough room
        if (data.contactsLeft <= 0) {
            return 0;
        }

        var position = sphere.getAxis(3);

        // distance from the plane

        // since plane.direction is a NORMALIZED vector then the
        // dot product will return the projection of the position
        // of the sphere in the direction of the normal vector
        // of the plane
        var ballDistance = plane.direction
            .dot(position) - sphere.radius - plane.offset;

        if (ballDistance >= 0) {
            // no collision detected
            return 0;
        }

        var contact = this.createContact();
        contact.contactNormal = plane.direction.clone();
        contact.penetration = -ballDistance;
        contact.contactPoint = position.sub(
            plane.direction.clone().multiplyScalar(
                ballDistance + sphere.radius
            )
        );

        // set body data
        contact.body[0] = sphere.body;
        contact.body[1] = null;
        contact.restitution = data.restitution;
        contact.friction = data.friction;
        data.contacts.push(contact);

        return 1;
    },

    /**
     * Detects collisions between a box and a half space plane
     * @param box
     * @param plane
     * @param data
     */
    boxAndHalfSpace: function (box, plane, data) {
        var me = this;

        // only write contacts if there's enough room
        if (data.contactsLeft <= 0) {
            return 0;
        }

        function checkBoxAndHalfSpaceIntersection(box, plane) {
            // work out the radius from the box to the plane
            var projectedRadius = me.transformToAxis(box, plane.direction);
            // compute how far is the box from the origin
            var boxDistance = plane.direction.
                dot(box.getAxis(3)) - projectedRadius;
            return boxDistance <= plane.offset;
        }

        if (!checkBoxAndHalfSpaceIntersection(box, plane)) {
            return 0;
        }

        var multipliers = [
            [ 1,  1,  1],
            [ 1,  1, -1],
            [ 1, -1,  1],
            [ 1, -1, -1],
            [-1,  1,  1],
            [-1,  1, -1],
            [-1, -1,  1],
            [-1, -1, -1]
        ];

        var i,
            contact,
            contactsWritten = 0;
        // iterate through all the 8 vertices of the box
        for (i = 0; i < 8; i += 1) {
            var vertexPos = new Ape.Vector3(
                multipliers[i][0] * box.halfSize.x,
                multipliers[i][1] * box.halfSize.y,
                multipliers[i][2] * box.halfSize.z
            );

            // transform the point using the box transformMatrix
            vertexPos = box.transform.transform(vertexPos);

            // calculate the distance from the plane
            var vertexDistance = vertexPos.dot(plane.direction);

            if (vertexDistance <= plane.offset) {
                contact = this.createContact();
                contact.contactPoint = plane.direction.clone()
                    .multiplyScalar(vertexDistance - plane.offset)
                    .add(vertexPos);
                contact.contactNormal = plane.direction.clone();
                contact.penetration = plane.offset - vertexDistance;

                // set body data
                contact.body[0] = box.body;
                contact.body[1] = null;
                contact.restitution = data.restitution;
                contact.friction = data.friction;
                data.contacts.push(contact);

                contactsWritten += 1;
            }
        }

        return contactsWritten;
    },

    /**
     * Detects collisions between a box and a sphere, there are 3 cases
     *
     *      sphere face - box face
     *      sphere face - box point
     *      sphere face - box edge
     *
     * @param {Ape.primitive.Box} box
     * @param {Ape.primitive.Sphere} sphere
     * @param {Ape.collision.CollisionData} data
     */
    boxAndSphere: function (box, sphere, data) {
        // transform the center of the sphere into box OBJECT coordinates
        var center = sphere.getAxis(3),
            relativeCenter = box.transform.transformInverse(center);

        if (Math.abs(relativeCenter.x) - sphere.radius > box.halfSize.x ||
                Math.abs(relativeCenter.y) - sphere.radius > box.halfSize.y ||
                Math.abs(relativeCenter.z) - sphere.radius > box.halfSize.z) {
            return 0;
        }

        // clamp each coordinate between [-box.halfSize.C, box.halfSize.C]
        var closestPoint = new Ape.Vector3(
            Math.min(Math.max(relativeCenter.x, -box.halfSize.x), box.halfSize.x),
            Math.min(Math.max(relativeCenter.y, -box.halfSize.y), box.halfSize.y),
            Math.min(Math.max(relativeCenter.z, -box.halfSize.z), box.halfSize.z)
        );
        var distance = closestPoint.clone().sub(relativeCenter).length();
        Ape.assert(typeof distance === 'number');
        if (distance > sphere.radius) {
            // no contact
            return 0;
        }

        // create the contact
        var closestPointWorld = box.transform.transform(closestPoint);
        var contact = this.createContact();
        contact.contactNormal = closestPointWorld.clone().sub(center).normalize();
        contact.contactPoint = closestPointWorld;
        contact.penetration = sphere.radius - distance;

        // set body data
        contact.body[0] = box.body;
        contact.body[1] = sphere.body;
        contact.restitution = data.restitution;
        contact.friction = data.friction;
        data.contacts.push(contact);

        return 1;
    },

    /**
     * Simulates the contact between any face of a box and a point
     * @param {Ape.primitive.Box} box
     * @param {Ape.Vector3} point
     * @param {Ape.collision.CollisionData} data
     * @returns {number}
     */
    boxAndPoint: function (box, point, data) {
        var pointObject = box.transform.transformInverse(point),
            normal,
            depth,
            minDepth;

        // check each axis looking for the axis on which the
        // penetration is least deep

        // x axis
        minDepth = box.halfSize.x - Math.abs(pointObject.x);
        if (minDepth < 0) {
            return 0;
        }
        normal = box.getAxis(0).multiplyScalar(pointObject.x < 0 ? -1 : 1);

        // y axis
        depth = box.halfSize.y - Math.abs(pointObject.y);
        if (depth < 0) {
            return 0;
        } else if (depth < minDepth) {
            minDepth = depth;
            normal = box.getAxis(1).multiplyScalar(pointObject.y < 0 ? -1 : 1);
        }

        // y axis
        depth = box.halfSize.z - Math.abs(pointObject.z);
        if (depth < 0) {
            return 0;
        } else if (depth < minDepth) {
            minDepth = depth;
            normal = box.getAxis(2).multiplyScalar(pointObject.z < 0 ? -1 : 1);
        }

        // create the contact
        var contact = this.createContact();
        contact.contactNormal = normal;
        contact.contactPoint = point;
        contact.penetration = minDepth;

        // set body data
        contact.body[0] = box.body;
        contact.body[1] = null;
        contact.restitution = data.restitution;
        contact.friction = data.friction;
        data.contacts.push(contact);

        return 1;
    },

    /**
     * Simulates the contact between two boxes
     * @param {Ape.primitive.Box} one
     * @param {Ape.primitive.Box} two
     * @param {Ape.collision.CollisionData} data
     */
    boxAndBox: function (one, two, data) {
        // lets assume that there's no contact
        var me = this,
            toCenter = two.getAxis(3).sub(one.getAxis(3)),
            penetration = Infinity,
            best = -1;

        // checks if the projections of the objects [one, two]
        // over the given axis intersect, this is checked by cutting the objects
        // with a plane that is perpendicular to the axis and passes through
        // each object's center, the projections of those "half sizes" are
        // computed in `me.transformToAxis`
        function penetrationOnAxis(axis) {
            var oneProject = me.transformToAxis(one, axis),
                twoProject = me.transformToAxis(two, axis),
                distance = Math.abs(toCenter.dot(axis));

            // returns the overlap amount:
            //  - positive means overlap
            //  - negative means separation
            return oneProject + twoProject - distance;
        }

        function tryAxis(axis, index) {
            if (axis.lengthSq() < 1e-4) {
                return true;
            }
            axis.normalize();
            var candidate = penetrationOnAxis(axis);
            if (candidate < 0) {
                return false;
            }
            if (candidate < penetration) {
                penetration = candidate;
                best = index;
            }
            return true;
        }

        // check if there's an overlap by checking if there's
        // a Separating Axis Test, this test says that the bodies are not colliding
        // if there's a axis (in 2d) or a plane (in 3d) that passes between the objects
        // without colliding any of them.
        //
        // What we'll do is check for each axis if there's some overlap
        // if not it means that there's an axis or plane that may go between the objects
        // In 3d we need 15 checks as explained here:
        // http://gamedev.stackexchange.com/questions/44500/how-many-and-which-axes-to-use-for-3d-obb-collision-with-sat
        //
        // In any case to avoid calculating all the overlap over one axis, we can
        // divide the shape in two parts (no matter which axis or plane we choose, if that
        // plane contains the center of the object it'll cut it in equally proportional
        // dimensions)

        // check overlap over one's (x, y, z) axes
        if (!tryAxis(one.getAxis(0), 0)) { return 0; }
        if (!tryAxis(one.getAxis(1), 1)) { return 0; }
        if (!tryAxis(one.getAxis(2), 2)) { return 0; }

        // check overlap over two's (x, y, z) axes
        if (!tryAxis(two.getAxis(0), 3)) { return 0; }
        if (!tryAxis(two.getAxis(1), 4)) { return 0; }
        if (!tryAxis(two.getAxis(2), 5)) { return 0; }

        var bestSingleAxis = best;

        // check overlap over the combination of two's and one's axes
        if (!tryAxis(one.getAxis(0).cross(two.getAxis(0)), 6)) { return 0; }
        if (!tryAxis(one.getAxis(0).cross(two.getAxis(1)), 7)) { return 0; }
        if (!tryAxis(one.getAxis(0).cross(two.getAxis(2)), 8)) { return 0; }
        if (!tryAxis(one.getAxis(1).cross(two.getAxis(0)), 9)) { return 0; }
        if (!tryAxis(one.getAxis(1).cross(two.getAxis(1)), 10)) { return 0; }
        if (!tryAxis(one.getAxis(1).cross(two.getAxis(2)), 11)) { return 0; }
        if (!tryAxis(one.getAxis(2).cross(two.getAxis(0)), 12)) { return 0; }
        if (!tryAxis(one.getAxis(2).cross(two.getAxis(1)), 13)) { return 0; }
        if (!tryAxis(one.getAxis(2).cross(two.getAxis(2)), 14)) { return 0; }

        Ape.assert(best !== -1);

        // We know which axis the collision is on (i.e. best),
        // but we need to work out which of the two faces that
        // are perpendicular to this axis need to be taken.
        function fillPointFaceBoxBox(one, two, toCenter, best) {
            var normal = one.getAxis(best);

            // The axis should point from box one to box two
            if (normal.dot(toCenter) > 0) {
                normal.multiplyScalar(-1);
            }

            // work out which vertex of box two we're colliding with
            var vertex = two.halfSize.clone();
            if (two.getAxis(0).dot(normal) < 0) { vertex.x *= -1; }
            if (two.getAxis(1).dot(normal) < 0) { vertex.y *= -1; }
            if (two.getAxis(2).dot(normal) < 0) { vertex.z *= -1; }

            // create the contact data
            var contact = me.createContact();
            contact.contactNormal = normal;
            contact.penetration = penetration;
            contact.contactPoint = two.transform.clone().multiplyVector(vertex);

            // set body data
            contact.body[0] = one.body;
            contact.body[1] = two.body;
            contact.restitution = data.restitution;
            contact.friction = data.friction;
            data.contacts.push(contact);
        }

        if (best < 3) {
            fillPointFaceBoxBox(one, two, toCenter, best);
            return 1;
        } else if (best < 6) {
            fillPointFaceBoxBox(two, one, toCenter.multiplyScalar(-1), best - 3);
            return 1;
        } else {
            best -= 6;
            var oneIndex = ~~(best / 3);
            var twoIndex = best % 3;
            var oneAxis = one.getAxis(oneIndex);
            var twoAxis = two.getAxis(twoIndex);
            var axis = oneAxis.clone().cross(twoAxis);
            axis.normalize();

            // The axis should point from box one to box two
            if (axis.dot(toCenter) > 0) { axis.multiplyScalar(-1); }

            var ptOnOneEdge = one.halfSize.clone();
            var ptOnTwoEdge = two.halfSize.clone();
            var map = ['x', 'y', 'z'];
            for (var i = 0; i < 3; i += 1) {
                if (i === oneIndex) { ptOnOneEdge[map[i]] = 0; }
                else if (one.getAxis(i).dot(axis) > 0) { ptOnOneEdge[map[i]] *= -1; }

                if (i === twoIndex) { ptOnTwoEdge[map[i]] = 0; }
                else if (two.getAxis(i).dot(axis) > 0) { ptOnTwoEdge[map[i]] *= -1; }
            }

            ptOnOneEdge = one.transform.multiplyVector(ptOnOneEdge);
            ptOnTwoEdge = two.transform.multiplyVector(ptOnTwoEdge);

            function contactPoint(
                    pOne, dOne, oneSize,
                    pTwo, dTwo, twoSize,
                    useOne) {
                // Ape.Vector3
                var toSt, cOne, cTwo;

                // number
                var dpStaOne, dpStaTwo, dpOneTwo, smOne, smTwo;
                var denominator, mua, mub;

                smOne = dOne.lengthSq();
                smTwo = dTwo.lengthSq();
                dpOneTwo = dTwo.dot(dOne);

                toSt = pOne.clone().sub(pTwo);
                dpStaOne = dOne.dot(toSt);
                dpStaTwo = dTwo.dot(toSt);

                denominator = smOne * smTwo - dpOneTwo * dpOneTwo;

                // Zero denominator indicates parallel lines
                if (Math.abs(denominator) < 1e-4) {
                    return useOne ? pOne : pTwo;
                }

                mua = (dpOneTwo * dpStaTwo - smTwo * dpStaOne) / denominator;
                mub = (smOne * dpStaTwo - dpOneTwo * dpStaOne) / denominator;

                // If either of the edges has the nearest point out
                // of bounds, then the edges aren't crossed, we have
                // an edge-face contact. Our point is on the edge, which
                // we know from the useOne parameter.
                if (mua > oneSize || mua < -oneSize ||
                    mub > twoSize || mub < -twoSize) {
                    return useOne ? pOne : pTwo;
                } else {
                    cOne = pOne.add(dOne.multiplyScalar(mua));
                    cTwo = pTwo.add(dTwo.multiplyScalar(mub));
                    return cOne.multiplyScalar(0.5).add(
                        cTwo.multiplyScalar(0.5)
                    );
                }
            }

            var vertex = contactPoint(
                ptOnOneEdge, oneAxis, one.halfSize[map[oneIndex]],
                ptOnTwoEdge, twoAxis, two.halfSize[map[twoIndex]],
                bestSingleAxis > 2
            );

            var contact = me.createContact();
            contact.penetration = penetration;
            contact.contactNormal = axis;
            contact.contactPoint = vertex;

            // set body data
            contact.body[0] = one.body;
            contact.body[1] = two.body;
            contact.restitution = data.restitution;
            contact.friction = data.friction;

            data.contacts.push(contact);
            return 1;
        }
    },

    /**
     * Projects a box to an axis, to avoid computing the whole projection of the box
     * we can project only half of the box
     * Check [this paper about Separating Axis Theorem in boxes](http://www.jkh.me/files/tutorials/Separating%20Axis%20Theorem%20for%20Oriented%20Bounding%20Boxes.pdf)
     * @param box
     * @param axis
     * @returns {number}
     */
    transformToAxis: function (box, axis) {
        return box.halfSize.x * Math.abs(axis.dot(box.getAxis(0))) +
               box.halfSize.y * Math.abs(axis.dot(box.getAxis(1))) +
               box.halfSize.z * Math.abs(axis.dot(box.getAxis(2)));
    },

    /**
     * Creates an instance of Ape.collision.Contact
     * @returns {Ape.collision.Contact}
     */
    createContact: function () {
        return new Ape.collision.Contact();
    },


	/**
	 * The `detect` method identifies which the method to be executed
	 * to detect collisions between a pair of objects:
	 *
	 *      // e.g.
	 *      // detect collision between: sphere and sphere
	 *      detector: {
	 *          sphere: {
	 *              sphere: 'sphereAndSphere'
	 *          }
	 *      }
	 *      // method `sphereAndSphere` will be called
     *      // this map defaults to:
     *      detector: {
     *          sphere: {
     *              sphere: 'sphereAndSphere',
     *              plane: 'sphereAndHalfSpace'
     *          },
     *          box: {
     *              box: 'boxAndBox',
     *              sphere: 'boxAndSphere',
     *              plane: 'boxAndHalfSpace',
     *              point: 'boxAndPoint'
     *          }
     *      },
	 *
     * @type {Object}
	 */
    detector: {
        sphere: {
            sphere: 'sphereAndSphere',
            plane: 'sphereAndHalfSpace'
        },
        box: {
            box: 'boxAndBox',
            sphere: 'boxAndSphere',
            plane: 'boxAndHalfSpace',
            point: 'boxAndPoint'
        }
    },

    /**
     * For any two objects passed, detects which is the method
     * to call to detect collisions based on the rules described in the
     * {@link Ape.collision.CollisionDetector#property-detector}
     * @param {Ape.primitive.Primitive} a
     * @param {Ape.primitive.Primitive} b
     * @param {Ape.collision.CollisionData} data
     */
    detect: function (a, b, data) {
        var i,
            first, second,
            method,
            objects = [a, b],
            types = [a.getType(), b.getType()];

        for (i = -1; ++i < 2;) {
            first = i;
            second = 1 - i;
            method = this.detector[types[first]] &&
                this.detector[types[first]][types[second]];
            if (method) {
                this[method](objects[first], objects[second], data);
                return;
            }
        }
    }
});
Ape.collision.Contact = Class.extend({
    init: function (config) {
        config = config || {};
        /**
         * Holds the bodies that are involved in the contact.
         * The second body can be NULL meaning that it's not movable
         * @type {Ape.RigidBody[]}
         */
        this.body = config.body || [];

        /**
         * Holds the normal restitution factor at the contact normal
         * @type {number} [restitution=0]
         */
        this.restitution = config.restitution !== undefined ?
            config.restitution : 0;

        /**
         * Holds the direction of the contact in WORLD coordinates
         * @type {Ape.Vector3}
         */
        this.contactNormal = config.contactNormal || new Ape.Vector3();

        /**
         * Holds the depth of penetration at the contact point
         * @type {number}
         */
        this.penetration = config.penetration || null;

        // ************* Rigid body specific variables *************
        /**
         * Holds the contact point in WORLD coordinates
         * @type {Ape.Vector3}
         */
        this.contactPoint = config.contactPoint || new Ape.Vector3();

        /**
         * Holds the lateral friction coefficient at the contact
         * @type {number} [friction=0]
         */
        this.friction = config.friction || 0;

        /**
         * A transform matrix that converts coordinates in the CONTACT
         * frame of reference to WORLD coordinates, the columns of this
         * matrix form an orthonormal set of vectors
         * @type {Ape.Matrix3}
         */
        this.contactToWorld = new Ape.Matrix3();

        /**
         * Holds the closing velocity at the point of contact
         * (set when `calculateInternals` is run)
         * @type {Ape.Vector3}
         */
        this.contactVelocity = new Ape.Vector3();

        /**
         * Holds the desired change in velocity to apply
         * to give it the correct impulse to the rigid body
         * to resolve the contact
         * @type {number} [desiredVelocity=0]
         */
        this.desiredVelocity = 0;

        /**
         * Holds the relative position of the contact in OBJECT
         * coordinates of both rigid bodies
         * @type {Ape.Vector3[]}
         */
        this.relativeContactPosition = [];
    },

    /**
     * Sets the data that doesn't depend on the position of the contact
     * @param {Ape.RigidBody} one
     * @param {Ape.RigidBody} two
     * @param {number} friction
     * @param {number} restitution
     */
    setBodyData: function (one, two, friction, restitution) {
        this.body = [one, two];
        this.friction = friction;
        this.restitution = restitution;
    },

    /**
     * @private
     * Swaps the bodies (in the case the first is null), this also changes
     * the direction of the contact normal
     */
    swapBodies: function () {
        this.contactNormal.multiplyScalar(-1);
        this.body = [this.body[1], this.body[0]];
    },

    /**
     * Calculates internal data useful to create the contact such as:
     *
     * - orthogonal contact basis
     * - relative contact position
     * - velocity at the contact point
     * - velocity change
     *
     * @param {number} duration
     */
    calculateInternals: function (duration) {
        if (!this.body[0]) {
            this.swapBodies();
        }
        Ape.assert(this.body[0]);

        // calculate a set of axes at the contact point
        this.calculateContactBasis();

        // store the relative position of the contact relative to each body
        this.relativeContactPosition[0] = this.contactPoint.clone().sub(
            this.body[0].position
        );
        if (this.body[1]) {
            this.relativeContactPosition[1] = this.contactPoint.clone().sub(
                this.body[1].position
            );
        }

        // find the relative velocities of the bodies at the contact point
        // this method uses the `contactToWorld` matrix and the
        // `relativeContactPosition` array
        this.contactVelocity = this.calculateLocalVelocity(0, duration);
        if (this.body[1]) {
            this.contactVelocity.sub(this.calculateLocalVelocity(1, duration));
        }

        // calculate the desired change in velocity for resolution
        this.calculateDesiredDeltaVelocity(duration);
    },

    /**
     * Calculates an arbitrary orthonormal basis for the contact, this is
     * stored as a 3x3 matrix where each vector is a column (in other words
     * the matrix that transforms from CONTACT space to WORLD space), the x direction
     * is generated from the contact normal, and the (y,z) arbitrary considering
     * which (y,z) axes is closer to the world's (y,z) axes
     */
    calculateContactBasis: function () {
        var contactTangent = [
                new Ape.Vector3(),
                new Ape.Vector3()
            ],
            scale;

        if (Math.abs(this.contactNormal.x) > Math.abs(this.contactNormal.y)) {
            // the Z-axis is nearer to the X axis
            scale = 1 / Math.sqrt(this.contactNormal.z * this.contactNormal.z +
                this.contactNormal.x * this.contactNormal.x);

            // the new X axis is at right angles to the world Y-axis
            contactTangent[0].x = this.contactNormal.z * scale;
            contactTangent[0].y = 0;
            contactTangent[0].z = -this.contactNormal.x * scale;

            // the new Y axis is at right angles to the new X-axis and Z-axis
            contactTangent[1].x = this.contactNormal.y * contactTangent[0].x;
            contactTangent[1].y = this.contactNormal.z * contactTangent[0].x -
                this.contactNormal.x * contactTangent[0].z;
            contactTangent[1].z = -this.contactNormal.y * contactTangent[0].x;
        } else {
            // the Z-axis is nearer to the Y axis
            scale = 1 / Math.sqrt(this.contactNormal.z * this.contactNormal.z +
                this.contactNormal.y * this.contactNormal.y);

            // The new X-axis is at right angles to the world X-axis
            contactTangent[0].x = 0;
            contactTangent[0].y = -this.contactNormal.z * scale;
            contactTangent[0].z = this.contactNormal.y * scale;

            // The new Y-axis is at right angles to the new X-axis and Z- axis
            contactTangent[1].x = this.contactNormal.y * contactTangent[0].z -
                this.contactNormal.z * contactTangent[0].y;
            contactTangent[1].y = -this.contactNormal.x * contactTangent[0].z;
            contactTangent[1].z = this.contactNormal.x * contactTangent[0].y;
        }

        this.contactToWorld.setComponents(
            this.contactNormal,
            contactTangent[0],
            contactTangent[1]
        );
    },

    /**
     * Calculates the velocity of the contact point on the given body:
     *
     *      // the angular velocity is given by
     *      angularVelocity = bodyRotation (cross) relativeContactPosition
     *      linearVelocity = bodyVelocity
     *      // the total closing velocity is:
     *      velocity = angularVelocity + linearVelocity
     *
     * @param {number} bodyIndex
     * @param {number} duration
     * @returns Ape.Vector3
     */
    calculateLocalVelocity: function (bodyIndex, duration) {
        var body = this.body[bodyIndex],
            velocity,
            contactVelocity,
            accumulatedVelocity;

        // the velocity is equal to the linear velocity +
        // the angular velocity at the contact point
        velocity = body.angularVelocity.clone().cross(
            this.relativeContactPosition[bodyIndex]
        );
        velocity.add(body.linearVelocity);

        // transform the velocity from WORLD coordinates to CONTACT coordinates
        contactVelocity = this.contactToWorld.transformTranspose(velocity);

        // STABILIZATION and FRICTION
        // calculate the amount of velocity that is due to forces without reactions
        accumulatedVelocity = body.lastFrameAcceleration.clone()
            .multiplyScalar(duration);
        accumulatedVelocity = this.contactToWorld
            .transformTranspose(accumulatedVelocity);
        // ignore any velocity change in the direction of the contact normal
        // only check planar acceleration
        accumulatedVelocity.x = 0;
        contactVelocity.add(accumulatedVelocity);

        // process velocity
        return contactVelocity;
    },

    /**
     * Calculates the velocity based on the linear velocity +
     * the angular velocity of the contact point
     *
     * @param {number} duration
     */
    calculateDesiredDeltaVelocity: function (duration) {
        var velocityLimit = 0.25,
            restitution = this.restitution;

        // STABILIZATION
        var accumulatedVelocity = this.body[0].lastFrameAcceleration
            .dot(this.contactNormal) * duration;

        if (this.body[1]) {
            accumulatedVelocity -= this.body[1].lastFrameAcceleration
                .dot(this.contactNormal) * duration;
        }

        // if the velocity is too low limit the restitution
        // to avoid the vibration of the rigid bodies
        if (Math.abs(this.contactVelocity.x) < velocityLimit) {
            restitution = 0;
        }

//        this.desiredVelocity = -this.contactVelocity.x * (1 + restitution);
        this.desiredVelocity = -this.contactVelocity.x -
            restitution * (this.contactVelocity.x - accumulatedVelocity);
    },

    /**
     * Turns an impulse generated into velocity and rotation change
     * @param {Ape.Vector3[]} velocityChange
     * @param {Ape.Vector3[]} rotationChange
     */
    applyVelocityChange: function (velocityChange, rotationChange) {
        var inverseInertiaTensor = [],
            impulseContact,
            impulsiveTorque,
            impulse,
            i;
        for (i = 0; i < 2; i += 1) {
            if (this.body[i]) {
                inverseInertiaTensor[i] = this.body[i].inverseInertiaTensor;
            }
        }

        // calculate the impulse required
        impulseContact = this[this.friction === 0 ? 'calculateFrictionlessImpulse' :
            'calculateFrictionImpulse'](inverseInertiaTensor);

        // convert impulse to world coordinates
        impulse = this.contactToWorld.transform(impulseContact);

        // split the impulse into linear and rotational components
        // first body
        impulsiveTorque = this.relativeContactPosition[0].clone().cross(impulse);
        rotationChange[0] = inverseInertiaTensor[0].transform(impulsiveTorque);
        velocityChange[0] = impulse.clone().multiplyScalar(this.body[0].getInverseMass());
        // apply the changes
        this.body[0].addVelocity(velocityChange[0]);
        this.body[0].addRotation(rotationChange[0]);

        // second body
        if (this.body[1]) {
            impulsiveTorque = impulse.clone().cross(this.relativeContactPosition[1]);
            rotationChange[1] = inverseInertiaTensor[1].transform(impulsiveTorque);
            velocityChange[1] = impulse.clone().multiplyScalar(-this.body[1].getInverseMass());
            // apply the changes
            this.body[1].addVelocity(velocityChange[1]);
            this.body[1].addRotation(rotationChange[1]);
        }
    },

    /**
     * Applies a change in the position considering the linear and angular
     * changes in the position
     * @param {Ape.Vector3[]} linearChange
     * @param {Ape.Vector3[]} angularChange
     * @param {number} penetration
     */
    applyPositionChange: function (linearChange, angularChange, penetration) {
        var i,
            linearMove = [], angularMove = [],
            inverseInertiaTensor,
            angularInertiaWorld,
            totalInertia = 0,
            linearInertia = [], angularInertia = [];

        // work out the inertia of each object in the direction
        // of the contact normal due to angular inertia only
        for (i = -1; ++i < 2;) {
            if (this.body[i]) {
                inverseInertiaTensor = this.body[i].inverseInertiaTensor;

                // angular inertia
                angularInertiaWorld = this.relativeContactPosition[i].clone().cross(
                    this.contactNormal
                );
                angularInertiaWorld = inverseInertiaTensor.transform(angularInertiaWorld);
                angularInertiaWorld.cross(this.relativeContactPosition[i]);
                angularInertia[i] = angularInertiaWorld.dot(this.contactNormal);

                // the linear component is simply the inverse mass
                linearInertia[i] = this.body[i].getInverseMass();

                totalInertia += linearInertia[i] + angularInertia[i];
            }
        }

        // loop again to apply the changes
        for (i = -1; ++i < 2;) {
            angularChange[i] = new Ape.Vector3();
            linearChange[i] = new Ape.Vector3();

            if (this.body[i]) {
                var sign = (i === 0 ? 1 : -1);
                angularMove[i] = sign * this.penetration * (angularInertia[i] / totalInertia);
                linearMove[i] = sign * this.penetration * (linearInertia[i] / totalInertia);

                // we have the linear amount of movement required by
                // turning the rigid body (in angularMove)
                if(angularMove[i] === 0) {
                    // no angular movement means no rotation
                    angularChange[i].set(0, 0, 0);
                } else {
                    // work out the direction we would like to rotate in
                    var targetAngularDirection = this.relativeContactPosition[i].clone()
                        .cross(this.contactNormal);
                    inverseInertiaTensor = this.body[i].inverseInertiaTensor;
                    angularChange[i] = inverseInertiaTensor.transform(targetAngularDirection)
                        .multiplyScalar(angularMove[i] / angularInertia[i]);
                }
                linearChange[i] = this.contactNormal.clone().multiplyScalar(linearMove[i]);

                // apply changes
                // change in position
                this.body[i].position.add(linearChange[i]);
                // change in orientation
                this.body[i].orientation.addScaledVector(angularChange[i], 1);
                this.body[i].rotation.setFromQuaternion(
                    this.body[i].orientation,
                    THREE.Euler.DefaultOrder
                );

                this.body[i].calculateDerivedData();
            }
        }
    },

    /**
     * Calculates the impulse needed to resolve this contact given that it
     * has no friction
     * @param {Ape.Matrix3[]} inverseInertiaTensor Inverse inertia tensor
     * of the two bodies (`inverseInertiaTensor[1]` might be null)
     * @returns {Ape.Vector3}
     */
    calculateFrictionlessImpulse: function (inverseInertiaTensor) {
        var deltaVelocityWorld,
            deltaVelocity;

        // first body
        deltaVelocityWorld = this.relativeContactPosition[0].clone()
            .cross(this.contactNormal);
        deltaVelocityWorld = inverseInertiaTensor[0].transform(deltaVelocityWorld);
        deltaVelocityWorld = deltaVelocityWorld.clone()
            .cross(this.relativeContactPosition[0]);

        // transform to contact coordinates
        deltaVelocity =
            // angular component
            deltaVelocityWorld.dot(this.contactNormal) +
                // linear component
                this.body[0].getInverseMass();

        if (this.body[1]) {
            deltaVelocityWorld = this.relativeContactPosition[1].clone()
                .cross(this.contactNormal);
            deltaVelocityWorld = inverseInertiaTensor[1].transform(deltaVelocityWorld);
            deltaVelocityWorld = deltaVelocityWorld.clone()
                .cross(this.relativeContactPosition[1]);

            // transform to contact coordinates
            deltaVelocity +=
                // angular component
                deltaVelocityWorld.dot(this.contactNormal) +
                    // linear component
                    this.body[1].getInverseMass();
        }

        return new Ape.Vector3(this.desiredVelocity / deltaVelocity, 0, 0);
    },

    /**
     * Calculates the impulse needed to resolve this contact given that it
     * has friction
     * @param {Ape.Matrix3[]} inverseInertiaTensor Inverse inertia tensor
     * of the two bodies (`inverseInertiaTensor[1]` might be null)
     * @returns {Ape.Vector3}
     */
    calculateFrictionImpulse: function (inverseInertiaTensor) {
        var impulseContact,
            inverseMass = this.body[0].getInverseMass(),
            impulseToTorque = new Ape.Matrix3()
                .setSkewSymmetric(this.relativeContactPosition[0]);

        // build the matrix to convert contact impulse to change
        // in velocity in world coordinates
        var deltaToWorld = impulseToTorque.clone();
        deltaToWorld = deltaToWorld.multiply(inverseInertiaTensor[0]);
        deltaToWorld = deltaToWorld.multiply(impulseToTorque);
        deltaToWorld = deltaToWorld.multiplyScalar(-1);

        if (this.body[1]) {
            inverseMass += this.body[1].getInverseMass();
            impulseToTorque.setSkewSymmetric(this.relativeContactPosition[1]);

            var deltaToWorld2 = impulseToTorque.clone();
            deltaToWorld2 = deltaToWorld2.multiply(inverseInertiaTensor[1]);
            deltaToWorld2 = deltaToWorld2.multiply(impulseToTorque);
            deltaToWorld2 = deltaToWorld2.multiplyScalar(-1);

            deltaToWorld = deltaToWorld.add(deltaToWorld2);
        }

        // change to contact coordinates
        var deltaVelocity = this.contactToWorld.transpose();
        deltaVelocity = deltaVelocity.multiply(deltaToWorld);
        deltaVelocity = deltaVelocity.multiply(this.contactToWorld);

        // add in the linear velocity change to the diagonal
        deltaVelocity.data[0] += inverseMass;
        deltaVelocity.data[4] += inverseMass;
        deltaVelocity.data[8] += inverseMass;

        var impulseMatrix = deltaVelocity.inverse();
        var velocityKill = new Ape.Vector3(
            this.desiredVelocity,
            -this.contactVelocity.y,
            -this.contactVelocity.z
        );
        impulseContact = impulseMatrix.transform(velocityKill);
        var planarImpulse = Math.sqrt(impulseContact.y * impulseContact.y +
            impulseContact.z * impulseContact.z);
        if (planarImpulse > impulseContact.x * this.friction) {
            impulseContact.y /= planarImpulse;
            impulseContact.z /= planarImpulse;

            impulseContact.x = deltaVelocity.data[0] +
                deltaVelocity.data[1] * this.friction * impulseContact.y +
                deltaVelocity.data[2] * this.friction * impulseContact.z;

            impulseContact.x = this.desiredVelocity / impulseContact.x;
            impulseContact.y *= this.friction * impulseContact.x;
            impulseContact.z *= this.friction * impulseContact.x;
        }
        return impulseContact;
    }
});
Ape.collision.ContactResolver = Class.extend({
    init: function (config) {
        /**
         * Holds the number of iterations to perform when resolving velocity
         * @property {number} [velocityIterations=1]
         */
        this.velocityIterations = config.velocityIterations || 1;

        /**
         * To avoid instabilities, velocities smaller than this value
         * are considered to be zero
         * @property {number} [velocityEpsilon=1e-2]
         */
        this.velocityEpsilon = config.velocityEpsilon || 1e-2;

        /**
         * @private
         * Total number of iterations used in the resolver
         * @property {number} [velocityIterationsUsed=0]
         */
        this.velocityIterationsUsed = 0;

        /**
         * Holds the number of iterations to perform when resolving position
         * @property {number} [positionIterations=1]
         */
        this.positionIterations = config.positionIterations || 1;

        /**
         * @private
         * Total number of iterations used in the resolver
         * @property {number} [positionIterationsUsed=0]
         */
        this.positionIterationsUsed = 0;

        /**
         * To avoid instabilities, positions smaller than this value
         * are considered to be zero
         * @property {number} [positionEpsilon=1e-2]
         */
        this.positionEpsilon = config.positionEpsilon || 1e-2;
    },

    /**
     * Checks if the iterations completed haven't surpassed the iterations defined
     * in the configuration options to continue resolving the contacts
     * @returns {boolean}
     */
    isValid: function () {
        return this.velocityIterations > 0 &&
            this.velocityEpsilon >= 0 &&
            this.positionIterations > 0 &&
            this.positionEpsilon >= 0;
    },

    /**
     * Resolves a set of contacts for both penetration and velocity
     * @param {Ape.collision.Contact[]} contactArray
     * @param {number} numContacts
     * @param {number} duration
     */
    resolveContacts: function (contactArray, numContacts, duration) {
        if (numContacts === 0 || !this.isValid()) {
            return;
        }
        // NOTE: to keep consistency within the API we're passing the
        // same arguments to each function (they might not be used at all)

        // prepare the contacts for processing
        this.prepareContacts(contactArray, numContacts, duration);
        // resolve the interpenetration problems with the contacts
        this.adjustPositions(contactArray, numContacts, duration);
        // resolve the velocity problems with the contacts
        this.adjustVelocities(contactArray, numContacts, duration);
    },

    /**
     * Prepares the contacts calculating its internal properties (see
     * {@link Ape.collision.Contact#calculateInternals for more info})
     * @param {Ape.collision.Contact[]} contactArray
     * @param {number} numContacts
     * @param {number} duration
     */
    prepareContacts: function (contactArray, numContacts, duration) {
	    var i;
	    for (i = -1; ++i < numContacts;) {
            // calculate the internal contact data (basis, inertia, etc)
            contactArray[i].calculateInternals(duration);
        }
    },

    /**
     * Adjusts the positions of the rigid bodies involved in a contact
     * resolving any interpenetration existing in the bodies
     * @param {Ape.collision.Contact[]} contactArray
     * @param {number} numContacts
     * @param {number} duration
     */
    adjustPositions: function (contactArray, numContacts, duration) {
        var i, b, d,
            linearChange = [], angularChange = [],
            max,
            maxIndex,
            contact,
            deltaPosition;

        this.positionIterationsUsed = 0;
        while(this.positionIterationsUsed++ < this.positionIterations) {

            // find biggest penetration
            max = this.positionEpsilon;
            maxIndex = -1;
            i = numContacts;
            for(i = -1; ++i < numContacts;) {
                if (contactArray[i].penetration > max) {
                    max = contactArray[i].penetration;
                    maxIndex = i;
                }
            }
            if (maxIndex === -1) {
                // there are no contacts with a penetration bigger
                // than the minimum allowed: `this.positionEpsilon`
                break;
            }

            contact = contactArray[maxIndex];

            contact.applyPositionChange(
                linearChange,
                angularChange,
                contact.penetration
            );

            // this action may have changed the penetration of other bodies
            // so update the contacts (do not check for collisions again)
            for (i = -1; ++i < numContacts;) {
                for (b = -1; ++b < 2;) {
                    if (contactArray[i].body[b]) {
                        // check for a match with each body in the newly
                        // resolved contact
                        for (d = -1; ++d < 2;) {
                            if (contactArray[i].body[b] === contact.body[d]) {
                                deltaPosition = linearChange[d].clone().add(
                                    angularChange[d].clone().cross(
                                        contactArray[i].relativeContactPosition[b]
                                    )
                                );

                                // the sign is positive if we're dealing with the
                                // second body in a contact and negative otherwise
                                // (we're subtracting the resolution)
                                contactArray[i].penetration +=
                                    deltaPosition
                                        .dot(contactArray[i].contactNormal) *
                                         (b ? 1 : -1);
                            }
                        }
                    }
                }
            }
        }
    },

    /**
     * Adjusts the velocities of the rigid bodies involved in a contact
     * distributing the velocity in the system between the bodies
     * @param {Ape.collision.Contact[]} contactArray
     * @param {number} numContacts
     * @param {number} duration
     */
    adjustVelocities: function (contactArray, numContacts, duration) {
        var i, b, d,
            velocityChange = [], rotationChange = [],
            max,
            maxIndex,
            contact,
            deltaVelocity;

        this.velocityIterationsUsed = 0;
        while(this.velocityIterationsUsed++ < this.velocityIterations) {

            // find biggest penetration
            max = this.velocityEpsilon;
            maxIndex = -1;
            for(i = -1; ++i < numContacts;) {
                if (contactArray[i].desiredVelocity > max) {
                    max = contactArray[i].desiredVelocity;
                    maxIndex = i;
                }
            }
            if (maxIndex === -1) {
                // there are no contacts with a penetration bigger
                // than the minimum allowed: `this.positionEpsilon`
                break;
            }

            contact = contactArray[maxIndex];

            contact.applyVelocityChange(
                velocityChange,
                rotationChange
            );

            // with the change in velocity of the two bodies, the update of
            // contact velocities means that some of the relative closing
            // velocities need recomputing
            for (i = -1; ++i < numContacts;) {
                for (b = -1; ++b < 2;) {
                    if (contactArray[i].body[b]) {
                        // check for a match with each body in the newly
                        // resolved contact
                        for (d = -1; ++d < 2;) {
                            if (contactArray[i].body[b] === contact.body[d]) {
                                deltaVelocity = velocityChange[d].clone().add(
                                    rotationChange[d].clone().cross(
                                        contactArray[i].relativeContactPosition[b]
                                    )
                                );

                                // the sign is positive if we're dealing with the
                                // second body in a contact and negative otherwise
                                // (we're subtracting the resolution)
                                contactArray[i].contactVelocity.add(
                                    contactArray[i].contactToWorld
                                        .transformTranspose(deltaVelocity)
                                        .multiplyScalar(b ? -1 : 1)
                                );

                                // update the desired delta velocity
                                contactArray[i]
                                    .calculateDesiredDeltaVelocity(duration);
                            }
                        }
                    }
                }
            }
        }
    }
});