import {
	ACESFilmicToneMapping,
	BoxGeometry,
	PCFSoftShadowMap,
	PerspectiveCamera,
	Scene,
	sRGBEncoding,
	WebGLRenderer,
    AxesHelper,
    Color,
    Fog,
	ReinhardToneMapping,
	MeshFaceMaterial,
	MeshStandardMaterial,
	TextureLoader,
	RepeatWrapping,
	Mesh
} from "./three.module.js";

class Manager{
	constructor() {
		this.scene = new Scene();

        this.scene.background = new Color( 0xcce0ff );
        this.scene.fog = new Fog( 0xcce0ff, 500, 10000 );

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
		// this.renderer.toneMapping = ACESFilmicToneMapping;
		this.renderer.toneMapping = ReinhardToneMapping
		this.renderer.toneMappingExposure = 2.3;
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

		/*
		 * Wall
		 */
		const textureVerticleLong = new TextureLoader().load('./textures/plant_cr.jpg');
        textureVerticleLong.wrapS = RepeatWrapping;
        textureVerticleLong.repeat.set(78,1);
		const textureHorizontalLong = new TextureLoader().load('./textures/plant_cr.jpg');
        textureHorizontalLong.wrapT = RepeatWrapping;
        textureHorizontalLong.repeat.set(1, 78);
        const textureShort = new TextureLoader().load('./textures/plant_cr.jpg');

        const materialVerticleLong = new MeshStandardMaterial( { map: textureVerticleLong } );
		const materialhorizontalLong = new MeshStandardMaterial( { map: textureHorizontalLong } );
        const materialShort = new MeshStandardMaterial( { map: textureShort } );


        const leftWall = new BoxGeometry(990, 20, 20);
		const leftWallProperties = {
			x: 0,
			y: 5,
			z: 445,
			material: new MeshFaceMaterial([
				materialShort, // +x
				materialShort, // -x
				materialVerticleLong, // +y
				materialVerticleLong, // -y
				materialVerticleLong, // +z
				materialVerticleLong // -z
			])
		}
		this.scene.add(this._makeWall(leftWall, leftWallProperties));

		const rightWall = new BoxGeometry(990, 20, 20);
		const rightWallProperties = {
			x: 0,
			y: 5,
			z: -445,
			material: new MeshFaceMaterial([
				materialShort, // +x
				materialShort, // -x
				materialVerticleLong, // +y
				materialVerticleLong, // -y
				materialVerticleLong, // +z
				materialVerticleLong // -z
			])
		}
		this.scene.add(this._makeWall(rightWall, rightWallProperties));

		const topWall = new BoxGeometry(20, 20, 990);
		const topWallProperties = {
			x: -445,
			y: 5,
			z: 0,
			material: new MeshFaceMaterial([
				materialVerticleLong, // +x
				materialVerticleLong, // -x
				materialhorizontalLong, // +y
				materialhorizontalLong, // -y
				materialShort, // +z
				materialShort // -z
			])	
		}
		this.scene.add(this._makeWall(topWall, topWallProperties));

		const bottomWall = new BoxGeometry(20, 20, 990);
		const bottomWallProperties = {
			x: 445,
			y: 5,
			z: 0,
			material: new MeshFaceMaterial([
				materialVerticleLong, // +x
				materialVerticleLong, // -x
				materialhorizontalLong, // +y
				materialhorizontalLong, // -y
				materialShort, // +z
				materialShort // -z
			])
		}
		this.scene.add(this._makeWall(bottomWall, bottomWallProperties));
	}

	_makeWall(object, properties){
		const mesh = new Mesh( object, properties.material );
		
		mesh.castShadow = true; 
        mesh.receiveShadow = true; 
        mesh.position.set(properties.x, properties.y, properties.z)
		mesh.geometry.uvsNeedUpdate = true;
		return mesh
    }
}

export {Manager};
