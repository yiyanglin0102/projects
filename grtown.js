/*jshint esversion: 6 */
// @ts-check

/**
 * Graphics Town Framework - "Main" File
 * 
 * This is the main file - it creates the world, populates it with 
 * objects and behaviors, and starts things running
 * 
 * The initial distributed version has a pretty empty world.
 * There are a few simple objects thrown in as examples.
 * 
 * It is the students job to extend this by defining new object types
 * (in other files), then loading those files as modules, and using this
 * file to instantiate those objects in the world.
 */

// these four lines fake out TypeScript into thinking that THREE
// has the same type as the T.js module, so things work for type checking
// type inferencing figures out that THREE has the same type as T
// and then I have to use T (not THREE) to avoid the "UMD Module" warning
/**  @type typeof import("./THREE/threets/index"); */
let T;
// @ts-ignore
T = THREE;

import { GrWorld } from "./Framework/GrWorld.js";
import { GrObject } from "./Framework/GrObject.js";  // only for typing
import * as Helpers from "./Libs/helpers.js";
import { WorldUI } from "./Framework/WorldUI.js";

/** These imports are for the examples - feel free to remove them */
import { SimpleHouse } from "./Examples/house.js";
import { GrForkLift, CircularTrack, TrackCube, TrackAirplane, GrLocomotive, GrTrainTrack, SplineTrack,
     SquareTrack, LavaTrack, Lava, GrQuadcopter, RaingDrop, RainningTrack,GrTruck,GrAdvancedSwing,
     GrColoredRoundabout,Scraper,House_1, House_2, House_3, Tree, RoadH, RoadV, GrCrane, SkyScraper, GrExcavator, GrGarbageTruck, Mountain, GrCarousel ,Ball } from "./Examples/track.js";
import { Helicopter, Helipad } from "./Examples/helicopter.js";
// import { House_1, House_2, House_3, Tree, RoadH, RoadV, GrCrane, SkyScraper, GrExcavator, GrGarbageTruck, Mountain, GrCarousel } from "./Examples/constructionobjects.js";


/**
 * The Graphics Town Main - 
 * This builds up the world and makes it go...
 */
function grtown() {
    // make the world
    let world = new GrWorld({
        width: 1100, height: 600,         // make the window reasonably large
        groundplanesize: 50              // make the ground plane big enough for a world of stuff
    });
    let loader = new T.CubeTextureLoader();
    loader.setPath("./Pictures/");
    let textureCuBe = loader.load([
        'front.jpg',
        'back.jpg',
        'top.jpg',
        'down.jpg',
        'right.jpg',
        'left.jpg'
    ]);

    // make two rows of houses, mainly to give something to look at
    for (let i = -19; i < 20; i += 5) {
        world.add(new SimpleHouse({ x: i, z: -12 }));
        world.add(new SimpleHouse({ x: i, z: 12 }));
    }


    for (let i = 0; i < 30; i += 1) {
        let rainTrack = new RainningTrack({ x: Math.random() * 100 - 50, y: Math.random() * 100, z: Math.random() * 100 - 60 });
        world.add(new RaingDrop(rainTrack, { length: Math.random() * 60 - 30 }));
    }

    /** Race Track - with three things racing around */
    let sqtrack = new SquareTrack({ x: 20, z: -30, perimeter: 15 });
    let sptrack = new SplineTrack({ x: -35, y: 0, z: -33 });
    let track = new CircularTrack({ x: 0, y: 1, z: 0, perimeter: 60 });
    let lvtrack = new LavaTrack({ x: -35, y: 0, z: -35, perimeter: 60 });

    let airplane = new TrackAirplane(sptrack);
    let exc = new GrExcavator({ x: 32, y: 0, z: -33});
    let truck = new GrTruck({ x: 40, y: 0, z: 10});
    let swing = new GrAdvancedSwing({ x: 32, y: 0, z: 33});
    let round = new  GrColoredRoundabout({ x: 25, y: 0, z: 33});
    let scraper = new  Scraper({ x: -40, y: 0, z: -33});
    
    let tc2 = new GrForkLift(sqtrack);
    // let sptc3 = new GrLocomotive(sptrack);
    // let sptc4 = new GrTrainTrack(sptrack);
    // let sptc5 = new GrTrainTrack(sptrack);
    // let sptc6 = new GrTrainTrack(sptrack);
    // let sptc7 = new GrTrainTrack(sptrack);
    // let sptc8 = new GrTrainTrack(sptrack);
    // let sptc9 = new GrTrainTrack(sptrack);
    // let sptc10 = new GrTrainTrack(sptrack);

    let lava = new Lava(lvtrack);

    let tc3 = new GrLocomotive(track);
    let tc4 = new GrTrainTrack(track);
    let tc5 = new GrTrainTrack(track);
    let tc6 = new GrTrainTrack(track);
    let tc7 = new GrTrainTrack(track);
    let tc8 = new GrTrainTrack(track);
    let tc9 = new GrTrainTrack(track);
    let tc10 = new GrTrainTrack(track);

    // place things are different points on the track
    // tc2.u = 0.25;
    
    tc3.u = 0.15;
    tc4.u = 0.13;
    tc5.u = 0.115;
    tc6.u = 0.1;
    tc7.u = 0.085;
    tc8.u = 0.07;
    tc9.u = 0.055;
    tc10.u = 0.04;
    truck.u = 0.3;

    // sptc3.u = 0.15;
    // sptc4.u = 0.13;
    // sptc5.u = 0.115;
    // sptc6.u = 0.1;
    // sptc7.u = 0.085;
    // sptc8.u = 0.07;
    // sptc9.u = 0.055;
    // sptc10.u = 0.04;
    // lava.u = 0;
    // and make sure they are in the world
    world.add(track);
    world.add(swing);
    world.add(round);
    world.add(scraper);


    // world.add(tc1);
    world.add(tc3);
    world.add(tc2);
    world.add(tc4);
    world.add(tc5);
    world.add(tc6);
    world.add(tc7);
    world.add(tc8);
    world.add(tc9);
    world.add(airplane);
    world.add(exc);
    world.add(truck);
    world.add(lava);

    // world.add(sptc3);
   
    // world.add(sptc5);
    // // world.add(sptc6);
    // world.add(sptc7);
    // // world.add(sptc8);
    // world.add(sptc9);
    // world.add(tc10);

    // let t1 = shift(new Train_1(), 0, 0, -2);
    // world.add(t1);

    // world.add(new Helipad(-15, 0, 0));
    // world.add(new Helipad(15, 0, 0));
    world.add(new Helipad(-40, 28, 33));
    world.add(new Helipad(-50, 0, -50));
    let copter = new Helicopter();
    world.add(copter);
    copter.getPads(world.objects);

    let crane = new GrCrane({ x: 45, z: 48 });
    world.add(crane);
    let c = shift(new GrCarousel(), 40, 0, 30);
    world.add(c);

    let m = shift(new Mountain(), -35, 0, -35);
    world.add(m);

    let building = new SkyScraper({ y: -1500.5 });
    world.add(building);


    for (let i = 0; i < 10; i++) {
        let t1 = shift(new House_1(), i * 5, 0, -40);
        world.add(t1);

        let t2 = shift(new House_2(), -35, 0, -30 + 5 * i);
        world.add(t2);

        let t3 = shift(new House_3(), 40 - i * 8, 0, 40);
        world.add(t3);

    }

    let ball = new Ball(track);
    ball.u = 0.25;
    world.add(ball);

    let t4 = shift(new RoadV(), 10, 0, 35);
    world.add(t4);

    let t8 = shift(new RoadV(), 5, 0, 50);
    world.add(t8);

    let t5 = shift(new RoadH(), 39, 0, -15);
    world.add(t5);

    let t9 = shift(new RoadH(), 45, 0, -15);
    world.add(t9);

    let t6 = shift(new RoadV(), 10, 0, 50);
    world.add(t6);

    let t7 = shift(new RoadH(), 40, 0, 0);
    world.add(t7);

    let t10 = shift(new RoadH(), 45, 0, 0);
    world.add(t10);

    function wood() {
        let tree1 = shift(new Tree(), -30, 0, 20);
        world.add(tree1);

        let tree2 = shift(new Tree(), 20, 0, 20);
        world.add(tree2);

        let tree3 = shift(new Tree(), -30, 0, 20);
        world.add(tree3);

        let tree4 = shift(new Tree(), 30, 0, 10);
        world.add(tree4);

        let tree5 = shift(new Tree(), -40, 0, 0);
        world.add(tree5);

        let tree6 = shift(new Tree(), 30, 0, 0);
        world.add(tree6);

        let tree7 = shift(new Tree(), 40, 0, 0);
        world.add(tree7);

        let tree8 = shift(new Tree(), -4, 0, 30);
        world.add(tree8);

        let tree9 = shift(new Tree(), -30, 0, 30);
        world.add(tree9);

        let tree10 = shift(new Tree(), -30, 0, 30);
        world.add(tree10);

        let tree11 = shift(new Tree(), -30, 0, 30);
        world.add(tree11);

        let tree12 = shift(new Tree(), 30, 0, -30);
        world.add(tree12);

        let tree13 = shift(new Tree(), 30, 0, -28);
        world.add(tree13);

        let tree14 = shift(new Tree(), 35, 0, -35);
        world.add(tree14);

        let tree15 = shift(new Tree(), -30, 0, 40);
        world.add(tree15);


    }
    wood();
    
    // build and run the UI
    // only after all the objects exist can we build the UI
    // @ts-ignore       // we're sticking a new thing into the world
    world.ui = new WorldUI(world);
    // now make it go!
    world.scene.background = textureCuBe;
    textureCuBe.format = T.RGBFormat;
    world.go();
}
Helpers.onWindowOnload(grtown);


function shift(grobj, x, y, z) {

    grobj.objects[0].translateX(x);
    grobj.objects[0].translateY(y);
    grobj.objects[0].translateZ(z);

    return grobj;
}

