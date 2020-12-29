import {
    CylinderBufferGeometry,
    Geometry, Line, LineBasicMaterial,
    Mesh,
    MeshStandardMaterial, MeshLambertMaterial,
    PlaneGeometry,
    TextureLoader, Vector3, RepeatWrapping, sRGBEncoding
} from "./three.module.js";
import {Path} from "./path.js";


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
        this.mesh.rotateY((newPosition.headingAngle - this.heading));
        this.heading = newPosition.headingAngle;
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
        const groundTexture = loader.load( './textures/grasslight-big.jpg' );
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
        geometry.vertices.push(pt2);
        const material = new LineBasicMaterial( { color: 0x4A7023 } );

        this.line = new Line(geometry, material);
    }

    updateSource(pt){
        this.line.geometry.vertices[0] = pt;
        this.line.geometry.verticesNeedUpdate = true;
    }
}

export {Bot, Ground};