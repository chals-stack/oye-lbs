'use client';
import {useEffect,useMemo,useState,type CSSProperties} from 'react';

const SIZE=7,MOVES=20,GOAL=2400;
const gems=[{icon:'✦',name:'Étoile',color:'#f2c66d'},{icon:'◆',name:'Cadeau',color:'#d95951'},{icon:'●',name:'Boule',color:'#4f8d7e'},{icon:'❄',name:'Flocon',color:'#9bc7df'},{icon:'▲',name:'Sapin',color:'#397255'}];
type Cell={id:number;type:number};
let nextId=1;
function randomType(){return Math.floor(Math.random()*gems.length)}
function makeBoard(){const b:Cell[]=[];for(let row=0;row<SIZE;row++)for(let col=0;col<SIZE;col++){let type=randomType();while((col>1&&b[row*SIZE+col-1].type===type&&b[row*SIZE+col-2].type===type)||(row>1&&b[(row-1)*SIZE+col].type===type&&b[(row-2)*SIZE+col].type===type))type=randomType();b.push({id:nextId++,type});}return b;}
function matches(board:Cell[]){const hit=new Set<number>();for(let r=0;r<SIZE;r++){let start=0;for(let c=1;c<=SIZE;c++){if(c<SIZE&&board[r*SIZE+c].type===board[r*SIZE+start].type)continue;if(c-start>=3)for(let x=start;x<c;x++)hit.add(r*SIZE+x);start=c;}}for(let c=0;c<SIZE;c++){let start=0;for(let r=1;r<=SIZE;r++){if(r<SIZE&&board[r*SIZE+c].type===board[start*SIZE+c].type)continue;if(r-start>=3)for(let y=start;y<r;y++)hit.add(y*SIZE+c);start=r;}}return hit;}
function adjacent(a:number,b:number){return Math.abs(Math.floor(a/SIZE)-Math.floor(b/SIZE))+Math.abs(a%SIZE-b%SIZE)===1}
function collapse(board:Cell[],hit:Set<number>){const next=[...board];for(let c=0;c<SIZE;c++){const kept:Cell[]=[];for(let r=SIZE-1;r>=0;r--){const i=r*SIZE+c;if(!hit.has(i))kept.push(board[i]);}while(kept.length<SIZE)kept.push({id:nextId++,type:randomType()});for(let r=SIZE-1,k=0;r>=0;r--,k++)next[r*SIZE+c]=kept[k];}return next;}

export default function MatchThree({onBack,onReward}:{onBack:()=>void;onReward:(score:number)=>void}){
 const [board,setBoard]=useState<Cell[]>(()=>makeBoard()),[selected,setSelected]=useState<number|null>(null),[score,setScore]=useState(0),[moves,setMoves]=useState(MOVES),[busy,setBusy]=useState(false),[won,setWon]=useState(false),[rewarded,setRewarded]=useState(false);
 const progress=Math.min(100,score/GOAL*100),finished=moves<=0||won;
 const status=useMemo(()=>won?'Commande terminée !':moves<=0?'Plus de déplacements':selected!==null?'Choisis une case voisine':'Aligne au moins 3 symboles',[won,moves,selected]);
 useEffect(()=>{if(won&&!rewarded){setRewarded(true);onReward(score);}},[won,rewarded,onReward,score]);
 function resolve(next:Cell[],combo=1){const hit=matches(next);if(!hit.size){setBoard(next);setBusy(false);return;}setScore(value=>{const total=value+hit.size*70*combo;if(total>=GOAL)setWon(true);return total;});setBoard(next.map((cell,i)=>hit.has(i)?{...cell,type:-1}:cell));window.setTimeout(()=>{const fallen=collapse(next,hit);setBoard(fallen);window.setTimeout(()=>resolve(fallen,combo+1),180);},180);}
 function pick(index:number){if(busy||finished)return;if(selected===null){setSelected(index);return;}if(selected===index){setSelected(null);return;}if(!adjacent(selected,index)){setSelected(index);return;}const swapped=[...board];[swapped[selected],swapped[index]]=[swapped[index],swapped[selected]];if(!matches(swapped).size){setSelected(index);return;}setSelected(null);setMoves(value=>value-1);setBusy(true);resolve(swapped);}
 function restart(){setBoard(makeBoard());setSelected(null);setScore(0);setMoves(MOVES);setBusy(false);setWon(false);setRewarded(false);}
 return <section className="mini-game match-game" aria-label="Éclats de Noël, jeu d’alignement">
  <header className="mini-game-header"><button className="mini-back" onClick={onBack}>← Arcade</button><div><p className="eyebrow">Puzzle · Match 3</p><h2>Éclats de Noël</h2></div><button className="mini-restart" onClick={restart}>↻ Rejouer</button></header>
  <div className="match-layout"><aside className="match-brief"><span className="mini-kicker">Commande LBS</span><h3>Prépare les décorations</h3><p>Aligne les boules, étoiles et sapins pour compléter la commande avant la fin des déplacements.</p><div className="match-stats"><div><span>Score</span><strong>{score.toLocaleString('fr-FR')}</strong></div><div><span>Coups</span><strong>{moves}</strong></div></div><div className="mini-progress"><i style={{width:progress+'%'}}/></div><small>Objectif : {GOAL.toLocaleString('fr-FR')} points</small></aside>
   <div><div className={'match-board '+(busy?'is-busy':'')} role="grid" aria-label="Grille de jeu">{board.map((cell,index)=>{const gem=cell.type>=0?gems[cell.type]:null;return <button key={cell.id} role="gridcell" aria-label={gem?.name??'Combinaison'} aria-selected={selected===index} className={'match-cell '+(!gem?'matched':'')} style={{'--gem':gem?.color??'#fff'} as CSSProperties} onClick={()=>pick(index)}><span>{gem?.icon}</span></button>})}</div><p className="match-status" aria-live="polite">{status}</p></div>
  </div>
  {finished&&<div className="mini-result"><div><span>{won?'✦':'◇'}</span><h3>{won?'Commande validée':'Presque !'}</h3><p>{won?'Tu remportes 3 tickets Oye.':'Réessaie pour atteindre l’objectif.'}</p><button onClick={restart}>Nouvelle partie</button></div></div>}
 </section>;
}
