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
     * Init a mesh object setting some default variables
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
        defaults.materialOptions && (me.materialOptions = defaults.materialOptions);

        me.createMesh(
            defaults.geometryConfig,
            defaults.materialConfig
        );
    
        return this;
    };
    
    /**
     * Creates the mesh using the meshFactory and also adds the created mesh to
     * this (this is an instance of T3.model.Object3D)
     * @param geometry
     * @param material
     */
    Mesh.prototype.createMesh = function (geometry, material) {
        var me = this;

        if (!geometry.initialized){
            throw new Error('Mesh.prototype.createMesh(): geometry must be initialized');
        }

        // call the mesh factory
        me.real = T3.createMesh({
            geometry: geometry.initialized,
            material: material.initialized || new THREE[material.type](
                $.extend(
                    {},
                    me.materialOptions,
                    material.options
                )
            ),
            scale: geometry.scale || T3.scale
        });
        me.add(me.real);
    };
    
    Mesh.prototype.initDatGui = function (gui) {
        var me = this,
            folder;

        if (!me.folder) {
            return null;
        }
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