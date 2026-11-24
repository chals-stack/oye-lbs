import type {Obstacle, Point} from './movement';

export type ZoneId='facade'|'library'|'preau'|'hall';
export type ZoneLayout={id:ZoneId;name:string;kicker:string;objective:string;spawn:Point;target:Point;obstacles:Obstacle[]};
export type MissionStep={id:string;zone:ZoneId;title:string;instruction:string;action:string;position:Point};

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
export const MISSION_STEPS:MissionStep[]=[
  {id:'briefing',zone:'facade',title:'Prendre le briefing',instruction:'Consulte le panneau lumineux près de l’entrée LBS.',action:'Lire le briefing',position:{x:-9.8,z:-1.7}},
  {id:'finance',zone:'library',title:'Rayon Finance',instruction:'Retrouve le manuel doré dans le rayonnage de gauche.',action:'Prendre le manuel',position:{x:-12.2,z:-6.8}},
  {id:'marketing',zone:'library',title:'Rayon Marketing',instruction:'Récupère le second ouvrage au fond de la bibliothèque.',action:'Prendre le livre',position:{x:7.5,z:-7.3}},
  {id:'library-desk',zone:'library',title:'Préparer la sélection',instruction:'Dépose les ouvrages sur la table centrale pour les invités.',action:'Déposer les livres',position:{x:0,z:-2.4}},
  {id:'table-left',zone:'preau',title:'Table des associations',instruction:'Installe le centre de table sur la rangée de gauche.',action:'Installer la décoration',position:{x:-8,z:1.7}},
  {id:'table-right',zone:'preau',title:'Table des partenaires',instruction:'Prépare maintenant la table de droite.',action:'Installer la décoration',position:{x:8,z:1.7}},
  {id:'garland',zone:'preau',title:'Illuminer le préau',instruction:'Active la guirlande au fond de l’espace bleu.',action:'Allumer la guirlande',position:{x:0,z:-7.8}},
  {id:'breaker',zone:'hall',title:'Alimentation de la salle',instruction:'Enclenche le tableau électrique près du mur gauche.',action:'Activer le courant',position:{x:-12.7,z:-7.6}},
  {id:'projector',zone:'hall',title:'Projection',instruction:'Allume le vidéoprojecteur face à l’écran.',action:'Démarrer le projecteur',position:{x:-4,z:-7.4}},
  {id:'microphone',zone:'hall',title:'Test du micro',instruction:'Récupère le micro et effectue le test son.',action:'Tester le micro',position:{x:0,z:-7.4}},
  {id:'open-doors',zone:'hall',title:'Accueillir les invités',instruction:'Ouvre officiellement la grande salle pour la veillée.',action:'Ouvrir la salle',position:{x:4,z:-7.4}},
];

export function unlockedZones(stepIndex:number){
  const active=MISSION_STEPS[Math.min(stepIndex,MISSION_STEPS.length-1)]?.zone??'hall';
  return ZONE_ORDER.slice(0,ZONE_ORDER.indexOf(active)+1);
}
export const LBS_SPAWN=ZONE_LAYOUTS.facade.spawn;
export const LBS_GIFTS:Point[]=ZONE_ORDER.map(id=>ZONE_LAYOUTS[id].target);
export const LBS_OBSTACLES=ZONE_LAYOUTS.facade.obstacles;
