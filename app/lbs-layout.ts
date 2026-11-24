import type {Obstacle, Point} from './movement';

export type ZoneId='facade'|'library'|'preau'|'hall';
export type ZoneLayout={id:ZoneId;name:string;kicker:string;objective:string;spawn:Point;target:Point;obstacles:Obstacle[]};

const roomWalls:Obstacle[]=[
  {x:0,z:-10,w:30,d:.5},{x:-15,z:0,w:.5,d:20},{x:15,z:0,w:.5,d:20},
];

export const ZONE_LAYOUTS:Record<ZoneId,ZoneLayout>={
  facade:{id:'facade',name:'Façade LBS',kicker:'Nukafu · extérieur',objective:'Rejoins l’entrée principale et récupère le sceau LBS.',spawn:{x:0,z:7},target:{x:-9.8,z:-1.7},obstacles:[
    {x:0,z:-7,w:32,d:7},{x:13,z:5,w:3,d:3},{x:-15,z:4,w:3,d:1},{x:17,z:0,w:.5,d:.5},{x:-17,z:0,w:.5,d:.5},
  ]},
  library:{id:'library',name:'Bibliothèque',kicker:'RDC · espace lecture',objective:'Trouve le livre doré près des rayonnages.',spawn:{x:0,z:7.5},target:{x:10.8,z:-7.5},obstacles:[...roomWalls,
    {x:0,z:-8.6,w:22,d:1.3},{x:-13.5,z:-2,w:1.3,d:12},{x:13.5,z:-2,w:1.3,d:12},
    {x:-4,z:0,w:5,d:2.2},{x:4,z:0,w:5,d:2.2},{x:0,z:-4.2,w:5,d:2.2},
  ]},
  preau:{id:'preau',name:'Préau',kicker:'RDC · espace bleu',objective:'Allume l’étoile de Noël au fond du préau.',spawn:{x:0,z:8},target:{x:0,z:-7.8},obstacles:[...roomWalls,
    {x:-8,z:-1.5,w:4.3,d:2.2},{x:0,z:-1.5,w:4.3,d:2.2},{x:8,z:-1.5,w:4.3,d:2.2},
    {x:-8,z:3.5,w:4.3,d:2.2},{x:0,z:3.5,w:4.3,d:2.2},{x:8,z:3.5,w:4.3,d:2.2},
  ]},
  hall:{id:'hall',name:'Grande salle',kicker:'R+1 · salle de conférence',objective:'Récupère le micro devant l’écran de projection.',spawn:{x:0,z:8},target:{x:0,z:-7.4},obstacles:[...roomWalls,
    ...[-6,-2,2,6].flatMap(z=>[-7,0,7].map(x=>({x,z,w:4.6,d:1.45}))),
  ]},
};

export const ZONE_ORDER:ZoneId[]=['facade','library','preau','hall'];
export const LBS_SPAWN=ZONE_LAYOUTS.facade.spawn;
export const LBS_GIFTS:Point[]=ZONE_ORDER.map(id=>ZONE_LAYOUTS[id].target);
export const LBS_OBSTACLES=ZONE_LAYOUTS.facade.obstacles;
