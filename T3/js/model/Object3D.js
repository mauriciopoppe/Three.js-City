/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/10/13
 * Time: 1:58 PM
 * To change this template use File | Settings | File Templates.
 */

/*
    Global:
    THREE
    T3.ObjectManager
 */

(function () {    

    var Object3D;
    
    /**
     * Abstract class used wrap a THREE.Mesh or THREE.Object3D, each instance of this class
     * will hold a reference to a real THREE.Mesh which is `this.real`, the idea of this class is to
     * have a master class that adds additional properties to both meshes and object3Ds
     * @abstract
     * @constructor
     * @extends THREE.Object3D
     */
    Object3D = function (config) {
        config = config || {};
    
        THREE.Object3D.call(this);
    
        /**
         * Name of this object
         * @type {string}
         */
        this.name = config.name;
    
        /**
         * The parent of this object
         * @type {Object3D|undefined}
         */
        this.originalParent = config.originalParent;
    
        /**
         * Visibility of this object
         * @type {Object}
         */
        this.visible = config.visible !== undefined ? config.visible : true;
    
        /**
         * Name of the dat.GUI folder to be added
         * @type {string}
         */
        this.folder = config.folder;

        /**
         * APE simulatable instance
         * @type {simulationInstance|*}
         */
        this.simulationInstance = config.simulationInstance;

        /**
         * `this` instance is just a wrapper to a inner element
         * which might be a Mesh, camera or even itself!
         * (the real pointer points to `this` if it's null)
         * The real instance is stored in `this.object`
         */
        this.real = config.real !== undefined ? config.real : this;
    
        Object3D.prototype.init.call(this, config);
    };
    
    T3.inheritFrom(Object3D, THREE.Object3D);
    
    /**
     * Adds this objects to the ObjectManager
     * @param {Object} config
     * @chainable
     */
    Object3D.prototype.init = function (config) {
    
        if (typeof config.update === 'function') {
            Object3D.prototype.update = config.update;
        }

        // name, object, parent
        T3.ObjectManager.add(this.name, this, this.originalParent);
        return this;
    };
    
    /**
     * Updates the instance datGUI if required to add new properties and folders
     * @param {dat.GUI} datGUI
     * @abstract
     */
    Object3D.prototype.initDatGui = function (datGUI) {
    };
    
    /**
     * Updates the properties of this Object3D, typically
     * this is the function that must be overridden to update this object during
     * each call of the `update` method of the render loop
     * @abstract
     */
    Object3D.prototype.update = function (delta) {
    };

    T3.model.Object3D = Object3D;

})();