import {
  Scene, PerspectiveCamera, WebGLRenderer, CubeTextureLoader,
  DirectionalLight, AmbientLight, Raycaster,
  PCFSoftShadowMap, ACESFilmicToneMapping, sRGBEncoding, Vector3
} from "./three.module.js";
import {WEBGL} from "./three.js/examples/jsm/WebGL.js";
import {Bot, Ground} from "./entities.js";
import {OrbitControls} from "./three.js/examples/jsm/controls/OrbitControls.js";

class Main {
  init(){
    this.scene = new Scene();
    this.rayCaster =  new Raycaster();
    this.camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    this.camera.position.set(74,100,0) ;

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
     * setup light
     */
    let light = new DirectionalLight(0xffffff, 1.0);
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
    this.scene.add(light);

    light = new AmbientLight(0x101010);
    this.scene.add(light);

    /*
     * setup controls
     */
    const controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.objects = [];

    /*
    * setup bot
    */
    this.bot = new Bot();
    this.scene.add( this.bot.mesh );
    this.objects.push(this.bot);

    /*
     * setup ground
     */
    this.ground = new Ground();
    this.scene.add( this.ground.mesh );
    this.objects.push(this.ground);
  }

  onClick(event) {
    event.preventDefault();
    let mouse={};

    mouse.x = (event.clientX / this.renderer.domElement.width) * 2  - 1;
    mouse.y = - (event.clientY / this.renderer.domElement.height) * 2  + 1;

    this.rayCaster.setFromCamera( mouse, this.camera );
    const intersects = this.rayCaster.intersectObjects(this.objects.map(m => m.mesh));

    if ( intersects.length > 0 ) {
      if (intersects[0].object.uuid == this.ground.mesh.uuid){
        if (this.bot.isSelected){
          console.log("Ground selected");
          this.bot.deselect();

          const xp = intersects[0].point.x.toFixed(2);
          const yp = intersects[0].point.y.toFixed(2);
          const zp = intersects[0].point.z.toFixed(2);
          this.bot.setPathToDestination(xp, yp, zp);
        }else {
          console.log('No bots previously selected. Ground selected.');
        }
      }else if(intersects[0].object.uuid == this.bot.mesh.uuid){
        console.log("Bot selected");
        this.bot.select();
      }
    }
  }

  onWindowSizeChange() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize( window.innerWidth, window.innerHeight );
  }

  animate(){
    requestAnimationFrame(this.animate.bind(this));
    this.bot.processStates(this.scene);
    this.renderer.render( this.scene, this.camera );
  }
}

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
