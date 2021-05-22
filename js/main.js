import {
  HemisphereLight, DirectionalLight, PerspectiveCamera, WebGLRenderer,
  AmbientLight, Raycaster,
  PCFSoftShadowMap, ACESFilmicToneMapping, sRGBEncoding, Vector3, AnimationMixer, Quaternion, Clock
} from "./three.module.js";
import {WEBGL} from "./three.js/examples/jsm/WebGL.js";
import {Bot, Cow, Ground, Tiger} from "./entities.js";
import {OrbitControls} from "./three.js/examples/jsm/controls/OrbitControls.js";
import {Manager} from "./manager.js";
import {ACTION_COW_RUN, ACTION_COW_WALK} from "./constants.js"

const clock = new Clock();
const rayCaster =  new Raycaster(); 
let running = true;

class Main {
  init(){
    this.manager = new Manager();

    /*
     * setup light
     */
    //let light = new HemisphereLight(0xffeeb1, 0x080820, 2);
    
    let light = new DirectionalLight(0xffeeb1, 1);
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
    
    /*
    * setup bot
    */
    /*this.manager.bot = new Bot();
    this.manager.scene.add( this.manager.bot.mesh );
    this.manager.objects.push(this.manager.bot);*/

    /*
     * setup ground
     */
    this.manager.ground = new Ground();
    this.manager.scene.add( this.manager.ground.mesh );
    this.manager.objects.push(this.manager.ground);

    /*
    * setup boundary
    */
    // this.manager.bot = new Bot();
    // this.manager.scene.add( this.manager.bot.mesh );
    // this.manager.objects.push(this.manager.bot);


    /*
     * Load tiger
     */
    this.manager.mixer = {};
    this.manager.tiger = new Tiger(this.manager.scene);
    this.manager.objects.push(this.manager.tiger);

    /*
     * Load Cows
     */
    this.manager.cow = new Cow(this.manager.scene);
  }

  onClick(event) {
    event.preventDefault();
    let mouse={};
    mouse.x = (event.clientX / this.manager.renderer.domElement.width) * 2  - 1;
    mouse.y = - (event.clientY / this.manager.renderer.domElement.height) * 2  + 1;

    rayCaster.setFromCamera( mouse, this.manager.camera );
    const intersects = rayCaster.intersectObjects(this.manager.objects.map(m => m.mesh));

    if ( intersects.length > 0 ) {
      this.processIntersectedObjects(intersects);
    }

    if (this.manager.cow.actions){
      if (running){
        if (this.manager.cow.actions[ACTION_COW_WALK]) {
          this.manager.cow.actions[ACTION_COW_WALK].crossFadeFrom(this.manager.cow.actions[ACTION_COW_RUN], 0.1, true);
          this.manager.cow.actions[ACTION_COW_RUN].stop();
          this.manager.cow.actions[ACTION_COW_WALK].play();
        }
        running = false;
      }else{
        if (this.manager.cow.actions[ACTION_COW_RUN]) {
          this.manager.cow.actions[ACTION_COW_RUN].crossFadeFrom(this.manager.cow.actions[ACTION_COW_WALK], 0.1, true);
          this.manager.cow.actions[ACTION_COW_WALK].stop();
          this.manager.cow.actions[ACTION_COW_RUN].play();
        }
        running=true;
      }
    }
  }

  processIntersectedObjects(intersects){
      if (intersects[0].object.uuid == this.manager.ground.mesh.uuid){
        if (this.manager.tiger.isSelected){
          console.log("Ground selected");
          //this.manager.bot.deselect();
          this.manager.tiger.deselect(this.manager.scene);

          const xp = intersects[0].point.x.toFixed(2);
          const yp = intersects[0].point.y.toFixed(2);
          const zp = intersects[0].point.z.toFixed(2);
          this.manager.tiger.setPathToDestination(xp, yp, zp);
        }else {
          console.log('No bots previously selected. Ground selected.');
        }
      }

      if(intersects[0].object.uuid == this.manager.tiger.mesh.uuid){
        console.log('Tiger selected');
        this.manager.tiger.select(this.manager.scene);
      }

      /*if(intersects[0].object.uuid == this.manager.bot.mesh.uuid){
        console.log("Bot selected");
        this.manager.bot.select();
      }*/

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
    // this.manager.bot.processStates(this.manager.scene);

    if (this.manager.tiger && this.manager.tiger.mixer ){
      if (this.manager.tiger.mixer) {
        this.manager.tiger.mixer.update(delta);
      }
      if (this.manager.tiger && this.manager.tiger.fbx){
        this.manager.tiger.fbx.scale.setScalar(0.1);
      }
    }

    this.manager.tiger.processStates(this.manager.scene);

    if (this.manager.cow && this.manager.cow.mixer) {
      this.manager.cow.mixer.update(delta);
    }

    if (this.manager.tiger.selector && this.manager.tiger.fbx && this.manager.tiger.fbx.position){
        this.manager.tiger.selector.fbx.position.x = this.manager.tiger.fbx.position.x;
        this.manager.tiger.selector.fbx.position.y = 15;
        this.manager.tiger.selector.fbx.position.z = this.manager.tiger.fbx.position.z;
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
