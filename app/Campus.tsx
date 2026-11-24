'use client';
import {useEffect,useRef,useState} from 'react';
import {createGame,type Preferences,type GameInput,type GameState} from './game';
import {ZONE_LAYOUTS,ZONE_ORDER,type ZoneId} from './lbs-layout';
const defaults:Preferences={mode:'keys',running:false,color:'#ce4b48',reduced:false,zoom:22};
const colors=[{value:'#ce4b48',name:'Rouge Noël'},{value:'#3d8074',name:'Vert sapin'},{value:'#537ba4',name:'Bleu glacier'}];
export default function Campus(){
 const mount=useRef<HTMLDivElement>(null),dialog=useRef<HTMLDialogElement>(null),settingsButton=useRef<HTMLButtonElement>(null);
 const engine=useRef<ReturnType<typeof createGame>|null>(null);
 const input=useRef<GameInput>({keys:new Set(),preferences:defaults,paused:false});
 const [preferences,setPreferences]=useState(defaults),[gameState,setGameState]=useState<GameState>({zone:'facade',score:0,objective:ZONE_LAYOUTS.facade.objective,completed:false}),[ready,setReady]=useState(false),[error,setError]=useState(false),[settings,setSettings]=useState(false),[overview,setOverview]=useState(false);
 useEffect(()=>{
  let prefs={...defaults,reduced:window.matchMedia('(prefers-reduced-motion: reduce)').matches};
  try{const saved=JSON.parse(localStorage.getItem('oye.preferences')??'null');if(saved){prefs={mode:saved.mode==='pointer'?'pointer':'keys',running:saved.running===true,color:colors.some(c=>c.value===saved.color)?saved.color:defaults.color,reduced:typeof saved.reduced==='boolean'?saved.reduced:prefs.reduced,zoom:typeof saved.zoom==='number'&&Number.isFinite(saved.zoom)?Math.max(14,Math.min(24,saved.zoom)):22};}}catch{/* Storage is optional. */}
  input.current.preferences=prefs;setPreferences(prefs);
  try{engine.current=createGame(mount.current!,input.current,setGameState);setReady(true);}catch(e){console.error('Initialisation 3D',e);setError(true);}
  return()=>{engine.current?.dispose();engine.current=null;};
 },[]);
 function update(patch:Partial<Preferences>){const next={...input.current.preferences,...patch};engine.current?.stop();input.current.preferences=next;setPreferences(next);try{localStorage.setItem('oye.preferences',JSON.stringify(next));}catch{/* Optional storage. */}}
 function openSettings(){engine.current?.stop();input.current.paused=true;setSettings(true);dialog.current?.showModal();}
 function closeSettings(){dialog.current?.close();input.current.paused=false;setSettings(false);settingsButton.current?.focus();}
 const directions=[['',''],['↑','arrowup'],['',''],['←','arrowleft'],['↓','arrowdown'],['→','arrowright']];
 function visit(zone:ZoneId){input.current.overview=false;setOverview(false);engine.current?.goToZone(zone);}
 return <main className="game relative">
  <div ref={mount} className="absolute inset-0" aria-label="Campus de Noël en 3D"/>
  <header className="game-header"><div className="panel brand"><span className="text-4xl font-black tracking-tighter">oye<span className="text-red-400">.</span></span><span className="brand-subtitle">LBS · Lomé</span></div><button ref={settingsButton} onClick={openSettings} className="panel settings-button" aria-haspopup="dialog" aria-expanded={settings}>⚙ <span>Paramètres</span></button></header>
  <section className="panel mission"><p className="eyebrow">{ZONE_LAYOUTS[gameState.zone].kicker}</p><h1>{ZONE_LAYOUTS[gameState.zone].name}</h1><p className="mission-description">{gameState.objective}</p><div className="mission-count"><span aria-live="polite">{gameState.score} / 4 sceaux</span><span>✦</span></div><div className="progress-track"><div style={{width:gameState.score*25+'%'}}/></div></section>
  <nav className="panel zone-nav" aria-label="Espaces de l’école">{ZONE_ORDER.map((id,index)=><button key={id} aria-current={gameState.zone===id?'page':undefined} onClick={()=>visit(id)}><span>{index+1}</span>{ZONE_LAYOUTS[id].name}</button>)}</nav>
  <button className="panel overview-button" aria-pressed={overview} onClick={()=>{engine.current?.stop();input.current.overview=!overview;setOverview(!overview);}}>{overview?'↘ Revenir au personnage':'↗ Voir toute l’école'}</button>
  <div className="panel player-card"><span className="avatar-dot" style={{background:preferences.color}}>✦</span><div><strong>Explorateur d’hiver</strong><small>{preferences.running?'Petite course':'Balade tranquille'} · {preferences.mode==='pointer'?'Guidage souris':'Direction au clavier'}</small></div></div>
  <footer className="panel game-help">{!ready?'Préparation du campus…':preferences.mode==='pointer'?'Clique pour rejoindre un point · Maintiens pour guider · Échap pour arrêter':'ZQSD / WASD / flèches · Maj pour courir'}</footer>
  {!settings&&preferences.mode==='keys'&&<div className="direction-pad" aria-label="Commandes tactiles">{directions.map(([label,key],i)=>key?<button key={key} aria-label={key==='arrowup'?'Avancer':key==='arrowdown'?'Reculer':key==='arrowleft'?'Gauche':'Droite'} className="panel direction" onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);input.current.keys.add(key)}} onPointerUp={()=>input.current.keys.delete(key)} onPointerCancel={()=>input.current.keys.delete(key)} onLostPointerCapture={()=>input.current.keys.delete(key)}>{label}</button>:<span key={i}/>)}</div>}
  {!settings&&preferences.mode==='pointer'&&<div className="panel pointer-label">◎ <span>Clique ou touche le sol</span></div>}
  <dialog ref={dialog} className="settings-dialog" onCancel={e=>{e.preventDefault();closeSettings();}} aria-labelledby="settings-title">
   <div className="dialog-heading"><div><p className="eyebrow">À ta façon</p><h2 id="settings-title">Ton aventure, tes réglages.</h2></div><button onClick={closeSettings} className="close-button" aria-label="Fermer les paramètres">×</button></div>
   <fieldset><legend>Comment veux-tu te déplacer ?</legend><div className="control-options">{([{value:'keys',icon:'↗',name:'Directions',description:'Clavier et flèches tactiles'},{value:'pointer',icon:'◎',name:'Curseur guidé',description:'Clic ou toucher sur le sol'}] as const).map(option=><label className={'control-option '+(preferences.mode===option.value?'selected':'')} key={option.value}><input type="radio" name="control-mode" value={option.value} checked={preferences.mode===option.value} onChange={()=>update({mode:option.value})}/><span className="option-icon">{option.icon}</span><strong>{option.name}</strong><small>{option.description}</small></label>)}</div></fieldset>
   <p className="settings-tip">{preferences.mode==='pointer'?'Un clic indique une destination. Maintiens le clic pour guider en continu ; les bâtiments sont contournés automatiquement. Sur mobile, utilise ton doigt.':'Les directions suivent l’écran. Maintiens Maj pour courir ; les boutons à l’écran fonctionnent aussi au toucher.'}</p>
   <fieldset><legend>La couleur de ton manteau</legend><div className="swatches">{colors.map(color=><button key={color.value} aria-label={color.name} aria-pressed={preferences.color===color.value} onClick={()=>update({color:color.value})} style={{background:color.value}}>{preferences.color===color.value?'✓':''}</button>)}</div></fieldset>
   <label className="setting-row"><span>Courir par défaut<small>Un pas plus rapide, avec les deux modes</small></span><input type="checkbox" checked={preferences.running} onChange={e=>update({running:e.target.checked})}/></label>
   <label className="setting-row"><span>Réduire les animations<small>Personnage et caméra plus stables</small></span><input type="checkbox" checked={preferences.reduced} onChange={e=>update({reduced:e.target.checked})}/></label>
   <label className="zoom-setting">Distance de caméra<input aria-label="Distance de caméra" type="range" min="14" max="24" step="1" value={preferences.zoom} onChange={e=>update({zoom:Number(e.target.value)})}/><span>Proche <span>Vue d’ensemble</span></span></label>
   <button className="primary-button" onClick={closeSettings}>Retour au campus →</button><p className="saved-note">Tes préférences sont conservées sur cet appareil.</p>
  </dialog>
  {gameState.completed&&!settings&&<div className="completion"><section className="panel"><p className="text-4xl">✦</p><h2>Campus exploré !</h2><p>Tu as retrouvé les quatre sceaux de Noël de LBS.</p><button className="primary-button" onClick={()=>engine.current?.reset()}>Rejouer la visite</button></section></div>}
  {error&&<div className="completion"><section className="panel"><h2>La 3D est indisponible</h2><p>Active l’accélération graphique de ton navigateur, puis recharge la page.</p></section></div>}
 </main>;
}
