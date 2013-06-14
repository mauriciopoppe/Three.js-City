/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/10/13
 * Time: 12:43 AM
 * To change this template use File | Settings | File Templates.
 */
(function () {
    var LightsFront = function (config) {
        config = config || {};

        T3.model.Mesh.call(this, config);

        LightsFront.prototype.init.call(this, config);
    };

    T3.inheritFrom(LightsFront, T3.model.Mesh);

    LightsFront.prototype.materialOptions = {
        ambient: '#ffffff',     // ambient
        color: '#abac9b',       // diffuse
        specular: '#cac4c4',    // specular
        shininess: 18,          // shininess
        wireframe: false,
        transparent: true,
        opacity: 0.75
    };

    /**
     * Init this object
     * @param {Object} config
     * @chainable
     */
    LightsFront.prototype.init = function (config) {
        return this;
    };

    LightsFront.prototype.initDatGui = function (gui) {
        var me = this,
            folder = LightsFront.superclass.initDatGui.call(this, gui);
        folder
            .add(me.materialOptions, 'opacity', 0.0, 1.0)
            .name('Opacity')
            .onChange(function (value) {
                me.real.material.opacity = value;
            });
    };

    LightsFront.prototype.update = function (delta) {
    };

    T3.model.LightsFront = LightsFront;
})();