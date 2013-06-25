/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/scale/13
 * Time: 12:43 AM
 * To change this template use File | Settings | File Templates.
 */
(function () {

    var RainSystem;
    
    RainSystem = function (config) {
        config = config || {};

        /**
         * raindrop's x max span coordinate
         * @type {number}
         */
        this.xLimit = 200;

        /**
         * Span the raindrops in this limit
         * @type {number}
         */
        this.yLimit = 100;

        /**
         * raindrop's z max span coordinate
         * @type {number}
         */
        this.zLimit = 200;

        /**
         * The total number of particles to be created
         * as rain drops
         * @type {number}
         */
        this.particleCount = 7000;

        /**
         * Dat.gui rain speed multiplier
         * @type {number}
         */
        this.speed = 1.5;

        /**
         * A copy of the total number of particles to be created (is used
         * by the dat.GUI instance to limit the totalNumber)
         * @private
         * @type {number}
         */
        this.maxParticleCount = this.particleCount;

        T3.model.Object3D.call(this, config);

        RainSystem.prototype.init.call(this);
    };

    T3.inheritFrom(RainSystem, T3.model.Object3D);

    /**
     * Inits the rains system
     * @chainable
     */
    RainSystem.prototype.init = function () {
        var me = this,
            i,
            mesh,
            particleCount = me.particleCount,
            sprite = THREE.ImageUtils.loadTexture('images/raindrop.png'),
            geometry = new THREE.Geometry(),
            material,
            particles;

        // create splash meshes
        me.splashTexture = THREE.ImageUtils.loadTexture('images/splash.png');
        me.splashGroup = [];
        me.currentSplash = 0;
        for (i = 0; i < 1000; i += 1) {
            mesh = new THREE.Mesh(
                new THREE.CircleGeometry(1, 32, 0, Math.PI * 2),
                new THREE.MeshBasicMaterial({
                    transparent: true,
                    opacity: 0.2,
                    map: me.splashTexture,
                    side: THREE.DoubleSide
                })
            );
            mesh.rotation.x = -Math.PI / 2;
            me.splashGroup.push(mesh);
            scene.add(mesh);
        }


        // create particle system
        me.maxParticleCount = me.particleCount;

        for (i = 0; i < particleCount; i += 1) {
            var particle = new THREE.Vector3();
            particle.x = me.xLimit * Math.random() - me.xLimit * 0.5;
            particle.y = me.yLimit * Math.random();
            particle.z = me.zLimit * Math.random() - me.zLimit * 0.5;

            // assume that the initial height is yLimit, let's find
            // the velocity of the particle when its height is yLimit - particle.y
            // Vf^2 = Vo^2 + 2 * a * d
            // Vf^2 = 2 * g * h             (applied to free fall)
            // Vf = sqrt(2 * g * h)
            particle.velocity = new THREE.Vector3(0, -Math.sqrt(2 * T3.World.GRAVITY * (me.yLimit - particle.y)), 0);
            geometry.vertices.push(particle);
        }

        material = new THREE.ParticleBasicMaterial({
            transparent: true,
            map: sprite
        });

        // since no `real` object was passed to the Object3D class, `this.real` is a pointer
        // to itself (this is an instance of THREE.Object3D)
        particles = me.real = new THREE.ParticleSystem(geometry, material);
        particles.sortParticles = true;

        me.add(me.real);

//        me.visible = false;
//        me.real.visible = false;

    };

    /**
     * Create a new folder and add the visible and particle count
     * sliders to the instance of dat.GUI
     * @param {dat.GUI} gui
     */
    RainSystem.prototype.initDatGui = function (gui) {
        var me = this,
            folder = gui.addFolder('Rain');

//        me.visible = false;
        folder
            .add(me, 'visible')
            .name('Visible')
            .onFinishChange(function (value) {
                me.real.visible = value;
            });

        folder
            .add(me, 'particleCount', 0, me.maxParticleCount)
            .name('Raindrops');

        folder
            .add(me, 'speed', 0, 3)
            .name('Speed');
    };

    /**
     * Updates this system and makes it follow the car (so that the user can see a constant rain
     * without rendering many particles in the world)
     * @param delta
     */
    RainSystem.prototype.update = function (delta) {
        var me = this,
            particles = me.real.geometry,
            particle,
            car,
            length = ~~me.particleCount;

        if (!me.visible) {
            return;
        }
        while (length--) {
            particle = particles.vertices[length];
            if (particle.y <= 0) {
                particle.y = me.yLimit;
                particle.velocity.y = -Math.random() * 30;  // random speed factor
            }

            // equation of free fall
            // vf = vo - gt
            particle.velocity.y = particle.velocity.y - T3.World.GRAVITY * delta;
            particle.y += particle.velocity.y * me.speed * delta;
        }
        for (length = ~~me.particleCount; length < particles.vertices.length; length += 1) {
            particle = particles.vertices[length];
            particle.y = me.yLimit;
        }

        // move the particle system above the car
        car = T3.ObjectManager.get('car');
        me.real.position.x = car.position.x;
        me.real.position.z = car.position.z;

        // cast rays
        me.castRays();
    };

    RainSystem.prototype.castRays = function () {
        var me = this;
//        var origin,
//            ray, results;
        for (var i = 0; i < 5; i += 1) {
            // ALTERNATIVE: RAYCASTING
//            origin = new THREE.Vector3(
//                me.real.position.x + me.xLimit - Math.random() * me.xLimit * 2,
//                me.yLimit,
//                me.real.position.z + me.xLimit - Math.random() * me.xLimit * 2
//            ),
//        // origin, vector, near, far
//            ray = new THREE.Raycaster(origin, new THREE.Vector3(0, -1, 0)),
//            results = ray.intersectObjects(T3.intersectable);
//
//            if (!results[0]) return; me.createSplash(results[0].point);
            me.createSplash(new THREE.Vector3(
                me.real.position.x + me.xLimit - Math.random() * me.xLimit * 2,
                3,
                me.real.position.z + me.xLimit - Math.random() * me.xLimit * 2
            ));
        }
    };

    RainSystem.prototype.createSplash = function (point) {
        var me = this,
            mesh = me.splashGroup[me.currentSplash++ % me.splashGroup.length],
            options = {
                x: 1,
                y: 1,
                opacity: 0.2
            };
        mesh.position = point;
        var scale = new TWEEN.Tween(options)
            .to({
                x: 3 + ~~(Math.random() * 5),
                y: 3 + ~~(Math.random() * 5),
                opacity: 0
            }, 2000)
            .onUpdate(function () {
                mesh.scale.x = options.x;
                mesh.scale.y = options.y;
                mesh.material.opacity = options.opacity;
            });
        scale.start();
    };
    T3.model.RainSystem = RainSystem;

})();