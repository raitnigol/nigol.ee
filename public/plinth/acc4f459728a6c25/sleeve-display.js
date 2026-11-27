/** Album jacket in the same Z-up world as the gramophone, shared by both renderers. */
const yaw=.17, lean=.15;
export const sleeve = {
  base:[-5.65,-1.45,.13], width:3.55, height:3.55, thickness:.075,
  right:[Math.cos(yaw),Math.sin(yaw),0],
  up:[-Math.sin(yaw)*Math.sin(lean),Math.cos(yaw)*Math.sin(lean),Math.cos(lean)],
  normal:[Math.sin(yaw)*Math.cos(lean),-Math.cos(yaw)*Math.cos(lean),Math.sin(lean)]
};
export const sleeveMotion=[-.30,.10,.62];
export function sleevePoint(x,z,depth=0,lift=0){
  return sleeve.base.map((n,i)=>n+sleeve.right[i]*x+sleeve.up[i]*z+sleeve.normal[i]*depth+sleeveMotion[i]*lift);
}
const w=sleeve.width/2,h=sleeve.height,d=sleeve.thickness/2;
const corners=[[-w,0,d],[w,0,d],[w,h,d],[-w,h,d],[-w,0,-d],[w,0,-d],[w,h,-d],[-w,h,-d]];
// Separate vertices preserve the paper edges' hard normals and square artwork UVs.
export const sleeveFaces=[
  {corners:[4,7,6,5],normal:sleeve.normal.map(n=>-n)},
  {corners:[0,3,7,4],normal:sleeve.right.map(n=>-n)},
  {corners:[1,5,6,2],normal:sleeve.right},
  {corners:[3,2,6,7],normal:sleeve.up},
  {corners:[0,4,5,1],normal:sleeve.up.map(n=>-n)},
  {corners:[0,1,2,3],normal:sleeve.normal,art:true}
].map(face=>({...face,points:face.corners.map(i=>sleevePoint(...corners[i]))}));

const ease=t=>t*t*(3-2*t);
/** Lift the old jacket, replace both textures at the peak, then settle the new one. */
export function createSleeveSwap(apply,{duration=520}={}){
  let pending=null,lift=0,hasCover=false;
  return {
    queue(value,animate=true,time=performance.now()){
      if(!hasCover||!animate){pending=null;lift=0;hasCover=true;apply(value);return;}
      pending={value,start:time,from:lift,committed:false};
    },
    step(time,reduced=false){
      if(!pending)return {lift,active:false};
      const p=Math.max(0,Math.min(1,(time-pending.start)/duration));
      if(!pending.committed&&(reduced||p>=.5)){apply(pending.value);pending.committed=true;}
      lift=reduced?0:p<.5?pending.from+(1-pending.from)*ease(p*2):1-ease((p-.5)*2);
      if(reduced||p>=1){pending=null;lift=0;}
      return {lift,active:Boolean(pending)};
    },
    clear(value){pending=null;lift=0;hasCover=false;apply(value);}
  };
}
