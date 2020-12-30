import {
  Scene, PerspectiveCamera, WebGLRenderer,
  DirectionalLight, AmbientLight, Raycaster,
  PCFSoftShadowMap, ACESFilmicToneMapping, sRGBEncoding, Vector3, AnimationMixer, Quaternion, Clock
} from "./three.module.js";
import {WEBGL} from "./three.js/examples/jsm/WebGL.js";
import {Bot, Ground, Tiger} from "./entities.js";
import {OrbitControls} from "./three.js/examples/jsm/controls/OrbitControls.js";
import {Manager} from "./manager.js";

const clock = new Clock();
const rayCaster =  new Raycaster();

class Main {
  init(){
    this.manager = new Manager();
        
    this.manager.scene = new Scene();
    
    this.manager.camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    this.manager.camera.position.set(74,100,0) ;

    this.manager.renderer = new WebGLRenderer({
      antialias: true,
    });
    this.manager.renderer.setSize( window.innerWidth, window.innerHeight );
    this.manager.renderer.shadowMap.enabled = true;
    this.manager.renderer.shadowMap.type = PCFSoftShadowMap
    this.manager.renderer.physicallyCorrectLights = true;
    this.manager.renderer.toneMapping = ACESFilmicToneMapping;
    this.manager.renderer.outputEncoding = sRGBEncoding;
    document.body.appendChild( this.manager.renderer.domElement );

    /*
     * setup light
     */
    let light = new DirectionalLight(0xffffff, 2.0);
    light.position.set(20,100,10);
    light.target.position.set(0,0,0);
    light.castShadow = true;
    light.shadow.bias = -0.001;
    light.shadow.mapSize.width=2048;
    light.shadow.mapSize.height=2048;
    light.shadow.camera.near = 1.0;
    light.shadow.camera.far = 500;
    light.shadow.camera.left = 200;
    light.shadow.camera.right = -200;
    light.shadow.camera.top = 200;
    light.shadow.camera.bottom = -200;
    this.manager.scene.add(light);

    light = new AmbientLight(0x101010);
    this.manager.scene.add(light);

    /*
     * setup controls
     */
    const controls = new OrbitControls(this.manager.camera, this.manager.renderer.domElement);

    this.objects = [];

    /*
    * setup bot
    */
    this.manager.bot = new Bot();
    this.manager.scene.add( this.manager.bot.mesh );
    this.objects.push(this.manager.bot);

    /*
     * setup ground
     */
    this.ground = new Ground();
    this.manager.scene.add( this.ground.mesh );
    this.objects.push(this.ground);

    /*
     * Load tiger
     */

    this.manager.mixer = {};
    this.manager.tiger = new Tiger(this.manager.scene);
  }

  onClick(event) {
    event.preventDefault();
    let mouse={};
    mouse.x = (event.clientX / this.manager.renderer.domElement.width) * 2  - 1;
    mouse.y = - (event.clientY / this.manager.renderer.domElement.height) * 2  + 1;

    this.manager.tiger.run(!this.manager.tiger.isRunning);

    rayCaster.setFromCamera( mouse, this.manager.camera );
    const intersects = rayCaster.intersectObjects(this.objects.map(m => m.mesh));

    if ( intersects.length > 0 ) {
      if (intersects[0].object.uuid == this.ground.mesh.uuid){
        if (this.manager.bot.isSelected){
          console.log("Ground selected");
          this.manager.bot.deselect();

          const xp = intersects[0].point.x.toFixed(2);
          const yp = intersects[0].point.y.toFixed(2);
          const zp = intersects[0].point.z.toFixed(2);
          this.manager.bot.setPathToDestination(xp, yp, zp);
        }else {
          console.log('No bots previously selected. Ground selected.');
        }
      }else if(intersects[0].object.uuid == this.manager.bot.mesh.uuid){
        console.log("Bot selected");
        this.manager.bot.select();
      }
    }
  }

  onWindowSizeChange() {
    this.manager.camera.aspect = window.innerWidth / window.innerHeight;
    this.manager.camera.updateProjectionMatrix();
    this.manager.renderer.setSize( window.innerWidth, window.innerHeight );
  }

  animate(){
    requestAnimationFrame(this.animate.bind(this));

    const delta = clock.getDelta();
    this.manager.renderer.render( this.manager.scene, this.manager.camera );
    this.fixUpModels(delta)
  }

  fixUpModels(delta){
    this.manager.bot.processStates(this.manager.scene);

    if (this.manager.tiger && this.manager.tiger.mixer ){
      if (this.manager.tiger.mixer) {
        this.manager.tiger.mixer.update(delta);
      }
      if (this.manager.tiger && this.manager.tiger.fbx){
        this.manager.tiger.fbx.scale.setScalar(0.1);
      }
    }
  }
}


/*
 * Startype Code
 */
const m = new Main();

// Events
window.addEventListener('resize', m.onWindowSizeChange.bind(m),false);
window.addEventListener('click', m.onClick.bind(m),false);

// Begin rendering
m.init();

if (WEBGL.isWebGLAvailable()) {
  m.animate();
} else {
  const warning = WEBGL.getWebGLErrorMessage();
  document.getElementById('container').appendChild(warning);
}
