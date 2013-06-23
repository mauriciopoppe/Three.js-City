/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 6/23/13
 * Time: 2:15 PM
 * To change this template use File | Settings | File Templates.
 */
(function () {

    var Water;

    Water = function (config) {
        config = config || {};

        /**
         * The total number of particles to be created
         * as rain drops
         * @type {number}
         */
        this.particleCount = 200;

        /**
         * water initial speed
         * @type {number}
         */
        this.xSpeed = 5;

        /**
         * water initial speed
         * @type {number}
         */
        this.ySpeed = 20;

        /**
         * water initial speed
         * @type {number}
         */
        this.zSpeed = 0.0;

        /**
         * Re-span the drops when they go below this level
         * @type {number}
         */
        this.minHeight = 0;

        T3.model.Object3D.call(this, config);

        Water.prototype.init.call(this, config);
    };

    T3.inheritFrom(Water, T3.model.Object3D);

    /**
     * Inits the rains system
     * @chainable
     */
    Water.prototype.init = function (config) {

        var me = this,
            i,
            geometry = new THREE.Geometry(),
            material,
            sprite = THREE.ImageUtils.loadTexture('images/white_particle.png');

        $.extend(me, config);
        for (i = 0; i < me.particleCount; i += 1) {
            var particle = new THREE.Vector3();
            particle.startTime = i;       // start animation each 100ms
            particle.velocity = new THREE.Vector3(me.xSpeed, me.ySpeed, me.zSpeed);
            geometry.vertices.push(particle);
        }
        material = new THREE.ParticleBasicMaterial({
            size: 10,
            opacity: 0.3,
            transparent: true,
            map: sprite,
            color: 0x395879         // water
        });
        me.real = new THREE.ParticleSystem(geometry, material);
        me.real.sortParticles = true;
        me.add(me.real);
    };

    /**
     * Create a new folder and add the visible and particle count
     * sliders to the instance of dat.GUI
     * @param {dat.GUI} gui
     */
    Water.prototype.initDatGui = function (gui) {
    };

    /**
     * Updates the water particles considering each
     * @param delta
     */
    Water.prototype.update = function (delta) {
        var me = this,
            particles = me.real.geometry,
            particle,
            i = ~~me.particleCount;
        if (!me.visible) {
            return;
        }
        while (i--) {
            particle = particles.vertices[i];
            if (T3.World.ticks >= particle.startTime) {
                particle.velocity.y = particle.velocity.y - T3.World.GRAVITY * delta;
                particle.y += particle.velocity.y * delta;
                particle.x += particle.velocity.x * delta;
                particle.z += particle.velocity.z * delta;
            }
            if (particle.y < me.minHeight) {
                me.particleReset(particle);
            }
        }
    };

    Water.prototype.particleReset = function (particle, config) {
        var me = this;
        $.extend(particle, {
            velocity: new THREE.Vector3(me.xSpeed, me.ySpeed, me.zSpeed),
            startTime: T3.World.ticks,
            x: 0,
            y: 0,
            z: 0
        }, config);
    };

    T3.model.Water = Water;

})();