class MathSolver{
    static radToDeg(rad){
        return rad * 180 / Math.PI;
    }

    static degToRad(deg){
        return deg * Math.PI / 180;
    }

    static distanceXZ(pos1, pos2){
        return Math.sqrt((pos1.x - pos2.x)*(pos1.x - pos2.x) + (pos1.z - pos2.z)*(pos1.z - pos2.z))
    }
}

export {MathSolver};