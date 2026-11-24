import * as THREE from 'three';
import type {ZoneId} from './lbs-layout';

/** Photo-derived, stylised reconstruction. Dimensions are game proportions, not survey data. */
export function createLbsScene(scene:THREE.Scene){
  const groups={} as Record<ZoneId,THREE.Group>;
  const materials=new Map<string,THREE.MeshStandardMaterial>();
  const textures:THREE.Texture[]=[];
  const taskVisuals=new Map<string,{complete:()=>void;reset:()=>void}>();
  const mats={cream:'#eadfc5',terracotta:'#a94d36',red:'#9a3e2d',blue:'#214e86',navy:'#193451',white:'#f3f1e9',wall:'#dadbd6',wood:'#d2b98c',dark:'#303a3c',gold:'#d8aa55'};
  function mat(color:string,metalness=0,roughness=.82){const key=color+metalness+roughness;if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({color,metalness,roughness}));return materials.get(key)!;}
  function group(id:ZoneId){const g=new THREE.Group();g.name=id;g.visible=id==='facade';scene.add(g);groups[id]=g;return g;}
  function mesh(parent:THREE.Group|THREE.Object3D,geometry:THREE.BufferGeometry,material:THREE.Material,x:number,y:number,z:number){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  function box(parent:THREE.Group|THREE.Object3D,w:number,h:number,d:number,color:string,x:number,y:number,z:number){return mesh(parent,new THREE.BoxGeometry(w,h,d),mat(color),x,y,z);}
  function cylinder(parent:THREE.Group|THREE.Object3D,r:number,h:number,color:string,x:number,y:number,z:number){return mesh(parent,new THREE.CylinderGeometry(r,r,h,12),mat(color),x,y,z);}
  function sign(parent:THREE.Group,text:string,sub:string,w:number,h:number,x:number,y:number,z:number,bg='#f7f0dd',fg=mats.navy){const c=document.createElement('canvas');c.width=1024;c.height=256;const ctx=c.getContext('2d')!;ctx.fillStyle=bg;ctx.fillRect(0,0,1024,256);ctx.fillStyle=fg;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='800 92px Arial';ctx.fillText(text,512,sub?92:128,950);if(sub){ctx.font='32px Arial';ctx.fillText(sub,512,194,950);}const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;textures.push(t);const p=mesh(parent,new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t}),x,y,z);p.castShadow=false;return p;}
  function arch(parent:THREE.Group,w:number,h:number,color:string,x:number,y:number,z:number){const r=w/2,s=new THREE.Shape();s.moveTo(-r,0);s.lineTo(-r,h-r);s.absarc(0,h-r,r,Math.PI,0,true);s.lineTo(r,0);s.closePath();return mesh(parent,new THREE.ExtrudeGeometry(s,{depth:.1,bevelEnabled:false,curveSegments:18}),mat(color),x,y,z);}
  function chair(parent:THREE.Group,x:number,z:number,rotation=0){const c=new THREE.Group();c.position.set(x,0,z);c.rotation.y=rotation;parent.add(c);box(c,.68,.12,.68,'#8f2636',0,.55,0);box(c,.68,.78,.1,'#8f2636',0,1,.3);for(const dx of [-.27,.27])for(const dz of [-.25,.25])cylinder(c,.025,.58,mats.gold,dx,.28,dz);box(c,.72,.045,.72,mats.gold,0,.47,0);return c;}
  function table(parent:THREE.Group,x:number,z:number,w=4,d=1.25){box(parent,w,.13,d,'#e4d6ba',x,.82,z);for(const dx of [-w/2+.2,w/2-.2])for(const dz of [-d/2+.18,d/2-.18])box(parent,.08,.78,.08,mats.dark,x+dx,.4,z+dz);}
  function fluorescent(parent:THREE.Group,x:number,z:number,y=5.2){const fixture=box(parent,2.8,.08,.18,'#ffffff',x,y,z);(fixture.material as THREE.MeshStandardMaterial).emissive.set('#ffffff');(fixture.material as THREE.MeshStandardMaterial).emissiveIntensity=.7;}
  function fan(parent:THREE.Group,x:number,z:number,y=5){cylinder(parent,.08,.5,mats.dark,x,y,z);for(let i=0;i<3;i++){const blade=box(parent,1.6,.05,.16,mats.dark,x,y-.25,z);blade.rotation.y=i*Math.PI*2/3;}}
  function tiledFloor(parent:THREE.Group,color='#c7c2b5'){box(parent,30,.2,20,color,0,-.12,0);for(let x=-15;x<=15;x+=1)box(parent,.018,.012,20,'#8f918c',x,.001,0);for(let z=-10;z<=10;z+=1)box(parent,30,.012,.018,'#8f918c',0,.002,z);}
  function roomShell(parent:THREE.Group,floor='#b9b7ae'){tiledFloor(parent,floor);box(parent,30,5.8,.35,mats.wall,0,2.9,-10);box(parent,.35,5.8,20,mats.wall,-15,2.9,0);box(parent,.35,5.8,20,mats.wall,15,2.9,0);}
  function questBeacon(parent:THREE.Group,id:ZoneId,x:number,z:number,kind:'seal'|'book'|'star'|'mic'){
    const q=new THREE.Group();q.name='quest-'+id;q.position.set(x,.85,z);q.userData.quest=id;parent.add(q);
    const ring=mesh(q,new THREE.TorusGeometry(.46,.07,8,28),mat(mats.gold,0,.35),0,0,0);ring.rotation.x=Math.PI/2;
    if(kind==='book'){box(q,.52,.68,.14,mats.gold,0,0,0);box(q,.05,.68,.16,mats.red,-.23,0,0);}
    else if(kind==='mic'){cylinder(q,.1,.72,mats.dark,0,0,0);const head=mesh(q,new THREE.SphereGeometry(.18,12,10),mat(mats.gold,1,.3),0,.43,0);head.castShadow=true;}
    else {const shape=new THREE.Shape();for(let i=0;i<10;i++){const a=Math.PI/2+i*Math.PI/5,r=i%2?.2:.48;const px=Math.cos(a)*r,py=Math.sin(a)*r;i?shape.lineTo(px,py):shape.moveTo(px,py);}shape.closePath();mesh(q,new THREE.ExtrudeGeometry(shape,{depth:.09,bevelEnabled:false}),mat(kind==='seal'?mats.blue:mats.gold,0,.35),0,0,0);}
    return q;
  }
  function registerTask(id:string,complete:()=>void,reset:()=>void){taskVisuals.set(id,{complete,reset});reset();}

  // FAÇADE — arched terracotta bays and embossed cream tiles from IMG_9277–9290.
  const facade=group('facade');tiledFloor(facade,'#c9b99d');box(facade,44,.08,8,'#5b6668',0,-.01,15);for(let x=-20;x<=20;x+=4)box(facade,1.7,.02,.12,'#f3dc9b',x,.04,15);
  box(facade,32,7.7,7,mats.cream,0,3.85,-7);box(facade,32.5,.28,7.4,mats.terracotta,0,7.8,-7);box(facade,10,3.1,7,mats.cream,-11,9.25,-7);box(facade,10.4,.3,7.4,mats.terracotta,-11,10.82,-7);
  for(let y=.55;y<7.5;y+=.55)box(facade,32,.018,.035,'#cabd9e',0,y,-3.45);
  for(let i=0;i<10;i++){const x=-14.2+i*3.05;arch(facade,2.25,4.55,mats.terracotta,x,3.2,-3.38);box(facade,1.82,1.45,.1,'#80989b',x,4.8,-3.19);box(facade,.06,1.45,.07,mats.cream,x,4.8,-3.1);box(facade,1.82,.06,.07,mats.cream,x,4.8,-3.1);}
  for(const x of [-13.7,-5,-.2,4.6,9.4,14]){box(facade,3.1,2.1,.12,mats.dark,x,1.38,-3.37);box(facade,2.85,1.85,.11,'#819798',x,1.38,-3.22);}
  // Pointed entrance surround, directly based on IMG_9289.
  arch(facade,2.75,3.35,mats.cream,-9.8,.05,-3.08);arch(facade,1.85,2.78,mats.terracotta,-9.8,.08,-2.96);box(facade,1.45,2.42,.08,mats.dark,-9.8,1.28,-2.82);sign(facade,'L  B  S','LOMÉ · BUSINESS · SCHOOL',3.2,.78,-9.8,3.42,-2.8);
  sign(facade,'LBS','LOMÉ BUSINESS SCHOOL',4.5,1.35,-3.8,1.55,-3.06);sign(facade,'oye','NOËL SUR LE CAMPUS',4.2,1.35,1.5,1.55,-3.06,'#173f57','#f3d9a3');
  for(const x of [-17,17]){cylinder(facade,.1,5.5,mats.dark,x,2.75,1);box(facade,.8,.13,.3,'#f3e2a6',x,5.4,1.35);}
  // Simplified upper-floor side volume and rooftop LBS panel.
  box(facade,5.6,1.35,.12,mats.terracotta,-11,9.25,-3.38);box(facade,5.1,1.02,.12,'#71888c',-11,9.25,-3.24);sign(facade,'LBS','DIGITAL ACADEMY',3.4,1.3,12.8,5.1,-3.02);
  // Christmas tree and entrance quest.
  box(facade,.34,1,.34,'#6d5038',12.5,.5,5);for(let i=0;i<4;i++)mesh(facade,new THREE.ConeGeometry(1.8-i*.32,2.1,12),mat(i%2?'#35644a':'#27543e'),12.5,1.55+i*.75,5);questBeacon(facade,'facade',-9.8,-1.7,'seal');
  const briefingGlow=new THREE.PointLight('#f2ca87',0,5);briefingGlow.position.set(-9.8,1.7,-2.3);facade.add(briefingGlow);registerTask('briefing',()=>{briefingGlow.intensity=3;},()=>{briefingGlow.intensity=.35;});

  // BIBLIOTHÈQUE — pale wood wall shelving, central tables and red/gold chairs.
  const library=group('library');roomShell(library,'#c7c5be');
  function shelf(parent:THREE.Group,x:number,z:number,w:number,rotation=0){const s=new THREE.Group();s.position.set(x,0,z);s.rotation.y=rotation;parent.add(s);box(s,w,3.9,.52,mats.wood,0,2.05,0);for(let y=.45;y<3.8;y+=.72){box(s,w-.14,.08,.62,'#a9865d',0,y,0);for(let bx=-w/2+.18;bx<w/2-.15;bx+=.18){const palette=['#9b3d3f','#315681','#e6d6b3','#4f704d','#d28c45'];box(s,.13,.54,.16,palette[Math.abs(Math.round((bx+y)*10))%palette.length],bx,y+.31,.3);}}}
  shelf(library,0,-9.15,22);shelf(library,-14.15,-2,11,Math.PI/2);shelf(library,14.15,-2,11,Math.PI/2);
  table(library,-4,0,5,1.65);table(library,4,0,5,1.65);table(library,0,-4.2,5,1.65);
  for(const [x,z,r] of [[-5.7,1.5,Math.PI],[-2.3,1.5,Math.PI],[-5.7,-1.5,0],[-2.3,-1.5,0],[2.3,1.5,Math.PI],[5.7,1.5,Math.PI],[2.3,-1.5,0],[5.7,-1.5,0],[-1.7,-5.65,0],[1.7,-5.65,0]] as [number,number,number][])chair(library,x,z,r);
  for(const x of [-8,0,8])fluorescent(library,x,-1);fan(library,0,3);sign(library,'BIBLIOTHÈQUE','LBS · LIRE · APPRENDRE',7,1.2,0,4.25,-9.78,'#e7dfcf',mats.navy);questBeacon(library,'library',10.8,-7.5,'book');
  const financeBook=box(library,.32,.62,.16,mats.gold,-12.2,1.08,-6.8);financeBook.rotation.z=.08;
  const marketingBook=box(library,.32,.62,.16,mats.gold,7.5,1.08,-7.3);marketingBook.rotation.z=-.08;
  const deskBooks=new THREE.Group();deskBooks.position.set(0,1,-3.8);library.add(deskBooks);for(let i=0;i<2;i++){const b=box(deskBooks,.75,.11,.48,i?mats.gold:mats.red,0,i*.12,0);b.rotation.y=i?.12:-.08;}
  registerTask('finance',()=>{financeBook.visible=false;},()=>{financeBook.visible=true;});registerTask('marketing',()=>{marketingBook.visible=false;},()=>{marketingBook.visible=true;});registerTask('library-desk',()=>{deskBooks.visible=true;},()=>{deskBooks.visible=false;});

  // PRÉAU — tiled blue base, open metal roof, trusses, banners and movable seating.
  const preau=group('preau');tiledFloor(preau,'#bfc5c4');box(preau,30,1.15,.4,'#275996',0,.57,-9.8);box(preau,.4,1.15,20,'#275996',-14.8,.57,0);box(preau,.4,1.15,20,'#275996',14.8,.57,0);box(preau,30,4.4,.25,'#eee9de',0,2.2,-10);
  for(const x of [-14,-7,0,7,14]){cylinder(preau,.1,5.3,mats.dark,x,2.65,-8.9);cylinder(preau,.1,5.3,mats.dark,x,2.65,8.5);const beam=box(preau,.13,.13,17.4,mats.dark,x,5.1,-.2);beam.rotation.z=0;}
  const roofL=box(preau,30,.13,11,'#788286',0,6.15,-4.5);roofL.rotation.x=-.18;const roofR=box(preau,30,.13,11,'#788286',0,6.15,4.5);roofR.rotation.x=.18;
  for(const x of [-8,0,8])for(const z of [-1.5,3.5]){table(preau,x,z,4.3,1.6);chair(preau,x-1.35,z+1.2,Math.PI);chair(preau,x+1.35,z+1.2,Math.PI);chair(preau,x,z-1.2,0);}
  for(const x of [-9,-3,3,9])fluorescent(preau,x,-1,5.25);sign(preau,'LBS','VOUS MÉRITEZ LE MEILLEUR',10,1.5,0,3.2,-9.82,'#f4f0e6',mats.blue);questBeacon(preau,'preau',0,-7.8,'star');
  function centerpiece(x:number,z:number){const c=new THREE.Group();c.position.set(x,1,z);preau.add(c);cylinder(c,.18,.16,mats.gold,0,0,0);mesh(c,new THREE.OctahedronGeometry(.28,0),mat(mats.red,0,.45),0,.32,0);return c;}
  const leftCenter=centerpiece(-8,3.5),rightCenter=centerpiece(8,3.5);registerTask('table-left',()=>{leftCenter.visible=true;},()=>{leftCenter.visible=false;});registerTask('table-right',()=>{rightCenter.visible=true;},()=>{rightCenter.visible=false;});
  const garlandMaterial=new THREE.MeshStandardMaterial({color:'#715c3b',emissive:'#000000',emissiveIntensity:0});materials.set('garland-special',garlandMaterial);const garlandBulbs:THREE.Mesh[]=[];for(let x=-11;x<=11;x+=1.4){const bulb=mesh(preau,new THREE.SphereGeometry(.11,10,8),garlandMaterial,x,4.35,-9.55);garlandBulbs.push(bulb);}registerTask('garland',()=>{garlandMaterial.color.set('#f4c76f');garlandMaterial.emissive.set('#e99634');garlandMaterial.emissiveIntensity=1.8;},()=>{garlandMaterial.color.set('#715c3b');garlandMaterial.emissive.set('#000');garlandMaterial.emissiveIntensity=0;});

  // GRANDE SALLE — R+1 lecture hall with screen, red aisle, tables, curtains and AC units.
  const hall=group('hall');roomShell(hall,'#4d4f4e');box(hall,2.4,.025,18,'#8c2532',0,.02,0);box(hall,11,3.2,.14,'#f8f7f1',0,2.9,-9.78);box(hall,11.5,.15,.22,mats.dark,0,4.53,-9.64);sign(hall,'GRANDE SALLE','CONFÉRENCE · R+1',8,.8,0,5.15,-9.76,'#e9e6dd',mats.navy);
  for(const z of [-6,-2,2,6])for(const x of [-7,0,7]){table(hall,x,z,4.6,1.15);chair(hall,x-1.35,z+1,Math.PI);chair(hall,x,z+1,Math.PI);chair(hall,x+1.35,z+1,Math.PI);}
  for(const x of [-10,-3.3,3.3,10])fluorescent(hall,x,-1);for(const z of [-6,-1,4]){box(hall,.16,3.5,2.5,'#6f7474',-14.72,2.3,z);box(hall,.16,3.5,2.5,'#6f7474',14.72,2.3,z);}for(const x of [-10,10])box(hall,2.4,.65,.5,'#f2eee4',x,4.7,-9.3);
  box(hall,1.1,1.1,.55,mats.wood,-3.8,.57,-7.8);questBeacon(hall,'hall',0,-7.4,'mic');
  const breakerLight=new THREE.Mesh(new THREE.SphereGeometry(.12,10,8),new THREE.MeshStandardMaterial({color:'#9e3434',emissive:'#4a0000',emissiveIntensity:.5}));breakerLight.position.set(-14.55,2.2,-7.6);hall.add(breakerLight);
  const projectorLight=new THREE.PointLight('#b9d8ff',0,9);projectorLight.position.set(0,3,-7.5);hall.add(projectorLight);
  const soundRings=new THREE.Group();soundRings.position.set(0,1.1,-7.4);hall.add(soundRings);for(let i=0;i<3;i++){const r=mesh(soundRings,new THREE.TorusGeometry(.24+i*.12,.025,6,20,Math.PI),mat('#f2ca87'),0,i*.14,0);r.rotation.z=Math.PI/2;}
  const welcome=sign(hall,'BIENVENUE','LA VEILLÉE DE NOËL COMMENCE',8,1.15,0,3,-9.56,'#173f57','#f2ca87');
  registerTask('breaker',()=>{(breakerLight.material as THREE.MeshStandardMaterial).color.set('#55b97c');(breakerLight.material as THREE.MeshStandardMaterial).emissive.set('#1c8a4c');},()=>{(breakerLight.material as THREE.MeshStandardMaterial).color.set('#9e3434');(breakerLight.material as THREE.MeshStandardMaterial).emissive.set('#4a0000');});
  registerTask('projector',()=>{projectorLight.intensity=5;},()=>{projectorLight.intensity=0;});registerTask('microphone',()=>{soundRings.visible=true;},()=>{soundRings.visible=false;});registerTask('open-doors',()=>{welcome.visible=true;},()=>{welcome.visible=false;});

  const quests={} as Record<ZoneId,THREE.Group>;for(const id of Object.keys(groups) as ZoneId[]){const q=groups[id].getObjectByName('quest-'+id) as THREE.Group;quests[id]=q;}
  let active:ZoneId='facade';
  return {
    setZone(id:ZoneId){active=id;for(const key of Object.keys(groups) as ZoneId[])groups[key].visible=key===id;},
    getZone(){return active;},quests,
    completeStep(id:string){taskVisuals.get(id)?.complete();},
    resetTasks(){taskVisuals.forEach(task=>task.reset());},
    animate(time:number,reduced:boolean){for(const id of Object.keys(quests) as ZoneId[]){const q=quests[id];if(q.visible){q.rotation.y=reduced?0:time*.8;q.position.y=.85+(reduced?0:Math.sin(time*2+id.length)*.08);}}},
    dispose(){textures.forEach(t=>t.dispose());materials.forEach(m=>m.dispose());},
  };
}
