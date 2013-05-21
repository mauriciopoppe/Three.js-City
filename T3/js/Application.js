/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/7/13
 * Time: 2:57 PM
 * To change this template use File | Settings | File Templates.
 */

/* GLOBALS:
 * THREE
 * Coordinates
 * THREEx.FullScreen
 * T3.ObjectManager
 */

T3.Application = {
    /**
     * Clock helper (its delta method is used to update the camera)
     */
    clock: new THREE.Clock(),
    /**
     * THREE.WebGL Renderer
     */
    renderer: null,
    /**
     * Instance of T3.controller.World
     */
    controller: null,
    /**
     * Stats instance
     */
    stats: null,
    /**
     * dat.GUI instance
     */
    datGUI: new dat.GUI(),
    /**
     * Crates the WebGL Renderer and binds the fullscreen key 'f'
     * @chainable
     */
    createRender: function () {
        var me = this;

        // init the renderer
        if( !Detector.webgl ) {
            Detector.addGetWebGLMessage();
        }
        me.renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        me.renderer.setClearColorHex( 0xAAAAAA, 1 );
        me.renderer.setSize( window.innerWidth, window.innerHeight );
        document.getElementById('webgl-container').appendChild(me.renderer.domElement);

        // allow 'f' to go fullscreen where this feature is supported
        if( THREEx.FullScreen.available() ){
            THREEx.FullScreen.bindKey();
        }

        return this;
    },

    /**
     * Creates the basic scene adding some fog and lights
     * @chainable
     */
    createScene: function () {
        // instantiate the scene (global)
        scene = new THREE.Scene();
        scene.fog = new THREE.Fog( 0x808080, 2000, 4000 );
        return this;
    },

    /**
     * Creates the lights used in the scene
     * @chainable
     */
    createSceneLights: function () {
        var light;

        light = new THREE.AmbientLight( 0x101010 );
        T3.ObjectManager.add('ambient-light', light);

        light = new THREE.DirectionalLight( 0xffffff, 1 );
        light.position.set(200, 400, 500);
        T3.ObjectManager.add('directional-light-1', light);

        light = new THREE.DirectionalLight( 0xffffff, 1 );
        light.position.set(-500, 250, -200);
        T3.ObjectManager.add('directional-light-2', light);

        //****** sphere + point light ******
        var colorLight = 0xffffff;

        light = new THREE.PointLight( 0xffffff, 1 );
        T3.ObjectManager.add('point-light', light);

        // light representation (little sphere)
        var sphereMesh, sphere;
        sphereMesh = new THREE.Mesh(
            new THREE.SphereGeometry( 100, 16, 8, 1 ),
            new THREE.MeshBasicMaterial( {color: colorLight} )
        );
        sphere = new T3.model.Object3D({
            name: 'sphere-light-point',
            real: sphereMesh,
            update: function () {
                typeof this.r !== "undefined" ? (this.r += 0.01) : (this.r = 0);
                this.real.position.x = 100 * Math.cos( this.r );
                this.real.position.z = 100 * Math.sin( this.r );
            }
        });
        sphere.real.scale.set(0.05, 0.05, 0.05);
        sphere.real.position = light.position;

        return this;
    },

    /**
     * Initializes the world controller
     * @chainable
     */
    initController: function () {
        var me = this;
        // keyboard controller
        T3.controller.Keyboard.init();

        // World
        me.world = new T3.controller.World({
            renderer: me.renderer,
            activeCamera: T3.ObjectManager.get('camera-main')
        });
        return this;
    },

    /**
     * Initializes the Stat helper
     * @chainable
     */
    initHelpers: function () {
        var me = this;
        // add Stats.js - https://github.com/mrdoob/stats.js
        me.stats = new Stats();
        me.stats.domElement.style.position	= 'absolute';
        me.stats.domElement.style.top	= '0px';
        document.body.appendChild( me.stats.domElement );
        return this;
    },

    /**
     * Animation loop (calls Application.render)
     */
    animate: function () {
        var me = this,
            delta = T3.Application.clock.getDelta();

        // loop on request animation loop
        // - it has to be at the beggining of the function
        // - see details at http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
        requestAnimationFrame( T3.Application.animate );

        // TODO: MOVE THIS TO THE CONTROLLER
        T3.Application.stats.update();

        // do the render
        T3.Application.world.update(delta);
        T3.Application.world.render();
    },

    /************** LAUNCHER *************/
    launch: function () {
        // init the world
        this.createRender()
            .createScene()
            .createSceneLights();

        this.initHelpers();

        // inits the world controller
        this.initController();

        // animate the world and the scene
        this.animate();
    }
};

/************** START THE APPLICATION **************/
(function () {
    T3.AssetLoader.debug();
    T3.AssetLoader
        .register('obj/Skyline.body.js', 'car-body-geometry')
        .register('obj/Skyline.exhaust.js', 'car-exhaust-geometry')
        .register('obj/Skyline.windows.js', 'car-windows-geometry')
        .register('obj/Skyline.lightsBack.js', 'car-lights-back-geometry')
        .register('obj/Skyline.lightsFront.js', 'car-lights-front-geometry')
        .register('obj/Skyline.tire.js', 'car-tire-geometry')
        .register('obj/Skyline.rim.js', 'car-rim-geometry')
        .register('obj/Skyline.interior.js', 'car-interior-geometry');
    T3.AssetLoader.load(T3.Application.launch, T3.Application);
})();