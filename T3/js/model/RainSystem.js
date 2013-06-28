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
        this.speed = 3;

        /**
         * A copy of the total number of particles to be created (is used
         * by the dat.GUI instance to limit the totalNumber)
         * @private
         * @type {number}
         */
        this.maxParticleCount = this.particleCount;

        /**
         * Car splash particles (only work when rain is enabled)
         * @type {Object}
         */
        this.carSplashParticleSystem = null;

        /**
         * Name of the texture used for the raindrops
         * @type {String}
         */
        this.textureUsed = null;

        /**
         * Raindrops particles (only work when rain is enabled)
         * @type {Object}
         */
        this.rainParticleSystem = null;

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
            mesh;

        // raindrop splash meshes
        me.splashTexture = THREE.ImageUtils.loadTexture('images/splash.png');
        me.splashGroup = [];
        me.currentSplash = 0;
        for (i = 0; i < 1000; i += 1) {
            mesh = new THREE.Mesh(
                new THREE.CircleGeometry(1, 32, 0, Math.PI * 2),
                new THREE.MeshBasicMaterial({
                    transparent: true,
                    opacity: 0,
                    map: me.splashTexture,
                    side: THREE.DoubleSide
                })
            );
            mesh.rotation.x = -Math.PI / 2;
            me.splashGroup.push(mesh);
            scene.add(mesh);
        }

        me.createCarSplashParticleSystem();
        me.createRainParticleSystem();
    };

    /**
     * Creates splash particles when the car is accelerating and rain is enabled
     */
    RainSystem.prototype.createCarSplashParticleSystem = function () {
        var me = this,
            mesh,
            sprite = THREE.ImageUtils.loadTexture('images/raindrop.png'),
            i;

        me.carSplashGroup = [];
        me.currentCarSplashParticle = 0;
        for (i = 0; i < 100; i += 1) {
            mesh = new THREE.Mesh(
                new THREE.CylinderGeometry(0.2, 0.2, 1, 32, 1),
                new THREE.MeshBasicMaterial({
                    transparent: true,
                    opacity: 0,
                    map: sprite,
                    side: THREE.DoubleSide,
                    color: 0xff0000
                })
            );
            me.carSplashGroup.push(mesh);
            scene.add(mesh);
        }
    };

    /**
     * Creates the rain particle system with a maximum number of `me.maxParticleCount`
     * particles, each particle starts at (random x between me.xLimit/2 and -me.xLimit/2,
     * random y between 0 and me.yLimit, random z between me.zLimit/2 and -me.zLimit/2),
     * also each particle has a yVelocity using some free fall equations
     */
    RainSystem.prototype.createRainParticleSystem = function () {
        var me = this,
            particleCount = me.particleCount,
            sprite = THREE.ImageUtils.loadTexture('images/raindrop_backup.png'),
            geometry = new THREE.Geometry(),
            material,
            i;

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
        me.rainParticleSystem = new THREE.ParticleSystem(geometry, material);
        me.rainParticleSystem.sortParticles = true;
        me.add(me.rainParticleSystem);
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
                me.visible = value;
                me.rainParticleSystem.visible = value;
            });

        folder
            .add(me, 'particleCount', 0, me.maxParticleCount)
            .name('Raindrops');

        folder
            .add(me, 'textureUsed', {
                White: 'images/raindrop_backup.png',
                Dark: 'images/raindrop_2.png'
            })
            .name('Raindrop texture')
            .onFinishChange(function (value) {
                me.rainParticleSystem.material.map =
                    THREE.ImageUtils.loadTexture(value);
                me.rainParticleSystem.material.needsUpdate = true;
            });

        folder
            .add(me, 'speed', 2, 5)
            .name('Speed');
    };

    /**
     * Updates its particle systems (rain particle system and car splash particle system),
     * it also creates the raindrops splashes
     * @param delta
     */
    RainSystem.prototype.update = function (delta) {
        var me = this;
        if (me.visible) {
            me.updateRain(delta);
//            me.updateCarSplash(delta);

            // actually it creates random splash everywhere
            // there's some alternative code commented
            me.createRandomSplashes();
        }
    };

    /**
     * Updates this system and makes it follow the car (so that the user can see a constant rain
     * without rendering many particles in the world)
     * @param delta
     */
    RainSystem.prototype.updateRain = function (delta) {
        var me = this,
            particles = me.rainParticleSystem.geometry,
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
        me.position.x = car.position.x;
        me.position.z = car.position.z;

    };

    RainSystem.prototype.updateCarSplash = function (delta) {
        var me = this,
            car = T3.ObjectManager.get('car'),
            particles = me.carSplashGroup,
            length = ~~(Math.abs(car.speed) / 50),
            wheel,
            particle,
            position;
        // at the center of the tire
//        new THREE.Vector3(0, -3, 0).add(car.localToWorld(car.wheelBackLeft.position.clone()));
        while (length--) {
            me.currentCarSplashParticle += 1;
            me.currentCarSplashParticle %= particles.length;
            particle = particles[me.currentCarSplashParticle];
            particle.rotation.set(0, 0, 0);
            // choose a random wheel
            wheel = Math.random() >= 0.5 ? car.wheelBackLeft : car.wheelBackRight;

            // chose a random place in the wheel
            // between -tireWidth / 2 and tireWidth / 2
            var randomX = wheel.tireWidth / 2;// - wheel.tireWidth * Math.random();
            position = car.localToWorld(
                wheel.position.clone()
                    .add(new THREE.Vector3(0, -3, 0))
                    .add(
                        new THREE.Vector3(
                            randomX,
                            5,
                            0
                        )
                    )
            );
//            particle.position = position;

            // rotate the particle
//            particle.rotation.x = -Math.random();
//            particle.rotation.z = randomX / wheel.tireWidth / 2 * Math.PI / 2;   // map to (-)[0..Math.pi]
            particle.rotation.y = Math.sin(car.orientation);
            particle.rotation.z = Math.PI / 2;

            var wrap = new THREE.Object3D();
            wrap.add(particle);
            wrap.position = position;
            console.log(wrap.position);
            scene.add(wrap);

            T3.assert(particle);
            (function (p) {
                var from = {
                    y: p.position.y,
                    z: p.position.z,
                    opacity: 1
                };
                var to = {
                    y: p.position.y + 10,
                    z: p.position.z + Math.cos(car.carOrientation) * 10,
//                        * car.speed >=0 ? 1 : -1,
                    opacity: 0
                };
                var tween = new TWEEN.Tween(from)
                    .to(to, 2000)
                    .onUpdate(function () {
                        p.position.y = from.y;
                        p.position.z = from.z;
//                        p.material.opacity = from.opacity;
                    });
                tween.start();
            })(wrap);
        }

    };

    /**
     * Creates random splashes for the raindrops
     */
    RainSystem.prototype.createRandomSplashes = function () {
        var me = this,
            car;
        for (var i = 0; i < 4; i += 1) {
            // ALTERNATIVE: RAYCASTING
//        var origin,
//            ray, results;
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
            // ALTERNATIVE: random position splash
            me.createSplash(new THREE.Vector3(
                me.real.position.x + me.xLimit - Math.random() * me.xLimit * 2,
                3,
                me.real.position.z + me.xLimit - Math.random() * me.xLimit * 2
            ));
        }

        // tire splash
        car = T3.ObjectManager.get('car');
        if (Math.abs(car.speed) > 1) {
//            console.log(car.wheelBackLeft.position);
//            console.log();
//            var point = ;
//            console.log(point);
            var options = {
                duration: 500
            };
            me.createSplash(new THREE.Vector3(0, -3, 0)
                .add(car.localToWorld(car.wheelBackLeft.position.clone())),
                options
            );
            me.createSplash(new THREE.Vector3(0, -3, 0)
                .add(car.localToWorld(car.wheelBackRight.position.clone())),
                options
            );

//            me.createSplash(new THREE.Vector3(0, -3, 0)
//                .add(car.localToWorld(car.wheelFrontLeft.position.clone())),
//                options
//            );
//            me.createSplash(new THREE.Vector3(0, -3, 0)
//                .add(car.localToWorld(car.wheelFrontRight.position.clone())),
//                options
//            );
        }
    };

    RainSystem.prototype.createSplash = function (point, options) {
        var me = this,
            rand = ~~(Math.random() * 5),
            mesh = me.splashGroup[me.currentSplash++ % me.splashGroup.length];
        options = $.extend({
            x: 1,
            y: 1,
            opacity: 0.2
        }, options);
        var to = { x: 3 + rand, y: 3 + rand, opacity: 0};
        mesh.position = point;
        var tween = new TWEEN.Tween(options)
            .to(to, options.duration || 1000)
            .onUpdate(function () {
                mesh.scale.x = options.x;
                mesh.scale.y = options.y;
                mesh.material.opacity = options.opacity;
            });
        tween.start();
    };
    T3.model.RainSystem = RainSystem;

})();