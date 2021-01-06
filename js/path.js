import {Vector3} from "./three.module.js";
import {MathSolver} from "./mathsolver.js";

const BOT_SPEED = 0.5;
const MAXIMUM_ROTATION_ANGLE_RAD = MathSolver.degToRad(10);
const PI = Math.PI;

class Path{
    constructor(x,y,z) {
        this.destination = new Vector3();
        this.destination.x = x;
        this.destination.y = y;
        this.destination.z = z;
    }

    getNextPosition(curPos, headingAngle) {
        const nextPositionInPath = new PositionInPath();

        nextPositionInPath.position.x = this.destination.x// curPos.x + this.findNextPos(curPos.x, this.destination.x);
        nextPositionInPath.position.y = curPos.y;
        nextPositionInPath.position.z = this.destination.z; // curPos.z + this.findNextPos(curPos.z, this.destination.z);
        nextPositionInPath.headingAngleDifference = 0;
        let globalAngleToDestination = 0;

        if (nextPositionInPath.position.x != curPos.x || nextPositionInPath.position.z != curPos.z){
            let angleToDestination = this.getAngleToNextPos(nextPositionInPath, curPos);
            globalAngleToDestination = this.shiftAngleToRightQuardrant(angleToDestination, curPos, nextPositionInPath);
            let angleDifference = Math.abs(globalAngleToDestination - headingAngle);
            nextPositionInPath.isRotationCounterClockwise = angleDifference < Math.PI && globalAngleToDestination > headingAngle;

            if (angleDifference > MAXIMUM_ROTATION_ANGLE_RAD) {
                angleDifference = MAXIMUM_ROTATION_ANGLE_RAD;
                console.log('angleDifference: ' + MathSolver.radToDeg(angleDifference) + ' ,heading: ' + MathSolver.radToDeg(headingAngle) + ' ,globalAngleToDestination: ' + MathSolver.radToDeg(globalAngleToDestination));
            }

            nextPositionInPath.headingAngleDifference = angleDifference;
        }

        this.findNextPos(curPos, this.destination, globalAngleToDestination, nextPositionInPath);
        /*nextPositionInPath.position.y = curPos.y;
        nextPositionInPath.headingAngleDifference = headingAngle;

        nextPositionInPath.position.x = curPos.x + this.findNextPos(curPos.x, this.destination.x);
        nextPositionInPath.position.z = curPos.z + this.findNextPos(curPos.z, this.destination.z);

        if (nextPositionInPath.position.x != curPos.x || nextPositionInPath.position.z != curPos.z){
            let originalAngle = this.getAngleToNextPos(nextPositionInPath, curPos);

            if (Math.abs(originalAngle) == MathSolver.degToRad(10)){

            }

            originalAngle = this.shiftAngleToRightQuardrant(originalAngle, curPos, nextPositionInPath);

            let angleDiff = originalAngle - headingAngle;

            if (Math.abs(angleDiff) > MathSolver.degToRad(10) ){
                angleDiff = originalAngle < 0? -1 * MathSolver.degToRad(10) : MathSolver.degToRad(10);
            }

            //if (angleDiff != 0){
                //console.log('angle: ' + MathSolver.radToDeg(angleDiff) + ' ,heading: ' + MathSolver.radToDeg(headingAngle));
                //nextPositionInPath.headingAngleDifference = angleDiff - headingAngle
            //}
        }*/

        // nextPositionInPath.position.copy(curPos);
        return nextPositionInPath;
    }

    /*findNextPos(curPos, endPos){
        if (curPos < endPos){
            // return BOT_SPEED > (endPos - curPos) ? (endPos - curPos) : BOT_SPEED;
        }else if(curPos > endPos){
            return BOT_SPEED > (curPos - endPos) ? (endPos - curPos) : -1 * BOT_SPEED;
        }else {
            return 0;
        }
    }*/

    getAngleToNextPos(nextPositionInPath, curPos){
        let angle =  Math.atan((nextPositionInPath.position.x - curPos.x )/(nextPositionInPath.position.z - curPos.z));
        return angle;
    }

    findNextPos(curPos, endPos, globalHeadingAngle, nextPositionInPath){
        let angle = 0;
        const distanceToDestination = MathSolver.distanceXZ(curPos, endPos);


        if (globalHeadingAngle >= 3*PI/2 && globalHeadingAngle < 2 * PI){
            angle = globalHeadingAngle - 2 * PI;
        }else if (PI/2 >= globalHeadingAngle && globalHeadingAngle < 3*PI/2){
            angle = globalHeadingAngle - 2 * PI;
        }else {
            angle = globalHeadingAngle;
        }

        if (distanceToDestination < BOT_SPEED){
            nextPositionInPath.position.z = parseFloat(endPos.z);
            nextPositionInPath.position.x = parseFloat(endPos.x);
        }else {
            let r = BOT_SPEED;
            let z = r * Math.cos(angle) + parseFloat(curPos.z);
            let x = Math.sqrt(r*r - (z - curPos.z)*(z - curPos.z)) + parseFloat(curPos.x);

            nextPositionInPath.position.z = z;
            nextPositionInPath.position.x = x;
        }
    }


    shiftAngleToRightQuardrant(angle, curPos, nextPos){
        const isXIncreasing = nextPos.position.x > curPos.x;
        const isZIncreasing = nextPos.position.z > curPos.z;
        const isXSame = nextPos.position.x == curPos.x;
        const isZSame = nextPos.position.z == curPos.z;
        const isXDecreasing = !isXSame && !isXIncreasing;
        const isZDecreasing = !isZSame && !isZIncreasing;

        /*if(isXIncreasing && isZIncreasing){
            return angle;
        } else if(isXIncreasing && isZDecreasing){
            return angle - Math.PI;
        } else if(isXIncreasing && isZSame){
            return angle + Math.PI/2;
        } else if(isXSame && isZIncreasing){
            return angle - Math.PI/2;
        } else if(isXSame && !isZIncreasing){
            return angle - Math.PI/2;
        } else if(isXDecreasing && isZIncreasing ){
            return angle;
        } else if(isXDecreasing && isZSame ){
            return angle;
        } else if(isXDecreasing && isZDecreasing ){
            return angle;
        }*/

        if (isZDecreasing){
            return Math.PI + angle;
        }else if (isXDecreasing && isZIncreasing){
            return 2 * Math.PI + angle;
        }else{
            return angle;
        }
    }

    setDestination(x,y,z){
        this.destination = new Vector3();
        this.destination.x = x;
        this.destination.y = y;
        this.destination.z = z;
    }

    clearDestination(){
        this.destination = undefined;
    }
}

class PositionInPath{
    constructor(){
        this.position = new Vector3();
        this.headingAngleDifference = undefined;
        this.isRotationCounterClockwise = true;
    }
}

export {Path, PositionInPath};
