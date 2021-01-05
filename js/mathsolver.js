class MathSolver{
    static radToDeg(rad){
        return rad * 180 / Math.PI;
    }

    static degToRad(deg){
        return deg * Math.PI / 180;
    }
}

export {MathSolver};