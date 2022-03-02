import * as THREE from 'three';
import { BoidController } from 'boid';
import { TrackballControls } from 'trackballControls';
import { loadLogo } from 'loadLogo';
import { GUI } from 'gui';

// Options
const maxBoids = 500; // Change Boid Instances

// Global
let camera, scene, renderer;
let controls; // TrackballControls
let boundary;
let boids1, boids2;

//
// Initialize:
//    Scene
//    Camera
//    Bounding Box
//    Boids
//    Renderer
//    TrackballControls
//    Screen Resize EventHandler
//
function Init() {

    // Initalize Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10);
    camera.position.set(0, 0, 3.5);
    camera.lookAt(scene.position);

    // Light
    const light = new THREE.DirectionalLight('white', 8)
    light.position.set(3, 3, 3)
    scene.add(light)

    // Fog
    const near = 0;
    const far = 15;
    const color = 0x87ace8;  // black
    scene.background = new THREE.Color(color)
    scene.fog = new THREE.Fog(color, near, far);

    // Boundary
    const box = new THREE.BoxGeometry(8, 4, 5); 
    const geo = new THREE.EdgesGeometry( box ); // or WireframeGeometry( geometry )
    const mat = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 2 } );
    boundary = new THREE.LineSegments( geo, mat );
    scene.add(boundary); // Render

    // Floor
    const geoPlane= new THREE.PlaneBufferGeometry(2000, 2000, 8, 8);
    const matPlane = new THREE.MeshBasicMaterial({ color: 0xebe4a0, side: THREE.DoubleSide });
    const plane = new THREE.Mesh(geoPlane, matPlane);
    scene.add(plane);
    plane.rotateX(- Math.PI/2);
    plane.position.y = -2;

    // Initalize Boids
    boids1 = new BoidController(scene, boundary, 0xeba0ce, maxBoids/2);
    boids2 = new BoidController(scene, boundary, 0xa0ebbb, maxBoids/2);
    boids1.spawn();
    boids2.spawn();

    // Initalize Renderer
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Load Models
    // initLogo();

    // Trackball Camera Controls
    controls = new TrackballControls( camera, renderer.domElement);
    controls.target.set( 0, 0, 0 );

    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;

    controls.keys = [ 'KeyA', 'KeyS', 'KeyD' ];

    // GUI
    initGui();

    // Resize
    window.addEventListener('resize', onWindowResize);

    animate(); // Call animation loop
}

//
// Initalize Gui
//
function initGui() {
    const gui = new GUI()
    const b = [boids1, boids2];
    for (let i = 0; i < b.length; i++) {
        const boidFolder = gui.addFolder(`Boid ${i + 1} Parameters`);
        boidFolder.add(b[i], "randomLocation");

        boidFolder.addColor(b[i], "color");
        boidFolder.add(b[i], "maxSpeed", 0, 0.1);
        boidFolder.add(b[i], "maxSpeedY", 0, 0.1);
        boidFolder.add(b[i], "field", 0.00001, 3);

        const separationFolder = boidFolder.addFolder('Boid Separation');
        const alignmentFolder = boidFolder.addFolder('Boid Adhesion');
        const cohesionFolder = boidFolder.addFolder('Boid Cohesion');
        separationFolder.add(b[i], "minSeperation", 0, 1);
        separationFolder.add(b[i], "avoidFactor", 0, 1);
        alignmentFolder.add(b[i], "matchFactor", 0, 1);
        cohesionFolder.add(b[i], "centeringFactor", 0, 0.01);
    }
}

//
// Add Logo to scene
//
async function initLogo() {
    const { logo } = await loadLogo();
    logo.scale.set(0.01, 0.01, 0.01);
    logo.rotateX( Math.PI/2);
    scene.add(logo);
}

//
// Animation loop, update objects, render, and loop
//
function animate() {
    boids1.update();
    boids2.update();
    controls.update(); // Camera Trackball

    // Boundary
    // if (boids.debug)
    //     boundary.visible = true;
    // else
        boundary.visible = false;

    // Render and Loop
    renderer.render( scene, camera );
    requestAnimationFrame( animate );
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    controls.handleResize(); // Camera Trackball

    renderer.setSize( window.innerWidth, window.innerHeight );
}

window.addEventListener('DOMContentLoaded', () => {
    Init()
})
