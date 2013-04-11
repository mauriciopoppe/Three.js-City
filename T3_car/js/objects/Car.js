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
    this.ambient = config.ambient || '#313131';

    /**
     * Diffuse color
     * @type {Object}
     */
    this.color = config.color || '#818181';

    /**
     * Specular (works with the diffuse color)
     * @type {Object}
     */
    this.specular = config.specular || '#818181';

    /**
     * Shininess
     * @type {Object}
     */
    this.shininess = config.shininess || (0.4 * 128);

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
    var me = this,
        loader = new THREE.JSONLoader(),
        addMesh = function ( geometry, scale, x, y, z, rx, ry, rz, material ) {
            var mesh;
            me.real = mesh = new THREE.Mesh( geometry, material );
            mesh.scale.set( scale, scale, scale );
            mesh.position.set( x, y, z );
            mesh.rotation.set( rx, ry, rz );
            scene.add( mesh );
            console.log(me.real);
        };

    loader.load('obj/Skyline.body.js', function (geometry) {
        // let's create just one model for now
        addMesh( geometry, 10, 0, 0, 0, 0, 0, 0, new THREE.MeshPhongMaterial({
            ambient: me.ambient,
            color: me.color,
            specular: me.specular,
            shininess: me.shininess
        }) );
    });
};


T3.Car.prototype.initDatGui = function (gui) {
    var me = this,
        folder = gui.addFolder('Car');
    folder
        .add(me, 'visible')
        .name('Show car mesh')
        .onFinishChange(function (value) {
            scene[value ? 'add' : 'remove'](me.real);
        });

    folder
        .addColor(me, 'color')
        .name('Car Color')
        .onChange(function (value) {
            me.real.material.color.setHex(parseInt(value.substr(1), 16));
        });

    folder
        .addColor(me, 'specular')
        .name('Car specular')
        .onChange(function (value) {
            me.real.material.specular.setHex(parseInt(value.substr(1), 16));
        });

    folder
        .addColor(me, 'ambient')
        .name('Car ambient')
        .onChange(function (value) {
            me.real.material.ambient.setHex(parseInt(value.substr(1), 16));
        });

    folder
        .add(me, 'shininess', 0, 128)
        .name('Car shininess')
        .onChange(function (value) {
            me.real.material.shininess = value;
        });
};

T3.Car.prototype.update = function (delta) {
    if (this.real) {
        this.real.rotation.y += 0.01;
    }
};
