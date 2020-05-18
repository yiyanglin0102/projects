/*jshint esversion: 6 */
// @ts-check

/*
 * Graphics Town Example Objects
 *
 * Simple Circular Track - and an object that goes around on it
 */

// these four lines fake out TypeScript into thinking that THREE
// has the same type as the T.js module, so things work for type checking
// type inferencing figures out that THREE has the same type as T
// and then I have to use T (not THREE) to avoid the "UMD Module" warning
/**  @type typeof import("../THREE/threets/index"); */
let T;
// @ts-ignore
T = THREE;



// we need the GrObject
import { GrObject } from "../Framework/GrObject.js";
import { GrCube } from "../Framework/SimpleObjects.js";
import * as Loaders from "../Framework/loaders.js";
import { shaderMaterial } from "../Framework/shaderHelper.js";
import * as SimpleObjects from "../Framework/SimpleObjects.js";


let road_texture = new T.TextureLoader().load("./Pictures/road_texture.jpg");
let train_texture = new T.TextureLoader().load("./Pictures/train_texture.jpg");


/**
 * This is a really simple track - just a circle
 * But in addition to having geometry, objects on the track can ask for their
 * position (given their U value). 
 * They can also ask for the direction vector.
 */
export class CircularTrack extends GrObject {

    constructor(params = {}) {

        let radius = params.radius || 30;
        let width = params.width || 1;

        let ring1 = new T.RingGeometry(radius - 5 * width, radius + 5 * width, 64, 3);

        let material1 = new T.MeshStandardMaterial({ side: T.DoubleSide, map: road_texture, roughness: 0.8 });
        let mesh1 = new T.Mesh(ring1, material1);
        mesh1.rotateX(Math.PI / 2);

        let ring2 = new T.RingGeometry(radius - width, radius + width, 64, 3);

        let material2 = new T.MeshStandardMaterial({ side: T.DoubleSide, roughness: 0.3 });
        let mesh2 = new T.Mesh(ring2, material2);
        mesh2.translateY(0.01);
        mesh2.rotateX(Math.PI / 2);

        let geometry = new T.BoxGeometry(0.1, 0.1, 2);

        let sticks_group1 = new T.Group();

        for (let k = 0; k < 6; k++) {
            let sticks_group = new T.Group();

            for (let j = 0; j < 6; j++) {
                let material = new T.MeshBasicMaterial({ color: "black" });
                let sticks = new T.Group();
                for (let i = 0; i < 5; i++) {
                    let cube = new T.Mesh(geometry, material);
                    cube.position.set(-2.5 + j * -0.5, 0, 30);
                    cube.translateX(i);
                    sticks.add(cube);
                }
                // sticks.translateZ(-0.001 * j);
                sticks.rotateY(-j * Math.PI / 3);
                sticks_group.add(sticks);
            }
            sticks_group1.add(sticks_group);
        }

        let group = new T.Group();
        group.add(sticks_group1);
        group.add(mesh1);
        group.add(mesh2);
        group.translateX(params.x || 0);
        group.translateY(params.bias || 0.1); // raise track above ground to avoid z-fight
        group.translateZ(params.z || 0);
        super(`CircularTrack`, group);

        this.x = params.x || 0;
        this.z = params.z || 0;
        this.y = params.bias || 0.1;
        this.r = radius - 2;
        for (let i = 1; i <= 10; i++) {
            let geometry = new T.BoxGeometry(2, 0.1, 0.1);
            let material = new T.MeshBasicMaterial({ color: "black" });
            let cube = new T.Mesh(geometry, material);
            cube.position.set(this.x + this.r + 2, this.y, this.z);
            // cube.rotateY(Math.PI/1*i);
            cube.translateX(this.x + this.r * Math.cos(Math.PI * 10 * i) * i * 2);
            group.add(cube);
        }

    }
    eval(u) {
        let p = u * 2 * Math.PI; // car rotation
        // console.log(u);
        return [this.x + (this.r + 3) * Math.cos(p), this.y, this.z + (this.r + 3) * Math.sin(p)];
    }
    tangent(u) {
        let p = u * 2 * Math.PI;
        // unit tangent vector - not the real derivative
        return [Math.sin(p), 0, -Math.cos(p)];
    }
}

export class SquareTrack extends GrObject {
    constructor(params = {}) {
        let perimeter = params.perimeter || 20;
        let ring1 = new T.RingGeometry(5 + perimeter, 10 + perimeter, 4, 1, 0, 6.3);
        let material1 = new T.MeshStandardMaterial({ side: T.DoubleSide, map: road_texture, roughness: 0.8 });
        let mesh1 = new T.Mesh(ring1, material1);
        // mesh1.rotateX(Math.PI / 2);
        // let material1 = new T.MeshStandardMaterial({side:T.DoubleSide, map: road_texture,roughness:0.8});
        // let mesh1 = new T.Mesh(ring1, material1);
        // mesh1.rotateX(Math.PI/2);

        // let ring2 = new T.RingGeometry(radius-width,radius+width,64,3);

        // let material2 = new T.MeshStandardMaterial({side:T.DoubleSide, color:"yellow",roughness:0.3, metalness:0.5});
        // let mesh2 = new T.Mesh(ring2, material2);
        // mesh2.translateY(0.01);
        // mesh2.rotateX(Math.PI/2);

        let group = new T.Group();
        // group.add(mesh1);
        // group.add(mesh2);
        group.translateX(params.x || 0);
        group.translateY(params.bias || 0.1); // raise track above ground to avoid z-fight
        group.translateZ(params.z || 0);
        super(`SquareTrack`, group);
        this.x = params.x || -45;
        this.z = params.z || -45;
        this.y = params.bias || 0.1;
        this.perimeter = perimeter;
    }
    eval(u) {
        let a = u % 2;
        if (a < 0.5) {
            return [this.x + this.perimeter * 2 * (u % 0.5) + this.perimeter, this.y, this.z + this.perimeter];
        }
        else if (a >= 0.5 && a < 1) {
            return [this.x + this.perimeter + this.perimeter, this.y, this.z + this.perimeter * 2 * (u % 0.5) + this.perimeter];
        }
        else if (a >= 1 && a < 1.5) {
            return [this.x + this.perimeter - this.perimeter * 2 * (u % 0.5) + this.perimeter, this.y, this.perimeter + this.z + this.perimeter];
        }
        else {
            return [this.x + this.perimeter, this.y, this.z + this.perimeter - this.perimeter * 2 * (u % 0.5) + this.perimeter];
        }
    }
    tangent(u) {
        let a = u % 2;
        if (a < 0.5) {
            return [-1, 0, 0];
        }
        else if (a >= 0.5 && a < 1) {
            return [0, 0, -1];
        }
        else if (a >= 1 && a < 1.5) {
            return [1, 0, 0];
        }
        else {
            return [0, 0, 1];
        }
    }
}

export class SplineTrack extends GrObject {
    constructor(params = {}) {
        let radius = params.radius || 200;
        let height = params.height || 1;
        let width = params.width || 1;
        let ring1 = new T.RingGeometry(radius - 5 * width, radius + 5 * width, 64, 3);

        // let material1 = new T.MeshStandardMaterial({side:T.DoubleSide, map: road_texture,roughness:0.8});
        // let mesh1 = new T.Mesh(ring1, material1);
        // mesh1.rotateX(Math.PI/2);

        // let ring2 = new T.RingGeometry(radius-width,radius+width,64,3);

        // let material2 = new T.MeshStandardMaterial({side:T.DoubleSide, color:"yellow",roughness:0.3, metalness:0.5});
        // let mesh2 = new T.Mesh(ring2, material2);
        // mesh2.translateY(0.01);
        // mesh2.rotateX(Math.PI/2);

        let group = new T.Group();
        // group.add(mesh1);
        // group.add(mesh2);
        group.translateX(params.x || 0);
        group.translateY(params.bias || 0.1); // raise track above ground to avoid z-fight
        group.translateZ(params.z || 0);
        super(`SplineTrack`, group);


        this.x = params.x || 0;
        this.z = params.z || 0;
        this.y = params.bias || -80;
        this.r = radius - 2;
    }
    eval(u) {
        let p = u * 2 * Math.PI; // car rotation
        // console.log(this.y);
        this.y += 0.1;
        if (this.y >= 200) { this.y = -300; u = 0; console.log(this.y); }
        return [this.x + (this.r - this.y * 0.3) * Math.cos(p), this.y + u * 4, this.z + (this.r - this.y * 0.3) * Math.sin(p)];
    }
    tangent(u) {
        let p = u * 2 * Math.PI;
        // unit tangent vector - not the real derivative
        return [Math.sin(p), 1 / 4, -Math.cos(p)];
    }
}

export class LavaTrack extends GrObject {
    constructor(params = {}) {
        let perimeter = params.perimeter || 20;
        let ring1 = new T.RingGeometry(5 + perimeter, 10 + perimeter, 4, 1, 0, 6.3);
        let material1 = new T.MeshStandardMaterial({ side: T.DoubleSide, map: road_texture, roughness: 0.8 });
        let mesh1 = new T.Mesh(ring1, material1);

        let group = new T.Group();

        group.translateX(params.x || 0);
        group.translateY(params.bias || 0.1); // raise track above ground to avoid z-fight
        group.translateZ(params.z || 0);
        super(`LavaTrack`, group);
        this.x = params.x || -45;
        this.z = params.z || -45;
        this.y = params.bias || 0.1;
        this.perimeter = perimeter;
    }
    eval(u) {
        let a = u % 2;
        if (a < 1) {
            return [this.x, this.y + 100 * (u % 0.5), this.z];
        }
        else {
            return [this.x, this.y, this.z];
        }
    }
    tangent(u) {

        return [0, 1, 0];

    }
}
export class RainningTrack extends GrObject {
    constructor(params = {}) {
        let perimeter = params.perimeter || 20;
        let ring1 = new T.RingGeometry(5 + perimeter, 10 + perimeter, 4, 1, 0, 6.3);
        let material1 = new T.MeshStandardMaterial({ side: T.DoubleSide, map: road_texture, roughness: 0.8 });
        let mesh1 = new T.Mesh(ring1, material1);

        let group = new T.Group();

        group.translateX(params.x || 0);
        group.translateY(params.bias || 0.1); // raise track above ground to avoid z-fight
        group.translateZ(params.z || 0);
        super(`LavaTrack`, group);
        this.x = params.x || -45;
        this.z = params.z || -45;
        this.y = 50;
        this.perimeter = perimeter;
    }
    eval(u) {
        // let a = u % 20;

        return [this.x, this.y - 100 * (u % 0.5), this.z];

    }
    tangent(u) {

        return [0, 0, 0];

    }
}
export class TrackCube extends GrCube {
    constructor(track, params = {}) {
        super({});
        this.track = track;
        this.u = 0;
        this.rideable = this.objects[0];
    }
    advance(delta, timeOfDay) {
        this.u += delta / 2000;
        let pos = this.track.eval(this.u);
        // remember, the center of the cube needs to be above ground!
        this.objects[0].position.set(pos[0], 0.5 + pos[1], pos[2]);
        let dir = this.track.tangent(this.u);
        // since we can't easily construct the matrix, figure out the rotation
        // easy since this is 2D!
        let zAngle = Math.atan2(dir[2], dir[0]);
        // turn the object so the Z axis is facing in that direction
        this.objects[0].rotation.y = -zAngle - Math.PI / 2;
    }
}

export class GrForkLift extends GrObject {

    constructor(track, params = {}) {

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
        base.translateY(-0.02);
        base.rotateY(Math.PI / 2);
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
        top.translateY(-0.02);
        top.rotateY(Math.PI / 2);
        forkLift.add(top);

        let stick_car_geometry1 = new T.BoxGeometry(0.2, 3.5, 0.2);
        let stick_car_material1 = new T.MeshStandardMaterial({ color: "yellow", metalness: 0.5, roughness: 0.7 });
        let stick_car1 = new T.Mesh(stick_car_geometry1, stick_car_material1);
        stick_car1.translateX(0.95);
        stick_car1.translateY(1.8);
        stick_car1.rotateX(-Math.PI / 40);
        forkLift.add(stick_car1);

        let stick_car_geometry2 = new T.BoxGeometry(0.2, 3.5, 0.2);
        let stick_car_material2 = new T.MeshStandardMaterial({ color: "yellow", metalness: 0.5, roughness: 0.7 });
        let stick_car2 = new T.Mesh(stick_car_geometry2, stick_car_material2);
        stick_car2.translateX(-0.5);
        stick_car2.translateY(1.8);
        stick_car2.rotateX(-Math.PI / 40);
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
        fork.rotateY(Math.PI / 2);
        fork.translateX(1.8);
        fork.translateY(-0.2);
        forkLift.add(fork);

        let tires = new T.Group();

        let tire_geo1 = new T.CylinderGeometry(0.4, 0.4, 0.2, 64, 1);
        let tire_mat1 = new T.MeshBasicMaterial({ color: "black" });
        let tire_mesh1 = new T.Mesh(tire_geo1, tire_mat1);
        // tire_geo1.scale(0.5, 0.5, 0.5);
        tire_mesh1.rotateZ(Math.PI / 2);
        tire_mesh1.position.set(1, 0.5, 1);
        tires.add(tire_mesh1);

        let tire_geo2 = new T.CylinderGeometry(0.4, 0.4, 0.2, 64, 1);
        let tire_mat2 = new T.MeshBasicMaterial({ color: "black" });
        let tire_mesh2 = new T.Mesh(tire_geo2, tire_mat2);
        // tire_geo2.scale(0.5, 0.5, 0.5);
        tire_mesh2.rotateZ(Math.PI / 2);
        tire_mesh2.position.set(-1, 0.5, 1);
        tires.add(tire_mesh2);

        let tire_geo3 = new T.CylinderGeometry(0.4, 0.4, 0.2, 64, 1);
        let tire_mat3 = new T.MeshBasicMaterial({ color: "black" });
        let tire_mesh3 = new T.Mesh(tire_geo3, tire_mat3);
        // tire_geo3.scale(0.5, 0.5, 0.5);
        tire_mesh3.rotateZ(Math.PI / 2);
        tire_mesh3.position.set(1, 0.5, -1);
        tires.add(tire_mesh3);

        let tire_geo4 = new T.CylinderGeometry(0.4, 0.4, 0.2, 64, 1);
        let tire_mat4 = new T.MeshBasicMaterial({ color: "black" });
        let tire_mesh4 = new T.Mesh(tire_geo4, tire_mat4);
        // tire_geo4.scale(0.5, 0.5, 0.5);
        tire_mesh4.rotateZ(Math.PI / 2);
        tire_mesh4.position.set(-1, 0.5, -1);
        tires.add(tire_mesh4);
        // tires.translateY(-0.2);
        tires.translateX(0.2);
        tires.translateZ(-1.8);
        tires.translateY(-0.2);
        forkLift.add(tires);

        // note that we have to make the Object3D before we can call
        // super and we have to call super before we can use this
        super(`forkLift`, forkLift);
        this.whole_ob = forkLift;
        this.track = track;
        this.u = 0;
        this.rideable = forkLift;

        // put the object in its place
        this.whole_ob.position.x = params.x ? Number(params.x) : 0;
        this.whole_ob.position.y = params.y ? Number(params.y) : 0;
        this.whole_ob.position.z = params.z ? Number(params.z) : 0;
        let scale = params.size ? Number(params.size) : 1;
        forkLift.scale.set(scale, scale, scale);
    }

    advance(delta, timeOfDay) {
        this.u += delta / 2000;
        let pos = this.track.eval(this.u);
        // remember, the center of the cube needs to be above ground!
        this.objects[0].position.set(pos[0], 0.5 + pos[1], pos[2]);
        let dir = this.track.tangent(this.u);
        // since we can't easily construct the matrix, figure out the rotation
        // easy since this is 2D!
        let zAngle = Math.atan2(dir[2], dir[0]);
        // turn the object so the Z axis is facing in that direction
        this.objects[0].rotation.y = -zAngle - Math.PI / 2;
    }
}

export class GrTruck extends GrObject {

    constructor(params = {}) {

        let dumpTruck = new T.Group();

        let exSettings = {
            steps: 2,
            depth: 2,
            bevelEnabled: true,
            bevelThickness: 0.2,
            bevelSize: 0.1,
            bevelSegments: 2
        };

        let curve = new T.Shape();
        curve.moveTo(0, 0);
        curve.lineTo(1.5, 0);
        curve.lineTo(1.5, 1.5);
        curve.lineTo(0.5, 1.5);
        curve.lineTo(0.5, 1);
        curve.lineTo(0, 1);
        curve.lineTo(0, 0);

        let frontGeo = new T.ExtrudeGeometry(curve, exSettings);
        let frontMat = new T.MeshStandardMaterial({ color: "white" });
        let front = new T.Mesh(frontGeo, frontMat);
        front.translateY(0.5);

        let wheels = [];
        let wheelGeo = new T.TorusGeometry(0.35, 0.18, 20, 100);
        let wheelMat = new T.MeshStandardMaterial({ color: "black" });
        for (let i = 0; i < 6; i++) {
            wheels[i] = new T.Mesh(wheelGeo, wheelMat);
        }
        wheels[0].position.set(0.5, 0.5, 2.2);
        wheels[1].position.set(0.5, 0.5, -0.2);
        wheels[2].position.set(3, 0.5, 2.2);
        wheels[3].position.set(3, 0.5, -0.2);
        wheels[4].position.set(4.5, 0.5, 2.2);
        wheels[5].position.set(4.5, 0.5, -0.2);

        let bed = new T.Mesh(new T.BoxGeometry(4, 0.2, 2), new T.MeshStandardMaterial({ color: "gray" }));
        bed.position.set(3.5, 0.6, 1);

        let bucket = new T.Group();
        let bucketMat = new T.MeshStandardMaterial({ color: "green" });

        let bottom = new T.Mesh(new T.BoxGeometry(3.5, 0.2, 2), bucketMat);

        let side1 = new T.Mesh(new T.BoxGeometry(3.5, 1.5, 0.2), bucketMat);
        let side2 = side1.clone();
        side1.position.set(0, 0.75, 0.9);
        side2.position.set(0, 0.75, -0.9);

        let forward = new T.Mesh(new T.BoxGeometry(0.2, 1.5, 2), bucketMat);
        forward.position.set(-1.65, 0.75, 0);

        let back = new T.Mesh(new T.BoxGeometry(0.2, 1.5, 2), bucketMat);
        back.translateY(-0.75);

        let back_group = new T.Group();
        back_group.add(back);
        back_group.position.set(1.65, 1.5, 0);

        bucket.add(bottom);
        bucket.add(side1);
        bucket.add(side2);
        bucket.add(forward);
        bucket.add(back_group);

        bucket.translateX(-2);

        let bucket_group = new T.Group();
        bucket_group.add(bucket);
        bucket_group.position.set(5.75, 0.8, 1);

        dumpTruck.add(front);
        for (let i = 0; i < 6; i++) dumpTruck.add(wheels[i]);
        dumpTruck.add(bed);
        dumpTruck.add(bucket_group);

        // note that we have to make the Object3D before we can call
        // super and we have to call super before we can use this
        super(`Truck`, dumpTruck);
        this.whole_ob = dumpTruck;
        // this.track = track;
        this.u = 0;
        this.rideable = dumpTruck;

        // put the object in its place
        this.whole_ob.position.x = params.x ? Number(params.x) : 0;
        this.whole_ob.position.y = params.y ? Number(params.y) : 0;
        this.whole_ob.position.z = params.z ? Number(params.z) : 0;
        let scale = params.size ? Number(params.size) : 1;
        dumpTruck.scale.set(scale, scale, scale);
    }

    advance(delta, timeOfDay) {
        this.u += delta / 2000;
        // let pos = this.track.eval(this.u);
        // remember, the center of the cube needs to be above ground!
        // this.objects[0].position.set(pos[0], 0.5 + pos[1], pos[2]);
        // let dir = this.track.tangent(this.u);
        // since we can't easily construct the matrix, figure out the rotation
        // easy since this is 2D!
        // let zAngle = Math.atan2(dir[2], dir[0]);
        // turn the object so the Z axis is facing in that direction
        // this.objects[0].rotation.y = -zAngle - Math.PI / 2;
    }
}


export class GrLocomotive extends GrObject {

    constructor(track, params = {}) {
        let locomotive = new T.Group();
        // head
        let geometry = new T.CylinderBufferGeometry(0.45, 0.45, 1.85, 32);
        let material = new T.MeshStandardMaterial({ color: "silver", metalness: 0.8, roughness: 0.7 });
        let cylinder = new T.Mesh(geometry, material);
        cylinder.rotateZ(Math.PI / 2);
        cylinder.rotateX(Math.PI / 2);
        cylinder.translateX(0.5);
        cylinder.translateZ(-1);
        cylinder.translateY(0.55);
        // wheels
        let weels_group = new T.Group();
        let wheel_geometry = new T.CylinderBufferGeometry(0.2, 0.2, 0.1, 32);
        let wheel_material = new T.MeshBasicMaterial({ color: "black" });
        let wheel1 = new T.Mesh(wheel_geometry, wheel_material);
        let wheel2 = new T.Mesh(wheel_geometry, wheel_material);
        let wheel3 = new T.Mesh(wheel_geometry, wheel_material);
        let wheel4 = new T.Mesh(wheel_geometry, wheel_material);
        let wheel5 = new T.Mesh(wheel_geometry, wheel_material);
        let wheel6 = new T.Mesh(wheel_geometry, wheel_material);
        wheel1.rotateY(Math.PI / 2);
        wheel1.rotateZ(Math.PI / 2);
        wheel2.rotateY(Math.PI / 2);
        wheel2.rotateZ(Math.PI / 2);
        wheel3.rotateY(Math.PI / 2);
        wheel3.rotateZ(Math.PI / 2);
        wheel4.rotateY(Math.PI / 2);
        wheel4.rotateZ(Math.PI / 2);
        wheel5.rotateY(Math.PI / 2);
        wheel5.rotateZ(Math.PI / 2);
        wheel6.rotateY(Math.PI / 2);
        wheel6.rotateZ(Math.PI / 2);
        wheel1.translateX(0);
        wheel2.translateX(0.5);
        wheel3.translateX(1);
        wheel4.translateX(0);
        wheel5.translateX(0.5);
        wheel6.translateX(1);
        wheel4.translateY(1);
        wheel5.translateY(1);
        wheel6.translateY(1);

        weels_group.add(wheel1);
        weels_group.add(wheel2);
        weels_group.add(wheel3);
        weels_group.add(wheel4);
        weels_group.add(wheel5);
        weels_group.add(wheel6);
        weels_group.rotateZ(Math.PI / 2);
        weels_group.rotateX(Math.PI / 2);
        weels_group.translateZ(-1.5);
        weels_group.translateX(0.2);

        let cube_geometry = new T.BoxGeometry(1.2, 1.2, 1.2);
        let cube_material = new T.MeshStandardMaterial({ color: "silver", metalness: 0.8, roughness: 0.7 });
        let head_cube = new T.Mesh(cube_geometry, cube_material);
        head_cube.translateX(-1);
        head_cube.translateY(0.6);
        head_cube.translateZ(-1);

        let cubeTop_geometry = new T.BoxGeometry(1.2, 1, 2);
        let cubeTop_material = new T.MeshStandardMaterial({ color: "silver", metalness: 0.8, roughness: 0.7 });
        let headTop_cube = new T.Mesh(cubeTop_geometry, cubeTop_material);
        headTop_cube.translateX(-1);
        headTop_cube.translateY(1.6);
        headTop_cube.translateZ(-0.7);


        let chimney_geometry = new T.CylinderBufferGeometry(0.15, 0.15, 1.5, 32);
        let chimney_material = new T.MeshStandardMaterial({ color: "silver", metalness: 0.8, roughness: 0.7 });
        let chimney = new T.Mesh(chimney_geometry, chimney_material);
        chimney.translateX(-1);
        chimney.translateY(1.6);
        chimney.translateZ(0.85);

        let chimneyTop_geometry = new T.CylinderBufferGeometry(0.35, 0.18, 0.3, 32);
        let chimneyTop_material = new T.MeshStandardMaterial({ color: "yellow", metalness: 0.4, roughness: 0.7 });
        let chimneyTop = new T.Mesh(chimneyTop_geometry, chimneyTop_material);
        chimneyTop.translateX(-1);
        chimneyTop.translateY(2.4);
        chimneyTop.translateZ(0.85);

        locomotive.add(chimneyTop);
        locomotive.add(chimney);
        locomotive.add(headTop_cube);
        locomotive.add(head_cube);
        locomotive.add(weels_group);
        locomotive.add(cylinder);
        locomotive.position.set(1.5, 0, 1.5);

        // note that we have to make the Object3D before we can call
        // super and we have to call super before we can use this
        super(`locomotive`, locomotive);
        this.whole_ob = locomotive;
        this.track = track;
        this.u = 0;
        this.rideable = this.objects[0];

        // put the object in its place
        this.whole_ob.position.x = params.x ? Number(params.x) : 0;
        this.whole_ob.position.y = params.y ? Number(params.y) : 0;
        this.whole_ob.position.z = params.z ? Number(params.z) : 0;
        let scale = params.size ? Number(params.size) : 1;
        locomotive.scale.set(scale, scale, scale);
    }

    advance(delta, timeOfDay) {
        this.u += delta / 2000;
        let pos = this.track.eval(this.u);
        // remember, the center of the cube needs to be above ground!
        this.objects[0].position.set(pos[0], 0.5 + pos[1], pos[2]);
        let dir = this.track.tangent(this.u);
        // since we can't easily construct the matrix, figure out the rotation
        // easy since this is 2D!
        let zAngle = Math.atan2(dir[2], dir[0]);
        // turn the object so the Z axis is facing in that direction
        this.objects[0].rotation.y = -zAngle - Math.PI / 2;
    }
}

export class GrTrainTrack extends GrObject {

    constructor(track, params = {}) {

        let train_track = new T.Group();

        // wheels
        let weels_group = new T.Group();
        let wheel_geometry = new T.CylinderBufferGeometry(0.2, 0.2, 0.1, 32);
        let wheel_material = new T.MeshBasicMaterial({ color: "black" });
        let wheel1 = new T.Mesh(wheel_geometry, wheel_material);
        let wheel2 = new T.Mesh(wheel_geometry, wheel_material);
        let wheel3 = new T.Mesh(wheel_geometry, wheel_material);
        let wheel4 = new T.Mesh(wheel_geometry, wheel_material);
        let wheel5 = new T.Mesh(wheel_geometry, wheel_material);
        let wheel6 = new T.Mesh(wheel_geometry, wheel_material);
        wheel1.rotateY(Math.PI / 2);
        wheel1.rotateZ(Math.PI / 2);
        wheel2.rotateY(Math.PI / 2);
        wheel2.rotateZ(Math.PI / 2);
        wheel3.rotateY(Math.PI / 2);
        wheel3.rotateZ(Math.PI / 2);
        wheel4.rotateY(Math.PI / 2);
        wheel4.rotateZ(Math.PI / 2);
        wheel5.rotateY(Math.PI / 2);
        wheel5.rotateZ(Math.PI / 2);
        wheel6.rotateY(Math.PI / 2);
        wheel6.rotateZ(Math.PI / 2);
        wheel1.translateX(0);
        wheel2.translateX(0.5);
        wheel3.translateX(1);
        wheel4.translateX(0);
        wheel5.translateX(0.5);
        wheel6.translateX(1);
        wheel4.translateY(1);
        wheel5.translateY(1);
        wheel6.translateY(1);

        weels_group.add(wheel1);
        weels_group.add(wheel2);
        weels_group.add(wheel3);
        weels_group.add(wheel4);
        weels_group.add(wheel5);
        weels_group.add(wheel6);
        weels_group.rotateZ(Math.PI / 2);
        weels_group.rotateX(Math.PI / 2);
        weels_group.translateZ(-1.5);
        weels_group.translateX(0.2);

        let cube_geometry = new T.BoxGeometry(1, 1.2, 2);
        let cube_material = new T.MeshStandardMaterial({ side: T.DoubleSide, map: train_texture, metalness: 0.8, roughness: 0.7, bumpMap: train_texture });

        let head_cube = new T.Mesh(cube_geometry, cube_material);
        head_cube.translateX(-1);
        head_cube.translateY(1);
        head_cube.translateZ(0.5);

        train_track.add(head_cube);
        train_track.add(weels_group);

        // note that we have to make the Object3D before we can call
        // super and we have to call super before we can use this
        super(`Train Track`, train_track);
        this.whole_ob = train_track;
        this.track = track;
        this.u = 0;
        this.rideable = this.objects[0];

        // put the object in its place
        this.whole_ob.position.x = params.x ? Number(params.x) : 0;
        this.whole_ob.position.y = params.y ? Number(params.y) : 0;
        this.whole_ob.position.z = params.z ? Number(params.z) : 0;
        let scale = params.size ? Number(params.size) : 1;
        train_track.scale.set(scale, scale, scale);
    }

    advance(delta, timeOfDay) {
        this.u += delta / 2000;
        let pos = this.track.eval(this.u);
        // remember, the center of the cube needs to be above ground!
        this.objects[0].position.set(pos[0], 0.5 + pos[1], pos[2]);
        let dir = this.track.tangent(this.u);
        // since we can't easily construct the matrix, figure out the rotation
        // easy since this is 2D!
        let zAngle = Math.atan2(dir[2], dir[0]);
        // turn the object so the Z axis is facing in that direction
        this.objects[0].rotation.y = -zAngle - Math.PI / 2;
    }
}

export class TrackAirplane extends Loaders.FbxGrObject {
    constructor(track) {
        super({ fbx: "./Examples/Assets/spitfire.fbx", norm: 80.0, name: "Airplane" });

        this.track = track;
        this.u = 0;
        // the fbx loader puts the car on the ground - we need a ride point above the ground
        this.ridePoint = new T.Object3D();
        // this.ridePoint.translateY(0.5);
        this.objects[0].add(this.ridePoint);
        this.rideable = this.ridePoint;
    }
    advance(delta, timeOfDay) {
        this.u += delta / 2000;
        let pos = this.track.eval(this.u);
        this.objects[0].position.set(pos[0], pos[1], pos[2]);
        let dir = this.track.tangent(this.u);
        // since we can't easily construct the matrix, figure out the rotation
        // easy since this is 2D!
        let zAngle = Math.atan2(dir[2], dir[0]);
        // turn the object so the Z axis is facing in that direction
        this.objects[0].rotation.y = -zAngle - Math.PI / 2;
    }
}

export class Lava extends GrObject {

    constructor(track, params = {}) {

        let group = new T.Group();
        let mountain_texture = new T.TextureLoader().load("./Pictures/lava_texture.jpg");

        let geometry = new T.CylinderGeometry(3, 3, 15, 32);
        let material = new T.MeshStandardMaterial({
            map: mountain_texture,
            bumpMap: mountain_texture,
            // roughness: 0.9
        });

        let mountain = new T.Mesh(geometry, material);
        mountain.translateY(15);
        mountain.rotateY(Math.PI);
        // Create the final object to add to the scene
        group.add(mountain);


        super(`Lava`, group);
        this.whole_ob = group;
        this.track = track;
        this.u = 0;
        this.rideable = this.objects[0];

        // put the object in its place
        this.whole_ob.position.x = params.x ? Number(params.x) : 0;
        this.whole_ob.position.y = params.y ? Number(params.y) : 0;
        this.whole_ob.position.z = params.z ? Number(params.z) : 0;
        let scale = params.size ? Number(params.size) : 1;
        group.scale.set(scale, scale, scale);
    }

    advance(delta, timeOfDay) {
        this.u += delta / 2000;
        let pos = this.track.eval(this.u);
        // remember, the center of the cube needs to be above ground!
        this.objects[0].position.set(pos[0], 0.5 + pos[1], pos[2]);
        let dir = this.track.tangent(this.u);
        // since we can't easily construct the matrix, figure out the rotation
        // easy since this is 2D!
        let zAngle = Math.atan2(dir[2], dir[0]);
        // turn the object so the Z axis is facing in that direction
        this.objects[0].rotation.y = -zAngle - Math.PI / 2;
    }
}

export class GrQuadcopter extends GrObject {
    constructor(track, params = {}) {

        // let group = new T.Group();

        // let propeller1 = new T.BoxGeometry(0.75, 0.02, 0.15);
        // let propeller11 = new T.Mesh(propeller1, new T.MeshStandardMaterial({ color: "grey" }));
        // propeller11.position.set(0.4, 1.15, 0);
        // group.add(propeller11);

        // let propeller2 = new T.BoxGeometry(0.15, 0.02, 0.75);
        // let propeller22 = new T.Mesh(propeller2, new T.MeshStandardMaterial({ color: "grey" }));
        // propeller22.position.set(0, 1.15, 0.4);
        // group.add(propeller22);

        // let propeller3 = new T.BoxGeometry(0.75, 0.02, 0.15);
        // let propeller33 = new T.Mesh(propeller3, new T.MeshStandardMaterial({ color: "grey" }));
        // propeller33.position.set(-0.4, 1.15, 0);
        // group.add(propeller33);

        // let propeller4 = new T.BoxGeometry(0.15, 0.02, 0.75);
        // let propeller44 = new T.Mesh(propeller4, new T.MeshStandardMaterial({ color: "grey" }));
        // propeller44.position.set(0, 1.15, -0.4);
        // group.add(propeller44);
        let group = new T.Group();
        let points = [];
        for (let i = 0; i < 6; i++) {
            points.push(new T.Vector2(Math.sin(i * 0.2) * 10 + 5, (i - 5) * 2));
        }
        let geometry = new T.LatheGeometry(points, 12, -0.49, 4);
        let material = new T.MeshStandardMaterial({ color: "rgb(30%, 30%, 40%)", transparent: true, opacity: 0.2 });
        let lathe = new T.Mesh(geometry, material);
        lathe.scale.set(0.04, -0.04, 0.04);
        lathe.position.set(0, 0.55, 0);
        group.add(lathe);

        let geometry1 = new T.LatheGeometry(points, 12, -0.49, 4);
        let material1 = new T.MeshStandardMaterial({ color: "silver", metalness: 0.5, roughness: 0.7 });
        let lathe1 = new T.Mesh(geometry1, material1);
        lathe1.scale.set(0.04, -0.04, 0.04);
        lathe1.position.set(0, 0.55, 0);
        lathe1.rotateY(Math.PI);
        group.add(lathe1);

        let geometry2 = new T.LatheGeometry(points, 12, 0, 4);
        let material2 = new T.MeshStandardMaterial({ color: "silver", metalness: 0.5, roughness: 0.7 });
        let lathe2 = new T.Mesh(geometry2, material2);
        lathe2.scale.set(0.04, 0.04, 0.04);
        lathe2.position.set(0, 0.55, 0);
        lathe2.rotateY(Math.PI);
        group.add(lathe2);

        let geometry3 = new T.LatheGeometry(points, 12, 0, 4);
        let material3 = new T.MeshStandardMaterial({ color: "silver", metalness: 0.5, roughness: 0.7 });
        let lathe3 = new T.Mesh(geometry3, material3);
        lathe3.scale.set(0.04, 0.04, 0.04);
        lathe3.position.set(0, 0.55, 0);
        group.add(lathe3);

        // legs
        let rightleg = new T.BoxGeometry(0.05, 0.25, 0.05);
        let rightleg1 = new T.Mesh(rightleg, new T.MeshStandardMaterial({ color: "black", metalness: 0.5, roughness: 0.7 }));
        rightleg1.position.set(0, 0.15, -0.2);
        group.add(rightleg1);

        let leftleg = new T.BoxGeometry(0.05, 0.25, 0.05);
        let leftleg1 = new T.Mesh(leftleg, new T.MeshStandardMaterial({ color: "black" }));
        leftleg1.position.set(0, 0.15, 0.2);
        group.add(leftleg1);

        //feet
        let leftfeet = new T.BoxGeometry(0.5, 0.05, 0.05);
        let leftfeet1 = new T.Mesh(leftfeet, new T.MeshStandardMaterial({ color: "black" }));
        leftfeet1.position.set(0, 0.05, 0.2);
        group.add(leftfeet1);

        let rightfeet = new T.BoxGeometry(0.5, 0.05, 0.05);
        let rightfeet1 = new T.Mesh(rightfeet, new T.MeshStandardMaterial({ color: "black" }));
        rightfeet1.position.set(0, 0.05, -0.2);
        group.add(rightfeet1);

        // stick
        let stick = new T.BoxGeometry(0.05, 0.25, 0.05);
        let stick1 = new T.Mesh(stick, new T.MeshStandardMaterial({ color: "black" }));
        stick1.position.set(0, 1.05, 0);
        group.add(stick1);

        // tail
        let tail = new T.BoxGeometry(0.9, 0.25, 0.05);
        let tail1 = new T.Mesh(tail, new T.MeshStandardMaterial({ color: "black" }));
        tail1.position.set(-0.8, 0.65, 0);
        tail1.rotateZ(-0.2);
        group.add(tail1);

        group.rotateY(Math.PI / 10);
        super(`Lava`, group);
        this.whole_ob = group;
        this.track = track;
        this.u = 0;
        this.rideable = this.objects[0];

        // put the object in its place
        this.whole_ob.position.x = params.x ? Number(params.x) : 0;
        this.whole_ob.position.y = params.y ? Number(params.y) : 0;
        this.whole_ob.position.z = params.z ? Number(params.z) : 0;
        let scale = params.size ? Number(params.size) : 1;
        group.scale.set(scale, scale, scale);
    }

    advance(delta, timeOfDay) {
        this.u += delta / 2000;
        let pos = this.track.eval(this.u);
        // remember, the center of the cube needs to be above ground!
        this.objects[0].position.set(pos[0], 0.5 + pos[1], pos[2]);
        let dir = this.track.tangent(this.u);
        // since we can't easily construct the matrix, figure out the rotation
        // easy since this is 2D!
        let zAngle = Math.atan2(dir[2], dir[0]);
        // turn the object so the Z axis is facing in that direction
        this.objects[0].rotation.y = -zAngle - Math.PI / 2;
    }


}

function defaultquadcopter(color1) {

    let group = new T.Group();
    let points = [];
    for (let i = 0; i < 6; i++) {
        points.push(new T.Vector2(Math.sin(i * 0.2) * 10 + 5, (i - 5) * 2));
    }
    let geometry = new T.LatheGeometry(points, 12, -0.49, 4);
    let material = new T.MeshStandardMaterial({ color: "rgb(30%, 30%, 40%)", transparent: true, opacity: 0.2 });
    let lathe = new T.Mesh(geometry, material);
    lathe.scale.set(0.04, -0.04, 0.04);
    lathe.position.set(0, 0.55, 0);
    group.add(lathe);

    let geometry1 = new T.LatheGeometry(points, 12, -0.49, 4);
    let material1 = new T.MeshStandardMaterial({ color: color1, metalness: 0.5, roughness: 0.7 });
    let lathe1 = new T.Mesh(geometry1, material1);
    lathe1.scale.set(0.04, -0.04, 0.04);
    lathe1.position.set(0, 0.55, 0);
    lathe1.rotateY(Math.PI);
    group.add(lathe1);

    let geometry2 = new T.LatheGeometry(points, 12, 0, 4);
    let material2 = new T.MeshStandardMaterial({ color: color1, metalness: 0.5, roughness: 0.7 });
    let lathe2 = new T.Mesh(geometry2, material2);
    lathe2.scale.set(0.04, 0.04, 0.04);
    lathe2.position.set(0, 0.55, 0);
    lathe2.rotateY(Math.PI);
    group.add(lathe2);

    let geometry3 = new T.LatheGeometry(points, 12, 0, 4);
    let material3 = new T.MeshStandardMaterial({ color: color1, metalness: 0.5, roughness: 0.7 });
    let lathe3 = new T.Mesh(geometry3, material3);
    lathe3.scale.set(0.04, 0.04, 0.04);
    lathe3.position.set(0, 0.55, 0);
    group.add(lathe3);

    // legs
    let rightleg = new T.BoxGeometry(0.05, 0.25, 0.05);
    let rightleg1 = new T.Mesh(rightleg, new T.MeshStandardMaterial({ color: "black", metalness: 0.5, roughness: 0.7 }));
    rightleg1.position.set(0, 0.15, -0.2);
    group.add(rightleg1);

    let leftleg = new T.BoxGeometry(0.05, 0.25, 0.05);
    let leftleg1 = new T.Mesh(leftleg, new T.MeshStandardMaterial({ color: "black" }));
    leftleg1.position.set(0, 0.15, 0.2);
    group.add(leftleg1);

    //feet
    let leftfeet = new T.BoxGeometry(0.5, 0.05, 0.05);
    let leftfeet1 = new T.Mesh(leftfeet, new T.MeshStandardMaterial({ color: "black" }));
    leftfeet1.position.set(0, 0.05, 0.2);
    group.add(leftfeet1);

    let rightfeet = new T.BoxGeometry(0.5, 0.05, 0.05);
    let rightfeet1 = new T.Mesh(rightfeet, new T.MeshStandardMaterial({ color: "black" }));
    rightfeet1.position.set(0, 0.05, -0.2);
    group.add(rightfeet1);

    // stick
    let stick = new T.BoxGeometry(0.05, 0.25, 0.05);
    let stick1 = new T.Mesh(stick, new T.MeshStandardMaterial({ color: "black" }));
    stick1.position.set(0, 1.05, 0);
    group.add(stick1);

    // tail
    let tail = new T.BoxGeometry(0.9, 0.25, 0.05);
    let tail1 = new T.Mesh(tail, new T.MeshStandardMaterial({ color: "black" }));
    tail1.position.set(-0.8, 0.65, 0);
    tail1.rotateZ(-0.2);
    group.add(tail1);

    return group;
}

export class RaingDrop extends GrObject {

    constructor(track, params = {}) {

        let group = new T.Group();
        let length = params.length;
        let geometry = new T.CubeGeometry(0.05, length, 0.05, 32);
        let material = new T.MeshStandardMaterial({ color: "white" });
        let drop = new T.Mesh(geometry, material);
        drop.translateY(15);
        drop.rotateY(Math.PI);
        group.add(drop);
        super(`Rain`, group);
        this.whole_ob = group;
        this.track = track;
        this.u = 0;
        this.rideable = this.objects[0];

        // put the object in its place
        this.whole_ob.position.x = params.x ? Number(params.x) : 0;
        this.whole_ob.position.y = params.y ? Number(params.y) : 0;
        this.whole_ob.position.z = params.z ? Number(params.z) : 0;
        let scale = params.size ? Number(params.size) : 1;
        group.scale.set(scale, scale, scale);
    }

    advance(delta, timeOfDay) {
        this.u += delta / 2000;
        let pos = this.track.eval(this.u);
        // remember, the center of the cube needs to be above ground!
        this.objects[0].position.set(pos[0], 0.5 + pos[1], pos[2]);
        let dir = this.track.tangent(this.u);
        // since we can't easily construct the matrix, figure out the rotation
        // easy since this is 2D!
        let zAngle = Math.atan2(dir[2], dir[0]);
        // turn the object so the Z axis is facing in that direction
        this.objects[0].rotation.y = -zAngle - Math.PI / 2;
    }
}

export class GrAdvancedSwing extends GrObject {

    constructor(params = {}) {
        let swing = new T.Group();
        addPosts(swing);

        let hanger = new T.Group();
        swing.add(hanger);
        hanger.translateY(1.8);
        let l_chain = new T.Group();
        let r_chain = new T.Group();
        hanger.add(l_chain);
        hanger.add(r_chain);
        // after creating chain groups, call the function to add chain links.
        growChain(l_chain, 20);
        growChain(r_chain, 20);
        l_chain.translateZ(0.4);
        r_chain.translateZ(-0.4);

        let seat_group = new T.Group();
        let seat_geom = new T.CubeGeometry(0.4, 0.1, 1);
        let seat_mat = new T.MeshStandardMaterial({ color: "#554433", metalness: 0.1, roughness: 0.6 });
        let seat = new T.Mesh(seat_geom, seat_mat);
        seat_group.add(seat);
        seat_group.position.set(0, -1.45, 0);
        hanger.add(seat_group);

        // note that we have to make the Object3D before we can call
        // super and we have to call super before we can use this
        super(`Swing`, swing);
        this.whole_ob = swing;
        this.hanger = hanger;
        this.seat = seat_group;

        // put the object in its place
        this.whole_ob.position.x = params.x ? Number(params.x) : 0;
        this.whole_ob.position.y = params.y ? Number(params.y) : 0;
        this.whole_ob.position.z = params.z ? Number(params.z) : 0;
        let scale = params.size ? Number(params.size) : 1;
        swing.scale.set(scale, scale, scale);

        this.swing_angle = 0;
        this.advance = function (delta, timeOfDay) {
            // in this animation, use the sine of the accumulated angle to set current rotation.
            // This means the swing moves faster as it reaches the bottom of a swing,
            // and faster at either end of the swing, like a pendulum should.
            this.swing_angle += 0.005 * delta;
            this.hanger.rotation.z = Math.sin(this.swing_angle) * Math.PI / 4;
            this.seat.rotation.z = Math.sin(this.swing_angle) * Math.PI / 16;
        };

        // This helper function creates the 5 posts for a swingset frame,
        // and positions them appropriately.
        function addPosts(group) {
            let post_material = new T.MeshStandardMaterial({ color: "red", metalness: 0.6, roughness: 0.5 });
            let post_geom = new T.CylinderGeometry(0.1, 0.1, 2, 16);
            let flPost = new T.Mesh(post_geom, post_material);
            group.add(flPost);
            flPost.position.set(0.4, 0.9, 0.9);
            flPost.rotateZ(Math.PI / 8);
            let blPost = new T.Mesh(post_geom, post_material);
            group.add(blPost);
            blPost.position.set(-0.4, 0.9, 0.9);
            blPost.rotateZ(-Math.PI / 8);
            let frPost = new T.Mesh(post_geom, post_material);
            group.add(frPost);
            frPost.position.set(0.4, 0.9, -0.9);
            frPost.rotateZ(Math.PI / 8);
            let brPost = new T.Mesh(post_geom, post_material);
            group.add(brPost);
            brPost.position.set(-0.4, 0.9, -0.9);
            brPost.rotateZ(-Math.PI / 8);
            let topPost = new T.Mesh(post_geom, post_material);
            group.add(topPost);
            topPost.position.set(0, 1.8, 0);
            topPost.rotateX(-Math.PI / 2);
        }

        // Helper function to add "length" number of links to a chain.
        function growChain(group, length) {
            let chain_geom = new T.TorusGeometry(0.05, 0.015);
            let chain_mat = new T.MeshStandardMaterial({ color: "#777777", metalness: 0.8, roughness: 0.2 });
            let link = new T.Mesh(chain_geom, chain_mat);
            group.add(link);
            for (let i = 0; i < length; i++) {
                let l_next = new T.Mesh(chain_geom, chain_mat);
                l_next.translateY(-0.07);
                link.add(l_next);
                l_next.rotation.set(0, Math.PI / 3, 0);
                link = l_next;
            }
        }
    }

}

export class GrColoredRoundabout extends GrObject {

    constructor(params = {}) {
        let roundabout = new T.Group();

        let base_geom = new T.CylinderGeometry(0.5, 1, 0.5, 16);
        let base_mat = new T.MeshStandardMaterial({ color: "#888888", metalness: 0.5, roughness: 0.8 });
        let base = new T.Mesh(base_geom, base_mat);
        base.translateY(0.25);
        roundabout.add(base);

        let platform_group = new T.Group();
        base.add(platform_group);
        platform_group.translateY(0.25);

        let section_geom = new T.CylinderGeometry(2, 1.8, 0.3, 8, 4, false, 0, Math.PI / 2);
        let section_mat;
        let section;

        let handle_geom = buildHandle();
        let handle_mat = new T.MeshStandardMaterial({ color: "#999999", metalness: 0.8, roughness: 0.2 });
        let handle;

        // in the loop below, we add four differently-colored sections, with handles,
        // all as part of the platform group.
        let section_colors = ["red", "blue", "yellow", "green"];
        for (let i = 0; i < section_colors.length; i++) {
            section_mat = new T.MeshStandardMaterial({ color: section_colors[i], metalness: 0.3, roughness: 0.6 });
            section = new T.Mesh(section_geom, section_mat);
            handle = new T.Mesh(handle_geom, handle_mat);
            section.add(handle);
            handle.rotation.set(0, Math.PI / 4, 0);
            handle.translateZ(1.5);
            platform_group.add(section);
            section.rotateY(i * Math.PI / 2);
        }

        // note that we have to make the Object3D before we can call
        // super and we have to call super before we can use this
        super(`Roundabout`, roundabout);
        this.whole_ob = roundabout;
        this.platform = platform_group;

        // put the object in its place
        this.whole_ob.position.x = params.x ? Number(params.x) : 0;
        this.whole_ob.position.y = params.y ? Number(params.y) : 0;
        this.whole_ob.position.z = params.z ? Number(params.z) : 0;
        let scale = params.size ? Number(params.size) : 1;
        roundabout.scale.set(scale, scale, scale);

        this.advance = function (delta, timeOfDay) { this.platform.rotateY(0.005 * delta); };

        // This helper function defines a curve for the merry-go-round's handles,
        // then extrudes a tube along the curve to make the actual handle geometry.
        function buildHandle() {
            /**@type THREE.CurvePath */
            let handle_curve = new T.CurvePath();
            handle_curve.add(new T.LineCurve3(new T.Vector3(-0.5, 0, 0), new T.Vector3(-0.5, 0.8, 0)));
            handle_curve.add(new T.CubicBezierCurve3(new T.Vector3(-0.5, 0.8, 0), new T.Vector3(-0.5, 1, 0), new T.Vector3(0.5, 1, 0), new T.Vector3(0.5, 0.8, 0)));
            handle_curve.add(new T.LineCurve3(new T.Vector3(0.5, 0.8, 0), new T.Vector3(0.5, 0, 0)));
            return new T.TubeGeometry(handle_curve, 64, 0.1, 8);
        }
    }
}

export class Scraper extends GrObject {
    constructor(params = {}) {
        let build = new T.Group();
        let buildingGeom = new T.BoxGeometry(7, 16, 7);
        buildingGeom.computeFaceNormals();
        let botGeom = new T.BoxGeometry(12, 12, 7);
        let buildingTexture = new T.TextureLoader().load("./Pictures/building.jpg");
        let buildingMaterial = new T.MeshStandardMaterial({
            color: "white",
            map: buildingTexture,
            roughness: 1.0,
            side: T.DoubleSide
        });

        let mesh = new T.Mesh(buildingGeom, buildingMaterial);
        mesh.translateX(params.x || 0);
        mesh.translateY(20 || 0);
        mesh.translateZ(-params.z || 0);

        let mesh1 = new T.Mesh(botGeom, buildingMaterial);
        mesh1.translateX(params.x);
        mesh1.translateY(6);
        mesh1.translateZ(-params.z);

        build.add(mesh);
        build.add(mesh1);
        // build.add(mesh2);
        // build.add(mesh3);
        build.castShadow = true;
        build.receiveShadow = true;

        // let p = new T.BoxGeometry(4, 1, 4);
        // let pmat = new T.MeshStandardMaterial({ color: "black" });
        // let meshp = new T.Mesh(p, pmat);
        // meshp.position.set(20, 26.8, -20);
        // build.add(meshp);
        super("skyscraper", build);
    }
}


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
            // medalness: 0.9,
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

        let roof_geom = new T.ConeGeometry(width, 0.5 * width, 32, 4);
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
            this.hourses.forEach(function (x) {
                i += 3;
                x.position.y = 0.8 * Math.sin(t + i) + 1.4;
            });
        };
    }
}

export class Ball extends GrObject {

    constructor(track, params = {}) {

        let shaderMat = shaderMaterial("./Examples/ball.vs", "./Examples/ball.fs",
            {
                side: T.DoubleSide,
                uniforms: {
                    checks: { value: 20.0 },
                    size: { value: 0 },
                    light: { value: new T.Vector3(1, 1, 1) },
                    dark: { value: new T.Vector3(0.4, 0.6, 0.8) }
                }
            });

        let geom = new T.SphereBufferGeometry(3,32, 6);

        let sphere = new T.Mesh(geom, shaderMat);

        // group.add(ball);
        // note that we have to make the Object3D before we can call
        // super and we have to call super before we can use this
        super(`Ball`, sphere);
        this.whole_ob = sphere;
        this.track = track;
        this.u = 0;
        this.rideable = this.objects[0];

        // put the object in its place
        this.whole_ob.position.x = params.x ? Number(params.x) : 0;
        this.whole_ob.position.y = params.y ? Number(params.y) : 0;
        this.whole_ob.position.z = params.z ? Number(params.z) : 0;
        let scale = params.size ? Number(params.size) : 1;
        sphere.scale.set(scale, scale, scale);

        this.advance = function (delta, timeofday) {
            let newR = Math.sin(delta / 200) / 5 + 0.5;      // get a number between 0-1
            shaderMat.uniforms.dark.value.y = newR;

            this.u += delta / 2000;
            let pos = this.track.eval(this.u);
            // remember, the center of the cube needs to be above ground!
            this.objects[0].position.set(pos[0], 0.5 + pos[1]+2, pos[2]);
            let dir = this.track.tangent(this.u);
            // since we can't easily construct the matrix, figure out the rotation
            // easy since this is 2D!
            let zAngle = Math.atan2(dir[2], dir[0]);
            // turn the object so the Z axis is facing in that direction
            this.objects[0].rotation.y = -zAngle - Math.PI / 2;
        };
    }
}

