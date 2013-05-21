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

        T3.model.Object3D.call(this, config);


        RainSystem.prototype.init.call(this);
    };

    T3.inheritFrom(RainSystem, T3.model.Object3D);

    /**
     * Init this object
     * @chainable
     */
    RainSystem.prototype.init = function () {
        var me = this,
            i,
            particleCount = 5000,
            sprite = THREE.ImageUtils.loadTexture('images/raindrop.png'),
            geometry = new THREE.Geometry(),
            material,
            particles;

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
            particle.velocity = new THREE.Vector3(0, -Math.sqrt(2 * T3.World.gravity * (me.yLimit - particle.y)), 0);
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
        console.log(me.real.position);
    };

    RainSystem.prototype.initDatGui = function (gui) {
    };

    RainSystem.prototype.update = function (delta) {
        var me = this,
            particles = me.real.geometry,
            particle,
            car,
            length = particles.vertices.length;

        while (length--) {
            particle = particles.vertices[length];
            if (particle.y <= 0) {
                particle.y = me.yLimit;
                particle.velocity.y = -Math.random() * 10;
            }

            // equation of free fall
            // vf = vo - gt
            particle.velocity.y = particle.velocity.y - T3.World.gravity * delta;
            particle.y += particle.velocity.y * delta;
        }

        // move the particle system above the car
        car = T3.ObjectManager.get('car');
        me.real.position.x = car.position.x;
        me.real.position.z = car.position.z;
    };

    T3.model.RainSystem = RainSystem;

})();