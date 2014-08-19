/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/10/13
 * Time: 2:43 PM
 * To change this template use File | Settings | File Templates.
 */

/*
    GLOBAL:
    T3, scene
 */
/**
 *
 * Manages the objects in the scene
 * @class T3.ObjectManager
 * @singleton
 */
T3.ObjectManager = {
    /**
     * In the case where an object has no id, generate a new id
     * automatically using this number
     */
    id: 0,
    /**
     * Map to all the objects created in the application
     */
    objects: {
    },
    /**
     * Registers an object in this manager
     * @param name Name of the object (the `get` method uses this name)
     * @param object The object itself
     * @param [parent=scene] parent of this object, defaults to the global scene
     */
    add: function (name, object, parent) {
        parent = parent !== undefined ? parent : scene;
        this.register(name, object);

        // add this object to the scene
        if (object.real && object.real !== object) {
            object instanceof THREE.Object3D &&
                object.add &&
                object.add(object.real);
        }
        parent.add(object);

        // init gui
        object.initDatGui && object.initDatGui(T3.Application.datGUI);
    },
    /**
     * Registers an object in the map of objects that the object manager holds,
     * this method does not add the object to the scene
     * @param name
     * @param object
     */
    register: function (name, object) {
        if (!name) {
            name = this.id++;
        }
        if (this.objects[name]) {
            console.log('[WARN]: registering an object with the same name: ' + name);
        }
        this.objects[name] = object;
    },
    /**
     * Removes an object from the ObjectManager and the scene
     */
    remove: function (name) {
        // add this object to the scene
        scene.remove(this.objects[name].real);
        this.objects[name] && delete this.objects[name];
    },
    /**
     * Gets an object from this manager
     * @returns {T3.Object3D | T3.Mesh}
     */
    get: function (name) {
        return this.objects[name];
    }
};