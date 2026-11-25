'use client';
import {useState} from 'react';
import MatchThree from './MatchThree';
import LomeRide from './LomeRide';

type Game='hub'|'match'|'ride';
export default function Arcade({tickets,onReward,onClose}:{tickets:number;onReward:(amount:number)=>void;onClose:()=>void}){
 const [game,setGame]=useState<Game>('hub'),[toast,setToast]=useState('');
 function reward(amount:number,label:string){onReward(amount);setToast(`+${amount} tickets · ${label}`);window.setTimeout(()=>setToast(''),2200);}
 if(game==='match')return <div className="arcade-overlay"><MatchThree onBack={()=>setGame('hub')} onReward={()=>reward(3,'Puzzle terminé')}/>{toast&&<div className="arcade-toast">{toast}</div>}</div>;
 if(game==='ride')return <div className="arcade-overlay"><LomeRide onBack={()=>setGame('hub')} onReward={()=>reward(4,'Course réussie')}/>{toast&&<div className="arcade-toast">{toast}</div>}</div>;
 return <div className="arcade-overlay"><section className="arcade-hub"><header className="arcade-header"><div><p className="eyebrow">oye · Campus arcade</p><h2>Choisis ton défi.</h2><p>Joue entre deux missions et gagne des tickets pour les animations de Noël.</p></div><div className="arcade-actions"><span className="ticket-count">✦ {tickets} tickets</span><button onClick={onClose}>Fermer ×</button></div></header><div className="game-cards">
  <button className="game-card match-card" onClick={()=>setGame('match')}><span className="game-card-number">01</span><div className="game-card-art"><i>✦</i><i>◆</i><i>●</i><i>▲</i><i>❄</i></div><div><span>Puzzle · 3 min</span><h3>Éclats de Noël</h3><p>Aligne les décorations et complète la commande de fête de LBS.</p><strong>Jouer maintenant →</strong></div></button>
  <button className="game-card ride-card" onClick={()=>setGame('ride')}><span className="game-card-number">02</span><div className="ride-card-art"><span>LOMÉ</span><div>🏍</div></div><div><span>Course · arcade</span><h3>Lomé Ride</h3><p>Traverse les quartiers de Lomé, évite le trafic et ramasse les pièces.</p><strong>Démarrer la course →</strong></div></button>
 </div><footer className="arcade-footer"><span>Clavier, souris et tactile</span><span>Scores enregistrés sur cet appareil</span></footer></section></div>;
}
