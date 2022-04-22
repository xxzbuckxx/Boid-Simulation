import * as THREE from 'three';

//
// A single Boid
//
export class Boid {

    public mesh: THREE.Mesh;

    // Direction
    private axis: THREE.Vector3;
    private vel: THREE.Vector3;

    // Boid Attributes
    public attributes: Attributes;

    constructor(x: number, y: number, z: number, mesh: THREE.Mesh) {
        // Create Mesh
        this.mesh = mesh;
        this.mesh.position.set(x, y, z);

        // Randomize velocity
        this.axis = new THREE.Vector3(0, 0, 1); // direction to face
        this.vel = new THREE.Vector3().randomDirection();

        // Boid Attribute Defaults
		this.attributes = {
			maxSpeed: 0, maxSpeedY: 0, field: 0, seperation: 0,
			cohesion: 0, alignment: 0, margin: 0, turnFactor: 0,
        }
    }

    //
    // Draw Boid to canvas
    //
    public update(boundary: THREE.LineSegments, boids: Array<Boid>) {
        if (this.attributes.maxSpeed == 0) return;

        this.sim(boids);
        this.limitSpeed();
        this.limitVelY();
        this.pushOnScreen(boundary);

        // Update positions
        this.mesh.position.add(this.vel);

        // Update direction
        const dir = this.vel.clone();
        // dir.setY(0); // lock on y plane
        dir.normalize();
        this.mesh.quaternion.setFromUnitVectors(this.axis, dir);
    }

    // Velocity Updaters ------------------------

    //
    // Performs all Velocity updates in one loop;
    // combination of this.avoidOthers, this.matchVelocity, and this.moveCenter
    //
    private sim(boids: Array<Boid>): void {
        let neighbors = 0;
        let match = new THREE.Vector3();
        let center = new THREE.Vector3();
        // this.pushDebug = this.vel.clone();
        for (let otherBoid of boids) {
            if (this.distance(otherBoid) >= this.attributes.field) continue;

            neighbors++;

            // Avoid Others (separation)
            if (otherBoid !== this && this.distance(otherBoid) < this.attributes.seperation) {
                let avoid = this.vel.clone().sub(otherBoid.vel)
                this.vel.addScaledVector(avoid, 2*this.attributes.maxSpeed/100*this.attributes.seperation); // apply avoid force
            }

            // Match (alignment)
            match.add(otherBoid.vel)

            // Center (cohesion)
            center.add(otherBoid.mesh.position);
        }

        // Apply Match Force
        match.add(this.vel);
        match.divideScalar(neighbors);
        this.vel.addScaledVector(match, 0.1*this.attributes.alignment);

        // Apply Center Force
        center.divideScalar(neighbors);
        center.sub(this.mesh.position);
        this.vel.addScaledVector(center, 0.1*this.attributes.cohesion/100);
    }

    // Screen Border Rules ------------------------------

    //
    // Push away from screen edge if within margin
    //
    // <++> TODO: Fix Boids leaving boundary
    // <++> TODO: make smoother
    private pushOnScreen(boundary: THREE.LineSegments) {
        const boundingBox = new THREE.Box3().setFromObject(boundary);
        const origin = boundingBox.min;
        const size = new THREE.Vector3();
        boundingBox.getSize(size);
        this.attributes.turnFactor = this.attributes.maxSpeed / 150; // Adjust turnFactor with speed

        // x component
        if (this.mesh.position.x < origin.x + this.attributes.margin)
            this.vel.x += this.attributes.turnFactor;
        else if (this.mesh.position.x > origin.x + size.x - this.attributes.margin)
            this.vel.x -= this.attributes.turnFactor;

        // y component
        if (this.mesh.position.y < origin.y + this.attributes.margin)
            this.vel.y += this.attributes.turnFactor;
        else if (this.mesh.position.y > origin.y + size.y - this.attributes.margin)
            this.vel.y -= this.attributes.turnFactor;

        // z component
        if (this.mesh.position.z < origin.z + this.attributes.margin)
            this.vel.z += this.attributes.turnFactor;
        else if (this.mesh.position.z > origin.z + size.z - this.attributes.margin)
            this.vel.z -= this.attributes.turnFactor;
    }

    // Helper Functions --------------------------------

    //
    // Calculate Distance from an object
    //
    private distance(other: Boid): number {
        return this.mesh.position.distanceTo(other.mesh.position);
    }

    //
    // Randomize X, Y, and Z position inside a given boundary
    //
    public randomLocation(boundary: THREE.LineSegments) {
        const boundingBox = new THREE.Box3().setFromObject(boundary);
        const origin = boundingBox.min;
        const size = new THREE.Vector3();
        boundingBox.getSize(size);

        const x = origin.x + Math.random() * size.x;
        const y = origin.y + Math.random() * size.y;
        const z = origin.z + Math.random() * size.z;
        this.mesh.position.set(x, y, z);
        this.vel.randomDirection();

        // Update direction
        const axis = new THREE.Vector3(0, 1, 0); // Top of mesh goes forward
        this.mesh.quaternion.setFromUnitVectors(axis, this.vel.clone().normalize());
    }

    // 
    // Bound speed to maxSpeed
    //
    private limitSpeed(): void {
        if (this.attributes.maxSpeed != 0)
            this.vel.clampLength(-this.attributes.maxSpeed/10, this.attributes.maxSpeed/10);
    }

    // 
    // Bound y velocity to maxZ
    //
    private limitVelY(): void {
		if (this.vel.clone().normalize().y > this.attributes.maxSpeedY)
			this.vel.setY(this.vel.y*this.attributes.maxSpeedY)
		if (this.vel.clone().normalize().y < -this.attributes.maxSpeedY)
			this.vel.setY(this.vel.y*-this.attributes.maxSpeedY)
    }

    // Debug Functions --------------------------------

    // 
    // Draw properties of Boid to DOM
    //
    public debug(): void {
        const debug = document.getElementById("debug");
        if (debug)
            debug.innerHTML =
                `<h3 style="text-align:center;text-decoration:underline">DEBUG</h3>
<p>Velocity: \<${this.vel.x.toFixed(3)}, ${this.vel.y.toFixed(3)}, ${this.vel.z.toFixed(3)}\></p>
<p>Speed: ${this.vel.length().toFixed(3)}</p>
<p>Position: \<${this.mesh.position.x.toFixed(3)}, ${this.mesh.position.y.toFixed(3)}, ${this.mesh.position.z.toFixed(3)}\></p>
`;
    }
}
