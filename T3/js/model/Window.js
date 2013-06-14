/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/10/13
 * Time: 12:43 AM
 * To change this template use File | Settings | File Templates.
 */
(function () {
    var Window = function (config) {
        config = config || {};

        T3.model.Mesh.call(this, config);

        Window.prototype.init.call(this, config);
    };

    T3.inheritFrom(Window, T3.model.Mesh);

    Window.prototype.materialOptions = {
        ambient: '#000000',     // ambient
        color: '#111111',       // diffuse
        specular: '#0f0f0f',    // specular
        shininess: 0.4 * 128,    // shininess
        wireframe: false,
        transparent: true,
        opacity: 0.75
    };

    /**
     * Init this object
     * @param {Object} config
     * @chainable
     */
    Window.prototype.init = function (config) {
        return this;
    };

    Window.prototype.initDatGui = function (gui) {
        var me = this,
            folder = Window.superclass.initDatGui.call(this, gui);
        folder
            .add(me.materialOptions, 'opacity', 0.0, 1.0)
            .name('Opacity')
            .onChange(function (value) {
                me.real.material.opacity = value;
            });
    };

    Window.prototype.update = function (delta) {
    };

    T3.model.Window = Window;
})();