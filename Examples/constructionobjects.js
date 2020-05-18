/*jshint esversion: 6 */
// @ts-check

// these four lines fake out TypeScript into thinking that THREE
// has the same type as the T.js module, so things work for type checking
// type inferencing figures out that THREE has the same type as T
// and then I have to use T (not THREE) to avoid the "UMD Module" warning
/**  @type typeof import("./THREE/threets/index"); */
let T;
// @ts-ignore
T = THREE;

import { GrObject } from "../Framework/GrObject.js";
import { GrCube } from "../Framework/SimpleObjects.js";
import * as Loaders from "../Framework/loaders.js";

function degreesToRadians(deg) {
	return deg * Math.PI / 180;
}

export class SkyScraper extends GrObject {
   
	constructor(params = {}) {
		let building = new T.Group();
		let t1 = new T.TextureLoader().load("./Pictures/skyscraper_texture.jpg");

		let material = new T.MeshStandardMaterial({
			map: t1,
			//    normalMap: t1,

		});
		let geometry = new T.BoxGeometry(100, 3000, 100);
		// let material = new T.MeshBasicMaterial({ color: "#77706a", metalness: 0.9, roughness: 0.7  });
		let cube = new T.Mesh(geometry, material);
		building.add(cube);

		super(`Building`, building,
			[
			]);

		this.whole_ob = building;
		this.whole_ob.position.x = params.x ? Number(params.x) : 0;
		this.whole_ob.position.y = params.y ? Number(params.y) : 0;
		this.whole_ob.position.z = params.z ? Number(params.z) : 0;
		let scale = params.size ? Number(params.size) : 1;
		building.scale.set(scale, scale, scale);
	}
	update(paramValues) {
		this.whole_ob.position.x = paramValues[0];
		this.whole_ob.position.z = paramValues[1];
		this.whole_ob.rotation.y = degreesToRadians(paramValues[2]);
	}
}
export class GrCrane extends GrObject {
    
	constructor(params = {}) {
		let crane = new T.Group();

		let exSettings = {
			steps: 2,
			depth: 0.5,
			bevelEnabled: false
		};

		// first, we define the base of the crane.
		// Just draw a curve for the shape, then use three's "ExtrudeGeometry"
		// to create the shape itself.
		/**@type THREE.Shape */
		let base_curve = new T.Shape();
		base_curve.moveTo(-0.5, 0);
		base_curve.lineTo(-0.5, 2);
		base_curve.lineTo(-0.25, 2.25);
		base_curve.lineTo(-0.25, 5);
		base_curve.lineTo(-0.2, 5);
		base_curve.lineTo(-0.2, 5.5);
		base_curve.lineTo(0.2, 5.5);
		base_curve.lineTo(0.2, 5);
		base_curve.lineTo(0.25, 5);
		base_curve.lineTo(0.25, 2.25);
		base_curve.lineTo(0.5, 2);
		base_curve.lineTo(0.5, 0);
		base_curve.lineTo(-0.5, 0);
		let base_geom = new T.ExtrudeGeometry(base_curve, exSettings);
		let crane_mat = new T.MeshStandardMaterial({ color: "yellow", metalness: 0.5, roughness: 0.7 });
		let base = new T.Mesh(base_geom, crane_mat);
		crane.add(base);
		base.translateZ(-0.25);

		// Use a similar process to create the cross-arm.
		// Note, we create a group for the arm, and move it to the proper position.
		// This ensures rotations will behave nicely,
		// and we just have that one point to work with for animation/sliders.
		let arm_group = new T.Group();
		crane.add(arm_group);
		arm_group.translateY(4.5);
		let arm_curve = new T.Shape();
		arm_curve.moveTo(-1.5, 0);
		arm_curve.lineTo(-1.5, 0.25);
		arm_curve.lineTo(-0.5, 0.5);
		arm_curve.lineTo(4, 0.4);
		arm_curve.lineTo(4, 0);
		arm_curve.lineTo(-1.5, 0);
		let arm_geom = new T.ExtrudeGeometry(arm_curve, exSettings);
		let arm = new T.Mesh(arm_geom, crane_mat);
		arm_group.add(arm);
		arm.translateZ(-0.25);

		// Finally, add the hanging "wire" for the crane arm,
		// which is what carries materials in a real crane.
		// The extrusion makes this not look very wire-like, but that's fine for what we're doing.
		let wire_group = new T.Group();
		arm_group.add(wire_group);
		wire_group.translateX(3);
		let wire_curve = new T.Shape();
		wire_curve.moveTo(-0.25, 0);
		wire_curve.lineTo(-0.25, -0.25);
		wire_curve.lineTo(-0.05, -0.3);
		wire_curve.lineTo(-0.05, -3);
		wire_curve.lineTo(0.05, -3);
		wire_curve.lineTo(0.05, -0.3);
		wire_curve.lineTo(0.25, -0.25);
		wire_curve.lineTo(0.25, 0);
		wire_curve.lineTo(-0.25, 0);
		let wire_geom = new T.ExtrudeGeometry(wire_curve, exSettings);
		let wire_mat = new T.MeshStandardMaterial({ color: "#888888", metalness: 0.6, roughness: 0.3 });
		let wire = new T.Mesh(wire_geom, wire_mat);
		wire_group.add(wire);
		wire.translateZ(-0.25);

		// note that we have to make the Object3D before we can call
		// super and we have to call super before we can use this
		// This is also where we define parameters for UI sliders.
		// These have format "name," "min", "max", "starting value."
		// Sliders are standardized to have 30 "steps" per slider,
		// so if your starting value does not fall on one of the 30 steps,
		// the starting value in the UI may be slightly different from the starting value you gave.
		super(`Crane`, crane,
			[['x', -4, 4, 0],
			['z', -4, 4, 0],
			['theta', 0, 360, 0],
			['wire', 1, 3.5, 2],
			['arm rotation', 0, 360, 0]
			]);
		// Here, we store the crane, arm, and wire groups as part of the "GrCrane" object.
		// This allows us to modify transforms as part of the update function.
		this.whole_ob = crane;
		this.arm = arm_group;
		this.wire = wire_group;

		// put the object in its place
		this.whole_ob.position.x = params.x ? Number(params.x) : 0;
		this.whole_ob.position.y = params.y ? Number(params.y) : 0;
		this.whole_ob.position.z = params.z ? Number(params.z) : 0;
		let scale = params.size ? Number(params.size) : 1;
		crane.scale.set(scale, scale, scale);

	}

	// Wire up the wire position and arm rotation to match parameters,
	// given in the call to "super" above.
	update(paramValues) {
		this.whole_ob.position.x = paramValues[0];
		this.whole_ob.position.z = paramValues[1];
		this.whole_ob.rotation.y = degreesToRadians(paramValues[2]);
		this.wire.position.x = paramValues[3];
		this.arm.rotation.y = degreesToRadians(paramValues[4]);
	}
}
export class GrExcavator extends GrObject {
    
	constructor(params = {}) {
		let excavator = new T.Group();

		let exSettings = {
			steps: 2,
			depth: 0.4,
			bevelEnabled: true,
			bevelThickness: 0.2,
			bevelSize: 0.1,
			bevelSegments: 2
		};

		// As with the crane, we define the base (treads) of the excavator.
		// We draw a line, then extrude the line with ExtrudeGeometry,
		// to get the "cutout" style object.
		// Note, for this object, we translate each piece by 0.25 on the negative x-axis.
		// This makes rotation about the y-axis work nicely
		// (since the extrusion happens along +z, a y-rotation goes around an axis on the back face of the piece,
		//  rather than an axis through the center of the piece).
		/**@type THREE.Shape */
		let base_curve = new T.Shape();
		base_curve.moveTo(-1, 0);
		base_curve.lineTo(-1.2, 0.2);
		base_curve.lineTo(-1.2, 0.4);
		base_curve.lineTo(-1, 0.6);
		base_curve.lineTo(1, 0.6);
		base_curve.lineTo(1.2, 0.4);
		base_curve.lineTo(1.2, 0.2);
		base_curve.lineTo(1, 0);
		base_curve.lineTo(-1, 0);
		let base_geom = new T.ExtrudeGeometry(base_curve, exSettings);
		let excavator_mat = new T.MeshStandardMaterial({ color: "yellow", metalness: 0.5, roughness: 0.7 });
		let base = new T.Mesh(base_geom, excavator_mat);
		excavator.add(base);
		base.translateZ(-0.2);

		// We'll add the "pedestal" piece for the cab of the excavator to sit on.
		// It can be considered a part of the treads, to some extent,
		// so it doesn't need a group of its own.
		let pedestal_curve = new T.Shape();
		pedestal_curve.moveTo(-0.35, 0);
		pedestal_curve.lineTo(-0.35, 0.25);
		pedestal_curve.lineTo(0.35, 0.25);
		pedestal_curve.lineTo(0.35, 0);
		pedestal_curve.lineTo(-0.35, 0);
		let pedestal_geom = new T.ExtrudeGeometry(pedestal_curve, exSettings);
		let pedestal = new T.Mesh(pedestal_geom, excavator_mat);
		excavator.add(pedestal);
		pedestal.translateY(0.6);
		pedestal.translateZ(-0.2);

		// For the cab, we create a new group, since the cab should be able to spin on the pedestal.
		let cab_group = new T.Group();
		excavator.add(cab_group);
		cab_group.translateY(0.7);
		let cab_curve = new T.Shape();
		cab_curve.moveTo(-1, 0);
		cab_curve.lineTo(1, 0);
		cab_curve.lineTo(1.2, 0.35);
		cab_curve.lineTo(1, 0.75);
		cab_curve.lineTo(0.25, 0.75);
		cab_curve.lineTo(0, 1.5);
		cab_curve.lineTo(-0.8, 1.5);
		cab_curve.lineTo(-1, 1.2);
		cab_curve.lineTo(-1, 0);
		let cab_geom = new T.ExtrudeGeometry(cab_curve, exSettings);
		let cab = new T.Mesh(cab_geom, excavator_mat);
		cab_group.add(cab);
		cab.translateZ(-0.2);

		// Next up is the first part of the bucket arm.
		// In general, each piece is just a series of line segments,
		// plus a bit of extra to get the geometry built and put into a group.
		// We always treat the group as the "pivot point" around which the object should rotate.
		// It is helpful to draw the lines for extrusion with the zero at our desired "pivot point."
		// This minimizes the fiddling needed to get the piece placed correctly relative to its parent's origin.
		// The remaining few pieces are very similar to the arm piece.
		let arm_group = new T.Group();
		cab_group.add(arm_group);
		arm_group.position.set(-0.8, 0.5, 0);
		let arm_curve = new T.Shape();
		arm_curve.moveTo(-2.25, 0);
		arm_curve.lineTo(-2.35, 0.15);
		arm_curve.lineTo(-1, 0.5);
		arm_curve.lineTo(0, 0.25);
		arm_curve.lineTo(-0.2, 0);
		arm_curve.lineTo(-1, 0.3);
		arm_curve.lineTo(-2.25, 0);
		let arm_geom = new T.ExtrudeGeometry(arm_curve, exSettings);
		let arm_mat = new T.MeshStandardMaterial({ color: "#888888", metalness: 0.6, roughness: 0.3 });
		let arm = new T.Mesh(arm_geom, arm_mat);
		arm_group.add(arm);
		arm.translateZ(-0.2);

		let forearm_group = new T.Group();
		arm_group.add(forearm_group);
		forearm_group.position.set(-2.1, 0, 0);
		let forearm_curve = new T.Shape();
		forearm_curve.moveTo(-1.5, 0);
		forearm_curve.lineTo(-1.5, 0.1);
		forearm_curve.lineTo(0, 0.15);
		forearm_curve.lineTo(0.15, 0);
		forearm_curve.lineTo(-1.5, 0);
		let forearm_geom = new T.ExtrudeGeometry(forearm_curve, exSettings);
		let forearm = new T.Mesh(forearm_geom, arm_mat);
		forearm_group.add(forearm);
		forearm.translateZ(-0.2);

		let bucket_group = new T.Group();
		forearm_group.add(bucket_group);
		bucket_group.position.set(-1.4, 0, 0);
		let bucket_curve = new T.Shape();
		bucket_curve.moveTo(-0.25, -0.9);
		bucket_curve.lineTo(-0.5, -0.5);
		bucket_curve.lineTo(-0.45, -0.3);
		bucket_curve.lineTo(-0.3, -0.2);
		bucket_curve.lineTo(-0.15, 0);
		bucket_curve.lineTo(0.1, 0);
		bucket_curve.lineTo(0.05, -0.2);
		bucket_curve.lineTo(0.5, -0.7);
		bucket_curve.lineTo(-0.25, -0.9);
		let bucket_geom = new T.ExtrudeGeometry(bucket_curve, exSettings);
		let bucket = new T.Mesh(bucket_geom, arm_mat);
		bucket_group.add(bucket);
		bucket.translateZ(-0.2);

		// note that we have to make the Object3D before we can call
		// super and we have to call super before we can use this
		// The parameters for sliders are also defined here.
		super(`Excavator`, excavator,
			[['x', -10, 10, 0],
			['z', -10, 10, 0],
			['theta', 0, 360, 0],
			['spin', 0, 360, 0],
			['arm rotate', 0, 50, 45],
			['forearm rotate', 0, 90, 45],
			['bucket rotate', -90, 45, 0]
			]);
		// As with the crane, we save the "excavator" group as the "whole object" of the GrExcavator class.
		// We also save the groups of each object that may be manipulated by the UI.
		this.whole_ob = excavator;
		this.cab = cab_group;
		this.arm = arm_group;
		this.forearm = forearm_group;
		this.bucket = bucket_group;

		// put the object in its place
		this.whole_ob.position.x = params.x ? Number(params.x) : 0;
		this.whole_ob.position.y = params.y ? Number(params.y) : 0;
		this.whole_ob.position.z = params.z ? Number(params.z) : 0;
		let scale = params.size ? Number(params.size) : 1;
		excavator.scale.set(scale, scale, scale);

	}

	// As with the crane, we wire up each saved group with the appropriate parameter defined in the "super" call.
	// Note, with the forearm, there is an extra bit of rotation added, which allows us to create a rotation offset,
	// while maintaining a nice 0-90 range for the slider itself.
	update(paramValues) {
		this.whole_ob.position.x = paramValues[0];
		this.whole_ob.position.z = paramValues[1];
		this.whole_ob.rotation.y = degreesToRadians(paramValues[2]);
		this.cab.rotation.y = degreesToRadians(paramValues[3]);
		this.arm.rotation.z = degreesToRadians(-paramValues[4]);
		this.forearm.rotation.z = degreesToRadians(paramValues[5]) + Math.PI / 16;
		this.bucket.rotation.z = degreesToRadians(paramValues[6]);
	}
}

export class GrGarbageTruck extends GrObject {

	constructor(params = {}) {

		let garbageTrunk = new T.Group();
		let rotateTrunk = new T.Group();
		garbageTrunk.add(rotateTrunk);
		// trunk
		let length = 3, width = 4;
		let shape = new T.Shape();
		shape.moveTo(0, 0);
		shape.lineTo(0, width);
		shape.lineTo(length, width);
		shape.lineTo(length, 0);
		shape.lineTo(0, 0);
		let extrudeSettings = {
			steps: 10,
			depth: 10,
			bevelEnabled: true,
			bevelThickness: 5,
			bevelSize: 3,
			bevelSegments: 5
		};
		let trunk_geometry = new T.ExtrudeGeometry(shape, extrudeSettings);
		let trunk_mat = new T.MeshStandardMaterial({ color: "red", metalness: 0.6, roughness: 0.3 });
		let trunk = new T.Mesh(trunk_geometry, trunk_mat);
		trunk_geometry.scale(0.2, 0.2, 0.2);
		trunk.position.set(-0.3, 1.7, 0.3);
		trunk.translateZ(-0.5);
		rotateTrunk.add(trunk);
		// trunk_mesh.translateZ(-0.25);

		let length1 = 16, width1 = 12;
		let shape1 = new T.Shape();
		shape1.moveTo(0, 0);
		shape1.lineTo(0, width1);
		shape1.lineTo(length1, width1);
		shape1.lineTo(length1, 0);
		shape1.lineTo(0, 0);

		let extrudeSettings1 = {
			steps: 1,
			depth: 15,
			bevelEnabled: true,
			bevelThickness: 5,
			bevelSize: 3,
			bevelSegments: 5
		};


		let head_geometry = new T.ExtrudeGeometry(shape1, extrudeSettings1);
		let head_material = new T.MeshStandardMaterial({ color: "#888888", metalness: 0.6, roughness: 0.3 });
		let head_mesh = new T.Mesh(head_geometry, head_material);
		head_geometry.scale(0.08, 0.08, 0.08);
		head_mesh.position.set(-0.7, 1.2, -2.3);
		head_mesh.translateZ(-0.5);
		garbageTrunk.add(head_mesh);


		let plane_geometry = new T.BoxGeometry(0.1, 2, 4);
		let plane_material = new T.MeshStandardMaterial({ color: "#888888", metalness: 0.6, roughness: 0.3 });
		let plane = new T.Mesh(plane_geometry, plane_material);
		plane.rotateZ(Math.PI / 2);
		plane.position.set(0, 1, 0.3);
		rotateTrunk.add(plane);
		let tires = new T.Group();

		let tire_geo1 = new T.CylinderGeometry(0.5, 0.5, 0.2, 64, 1);
		let tire_mat1 = new T.MeshBasicMaterial({ color: "black" });
		let tire_mesh1 = new T.Mesh(tire_geo1, tire_mat1);
		// tire_geo1.scale(0.5, 0.5, 0.5);
		tire_mesh1.rotateZ(Math.PI / 2);
		tire_mesh1.position.set(1, 0.5, 1);
		tires.add(tire_mesh1);

		let tire_geo2 = new T.CylinderGeometry(0.5, 0.5, 0.2, 64, 1);
		let tire_mat2 = new T.MeshBasicMaterial({ color: "black" });
		let tire_mesh2 = new T.Mesh(tire_geo2, tire_mat2);
		// tire_geo2.scale(0.5, 0.5, 0.5);
		tire_mesh2.rotateZ(Math.PI / 2);
		tire_mesh2.position.set(-1, 0.5, 1);
		tires.add(tire_mesh2);

		let tire_geo3 = new T.CylinderGeometry(0.5, 0.5, 0.2, 64, 1);
		let tire_mat3 = new T.MeshBasicMaterial({ color: "black" });
		let tire_mesh3 = new T.Mesh(tire_geo3, tire_mat3);
		// tire_geo3.scale(0.5, 0.5, 0.5);
		tire_mesh3.rotateZ(Math.PI / 2);
		tire_mesh3.position.set(1, 0.5, -1);
		tires.add(tire_mesh3);

		let tire_geo4 = new T.CylinderGeometry(0.5, 0.5, 0.2, 64, 1);
		let tire_mat4 = new T.MeshBasicMaterial({ color: "black" });
		let tire_mesh4 = new T.Mesh(tire_geo4, tire_mat4);
		// tire_geo4.scale(0.5, 0.5, 0.5);
		tire_mesh4.rotateZ(Math.PI / 2);
		tire_mesh4.position.set(-1, 0.5, -1);
		tires.add(tire_mesh4);

		garbageTrunk.add(tires);

		super(`Garbage Truck`, garbageTrunk,
			[['x', -10, 10, 0],
			['z', -10, 10, 0],
			['theta', 0, 360, 0],
			['tilt', 0, 20, 0],
			['good slip', 0, 2.5, 0],
				// ['forearm rotate',0,90,45],
				// ['bucket rotate',-90,45,0]
			]);

		this.trunk_rotate = rotateTrunk;
		this.trunk_slip = trunk;

		this.whole_ob = garbageTrunk;
		this.whole_ob.position.x = params.x ? Number(params.x) : 0;
		this.whole_ob.position.y = params.y ? Number(params.y) : 0;
		this.whole_ob.position.z = params.z ? Number(params.z) : 0;
		let scale = params.size ? Number(params.size) : 1;
		garbageTrunk.scale.set(scale, scale, scale);
	}
	update(paramValues) {
		this.whole_ob.position.x = paramValues[0];
		this.whole_ob.position.z = paramValues[1];
		this.whole_ob.rotation.y = degreesToRadians(paramValues[2]);
		this.trunk_rotate.rotation.x = degreesToRadians(paramValues[3]);
		this.trunk_slip.position.z = paramValues[4];

	}

}

export class GrForkLift extends GrObject {

	constructor(params = {}) {

		let forkLift = new T.Group();
		// base
		let exSettings = {
			steps: 2,
			depth: 2,
			bevelEnabled: false
		};
		let base_curve = new T.Shape();
		base_curve.moveTo(-1, 1);
		base_curve.lineTo(-1, 2.9 / 3);
		base_curve.lineTo(0, 0.7);
		base_curve.lineTo(0.4 / 3, 0.7 / 3);
		base_curve.lineTo(4 / 3, 0.7 / 3);
		base_curve.lineTo(5 / 3, 0.7);
		base_curve.lineTo(2, 0.7);
		base_curve.lineTo(6.1 / 3, 1);
		base_curve.lineTo(5.8 / 3, 3.5 / 3);
		base_curve.lineTo(4.8 / 3, 3.5 / 3);
		base_curve.lineTo(5 / 3, 1);
		base_curve.lineTo(0, 2.9 / 3);

		let base_geom = new T.ExtrudeGeometry(base_curve, exSettings);
		let base_mat = new T.MeshStandardMaterial({ color: "yellow", metalness: 0.5, roughness: 0.7 });
		let base = new T.Mesh(base_geom, base_mat);
		base.translateZ(-1);
		base.translateX(-0.8);
		base.translateY(0.08);
		forkLift.add(base);

		//top
		let top_curve = new T.Shape();
		top_curve.moveTo(-2 / 3, 1);
		top_curve.lineTo(-0.6, 4 / 3);
		top_curve.lineTo(-1.1 / 3, 4 / 3);
		top_curve.lineTo(-0.5 / 3, 8.2 / 3);
		top_curve.lineTo(-1 / 3, 8.2 / 3);
		top_curve.lineTo(-1 / 3, 8.5 / 3);
		top_curve.lineTo(6.2 / 3, 8.5 / 3);
		top_curve.lineTo(6.2 / 3, 8.2 / 3);
		top_curve.lineTo(4 / 3, 8.2 / 3);
		top_curve.lineTo(4 / 3, 1);
		top_curve.lineTo(3.7 / 3, 1);
		top_curve.lineTo(3.7 / 3, 8.2 / 3);
		top_curve.lineTo(0, 8.2 / 3);
		top_curve.lineTo(-1 / 3, 1);

		let top_geom = new T.ExtrudeGeometry(top_curve, exSettings);
		let top_mat = new T.MeshStandardMaterial({ color: "yellow", metalness: 0.5, roughness: 0.7 });
		let top = new T.Mesh(top_geom, top_mat);
		top.translateZ(-1);
		top.translateX(-0.8);
		top.translateY(0.08);
		forkLift.add(top);

		let stick_car_geometry1 = new T.BoxGeometry(0.2, 3.5, 0.2);
		let stick_car_material1 = new T.MeshStandardMaterial({ color: "yellow", metalness: 0.5, roughness: 0.7 });
		let stick_car1 = new T.Mesh(stick_car_geometry1, stick_car_material1);
		stick_car1.translateZ(0.8);
		stick_car1.translateX(-1.7);
		stick_car1.translateY(2);
		stick_car1.rotateZ(-Math.PI / 40);
		forkLift.add(stick_car1);

		let stick_car_geometry2 = new T.BoxGeometry(0.2, 3.5, 0.2);
		let stick_car_material2 = new T.MeshStandardMaterial({ color: "yellow", metalness: 0.5, roughness: 0.7 });
		let stick_car2 = new T.Mesh(stick_car_geometry2, stick_car_material2);

		stick_car2.translateZ(-0.8);
		stick_car2.translateX(-1.7);
		stick_car2.translateY(2);
		stick_car2.rotateZ(-Math.PI / 40);
		forkLift.add(stick_car2);

		//fork
		let fork = new T.Group();
		fork.position.set(0.2, 0, 0);
		let stick_geometry1 = new T.BoxGeometry(0.2, 3, 0.2);
		let stick_material1 = new T.MeshStandardMaterial({ color: "white", metalness: 0.5, roughness: 0.7 });
		let stick1 = new T.Mesh(stick_geometry1, stick_material1);
		stick1.translateZ(0.6);
		stick1.translateX(-2);
		stick1.translateY(2);
		fork.add(stick1);

		let stick_geometry2 = new T.BoxGeometry(0.2, 3, 0.2);
		let stick_material2 = new T.MeshStandardMaterial({ color: "white", metalness: 0.5, roughness: 0.7 });
		let stick2 = new T.Mesh(stick_geometry2, stick_material2);

		stick2.translateZ(-0.6);
		stick2.translateX(-2);
		stick2.translateY(2);
		fork.add(stick2);

		let rotatelift = new T.Group();
		rotatelift.position.set(-2, 0.6, 0);

		let stick_geometry3 = new T.BoxGeometry(1, 0.2, 0.2);
		let stick_material3 = new T.MeshStandardMaterial({ color: "white", metalness: 0.5, roughness: 0.7 });
		let stick3 = new T.Mesh(stick_geometry3, stick_material3);
		// stick3.position.set(-2.5, 0.6, 0.5);
		stick3.translateZ(0.4);
		stick3.translateX(-0.5);
		// stick3.translateY(0.6);


		let stick_geometry4 = new T.BoxGeometry(1, 0.2, 0.2);
		let stick_material4 = new T.MeshStandardMaterial({ color: "white", metalness: 0.5, roughness: 0.7 });
		let stick4 = new T.Mesh(stick_geometry4, stick_material4);
		stick4.translateZ(-0.4);
		stick4.translateX(-0.5);
		// stick4.translateY(0.6);

		let stick_geometry5 = new T.BoxGeometry(0.2, 0.2, 1);
		let stick_material5 = new T.MeshStandardMaterial({ color: "white", metalness: 0.5, roughness: 0.7 });
		let stick5 = new T.Mesh(stick_geometry5, stick_material5);
		// stick5.translateZ(0.5);
		stick5.translateX(-0.7);
		// stick5.translateY(0.6);

		rotatelift.add(stick3);
		rotatelift.add(stick4);
		rotatelift.add(stick5);
		// rotatelift.rotateZ(Math.PI/2);

		fork.add(rotatelift);
		forkLift.add(fork);

		let tires = new T.Group();

		let tire_geo1 = new T.CylinderGeometry(0.3, 0.3, 0.2, 64, 1);
		let tire_mat1 = new T.MeshBasicMaterial({ color: "black" });
		let tire_mesh1 = new T.Mesh(tire_geo1, tire_mat1);
		// tire_geo1.scale(0.5, 0.5, 0.5);
		tire_mesh1.rotateZ(Math.PI / 2);
		tire_mesh1.position.set(1, 0.5, 1);
		tires.add(tire_mesh1);

		let tire_geo2 = new T.CylinderGeometry(0.3, 0.3, 0.2, 64, 1);
		let tire_mat2 = new T.MeshBasicMaterial({ color: "black" });
		let tire_mesh2 = new T.Mesh(tire_geo2, tire_mat2);
		// tire_geo2.scale(0.5, 0.5, 0.5);
		tire_mesh2.rotateZ(Math.PI / 2);
		tire_mesh2.position.set(-1, 0.5, 1);
		tires.add(tire_mesh2);

		let tire_geo3 = new T.CylinderGeometry(0.3, 0.3, 0.2, 64, 1);
		let tire_mat3 = new T.MeshBasicMaterial({ color: "black" });
		let tire_mesh3 = new T.Mesh(tire_geo3, tire_mat3);
		// tire_geo3.scale(0.5, 0.5, 0.5);
		tire_mesh3.rotateZ(Math.PI / 2);
		tire_mesh3.position.set(1, 0.5, -1);
		tires.add(tire_mesh3);

		let tire_geo4 = new T.CylinderGeometry(0.3, 0.3, 0.2, 64, 1);
		let tire_mat4 = new T.MeshBasicMaterial({ color: "black" });
		let tire_mesh4 = new T.Mesh(tire_geo4, tire_mat4);
		// tire_geo4.scale(0.5, 0.5, 0.5);
		tire_mesh4.rotateZ(Math.PI / 2);
		tire_mesh4.position.set(-1, 0.5, -1);
		tires.add(tire_mesh4);
		tires.rotateY(Math.PI / 2);
		forkLift.add(tires);

		super(`Fork Lift`, forkLift,
			[['x', -10, 10, 0],
			['z', -10, 10, 0],
			['theta', 0, 360, 0],
			['lift fork', 0, 3, 0],
			['arm rotate', -90, 0, 0],
				// ['forearm rotate',0,90,45],
				// ['bucket rotate',-90,45,0]
			]);

		this.rotate = rotatelift;
		this.fork = fork;
		this.whole_ob = forkLift;
		this.whole_ob.position.x = params.x ? Number(params.x) : 0;
		this.whole_ob.position.y = params.y ? Number(params.y) : 0;
		this.whole_ob.position.z = params.z ? Number(params.z) : 0;
		let scale = params.size ? Number(params.size) : 1;
		forkLift.scale.set(scale, scale, scale);
	}
	update(paramValues) {
		this.whole_ob.position.x = paramValues[0];
		this.whole_ob.position.z = paramValues[1];
		this.whole_ob.rotation.y = degreesToRadians(paramValues[2]);
		this.fork.position.y = paramValues[3];
		this.rotate.rotation.z = degreesToRadians(paramValues[4]);
	}

}

export class House_1 extends GrObject {
	constructor() {


		let geometry = new T.Geometry();
		//
		geometry.vertices.push(new T.Vector3(0, 2, 0)); // 0
		geometry.vertices.push(new T.Vector3(-1, 1, -1)); // 1
		geometry.vertices.push(new T.Vector3(1, 1, -1)); // 2
		geometry.vertices.push(new T.Vector3(1, 1, 1)); // 3
		geometry.vertices.push(new T.Vector3(-1, 1, 1)); // 4
		//

		geometry.faceVertexUvs = [[]];
		// right
		let f1 = new T.Face3(3, 2, 0);
		geometry.faces.push(f1);
		geometry.faceVertexUvs[0].push([new T.Vector2(0, 0), new T.Vector2(1, 0), new T.Vector2(1 / 2, 1 / 2)]);
		// back
		let f2 = new T.Face3(2, 1, 0);
		geometry.faces.push(f2);
		geometry.faceVertexUvs[0].push([new T.Vector2(0, 0), new T.Vector2(1, 0), new T.Vector2(1 / 2, 1 / 2)]);
		// left
		let f3 = new T.Face3(1, 4, 0);
		geometry.faces.push(f3);
		geometry.faceVertexUvs[0].push([new T.Vector2(0, 0), new T.Vector2(1, 0), new T.Vector2(1 / 2, 1 / 2)]);
		// front
		let f4 = new T.Face3(4, 3, 0);
		geometry.faces.push(f4);
		geometry.faceVertexUvs[0].push([new T.Vector2(0, 0), new T.Vector2(1, 0), new T.Vector2(1 / 2, 1 / 2)]);

		geometry.computeFaceNormals();
		geometry.uvsNeedUpdate = true;

		let geometry2 = new T.Geometry();

		geometry2.vertices.push(new T.Vector3(-1, 1, 1)); // 0
		geometry2.vertices.push(new T.Vector3(1, 1, 1)); // 1
		geometry2.vertices.push(new T.Vector3(1, 0, 1)); // 2
		geometry2.vertices.push(new T.Vector3(-1, 0, 1)); // 3

		geometry2.faceVertexUvs = [[]];
		let f1_2 = new T.Face3(2, 1, 3);
		geometry2.faces.push(f1_2);
		geometry2.faceVertexUvs[0].push([new T.Vector2(1, 0), new T.Vector2(1, 1), new T.Vector2(0, 0)]);

		let f2_2 = new T.Face3(1, 0, 3);
		geometry2.faces.push(f2_2);
		geometry2.faceVertexUvs[0].push([new T.Vector2(1, 1), new T.Vector2(0, 1), new T.Vector2(0, 0)]);

		geometry2.computeFaceNormals();
		geometry2.uvsNeedUpdate = true;

		let cube_geometry = new T.BoxGeometry(2, 1, 1.99);
		let cube_material = new T.MeshBasicMaterial({ color: "#6c5d62" });
		let cube = new T.Mesh(cube_geometry, cube_material);
		cube.translateY(0.5);

		//
		let tl = new T.TextureLoader().load("./Pictures/roof1.png");
		let house_buttom = new T.TextureLoader().load("./Pictures/buttom.png");


		let material = new T.MeshStandardMaterial({ map: tl, roughness: 0.75 });
		let but_material = new T.MeshStandardMaterial({ map: house_buttom, roughness: 0.0 });
		let mesh = new T.Mesh(geometry, material);
		let mesh2 = new T.Mesh(geometry2, but_material);

		mesh.add(cube);
		mesh.add(mesh2);
		
		super("House-1", mesh);
	}
}

export class House_2 extends GrObject {
	constructor() {
		let group = new T.Group();
		let geometry = new T.Geometry();
		//
		geometry.vertices.push(new T.Vector3(-1, 1, -0.5)); // 0
		geometry.vertices.push(new T.Vector3(0, 1, -0.5)); // 1
		geometry.vertices.push(new T.Vector3(0, 3 / 2, 1 / 2)); // 2
		geometry.vertices.push(new T.Vector3(0, 1, 1.5)); // 3
		geometry.vertices.push(new T.Vector3(-1, 1, 1.5)); // 4
		geometry.vertices.push(new T.Vector3(-1, 3 / 2, 1 / 2)); // 5
		//
		geometry.faceVertexUvs = [[]];

		let f1 = new T.Face3(5, 1, 0);
		geometry.faces.push(f1);
		geometry.faceVertexUvs[0].push([new T.Vector2(1, 1), new T.Vector2(0, 0), new T.Vector2(1, 0)]);

		let f2 = new T.Face3(2, 1, 5);
		geometry.faces.push(f2);
		geometry.faceVertexUvs[0].push([new T.Vector2(0, 1), new T.Vector2(0, 0), new T.Vector2(1, 1)]);

		let f3 = new T.Face3(3, 2, 5);
		geometry.faces.push(f3);
		geometry.faceVertexUvs[0].push([new T.Vector2(1, 0), new T.Vector2(1, 1), new T.Vector2(0, 1)]);

		let f4 = new T.Face3(3, 5, 4);
		geometry.faces.push(f4);
		geometry.faceVertexUvs[0].push([new T.Vector2(1, 0), new T.Vector2(0, 1), new T.Vector2(0, 0)]);

		let f5 = new T.Face3(4, 5, 0);
		geometry.faces.push(f5);
		geometry.faceVertexUvs[0].push([new T.Vector2(1, 0), new T.Vector2(0, 0), new T.Vector2(1 / 2, 1)]);

		let f6 = new T.Face3(1, 2, 3);
		geometry.faces.push(f6);
		geometry.faceVertexUvs[0].push([new T.Vector2(1, 0), new T.Vector2(0, 0), new T.Vector2(1 / 2, 1)]);

		geometry.computeFaceNormals();
		geometry.uvsNeedUpdate = true;

		let geometry2 = new T.Geometry();

		geometry2.vertices.push(new T.Vector3(-1, 1, 1)); // 0
		geometry2.vertices.push(new T.Vector3(1, 1, 1)); // 1
		geometry2.vertices.push(new T.Vector3(1, 0, 1)); // 2
		geometry2.vertices.push(new T.Vector3(-1, 0, 1)); // 3

		geometry2.faceVertexUvs = [[]];
		let f1_2 = new T.Face3(2, 1, 3);
		geometry2.faces.push(f1_2);
		geometry2.faceVertexUvs[0].push([new T.Vector2(1, 0), new T.Vector2(1, 1), new T.Vector2(0, 0)]);

		let f2_2 = new T.Face3(1, 0, 3);
		geometry2.faces.push(f2_2);
		geometry2.faceVertexUvs[0].push([new T.Vector2(1, 1), new T.Vector2(0, 1), new T.Vector2(0, 0)]);


		geometry2.computeFaceNormals();
		geometry2.uvsNeedUpdate = true;

		let cube_geometry = new T.BoxGeometry(1, 1, 1.99);
		let cube_material = new T.MeshBasicMaterial({ color: "#7ba566" });
		let cube = new T.Mesh(cube_geometry, cube_material);
		cube.translateX(-0.5);
		cube.translateY(0.5);
		cube.translateZ(0.5);

		//
		let tl = new T.TextureLoader().load("./Pictures/roof3.png");
		let house_buttom = new T.TextureLoader().load("./Pictures/buttom2.png");


		let material = new T.MeshStandardMaterial({ map: tl, roughness: 0.75 });
		let but_material = new T.MeshStandardMaterial({ map: house_buttom, roughness: 0.0 });
		let mesh = new T.Mesh(geometry, material);
		let mesh2 = new T.Mesh(geometry2, but_material);

		group.add(mesh);
		group.add(cube);
		// group.add(mesh2);
		group.rotateY(Math.PI / 2);

		super("House-2", group);
	}
}

export class House_3 extends GrObject {
	constructor() {

		let geometry = new T.Geometry();
		//
		geometry.vertices.push(new T.Vector3(-1, 1, 0)); // 0
		geometry.vertices.push(new T.Vector3(1, 1, 0)); // 1
		geometry.vertices.push(new T.Vector3(1, 3 / 2, 1 / 2)); // 2
		geometry.vertices.push(new T.Vector3(1, 1, 1)); // 3
		geometry.vertices.push(new T.Vector3(-1, 1, 1)); // 4
		geometry.vertices.push(new T.Vector3(-1, 3 / 2, 1 / 2)); // 5
		//
		geometry.faceVertexUvs = [[]];

		let f1 = new T.Face3(5, 1, 0);
		geometry.faces.push(f1);
		geometry.faceVertexUvs[0].push([new T.Vector2(1, 1), new T.Vector2(0, 0), new T.Vector2(1, 0)]);

		let f2 = new T.Face3(2, 1, 5);
		geometry.faces.push(f2);
		geometry.faceVertexUvs[0].push([new T.Vector2(0, 1), new T.Vector2(0, 0), new T.Vector2(1, 1)]);

		let f3 = new T.Face3(3, 2, 5);
		geometry.faces.push(f3);
		geometry.faceVertexUvs[0].push([new T.Vector2(1, 0), new T.Vector2(1, 1), new T.Vector2(0, 1)]);

		let f4 = new T.Face3(3, 5, 4);
		geometry.faces.push(f4);
		geometry.faceVertexUvs[0].push([new T.Vector2(1, 0), new T.Vector2(0, 1), new T.Vector2(0, 0)]);

		let f5 = new T.Face3(4, 5, 0);
		geometry.faces.push(f5);
		geometry.faceVertexUvs[0].push([new T.Vector2(1, 0), new T.Vector2(0, 0), new T.Vector2(1 / 2, 1)]);

		let f6 = new T.Face3(1, 2, 3);
		geometry.faces.push(f6);
		geometry.faceVertexUvs[0].push([new T.Vector2(1, 0), new T.Vector2(0, 0), new T.Vector2(1 / 2, 1)]);

		geometry.computeFaceNormals();
		geometry.uvsNeedUpdate = true;

		let geometry2 = new T.Geometry();

		geometry2.vertices.push(new T.Vector3(-1, 1, 1)); // 0
		geometry2.vertices.push(new T.Vector3(1, 1, 1)); // 1
		geometry2.vertices.push(new T.Vector3(1, 0, 1)); // 2
		geometry2.vertices.push(new T.Vector3(-1, 0, 1)); // 3

		geometry2.faceVertexUvs = [[]];
		let f1_2 = new T.Face3(2, 1, 3);
		geometry2.faces.push(f1_2);
		geometry2.faceVertexUvs[0].push([new T.Vector2(1, 0), new T.Vector2(1, 1), new T.Vector2(0, 0)]);

		let f2_2 = new T.Face3(1, 0, 3);
		geometry2.faces.push(f2_2);
		geometry2.faceVertexUvs[0].push([new T.Vector2(1, 1), new T.Vector2(0, 1), new T.Vector2(0, 0)]);


		geometry2.computeFaceNormals();
		geometry2.uvsNeedUpdate = true;

		let cube_geometry = new T.BoxGeometry(2, 1, 0.99);
		let cube_material = new T.MeshBasicMaterial({ color: "gray" });
		let cube = new T.Mesh(cube_geometry, cube_material);
		cube.translateY(0.5);
		cube.translateZ(0.5);

		//
		let tl = new T.TextureLoader().load("./Pictures/roof2.jpg");
		let house_buttom = new T.TextureLoader().load("./Pictures/buttom2.png");


		let material = new T.MeshStandardMaterial({ map: tl, roughness: 0.75 });
		let but_material = new T.MeshStandardMaterial({ map: house_buttom, roughness: 0.0 });
		let mesh = new T.Mesh(geometry, material);
		let mesh2 = new T.Mesh(geometry2, but_material);

		mesh.add(cube);
		mesh.add(mesh2);
		super("House-3", mesh);
	}
}
export class Tree extends GrObject {
	constructor() {

		let group = new T.Group();
		let geometry = new T.CylinderGeometry(0, 0.4, 0.8, 32);
		let material = new T.MeshBasicMaterial({ color: "green" });
		let tree_top = new T.Mesh(geometry, material);
		let tree_bottom = new T.Mesh(geometry, material);
		let tree_mid = new T.Mesh(geometry, material);
		tree_top.translateY(2);
		tree_mid.translateY(1.5);
		tree_bottom.translateY(1);

		let trunk_geometry = new T.CylinderGeometry(0.1, 0.1, 1, 32);
		let trunk_material = new T.MeshBasicMaterial({ color: "#6d5415" });
		let trunk = new T.Mesh(trunk_geometry, trunk_material);
		trunk.translateY(0.5);

		group.add(trunk);
		group.add(tree_top);
		group.add(tree_mid);
		group.add(tree_bottom);
		group.position.set(1, 0, 1);

		super("Tree", group);
	}

}

export class RoadH extends GrObject {
	constructor() {


		let geometry3 = new T.Geometry();
		geometry3.vertices.push(new T.Vector3(0, 0.1, -5)); //0
		geometry3.vertices.push(new T.Vector3(0, 0.1, 5)); //1
		geometry3.vertices.push(new T.Vector3(1, 0.1, -5)); //2
		geometry3.vertices.push(new T.Vector3(1, 0.1, 5));//3

		geometry3.faceVertexUvs = [[]];
		let road_face1 = new T.Face3(0, 1, 2);
		let road_face2 = new T.Face3(3, 2, 1);
		geometry3.faces.push(road_face1);
		geometry3.faceVertexUvs[0].push([new T.Vector2(0, 1), new T.Vector2(1, 1), new T.Vector2(0, 0)]);
		geometry3.faces.push(road_face2);
		geometry3.faceVertexUvs[0].push([new T.Vector2(1, 0), new T.Vector2(0, 0), new T.Vector2(1, 1)]);
		geometry3.computeFaceNormals();
		geometry3.uvsNeedUpdate = true;

		geometry3.rotateY(Math.PI / 2);

		let road = new T.TextureLoader().load("./Pictures/road.png");
		let roadMat = new T.MeshStandardMaterial({ map: road, roughness: 0.75 });
		let roadmesh = new T.Mesh(geometry3, roadMat);

		super("road", roadmesh);

	}

}

export class RoadV extends GrObject {
	constructor() {
		let geometry3 = new T.Geometry();
		geometry3.vertices.push(new T.Vector3(0, 0.1, -5)); //0
		geometry3.vertices.push(new T.Vector3(0, 0.1, 5)); //1
		geometry3.vertices.push(new T.Vector3(1, 0.1, -5)); //2
		geometry3.vertices.push(new T.Vector3(1, 0.1, 5));//3

		geometry3.faceVertexUvs = [[]];
		let road_face1 = new T.Face3(0, 1, 2);
		let road_face2 = new T.Face3(3, 2, 1);
		geometry3.faces.push(road_face1);
		geometry3.faceVertexUvs[0].push([new T.Vector2(0, 1), new T.Vector2(1, 1), new T.Vector2(0, 0)]);
		geometry3.faces.push(road_face2);
		geometry3.faceVertexUvs[0].push([new T.Vector2(1, 0), new T.Vector2(0, 0), new T.Vector2(1, 1)]);
		geometry3.computeFaceNormals();
		geometry3.uvsNeedUpdate = true;

		geometry3.rotateY(Math.PI / 2);

		let road = new T.TextureLoader().load("./Pictures/road.png");
		let roadMat = new T.MeshStandardMaterial({ map: road, roughness: 0.75 });
		let roadmesh = new T.Mesh(geometry3, roadMat);

		roadmesh.rotateY(Math.PI / 2);
		super("road", roadmesh);

	}

}

export class Mountain extends GrObject {
	constructor(params = {}) {
		let mountain_texture = new T.TextureLoader().load("./Pictures/mountain_texture.jpg");

		let group = new T.Group();
		let geometry = new T.CylinderGeometry(5, 15, 30, 32);
		let material = new T.MeshStandardMaterial({
			map: mountain_texture,
			bumpMap: mountain_texture,
			medalness: 0.9,
			roughness: 0.9
		});

		let mountain = new T.Mesh(geometry, material);
		mountain.translateY(15);
		mountain.rotateY(Math.PI);
		// Create the final object to add to the scene
		group.add(mountain);
		super("Mountain", group);
	}
}

export class GrCarousel extends GrObject {
  
	constructor(params = {}) {
		let width = 3;
		let carousel = new T.Group();

		let base_geom = new T.CylinderGeometry(width, width, 1, 32);
		let base_mat = new T.MeshStandardMaterial({ color: "lightblue", metalness: 0.3, roughness: 0.8 });
		let base = new T.Mesh(base_geom, base_mat);
		base.translateY(0.5);
		carousel.add(base);

		let platform_group = new T.Group();
		base.add(platform_group);
		platform_group.translateY(0.5);

		let platform_geom = new T.CylinderGeometry(0.95 * width, 0.95 * width, 0.2, 32);
		let platform_mat = new T.MeshStandardMaterial({ color: "gold", metalness: 0.3, roughness: 0.8 });
		let platform = new T.Mesh(platform_geom, platform_mat);
		platform_group.add(platform);

		let cpole_geom = new T.CylinderGeometry(0.3 * width, 0.3 * width, 3, 16);
		let cpole_mat = new T.MeshStandardMaterial({ color: "gold", metalness: 0.8, roughness: 0.5 });
		let cpole = new T.Mesh(cpole_geom, cpole_mat);
		platform_group.add(cpole);
		cpole.translateY(1.5);


		let top_trim = new T.Mesh(platform_geom, platform_mat);
		platform_group.add(top_trim);
		top_trim.translateY(3);

		let opole_geom = new T.CylinderGeometry(0.03 * width, 0.03 * width, 3, 16);
		let opole_mat = new T.MeshStandardMaterial({ color: "#aaaaaa", metalness: 0.8, roughness: 0.5 });
		let opole;
		let num_poles = 8;
		let poles = [];

		for (let i = 0; i < num_poles; i++) {
			opole = new T.Mesh(opole_geom, opole_mat);
			platform_group.add(opole);
			opole.translateY(1.5);
			opole.rotateY(2 * i * Math.PI / num_poles);
			opole.translateX(0.8 * width);
			poles.push(opole);
		}

		let hourse_geom = new T.CubeGeometry(0.8, 0.8, 0.8);
		let hourse_mat = new T.MeshStandardMaterial({ color: "red" });
		let hourse;
		let hourses = [];

		for (let i = 0; i < num_poles; i++) {
			hourse = new T.Mesh(hourse_geom, hourse_mat);
			platform_group.add(hourse);
			hourse.translateY(1.5);
			hourse.rotateY(2 * i * Math.PI / num_poles);
			hourse.translateX(0.8 * width);
			hourses.push(hourse);
		}

		let roof_geom = new T.ConeGeometry(width, 0.5*width, 32, 4);
		let roof = new T.Mesh(roof_geom, base_mat);
		carousel.add(roof);
		roof.translateY(4.8);

		// note that we have to make the Object3D before we can call
		// super and we have to call super before we can use this
		super(`Carousel`, carousel);
		this.whole_ob = carousel;
		// this.platform = platform;
		this.platform = platform_group;
		this.poles = poles;
		this.hourses = hourses;
		this.time = 0;
		this.mesh = hourse;

		// put the object in its place
		this.whole_ob.position.x = params.x ? Number(params.x) : 0;
		this.whole_ob.position.y = params.y ? Number(params.y) : 0;
		this.whole_ob.position.z = params.z ? Number(params.z) : 0;
		let scale = params.size ? Number(params.size) : 1;
		carousel.scale.set(scale, scale, scale);

		this.advance = function (delta, timeOfDay) {
			let i = 0;
			this.platform.rotateY(0.001 * delta);

			this.time += delta / 1000;
			let t = this.time % 100;
			this.hourses.forEach(function(x){
				i+=3;
				x.position.y = 0.8*Math.sin(t+i)+1.4;
			});
		};
	}
}

