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
     * Stats instance
     */
    stats: null,
    /**
     * dat.GUI instance
     */
    datGUI: new dat.GUI(),
    /**
     * References to the coordinate helper objects
     * e.g.
     *      axes: THREE.Object3D(),
     *      ground: THREE.Mesh(),
     *      gridX: THREE.Mesh(),
     *      gridY: THREE.Mesh(),
     *      gridZ: THREE.Mesh()
     */
    coordinates: {},
    /**
     * dat.GUI true/false values used to determine the visibility
     * of each coordinate helper object
     */
    coordinatesGUI: null,

    /**
     * Crates the WebGL Renderer and binds the fullscreen key 'f'
     * @chainable
     */
    initialize: function () {
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
            document.getElementById('fullscreen').innerHTML	+= "Press <i>f</i> for fullscreen";
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

        light = { real: new THREE.AmbientLight( 0x101010 ) };
        T3.ObjectManager.addObject('ambient-light', light, true);

        light = { real: new THREE.DirectionalLight( 0xffffff, 1 ) };
        light.real.position.set(200, 400, 500);
        T3.ObjectManager.addObject('directional-light-1', light, true);

        light = { real: new THREE.DirectionalLight( 0xffffff, 1 ) };
        light.real.position.set(-500, 250, -200);
        T3.ObjectManager.addObject('directional-light-2', light, true);

        //****** sphere + point light ******
        var colorLight = 0xffffff;

        light = { real: new THREE.PointLight( 0xffffff, 1 ) };
        T3.ObjectManager.addObject('point-light', light, true);

        // light representation (little sphere)
        var sphereMesh, sphere;
        sphereMesh = new THREE.Mesh(
            new THREE.SphereGeometry( 100, 16, 8, 1 ),
            new THREE.MeshBasicMaterial( {color: colorLight} )
        );
        sphere = new T3.Object3D({
            name: 'sphere-light-point',
            real: sphereMesh,
            update: function () {
                typeof this.r !== "undefined" ? (this.r += 0.01) : (this.r = 0);
                this.real.position.x = 100 * Math.cos( this.r );
                this.real.position.z = 100 * Math.sin( this.r );
            }
        });
        sphere.real.scale.set(0.05, 0.05, 0.05);
        sphere.real.position = light.real.position;

        return this;
    },

    /**
     * Creates the cameras used in this application
     * @chainable
     */
    createCameras: function () {
        var me = this;

        var camera = new T3.Camera({
            name: 'camera-main',
            cameraPan: true,
            renderer: me.renderer,
            position: new THREE.Vector3( 10, 100, 150 )
        });
        return this;
    },


    /**
     * Creates a basic green cube
     * @chainable
     */
    createObjects: function () {

        // cube example
        new T3.Car({
            name: 'car-silver',
            folder: 'Silver Car',
            addToScene: false       // the mesh will be added manually after it's loaded
        });

//        new T3.Car({
//            folder: 'Gold Car',
//            name: 'car-gold',
//            ambient: '#3f3212',     // ambient
//            color: '#bf9a39',       // diffuse
//            specular: '#a08d5d',    // specular
//            shininess: 0.4 * 128,    // shininess
//            addToScene: false,       // the mesh will be added manually after it's loaded,
//            onLoad: function () {
//                this.real.position.z += 60;
//            }
//        });

        return this;
    },

    /**
     * Initializes the Stat helper
     * @chainable
     */
    initStats: function () {
        var me = this;
        // add Stats.js - https://github.com/mrdoob/stats.js
        me.stats = new Stats();
        me.stats.domElement.style.position	= 'absolute';
        me.stats.domElement.style.top	= '0px';
        document.body.appendChild( me.stats.domElement );
        return this;
    },

    /**
     * Initializes the dat.GUI helper adding some basic options to
     * the coordinates helpers
     * @chainable
     */
    initDatGui: function () {

        var me = this,
            effectController = {
                gridX: me.coordinatesGUI.gridX,
                gridY: me.coordinatesGUI.gridY,
                gridZ: me.coordinatesGUI.gridZ,
                ground: me.coordinatesGUI.ground,
                axes: me.coordinatesGUI.axes
            };

        var gui = me.datGUI,
            folder,
            property,
            object3d;

        folder = gui.addFolder('Grid display');
        folder.add(effectController, 'gridX').name('Show XZ grid').onFinishChange(function (value) {
            scene[value ? 'add' : 'remove'](me.coordinates.gridX);
        });
        folder.add(effectController, 'gridY').name('Show YZ grid').onFinishChange(function (value) {
            scene[value ? 'add' : 'remove'](me.coordinates.gridY);
        });
        folder.add(effectController, 'gridZ').name('Show XY grid').onFinishChange(function (value) {
            scene[value ? 'add' : 'remove'](me.coordinates.gridZ);
        });
        folder.add(effectController, 'ground').name('Show ground').onFinishChange(function (value) {
            scene[value ? 'add' : 'remove'](me.coordinates.ground);
        });
        folder.add(effectController, 'axes').name('Show axes').onFinishChange(function (value) {
            scene[value ? 'add' : 'remove'](me.coordinates.axes);
        });

        return this;
    },

    /**
     * Initializes the Coordinates helper, by default it draws the xyz-axes, a ground and
     * a grid in the XZ plane
     * @param [options]
     * @param {boolean} options.axes True to draw axes
     * @param {boolean} options.ground True to draw the ground
     * @param {boolean} options.gridX True to draw a grid in the XZ plane
     * @param {boolean} options.gridY True to draw a grid in the YZ plane
     * @param {boolean} options.gridZ True to draw a grid in the XY plane
     * @returns {*}
     */
    initCoordinates: function (options) {
        var me = this;
        me.coordinatesGUI = {
            axes: false,
            ground: false,
            gridX: false,
            gridY: false,
            gridZ: false
        };
        $.extend(me.coordinatesGUI, options);
        
        // add all coordinates helpers to the scene
        me.coordinates.ground = Coordinates.drawGround({size:10000});
        me.coordinates.gridX = Coordinates.drawGrid({size:10000,scale:0.01});
        me.coordinates.gridY = Coordinates.drawGrid({size:10000,scale:0.01, orientation:"y"});
        me.coordinates.gridZ = Coordinates.drawGrid({size:10000,scale:0.01, orientation:"z"});
        me.coordinates.axes = Coordinates.drawAllAxes({axisLength:100,axisRadius:1,axisTess:50});

        // remove objects depending on me.coordinatesGUI
        !me.coordinatesGUI.ground && scene.remove(me.coordinates.ground);
        !me.coordinatesGUI.gridX && scene.remove(me.coordinates.gridX);
        !me.coordinatesGUI.gridY && scene.remove(me.coordinates.gridY);
        !me.coordinatesGUI.gridZ && scene.remove(me.coordinates.gridZ);
        !me.coordinatesGUI.axes && scene.remove(me.coordinates.axes);

        return this;
    },

    /**
     * Animation loop (calls Application.render)
     */
    animate: function () {

        // loop on request animation loop
        // - it has to be at the begining of the function
        // - see details at http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
        requestAnimationFrame( T3.Application.animate );

        // do the render
        T3.Application.render();

        // update stats
        T3.Application.stats.update();
    },

    /**
     * Render loop
     */
    render: function () {
        var me = this,
            property,
            object3d,
            delta = me.clock.getDelta();

        // update all the objects in the scene
        for (property in T3.ObjectManager.objects) {
            if ( T3.ObjectManager.objects.hasOwnProperty(property) ) {
                object3d = T3.ObjectManager.objects[property];
                object3d.update && object3d.update(delta);
            }
        }

        // actually render the scene
        me.renderer.render( scene, T3.ObjectManager.getObject('camera-main').real );
    }
};

/************** START THE APPLICATION **************/
T3.Application
    .initialize()
    .createScene()
    .createSceneLights()
    .createCameras()
    .createObjects();

T3.Application
    .initStats()
    .initCoordinates({
        ground: true,
        gridX: true,
        axes: true
    })
    .initDatGui();

T3.Application.animate();