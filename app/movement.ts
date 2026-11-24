export type Obstacle = { x: number; z: number; w: number; d: number };
export type Point = { x: number; z: number };
export function isWalkable(x: number, z: number, obstacles: Obstacle[]) {
  return Math.abs(x) <= 20 && Math.abs(z) <= 20 && !obstacles.some(b => Math.abs(x-b.x) < b.w/2+.4 && Math.abs(z-b.z) < b.d/2+.4);
}
export function clearSegment(a: Point, b: Point, obstacles: Obstacle[]) {
  const steps = Math.max(1, Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/.2));
  for(let i=0;i<=steps;i++) if(!isWalkable(a.x+(b.x-a.x)*i/steps,a.z+(b.z-a.z)*i/steps,obstacles)) return false;
  return true;
}
/** Small campus grid: route around buildings rather than walking into walls. */
export function findRoute(start: Point, goal: Point, obstacles: Obstacle[]): Point[] {
  if(!isWalkable(goal.x,goal.z,obstacles)) return [];
  if(clearSegment(start,goal,obstacles)) return [goal];
  const candidates: Point[]=[];
  for(let x=Math.floor(start.x)-1;x<=Math.ceil(start.x)+1;x++) for(let z=Math.floor(start.z)-1;z<=Math.ceil(start.z)+1;z++) {
    if(clearSegment(start,{x,z},obstacles)) candidates.push({x,z});
  }
  candidates.sort((a,b)=>Math.hypot(a.x-start.x,a.z-start.z)-Math.hypot(b.x-start.x,b.z-start.z));
  if(!candidates.length) return [];
  const queue=[candidates[0]], ids=(p:Point)=>`${p.x},${p.z}`;
  const parents=new Map<string,Point|null>([[ids(queue[0]),null]]);
  let end: Point|undefined;
  for(let i=0;i<queue.length;i++) {
    const p=queue[i];
    if(Math.hypot(p.x-goal.x,p.z-goal.z)<1.6 && clearSegment(p,goal,obstacles)){end=p;break;}
    for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const n={x:p.x+dx,z:p.z+dz};
      if(!parents.has(ids(n))&&clearSegment(p,n,obstacles)){parents.set(ids(n),p);queue.push(n);}
    }
  }
  if(!end)return [];
  const path:Point[]=[goal];let p:Point|null=end;
  while(p){path.unshift(p);p=parents.get(ids(p))??null;}
  const simplified:Point[]=[];let anchor=start;
  while(path.length){let i=path.length-1;while(i>0&&!clearSegment(anchor,path[i],obstacles))i--;anchor=path[i];simplified.push(anchor);path.splice(0,i+1);}
  return simplified;
}
