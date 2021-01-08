import {
	ACESFilmicToneMapping,
	PCFSoftShadowMap,
	PerspectiveCamera,
	Scene,
	sRGBEncoding,
	WebGLRenderer,
    AxesHelper
} from "./three.module.js";

class Manager{
	constructor() {
		this.scene = new Scene();

		/*
		 * Renderer
		 */
		this.renderer = new WebGLRenderer({
			antialias: true,
		});
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = PCFSoftShadowMap
		this.renderer.physicallyCorrectLights = true;
		this.renderer.toneMapping = ACESFilmicToneMapping;
		this.renderer.outputEncoding = sRGBEncoding;
		document.body.appendChild( this.renderer.domElement );

		/*
		 * Camera
		 */
		this.camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
		this.camera.position.set(74,100,0) ;

        const axesHelper = new AxesHelper( 25 );
        axesHelper.position.set(0,3,0);
        this.scene.add( axesHelper );


		this.mixer = undefined;

		/*
		 * Models
		 */
		this.objects = [];
		this.ground = undefined;
		this.bot = undefined;
		this.tiger = undefined
	}
}

export {Manager};
