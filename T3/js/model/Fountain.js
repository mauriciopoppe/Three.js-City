/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 6/23/13
 * Time: 1:35 PM
 * To change this template use File | Settings | File Templates.
 */
(function () {

    var Fountain;

    Fountain = function (config) {
        config = config || {};

        /**
         * Height of the cylinder
         * @type {number}
         */
        this.height = 30;

        /**
         * Bottom level configuration
         * @type {Object}
         */
        this.bottomLevel = config.bottomLevel || {};

        /**
         * The fountain has many water instances that are stored here
         * @type {Array}
         */
        this.waterInstances = [];

        /**
         * The fountain has this number of water instances
         * @type {number}
         */
        this.waterTotal = 30;

        T3.model.Object3D.call(this, config);

        Fountain.prototype.init.call(this, config);
    };

    T3.inheritFrom(Fountain, T3.model.Object3D);

    /**
     * Init this fountain (made of a cylinder, torus and circle)
     * @chainable
     */
    Fountain.prototype.init = function () {
        var me = this;

        me.bottomLevel = $.extend({}, {
            height: 10,
            radius: 20
        }, me.bottomLevel);

        me.createStructure();
        return this;
    };

    Fountain.prototype.createStructure = function () {
        var me = this,
            i, disk, sphere,
            base, level, levelWrap;

        base = new THREE.Mesh(
            // top, base, height, faces
            new THREE.CylinderGeometry(0.5, 3, me.height, 64),
            new THREE.MeshBasicMaterial({
                map: T3.AssetLoader.get('texture-marble')
            })
        );
        base.position.y = me.height / 2;
        base.receiveShadow = true;
        base.castShadow = true;
        me.add(base);

        levelWrap = new THREE.Object3D();
        for (i = 0; i < 3; i += 1) {
            level = new THREE.Mesh(
                // radius, tubeRadius, radialSegments, tubularSegments
                new THREE.TorusGeometry(
                    me.bottomLevel.radius / (1 << i), 1, 60, 60
                ),
                new THREE.MeshBasicMaterial({
                    map: T3.AssetLoader.get('texture-marble')
                })
            );
            level.receiveShadow = true;
            level.castShadow = true;
            level.rotation.x = Math.PI / 2;

            disk = new THREE.Mesh(
                // radius, segment, start angle, end angle
                new THREE.CircleGeometry(
                    me.bottomLevel.radius / (1 << i), 32, 0, Math.PI * 2
                ),
                new THREE.MeshBasicMaterial({
                    map: T3.AssetLoader.get('texture-water')
                })
            );
            disk.rotation.x -= Math.PI / 2;
            disk.receiveShadow = true;
            disk.castShadow = true;

            level.position.y = disk.position.y = i * 5;
            levelWrap.add(level);
            levelWrap.add(disk);
        }
        levelWrap.position.y = me.bottomLevel.height;
        me.add(levelWrap);

        var texture = T3.AssetLoader.get('texture-world');
        sphere = new THREE.Mesh(
            // top, base, height, faces
            new THREE.SphereGeometry(5, 30, 30),
            new THREE.MeshBasicMaterial({
                map: texture
            })
        );
        sphere.rotation.x -= Math.PI / 10;
        sphere.position.y = me.height;
        sphere.castShadow = true;
        sphere.receiveShadow = true;

        me.add(me.world = sphere);
        // water
        // by now it's disabled because it needs lots of updates
        /*
        var split, speed, instance;
        levelWrap = new THREE.Object3D();
        split = me.waterTotal / 3;
        speed = 5;
        for (i = 0; i < split; i += 1) {
            instance = new T3.model.Water({
                xSpeed: Math.cos(i * Math.PI * 2 / split) * speed,
                zSpeed: Math.sin(i * Math.PI * 2 / split) * speed,
                minHeight: -(me.height - me.bottomLevel.height)
            });
            me.waterInstances.push(instance);
            levelWrap.add(instance);
        }
        for (i = 0; i < split; i += 1) {
            instance = new T3.model.Water({
                ySpeed: 10,
                xSpeed: Math.cos(i * Math.PI * 2 / split) * speed,
                zSpeed: Math.sin(i * Math.PI * 2 / split) * speed,
                minHeight: -(me.height - me.bottomLevel.height)
            });
            me.waterInstances.push(instance);
            levelWrap.add(instance);
        }
        for (i = 0; i < split; i += 1) {
            instance = new T3.model.Water({
                ySpeed: 20,
                xSpeed: 0,
                zSpeed: 0
            });
            instance.position.set(
                Math.cos(i * Math.PI * 2 / split),
                0,
                Math.sin(i * Math.PI * 2 / split)
            );
            me.waterInstances.push(instance);
            levelWrap.add(instance);
        }
        levelWrap.position.y = me.height;
        me.add(levelWrap);
        */
    };

    Fountain.prototype.initDatGui = function () {
    };

    Fountain.prototype.update = function (delta) {
        var me = this;
        me.world.rotation.y += delta;
    };

    T3.model.Fountain = Fountain;
})();