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
 */
var scene = {};

var Application = {
    /**
     * local reference to the global scene
     */
    scene: scene,               // reference to the scene
    /**
     * Clock helper (its delta method is used to update the camera)
     */
    clock: new THREE.Clock(),
    /**
     * THREE.WebGL Renderer
     */
    renderer: null,
    /**
     * THREE.PerspectiveCamera
     */
    camera: null,

    // extra
    /**
     * Stats helper
     */
    stats: null,
    /**
     * OrbitAndPanControls
     */
    cameraControls: null,
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
     * Map to each object that belong to this application, each object must have
     * a reference from here to the object itself
     */
    objects: {},

    mouseX: null,
    mouseY: null,

    meshGUI: {
        visible: true,

        // silver
//        ambient: '#313131',     // ambient
//        color: '#818181',       // diffuse
//        specular: '#818181',    // specular
//        shininess: 0.4 * 128    // shininess

        // gold
        ambient: '#3f3212',     // ambient
        color: '#bf9a39',       // diffuse
        specular: '#a08d5d',    // specular
        shininess: 0.4 * 128    // shininess
    },

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
            antialias: true,
            alpha: true
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
     * Creates the cameras used in this application
     * @param {Object} parameters
     * @param {boolean} parameters.cameraPan If set to true then an instance of OrbitAndPanControls is
     * created and referenced with Application.cemeraControls
     * @returns {*}
     */
    createCameras: function (parameters) {
        var me = this,
            canvasRatio = window.innerWidth / window.innerHeight;

        // put a camera in the scene
        me.camera = new THREE.PerspectiveCamera( 38, canvasRatio, 1, 10000 );
        me.camera.position.set( 10, 100, 150 );

        // transparently support window resize
        THREEx.WindowResize.bind(me.renderer, me.camera);

        // create a camera control
        if (parameters) {
            if (parameters.cameraPan) {
                me.cameraControls = new THREE.OrbitAndPanControls(me.camera, me.renderer.domElement);
                me.cameraControls.target.set(0, 0, 0);
            }
        }

        return this;
    },

    /**
     * Creates the basic scene adding some fog and lights
     * @chainable
     */
    createScene: function () {
        // create the scene
        scene = new THREE.Scene();
        scene.fog = new THREE.Fog( 0x808080, 2000, 4000 );

        return this;
    },

    createLights: function () {
        // create some lights to show lambert and phong material objects
        var ambientLight = new THREE.AmbientLight( 0x101010 );
        scene.add(ambientLight);

        var directionalLight;
        directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
        directionalLight.position.set(200, 400, 500);
        scene.add(directionalLight);

        directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
        directionalLight.position.set(-500, 250, -200);
        scene.add(directionalLight);


//        var colorLight = 0xffaa00;
        var colorLight = 0xffffff;

        var pointLight = new THREE.PointLight( colorLight );
        pointLight.position.set(0, 0, 0);
        scene.add(pointLight);

        // light representation (little sphere)
        var lightMesh;
        this.objects.lightMesh = lightMesh = new THREE.Mesh(
            new THREE.SphereGeometry( 100, 16, 8, 1 ),
            new THREE.MeshBasicMaterial( {color: colorLight} )
        );
        lightMesh.scale.set(0.05, 0.05, 0.05);
        lightMesh.position = pointLight.position;
        scene.add(lightMesh);

        return this;
    },

    /**
     * Creates a basic green cube
     * @chainable
     */
    createObjects: function () {
        var me = this;
        // BASIC MATERIALS:
        // THREE.MeshBasicMaterial() - (needs lighting)
        // THREE.MeshNormalMaterial() - normal material with default coloring on the faces

        // LIGHTS
        // THREE.PointLight - Affects objects using MeshLambertMaterial or MeshPhongMaterial.
        // THREE.DirectionalLight - creates a light pointing to the target

        // load model
        var loader = new THREE.JSONLoader(),
            addMesh = function ( geometry, scale, x, y, z, rx, ry, rz, material ) {
                var mesh = new THREE.Mesh( geometry, material );
                mesh.scale.set( scale, scale, scale );
                mesh.position.set( x, y, z );
                mesh.rotation.set( rx, ry, rz );
                me.mesh = mesh;
                console.log(mesh);
                scene.add( mesh );
            };

        loader.load('obj/Skyline.body.js', function (geometry) {
            // let's create just one model for now
            addMesh( geometry, 10, 0, 0, 0, 0, 0, 0, new THREE.MeshPhongMaterial({
                ambient: me.meshGUI.ambient,
                color: me.meshGUI.color,
                specular: me.meshGUI.specular,
                shininess: me.meshGUI.shininess
            }) );
        });
//        var cube = new THREE.Mesh(new THREE.CubeGeometry(10, 10, 10), new THREE.MeshNormalMaterial());
//        scene.add(cube);
//        console.log(cube);

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
                axes: me.coordinatesGUI.axes,

                meshVisible: me.meshGUI.visible,
                meshColor: me.meshGUI.color,
                meshSpecular: me.meshGUI.specular,
                meshAmbient: me.meshGUI.ambient,
                meshShininess: me.meshGUI.shininess
            };

        var gui = new dat.GUI(),
            folder;

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
        folder = gui.addFolder('Car');
        folder.add(effectController, 'meshVisible').name('Show car mesh').onFinishChange(function (value) {
            scene[value ? 'add' : 'remove'](me.mesh);
        });
        folder.addColor(effectController, 'meshColor').name('Car Color').onChange(function (value) {
            me.mesh.material.color.setHex(parseInt(value.substr(1), 16));
        });
        folder.addColor(effectController, 'meshSpecular').name('Car specular').onChange(function (value) {
            me.mesh.material.specular.setHex(parseInt(value.substr(1), 16));
        });
        folder.addColor(effectController, 'meshAmbient').name('Car ambient').onChange(function (value) {
            me.mesh.material.ambient.setHex(parseInt(value.substr(1), 16));
        });
        folder.add(effectController, 'meshShininess', 0, 128).name('Car shininess').onChange(function (value) {
            me.mesh.material.shininess = value;
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

    initAdditionalListeners: function () {
        var me = this;
        document.addEventListener('mousemove', me.onMouseMove, false);
        return this;
    },

    onMouseMove: function (event) {
        var me = Application;
        me.mouseX = event.clientX - window.innerWidth / 2;
        me.mouseY = event.clientY - window.innerHeight / 2;
    },

    /**
     * Animation loop (calls Application.render)
     */
    animate: function () {

        // loop on request animation loop
        // - it has to be at the begining of the function
        // - see details at http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
        requestAnimationFrame( Application.animate );

        // do the render
        Application.render();

        // update stats
        Application.stats.update();
    },

    r: 0,
    /**
     * Render loop
     */
    render: function () {
        var me = this,
            delta = me.clock.getDelta();

        // update camera controls
        if (me.cameraControls) {
            me.cameraControls.update(delta);
        } else {
            me.camera.position.x += ( me.mouseX - me.camera.position.x ) * .05;
            me.camera.position.y += ( - me.mouseY - me.camera.position.y ) * .05;
        }

        me.camera.lookAt( scene.position );

        me.objects.lightMesh.position.x = 100 * Math.cos( me.r );
        me.objects.lightMesh.position.z = 100 * Math.sin( me.r );

        me.r += 0.01;


        // actually render the scene
        me.renderer.render( scene, me.camera );
    }
};

/************** START THE APPLICATION **************/
Application
    .initialize()
    .createScene()
    .createLights()
    .createCameras({
        cameraPan: true
    })
    .createObjects();

Application
    .initStats()
    .initCoordinates({
        ground: true,
        gridX: true
    })
    .initDatGui()
    .initAdditionalListeners();

Application.animate();