/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/10/13
 * Time: 12:43 AM
 * To change this template use File | Settings | File Templates.
 */

T3.Car = function (config) {
    config = config || {};

    T3.Object3D.call(this, config);

    /**
     * Ambient color
     * @type {Object}
     */
    this.ambient = null;

    /**
     * Diffuse color
     * @type {Object}
     */
    this.color = null;

    /**
     * Specular (works with the diffuse color)
     * @type {Object}
     */
    this.specular = null;

    /**
     * Shininess
     * @type {Object}
     */
    this.shininess = null;

    T3.Car.prototype.init.call(this, config);
};

T3.inheritFrom(T3.Car, T3.Object3D);

/**
 * Init this object
 * @param {Object} config
 * @chainable
 */
T3.Car.prototype.init = function (config) {
    this.loader();
    return this;
};

T3.Car.prototype.loader = function () {
    var loader = new THREE.JSONLoader(),
        addMesh = function ( geometry, scale, x, y, z, rx, ry, rz, material ) {
            var mesh;
            this.real = mesh = new THREE.Mesh( geometry, material );
            mesh.scale.set( scale, scale, scale );
            mesh.position.set( x, y, z );
            mesh.rotation.set( rx, ry, rz );
            scene.add( mesh );
        };

    loader.load('obj/Skyline.body.js', function (geometry) {
        // let's create just one model for now
        addMesh( geometry, 10, 0, 0, 0, 0, 0, 0, new THREE.MeshPhongMaterial({
            ambient: this.ambient,
            color: this.color,
            specular: this.specular,
            shininess: this.shininess
        }) );
    });
};

T3.Car.prototype.update = function (delta) {
//    this.real.rotation.x += 0.01;
};