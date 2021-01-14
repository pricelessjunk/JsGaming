import {
    CylinderBufferGeometry,
    Geometry, Line, LineBasicMaterial,
    Mesh,
    MeshStandardMaterial, MeshLambertMaterial,
    PlaneGeometry,
    TextureLoader, Vector3, RepeatWrapping, sRGBEncoding, AnimationMixer, LoopOnce
} from "./three.module.js";
import {Path} from "./path.js";
import {FBXLoader} from "./three.js/examples/jsm/loaders/FBXLoader.js";


const COLOR_DEFAULT = 0xffffff;
const COLOR_SELECTED = 0x000000;

class Bot {
    constructor() {
        this.isSelected = false;
        this.destinationSet = false;
        this.type = "bot";
        this.state = "idle";
        this.heading = 0;
        this.destination = undefined;

        const geometry = new CylinderBufferGeometry(1,3 ,6,);
        geometry.rotateZ(Math.PI / 2);
        const material = new MeshStandardMaterial( { color: COLOR_DEFAULT} );
        this.mesh = new Mesh( geometry, material );

        this.mesh.castShadow = true; //default = false
        this.mesh.receiveShadow = true; //default false
        this.mesh.position.set(0,3,0)
    }

    select(){
        this.isSelected = true;
        this.mesh.material.color.setHex(COLOR_SELECTED);
    }

    deselect(){
        this.isSelected = false;
        this.mesh.material.color.setHex(COLOR_DEFAULT);
    }

    turnAndMoveToDestination(){
        const newPosition = this.path.getNextPosition(this.mesh.position, this.heading);

        this.mesh.position.x = newPosition.position.x;
        this.mesh.position.z = newPosition.position.z;
        this.mesh.rotateY((newPosition.headingAngleDifference - this.heading));
        this.heading = newPosition.headingAngleDifference;
    }

    processStates(scene){
        if (this.state == "idle"){
            if (this.path && (this.mesh.position.x != this.path.destination.x || this.mesh.position.z !=this.path.destination.z)){
                this.state = "moving";
                this.turnAndMoveToDestination();
                this.connector = new LineConnector(this.mesh.position, this.path.destination);
                scene.add(this.connector.line);
            }
        }else if (this.state == "moving"){
            if (this.mesh.position.x == this.path.destination.x && this.mesh.position.z == this.path.destination.z){
                this.state = "idle";
                scene.remove(this.connector.line);
                this.path = undefined;
            }else if (this.path && this.mesh.position.x != this.path.destination.x || this.mesh.position.z !=this.path.destination.z){
                this.turnAndMoveToDestination();
                this.connector.updateSource(this.mesh.position);
            }
        }
    }

    setPathToDestination(xp, yp, zp) {
        this.path = new Path(xp, yp, zp);
    }

}

class Ground {
    constructor() {
        this.isSelected = false;
        this.type = "Ground";

        const geometry = new PlaneGeometry(1000,1000,10,10);
        // const material = new MeshStandardMaterial( { color: 0x4A7023 } );

        const loader = new TextureLoader();
        const groundTexture = loader.load( './resources/textures/grasslight-big.jpg' );
        groundTexture.wrapS = groundTexture.wrapT = RepeatWrapping;
        groundTexture.repeat.set( 25, 25 );
        groundTexture.anisotropy = 16;
        groundTexture.encoding = sRGBEncoding;

        const material = new MeshLambertMaterial( { map: groundTexture } );

        this.mesh = new Mesh( geometry, material );

        this.mesh.castShadow = false; //default is false
        this.mesh.receiveShadow = true; //default is false
        this.mesh.rotateX(-Math.PI/2)
    }
}

class LineConnector{
    constructor(pt1, pt2) {
        const geometry = new Geometry();
        geometry.vertices.push(pt1);
        pt2.y = 3; // matching the objects height
        geometry.vertices.push(pt2);
        const material = new LineBasicMaterial( { color: 0x4A7023 } );

        this.line = new Line(geometry, material);
    }

    updateSource(pt){
        this.line.geometry.vertices[0] = pt;
        this.line.geometry.verticesNeedUpdate = true;
    }
}

class Tiger{
    constructor(scene, mixer) {
        const loader = new FBXLoader();
        this.isSelected = false;
        this.destinationSet = false;
        this.type = "bot";
        this.state = "idle";
        this.heading = 0;
        this.destination = undefined;

        loader.load('./resources/model/tiger/tiger_run.fbx', (fbx) => {
            fbx.scale.multiplyScalar(0.1);
            this.mixer  = new AnimationMixer( fbx );

            this.action = this.mixer.clipAction( fbx.animations[ 0 ] );
            this.action.play();
            this.action.paused = true;
            this.isRunning = false;

            fbx.traverse( function ( child ) {
                if ( child.isMesh ) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            this.fbx = fbx;
            this.mesh = fbx.children[0].children[0];
            scene.add(fbx);
        });

        loader.load('./resources/model/tiger/selector/greendiamond.fbx', (fbx) => {
            fbx.scale.multiplyScalar(0.02);
            fbx.traverse( function ( child ) {
                if ( child.isMesh ) {
                    child.castShadow = false;
                    child.receiveShadow = false;
                }
            });

            this.selector = {
                fbx : fbx,
                mesh : fbx.children[0].children[0]
            };

            // scene.add(fbx);
        });
    }

    run(run){
        const oldPosition = new Vector3();
        oldPosition.copy(this.fbx.position);

        this.isRunning = run;
        if (run){
            this.action.paused = false;
        }else{
            this.action.reset();
            this.action.paused = true;
        }

        // this.fbx.position.set(oldPosition.x, oldPosition.y, oldPosition.z);
    }

    select(scene){
        this.isSelected = true;
        // this.mesh.material.color.setHex(COLOR_SELECTED);
        scene.add(this.selector.fbx);
    }

    deselect(scene){
        this.isSelected = false;
        // this.mesh.material.color.setHex(COLOR_DEFAULT);
        scene.remove(this.selector.fbx);
    }

    turnAndMoveToDestination(){
        const newPosition = this.path.getNextPosition(this.fbx.position, this.heading);

        this.fbx.position.x = newPosition.position.x;
        this.fbx.position.z = newPosition.position.z;
        this.fbx.rotateZ(newPosition.isRotationCounterClockwise? newPosition.headingAngleDifference : -1 * newPosition.headingAngleDifference);
        this.heading = newPosition.isRotationCounterClockwise ?
            this.fullRotateAngles(this.heading + newPosition.headingAngleDifference) :
            this.fullRotateAngles(this.heading - newPosition.headingAngleDifference) ;
    }

    fullRotateAngles(angle){
        if (angle > 2 * Math.PI){
            return angle - 2 * Math.PI
        } else if (angle < 0){
            return angle + 2 * Math.PI
        } else {
            return angle
        }
    }

    processStates(scene){
        if (this.state == "idle"){
            if (this.path && (this.fbx.position.x != this.path.destination.x || this.fbx.position.z !=this.path.destination.z)){
                this.state = "moving";
                this.run(true);
                this.turnAndMoveToDestination();
                this.connector = new LineConnector(this.fbx.position, this.path.destination);
                scene.add(this.connector.line);
            }
        }else if (this.state == "moving"){
            if (this.fbx.position.x == this.path.destination.x && this.fbx.position.z == this.path.destination.z){
                this.state = "idle";
                this.run(false);
                scene.remove(this.connector.line);
                this.path = undefined;
            }else if (this.path && this.fbx.position.x != this.path.destination.x || this.fbx.position.z !=this.path.destination.z){
                this.turnAndMoveToDestination();
                this.connector.updateSource(this.fbx.position);
            }
        }
    }

    setPathToDestination(xp, yp, zp) {
        this.path = new Path(xp, yp, zp);
    }
}

class Cow{
    constructor(scene) {
        const loader = new FBXLoader();
        this.isSelected = false;
        this.type = "bot";
        this.state = "idle";
        this.heading = 0;

        loader.load('./resources/model/cow/FarmCow.fbx', (fbxCow) => {
            fbxCow.scale.multiplyScalar(0.1);
            fbxCow.position.x = 10;
            /*this.mixer  = new AnimationMixer( fbx );

            this.action = this.mixer.clipAction( fbx.animations[ 0 ] );
            this.action.play();
            this.action.paused = true;
            this.isRunning = false;*/

            const animations = fbxCow.animations;
            const mixer = new AnimationMixer( fbxCow );

            const idleAction = mixer.clipAction( animations[ 0 ] );
            const actions = [ idleAction ];
            actions[0].play();

            fbxCow.traverse( function ( child ) {
                if ( child.isMesh ) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            this.fbx = fbxCow;
            this.mesh = fbxCow.children[0].children[0];
            scene.add(fbxCow);
        });
    }
    

}

export {Bot, Ground, Tiger, Cow};
