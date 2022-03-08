import * as THREE from 'three';
import { World } from 'world';
import { loadMesh } from 'loadMesh';
import { BoidController } from 'boidController';
import { GUI } from 'gui';

let ocean;          // World container
let fishMesh;       // Loaded Fish Mesh
let boids1, boids2; // Swarms

// Options
const maxBoids = 500; // Change Boid Instances
const debug = { boundingBox: true };

//
// Initialize:
//  World
//    Scene
//    Camera
//    Light
//    Fog
//    Boundary
//    Renderer
//    Camera Controls
//  Ocean Floor
//  Load Model
//  Boid Controllers (2)
//    Boids
//      Boid Debug
//  GUI
//
async function Init() {
    // Create World
    ocean = new World(80, 40, 50);

    // Floor
    // ocean.scene.add(initFloor());

    // Tank
    const boundingBox = new THREE.Box3().setFromObject(ocean.boundary);
    const origin = boundingBox.min;
    const size = new THREE.Vector3();
    boundingBox.getSize(size);

    const mat = new THREE.MeshBasicMaterial( {color: 0x282A38 } );
    let geo = new THREE.BoxGeometry(size.x, 5, 2);
    const baseX = new THREE.Mesh( geo, mat );

    // Front
    const front = baseX.clone();
    front.position.set(origin.x + size.x/2, origin.y + 2, -origin.z);
    ocean.scene.add(front);

    // Back
    const back = baseX.clone();
    back.position.set(origin.x + size.x/2, origin.y + 2, +origin.z);
    ocean.scene.add(back);

    // Left
    geo = new THREE.BoxGeometry(2, 5, size.z + 2);
    const baseZ = new THREE.Mesh( geo, mat );
    const left = baseZ.clone();
    left.position.set(origin.x + size.x + 1, origin.y + 2, 0);
    ocean.scene.add(left);

    // Right
    const right = baseZ.clone();
    right.position.set(origin.x - 1, origin.y + 2, 0);
    ocean.scene.add(right);

    // Load Fish Mesh
    fishMesh = await initFishMesh();

    // Initalize Boids
    boids1 = new BoidController(ocean.scene, ocean.boundary, fishMesh.clone(), 0xeba0ce, maxBoids/2);
    boids1.name = "Fishes 1";
    boids1.spawn();

    fishMesh.scale.set(0.04, 0.04, 0.04);
    boids2 = new BoidController(ocean.scene, ocean.boundary, fishMesh.clone(), 0xa0ebbb, maxBoids/2);
    boids2.name = "Fishes 2";
    boids2.spawn();

    // GUI
    const gui = new GUI()
    gui.add(debug, "boundingBox");
    boids1.makeGui(gui);
    boids2.makeGui(gui);
    gui.hide();
}

//
// Animation loop, update objects, render, and loop
//
function Animate() {
    // Update Boids
    boids1.update();
    boids2.update();

    // Boundary
    if (debug.boundingBox) ocean.boundary.visible = true;
    else ocean.boundary.visible = false;

    // Render and Loop
    ocean.update(); // Render Scene
    requestAnimationFrame( Animate );
}

// Helper Functions ------------------------------------

//
// Initialize Ocean Floor
//
function initFloor() {
    const geo = new THREE.PlaneBufferGeometry(500, 500, 1, 1);
    const mat = new THREE.MeshBasicMaterial({ color: 0xebe4a0, side: THREE.DoubleSide });
    const p  = new THREE.Mesh(geo, mat);
    p.rotateX(- Math.PI/2);
    p.position.y = -20;

    return p;
}

//
// Initialize FishMesh to scene
//
async function initFishMesh() {
    const { fishMesh } = await loadMesh('../models/ucsc.glb');
    fishMesh.scale.set(0.1, 0.1, 0.1);
    return fishMesh;
}

window.addEventListener('DOMContentLoaded', async () => {
    await Init();
    Animate();
});
