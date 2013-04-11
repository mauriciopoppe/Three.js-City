/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/10/13
 * Time: 2:43 PM
 * To change this template use File | Settings | File Templates.
 */

/*
    GLOBAL:
    T3
 */
/**
 *
 * Manages the objects in the scene
 * @class T3.ObjectManager
 * @singleton
 */
T3.ObjectManager = {
    /**
     * Map to all the objects created in the application
     */
    objects: {
    },
    /**
     * Registers an object in this manager
     */
    addObject: function (name, object, addToScene) {
        if (!name) {
            throw new Error('T3.ObjectManager.addObject(): name required')
        }
        if (this.objects[name]) {
            console.log('[WARN]: registering an object with the same name: ' + name);
        }
        this.objects[name] = object;

        // add this object to the scene
        addToScene && scene.add(object.real);

        // init gui
        object.initDatGui && object.initDatGui(T3.Application.datGUI);

    },
    /**
     * Removes an object from the ObjectManager and the scene
     */
    removeObject: function (name) {
        // add this object to the scene
        scene.remove(this.objects[name].real);
        this.objects[name] && delete this.objects[name];
    },
    /**
     * Gets an object from this manager
     * @returns {T3.Object3D | T3.Mesh}
     */
    getObject: function (name) {
        return this.objects[name];
    }
};