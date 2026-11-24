import * as THREE from 'three';
import {createCharacter} from './character';
import {createLbsScene} from './lbs-scene';
import {ZONE_LAYOUTS,ZONE_ORDER,type ZoneId} from './lbs-layout';
import {findRoute,isWalkable,type Point} from './movement';

export type Preferences={mode:'keys'|'pointer';running:boolean;color:string;reduced:boolean;zoom:number};
export type GameInput={keys:Set<string>;preferences:Preferences;paused:boolean;overview?:boolean};
export type GameState={zone:ZoneId;score:number;objective:string;completed:boolean};

export function createGame(host:HTMLDivElement,input:GameInput,onState:(state:GameState)=>void){
 const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
 host.appendChild(renderer.domElement);const canvas=renderer.domElement;canvas.style.touchAction='none';
 const scene=new THREE.Scene();scene.background=new THREE.Color('#c8d7d8');scene.fog=new THREE.Fog('#c8d7d8',48,95);
 const camera=new THREE.PerspectiveCamera(48,1,.1,150);const sun=new THREE.DirectionalLight('#fff0d2',3);sun.position.set(10,20,8);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-25,right:25,top:25,bottom:-25});sun.shadow.normalBias=.04;scene.add(sun,new THREE.HemisphereLight('#edf7ff','#526564',2.2));
 const campus=createLbsScene(scene),avatar=createCharacter(),player=avatar.root;scene.add(player);
 const ring=new THREE.Mesh(new THREE.RingGeometry(.48,.56,40),new THREE.MeshBasicMaterial({color:'#f2ca87',side:THREE.DoubleSide,transparent:true,opacity:.82}));ring.rotation.x=-Math.PI/2;ring.position.y=.015;scene.add(ring);
 const marker=new THREE.Mesh(new THREE.RingGeometry(.27,.38,40),new THREE.MeshBasicMaterial({color:'#d9584e',side:THREE.DoubleSide}));marker.rotation.x=-Math.PI/2;marker.position.y=.02;marker.visible=false;scene.add(marker);
 const velocity=new THREE.Vector3(),desired=new THREE.Vector3(),follow=new THREE.Vector3();const visited=new Set<ZoneId>();
 let zone:ZoneId='facade',route:Point[]=[],held=false,pointerId:number|null=null,lastMode=input.preferences.mode,previousColor='',frame=0,elapsed=0,lastPlan=0;
 const pointer=new THREE.Vector2(),ray=new THREE.Raycaster(),plane=new THREE.Plane(new THREE.Vector3(0,1,0),0),hit=new THREE.Vector3();
 const state=()=>onState({zone,score:visited.size,objective:ZONE_LAYOUTS[zone].objective,completed:visited.size===ZONE_ORDER.length});
 function stop(){input.keys.clear();route=[];velocity.set(0,0,0);held=false;marker.visible=false;}
 function plan(){ray.setFromCamera(pointer,camera);if(!ray.ray.intersectPlane(plane,hit))return;route=findRoute(player.position,{x:hit.x,z:hit.z},ZONE_LAYOUTS[zone].obstacles);marker.position.set(hit.x,.02,hit.z);marker.visible=true;marker.material.color.set(route.length?'#cd5447':'#8d9699');}
 function updatePointer(e:PointerEvent){const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);}
 function pointerDown(e:PointerEvent){if(e.button!==0||input.paused||input.preferences.mode!=='pointer')return;updatePointer(e);held=true;pointerId=e.pointerId;canvas.setPointerCapture(e.pointerId);plan();}
 function pointerMove(e:PointerEvent){if(held&&pointerId===e.pointerId)updatePointer(e);}
 function pointerUp(){held=false;pointerId=null;}
 function pointerCancel(){stop();pointerId=null;}
 canvas.addEventListener('pointerdown',pointerDown);canvas.addEventListener('pointermove',pointerMove);canvas.addEventListener('pointerup',pointerUp);canvas.addEventListener('pointercancel',pointerCancel);canvas.addEventListener('lostpointercapture',pointerUp);
 const controls=new Set(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d','z','q','shift']);
 function down(e:KeyboardEvent){if(input.paused)return;const key=e.key.toLowerCase();if(key==='escape'){stop();return;}if(input.preferences.mode==='keys'&&controls.has(key)){e.preventDefault();input.keys.add(key);}}
 function up(e:KeyboardEvent){input.keys.delete(e.key.toLowerCase());}
 const visibility=()=>{if(document.hidden)stop();};window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',stop);document.addEventListener('visibilitychange',visibility);
 const resize=()=>{camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();renderer.setSize(host.clientWidth,host.clientHeight);};const observer=new ResizeObserver(resize);observer.observe(host);resize();
 function goToZone(next:ZoneId){stop();zone=next;campus.setZone(next);const spawn=ZONE_LAYOUTS[next].spawn;player.position.set(spawn.x,0,spawn.z);player.rotation.y=Math.PI;follow.copy(player.position);const interior=next!=='facade';scene.background=new THREE.Color(interior?'#bfc8c8':'#c8d7d8');scene.fog=new THREE.Fog(interior?'#bfc8c8':'#c8d7d8',interior?35:48,interior?75:95);state();}
 function reset(){visited.clear();for(const id of ZONE_ORDER)campus.quests[id].visible=true;goToZone('facade');}
 reset();const clock=new THREE.Clock();
 function animate(){
  frame=requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04);elapsed+=dt;const prefs=input.preferences;
  if(lastMode!==prefs.mode){stop();lastMode=prefs.mode;}if(previousColor!==prefs.color){avatar.setColor(prefs.color);previousColor=prefs.color;}canvas.style.cursor=prefs.mode==='pointer'?'crosshair':'default';
  if(input.paused)stop();else{
   if(held&&elapsed-lastPlan>.12){plan();lastPlan=elapsed;}desired.set(0,0,0);const speed=prefs.running||input.keys.has('shift')?7.1:4.5;
   if(prefs.mode==='keys'){const k=input.keys,h=Number(k.has('d')||k.has('arrowright'))-Number(k.has('a')||k.has('q')||k.has('arrowleft')),v=Number(k.has('s')||k.has('arrowdown'))-Number(k.has('w')||k.has('z')||k.has('arrowup'));desired.set(h*.96+v*.28,0,-h*.28+v*.96).normalize().multiplyScalar(speed);}
   else if(route.length){let target=route[0],distance=Math.hypot(target.x-player.position.x,target.z-player.position.z);if(distance<.18){route.shift();if(!route.length){velocity.set(0,0,0);marker.visible=false;}else{target=route[0];distance=Math.hypot(target.x-player.position.x,target.z-player.position.z);}}if(route.length)desired.set(target.x-player.position.x,0,target.z-player.position.z).normalize().multiplyScalar(Math.min(speed,distance*(route.length===1?5:9)));}
   velocity.lerp(desired,1-Math.exp(-dt*(desired.lengthSq()?11:17)));const before=player.position.clone(),obstacles=ZONE_LAYOUTS[zone].obstacles,nx=player.position.x+velocity.x*dt,nz=player.position.z+velocity.z*dt;
   if(isWalkable(nx,player.position.z,obstacles))player.position.x=nx;else velocity.x=0;if(isWalkable(player.position.x,nz,obstacles))player.position.z=nz;else velocity.z=0;
   const actual=player.position.clone().sub(before),moving=actual.length()/Math.max(dt,.0001);if(moving>.05){const angle=Math.atan2(actual.x,actual.z),delta=Math.atan2(Math.sin(angle-player.rotation.y),Math.cos(angle-player.rotation.y));player.rotation.y+=delta*(1-Math.exp(-dt*14));}
   avatar.animate(dt,moving,elapsed,prefs.reduced);
   const target=ZONE_LAYOUTS[zone].target;if(!visited.has(zone)&&Math.hypot(player.position.x-target.x,player.position.z-target.z)<1.15){visited.add(zone);campus.quests[zone].visible=false;state();}
  }
  campus.animate(elapsed,prefs.reduced);ring.position.set(player.position.x,.02,player.position.z);follow.lerp(player.position,prefs.reduced?1:1-Math.exp(-dt*7));
  if(input.overview){camera.position.set(18,24,24);camera.lookAt(0,1,-1);}else{camera.position.set(follow.x+prefs.zoom*.23,prefs.zoom*.68,follow.z+prefs.zoom*.76);camera.lookAt(follow.x,1.55,follow.z-1.4);}camera.updateMatrixWorld();renderer.render(scene,camera);
 }
 animate();
 return {reset,stop,goToZone,dispose(){cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',stop);document.removeEventListener('visibilitychange',visibility);canvas.removeEventListener('pointerdown',pointerDown);canvas.removeEventListener('pointermove',pointerMove);canvas.removeEventListener('pointerup',pointerUp);canvas.removeEventListener('pointercancel',pointerCancel);canvas.removeEventListener('lostpointercapture',pointerUp);const geometries=new Set<THREE.BufferGeometry>(),mats=new Set<THREE.Material>();scene.traverse(o=>{if(o instanceof THREE.Mesh){geometries.add(o.geometry);(Array.isArray(o.material)?o.material:[o.material]).forEach((m:THREE.Material)=>mats.add(m));}});geometries.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());campus.dispose();renderer.dispose();canvas.remove();}};
}
