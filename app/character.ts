import * as THREE from 'three';

/** Procedural winter avatar. The root faces +Z; limbs pivot at their joints. */
export function createCharacter() {
  const root = new THREE.Group();
  const rig = new THREE.Group();
  root.add(rig);
  const coat = new THREE.MeshStandardMaterial({ color: '#ce4b48', roughness: .85 });
  const cream = new THREE.MeshStandardMaterial({ color: '#fff1d7', roughness: 1 });
  const skin = new THREE.MeshStandardMaterial({ color: '#bd835f', roughness: .9 });
  const dark = new THREE.MeshStandardMaterial({ color: '#263b45', roughness: .85 });
  const hair = new THREE.MeshStandardMaterial({ color: '#392a29', roughness: 1 });
  const gold = new THREE.MeshStandardMaterial({ color: '#e9b35e', roughness: .6 });
  function mesh(parent: THREE.Object3D, geometry: THREE.BufferGeometry, material: THREE.Material, x: number, y: number, z: number) {
    const part = new THREE.Mesh(geometry, material);
    part.position.set(x, y, z); part.castShadow = true; part.receiveShadow = true;
    parent.add(part); return part;
  }
  // Slightly oversized winter silhouette: readable from the isometric camera.
  mesh(rig, new THREE.CapsuleGeometry(.43, .52, 8, 18), coat, 0, 1.18, 0);
  const shoulderCape = mesh(rig, new THREE.SphereGeometry(.48, 18, 10, 0, Math.PI*2, 0, Math.PI/2), coat, 0, 1.45, 0);
  shoulderCape.scale.z=.88;
  // Cream zipper, two buttons and padded pockets.
  mesh(rig, new THREE.BoxGeometry(.035, .65, .035), cream, 0, 1.2, .42);
  for (const x of [-.24, .24]) mesh(rig, new THREE.BoxGeometry(.19, .16, .07), coat, x, 1, .35);
  for (const y of [1.18, 1.39]) mesh(rig, new THREE.SphereGeometry(.045, 8, 8), gold, .07, y, .42);
  const head = new THREE.Group(); head.position.y = 1.94; rig.add(head);
  mesh(head, new THREE.SphereGeometry(.44, 20, 16), skin, 0, 0, 0);
  for (const x of [-.43, .43]) mesh(head, new THREE.SphereGeometry(.1, 10, 8), skin, x, -.02, 0);
  for (const x of [-.16, .16]) {
    mesh(head, new THREE.SphereGeometry(.055, 12, 8), dark, x, .025, .395);
    mesh(head, new THREE.SphereGeometry(.017, 8, 8), cream, x-.014, .043, .443);
    mesh(head, new THREE.BoxGeometry(.13, .035, .04), hair, x, .14, .39);
  }
  // Small curls keep the face warm and give the avatar a stronger silhouette.
  for(const [x,y] of [[-.31,.24],[-.2,.34],[0,.38],[.2,.34],[.31,.24]] as [number,number][]) mesh(head,new THREE.SphereGeometry(.105,10,8),hair,x,y,.34);
  mesh(head, new THREE.SphereGeometry(.07, 10, 8), skin, 0, -.06, .43);
  const smile = mesh(head, new THREE.TorusGeometry(.1, .017, 6, 16, Math.PI), hair, 0, -.12, .418);
  smile.rotation.z = Math.PI;
  mesh(head, new THREE.SphereGeometry(.45, 20, 12, 0, Math.PI*2, 0, Math.PI/2), coat, 0, .19, 0);
  const brim = mesh(head, new THREE.TorusGeometry(.425, .085, 8, 24), cream, 0, .21, 0);
  brim.rotation.x = Math.PI/2;
  mesh(head, new THREE.SphereGeometry(.14, 12, 10), cream, 0, .67, 0);
  const scarf = mesh(rig, new THREE.TorusGeometry(.31, .13, 8, 20), gold, 0, 1.62, 0);
  scarf.rotation.x = Math.PI/2;
  const tail = mesh(rig, new THREE.BoxGeometry(.18, .45, .09), gold, .25, 1.38, .43);
  tail.rotation.z = -.18;
  // A small backpack gives the silhouette detail from the follow camera.
  mesh(rig, new THREE.BoxGeometry(.52, .6, .23), dark, 0, 1.2, -.4);
  mesh(rig, new THREE.BoxGeometry(.36, .2, .08), gold, 0, 1.05, -.55);
  const badge=mesh(rig,new THREE.OctahedronGeometry(.1,0),gold,0,1.29,-.535);badge.rotation.z=Math.PI/4;
  const arms: THREE.Group[] = [], legs: THREE.Group[] = [];
  for (const side of [-1, 1]) {
    const arm = new THREE.Group(); arm.position.set(side*.47, 1.47, 0); rig.add(arm);
    mesh(arm, new THREE.CapsuleGeometry(.14, .35, 4, 10), coat, 0, -.24, 0);
    mesh(arm, new THREE.SphereGeometry(.15, 10, 10), cream, 0, -.53, 0);
    arm.rotation.z = side*.12; arms.push(arm);
    const leg = new THREE.Group(); leg.position.set(side*.22, .75, 0); rig.add(leg);
    mesh(leg, new THREE.CapsuleGeometry(.15, .32, 4, 10), dark, 0, -.22, 0);
    mesh(leg, new THREE.BoxGeometry(.32, .22, .46), dark, 0, -.58, .08);
    mesh(leg, new THREE.BoxGeometry(.33, .06, .47), cream, 0, -.68, .08);
    legs.push(leg);
  }
  let phase = 0;
  return {
    root,
    setColor(color: string) { coat.color.set(color); },
    animate(dt: number, speed: number, time: number, reduced: boolean) {
      const stride = Math.min(speed/5, 1.3);
      phase += dt * speed * 2.7;
      const swing = reduced ? 0 : Math.sin(phase)*.65*stride;
      legs[0].rotation.x = swing; legs[1].rotation.x = -swing;
      arms[0].rotation.x = -swing*.8; arms[1].rotation.x = swing*.8;
      rig.position.y = reduced ? 0 : Math.abs(Math.sin(phase))*.055*stride + Math.sin(time*2)*.015*(1-Math.min(stride,1));
      rig.rotation.z=reduced?0:Math.sin(phase*.5)*.022*stride;
      head.rotation.y=reduced?0:Math.sin(time*.75)*.045*(1-Math.min(stride,1));
      head.rotation.z=reduced?0:Math.sin(time*.55)*.018*(1-Math.min(stride,1));
      tail.rotation.x = reduced ? 0 : Math.sin(phase+.5)*.12*stride;
    }
  };
}
