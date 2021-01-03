import {Vector3} from "./three.module.js";
import {MathSolver} from "./mathsolver.js";

const BOT_SPEED = 0.5;

class Path{
    constructor(x,y,z) {
        this.destination = new Vector3();
        this.destination.x = x;
        this.destination.y = y;
        this.destination.z = z;
    }

    getNextPosition(curPos, headingAngle) {
        const nextPositionInPath = new PositionInPath();
        nextPositionInPath.position.y = curPos.y;
        nextPositionInPath.headingAngle = headingAngle;

        nextPositionInPath.position.x = curPos.x + this.findNextPos(curPos.x, this.destination.x);
        nextPositionInPath.position.z = curPos.z + this.findNextPos(curPos.z, this.destination.z);

        if (nextPositionInPath.position.x != curPos.x || nextPositionInPath.position.z != curPos.z){
            let angle = Math.atan((nextPositionInPath.position.z - curPos.z )/(nextPositionInPath.position.x - curPos.x));
            angle = this.shiftAngleToRightQuardrant(angle, curPos, nextPositionInPath);

            if (angle != headingAngle){
                console.log('angle: ' + MathSolver.radToDeg(angle) + ' ,heading: ' + MathSolver.radToDeg(headingAngle));
                nextPositionInPath.headingAngle = angle;
            }
        }

        return nextPositionInPath;
    }

    findNextPos(curPos, endPos){
        if (curPos < endPos){
            return BOT_SPEED > (endPos - curPos) ? (endPos - curPos) : BOT_SPEED;
        }else if(curPos > endPos){
            return BOT_SPEED > (curPos - endPos) ? (endPos - curPos) : -1 * BOT_SPEED;
        }else {
            return 0;
        }
    }


    shiftAngleToRightQuardrant(angle, curPos, nextPos){
        const isXIncreasing = nextPos.position.x > curPos.x;
        const isZIncreasing = nextPos.position.z > curPos.z;
        const isXSame = nextPos.position.x == curPos.x;
        const isZSame = nextPos.position.z == curPos.z;
        const isXDecreasing = !isXSame && !isXIncreasing;
        const isZDecreasing = !isZSame && !isZIncreasing;

        if(isXIncreasing && isZIncreasing){
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
        this.headingAngle = undefined;
    }
}

export {Path, PositionInPath};