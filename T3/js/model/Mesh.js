/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/10/13
 * Time: 12:43 AM
 * To change this template use File | Settings | File Templates.
 */
(function () {
    var Mesh;

    Mesh = function (config) {
        config = config || {};
    
        T3.model.Object3D.call(this, config);

        /**
         * Mesh's geometry
         * @type {Object}
         */
        this.geometryConfig = null;
        /**
         * Mesh's material
         * @type {Object}
         */
        this.materialConfig = null;

        Mesh.prototype.init.call(this, config);
    };
    
    T3.inheritFrom(Mesh, T3.model.Object3D);
    
    Mesh.prototype.materialOptions = {
        ambient: '#313131',     // ambient
        color: '#818181',       // diffuse
        specular: '#818181',    // specular
        shininess: 0.4 * 128,   // shininess,
        wireframe: false
    };
    
    /**
     * Init this object
     * @param {Object} config
     * @chainable
     */
    Mesh.prototype.init = function (config) {
        var me = this,
            defaults = {
                geometryConfig: {
                    initialized: null
                },
                materialConfig: {
                    initialized: null,
                    type: 'MeshPhongMaterial',
                    options: {}
                }
            };
    
        $.extend(true, defaults, config);

        me.geometryConfig = defaults.geometryConfig;
        me.materialConfig = defaults.materialConfig;

        me.createRealObject(
            defaults.geometryConfig,
            defaults.materialConfig
        );
    
        return this;
    };
    
    /**
     * @template
     * Creates the real object (function executed when the method is ready to be called),
     * be sure to set me.real in this method for the callback to work
     * @param geometry
     * @param material
     */
    Mesh.prototype.createRealObject = function (geometry, material) {
        var me = this;

        if (!geometry.initialized){
            throw new Error('Mesh.prototype.createRealObject(): geometry must be initialized');
        }

        me.real = T3.createMesh({
            geometry: geometry.initialized,
            material: material.initialized || new THREE[material.type](
                $.extend(
                    me.materialOptions,
                    material.options
                )
            ),
            scale: 10
        });
        me.add(me.real);
    };
    
    Mesh.prototype.initDatGui = function (gui) {
        var me = this,
            folder = gui.addFolder(me.folder);

        folder
            .add(me.materialOptions, 'wireframe')
            .name('Wireframe')
            .onChange(function (value) {
                me.real.material.wireframe = value;
            });

        folder
            .addColor(me.materialOptions, 'ambient')
            .name('Ambient')
            .onChange(function (value) {
                me.real.material.ambient.setHex(parseInt(value.substr(1), 16));
            });
    
        folder
            .addColor(me.materialOptions, 'color')
            .name('Color')
            .onChange(function (value) {
                me.real.material.color.setHex(parseInt(value.substr(1), 16));
            });
    
        folder
            .addColor(me.materialOptions, 'specular')
            .name('Specular')
            .onChange(function (value) {
                me.real.material.specular.setHex(parseInt(value.substr(1), 16));
            });
    
        folder
            .add(me.materialOptions, 'shininess', 0, 128)
            .name('Shininess')
            .onChange(function (value) {
                me.real.material.shininess = value;
            });

        return folder;
    };

    T3.model.Mesh = Mesh;
})();