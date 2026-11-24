import {test,expect} from '@playwright/test';
import {clearSegment,findRoute,isWalkable} from '../app/movement';
import {ZONE_LAYOUTS,ZONE_ORDER} from '../app/lbs-layout';
test('LBS: every photo-derived room objective is reachable',()=>{
  for(const id of ZONE_ORDER){
    const {spawn,target,obstacles}=ZONE_LAYOUTS[id];
    expect(isWalkable(target.x,target.z,obstacles)).toBe(true);
    const route=findRoute(spawn,target,obstacles);
    expect(route.length).toBeGreaterThan(0);
    let start=spawn;
    for(const point of route){expect(clearSegment(start,point,obstacles)).toBe(true);start=point;}
    expect(start).toEqual(target);
  }
});
test('direct route, invalid destination and campus boundaries',()=>{
  expect(findRoute({x:0,z:0},{x:3,z:3},[])).toEqual([{x:3,z:3}]);
  expect(isWalkable(21,0,[])).toBe(false);
  expect(findRoute({x:0,z:0},{x:23,z:0},[])).toEqual([]);
  expect(findRoute({x:0,z:0},{x:5,z:0},[{x:5,z:0,w:3,d:3}])).toEqual([]);
});
test('all path segments clear a building including the player radius',()=>{
  const obstacles=[{x:0,z:0,w:6,d:5}];
  const start={x:-6,z:0},goal={x:6,z:0};
  const route=findRoute(start,goal,obstacles);
  expect(route.length).toBeGreaterThan(1);
  expect(route.at(-1)).toEqual(goal);
  let previous=start;
  for(const point of route){expect(clearSegment(previous,point,obstacles)).toBe(true);previous=point;}
});
