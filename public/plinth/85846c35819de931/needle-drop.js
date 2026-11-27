import {planeAt} from './victor-camera.js';

// These dimensions and the stylus sweep match the machined record in model/reproducer.py.
const RECORD_Y=-.30, GROOVE_Z=2.1346, PAPER_EDGE=.648, RECORD_EDGE=1.898;
const PIVOT_X=1.74,PIVOT_Y=1.35,TIP_X=-.13,TIP_Y=-2.53, SWEEP=-.445;
function stylusRadius(t){
  const c=Math.cos(t*SWEEP),s=Math.sin(t*SWEEP);
  return Math.hypot(PIVOT_X+c*TIP_X-s*TIP_Y,PIVOT_Y+s*TIP_X+c*TIP_Y-RECORD_Y);
}
const OUTER=stylusRadius(0),INNER=stylusRadius(1);
export function grooveFraction(x,y){
  const r=Math.hypot(x,y-RECORD_Y);
  if(!Number.isFinite(r)||r<=PAPER_EDGE||r>RECORD_EDGE)return null;
  if(r>=OUTER)return 0;
  if(r<=INNER)return 1;
  // Invert the tonearm's circular path so its needle lands on the picked groove.
  let lo=0,hi=1;
  for(let i=0;i<18;i++){
    const mid=(lo+hi)*.5;
    if(stylusRadius(mid)>r)lo=mid;else hi=mid;
  }
  return (lo+hi)*.5;
}

export function pickGroove(rig,canvas,event,isBlocked){
  if(!rig)return null;
  const rect=canvas.getBoundingClientRect();
  if(!rect.width||!rect.height)return null;
  const u=(event.clientX-rect.left)/rect.width,v=(event.clientY-rect.top)/rect.height;
  if(u<0||u>=1||v<0||v>=1)return null;
  const point=planeAt(rig,2*u-1,1-2*v,GROOVE_Z);
  if(!point)return null;
  const fraction=grooveFraction(point[0],point[1]);
  if(fraction===null)return null;
  const back=rig.eye.map((n,i)=>n-point[i]), z=back.reduce((sum,n,i)=>sum+n*rig.front[i],0);
  if(z<=rig.near||z>=rig.far)return null;
  const origin=rig.perspective?
    rig.eye.map((n,i)=>n-back[i]*rig.near/z):
    point.map((n,i)=>n+rig.front[i]*(z-rig.near));
  return isBlocked(origin,point,u,v,z)?null:fraction;
}

/** Mesh picker for WebGL. The small bounds index is built on the first deliberate
 * needle drop. It reuses the loaded geometry and only visits intersected blocks.
 * The software renderer can test its already-computed depth buffer directly. */
export function makeNeedleOccluder(meta,bytes){
  const verts=new Int16Array(bytes,0,meta.vertices*6);
  const indices=new Uint32Array(bytes,meta.vertices*12,meta.indices),scale=meta.scale;
  let blocks;
  function build(){
    blocks=[];
    for(const batch of meta.draws){
      if(batch.group===1)continue; // The shellac itself is the receiving surface.
      for(let start=batch.start;start<batch.start+batch.count;start+=192){
        const end=Math.min(start+192,batch.start+batch.count);
        const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
        for(let i=start;i<end;i++){
          const p=indices[i]*6;
          for(let k=0;k<3;k++){const v=verts[p+k];if(v<min[k])min[k]=v;if(v>max[k])max[k]=v}
        }
        blocks.push({start,end,min,max,arm:batch.group===2});
      }
    }
  }
  function ray(from,to){
    const o=from.map(v=>v*scale),d=to.map((v,i)=>v*scale-o[i]);
    return {o,d,inv:d.map(v=>1/v)};
  }
  function intersectsBox(ray,block){
    let a=0,b=.99975;
    for(let k=0;k<3;k++){
      if(Math.abs(ray.d[k])<.000001){if(ray.o[k]<block.min[k]||ray.o[k]>block.max[k])return false;continue}
      const t1=(block.min[k]-ray.o[k])*ray.inv[k],t2=(block.max[k]-ray.o[k])*ray.inv[k];
      a=Math.max(a,Math.min(t1,t2));b=Math.min(b,Math.max(t1,t2));
      if(b<a)return false;
    }return true;
  }
  function crossesTriangle(ray,start){
    const a=indices[start]*6,b=indices[start+1]*6,c=indices[start+2]*6;
    const ex=verts[b]-verts[a],ey=verts[b+1]-verts[a+1],ez=verts[b+2]-verts[a+2];
    const fx=verts[c]-verts[a],fy=verts[c+1]-verts[a+1],fz=verts[c+2]-verts[a+2];
    const [dx,dy,dz]=ray.d;
    const px=dy*fz-dz*fy,py=dz*fx-dx*fz,pz=dx*fy-dy*fx;
    const det=ex*px+ey*py+ez*pz;
    if(Math.abs(det)<.00001)return false;
    const ox=ray.o[0]-verts[a],oy=ray.o[1]-verts[a+1],oz=ray.o[2]-verts[a+2];
    const u=(ox*px+oy*py+oz*pz)/det;if(u<0||u>1)return false;
    const qx=oy*ez-oz*ey,qy=oz*ex-ox*ez,qz=ox*ey-oy*ex;
    const v=(dx*qx+dy*qy+dz*qz)/det;if(v<0||u+v>1)return false;
    const t=(fx*qx+fy*qy+fz*qz)/det;
    return t>0&&t<.99975;
  }
  return (from,to,angle=0,lift=0)=>{
    if(!blocks)build();
    const world=ray(from,to),c=Math.cos(angle),s=Math.sin(angle);
    const unpose=p=>[PIVOT_X+c*(p[0]-PIVOT_X)+s*(p[1]-PIVOT_Y),
      PIVOT_Y-s*(p[0]-PIVOT_X)+c*(p[1]-PIVOT_Y),p[2]-lift];
    const arm=ray(unpose(from),unpose(to));
    for(const block of blocks){
      const sight=block.arm?arm:world;
      if(!intersectsBox(sight,block))continue;
      for(let i=block.start;i<block.end;i+=3)if(crossesTriangle(sight,i))return true;
    }return false;
  };
}

export function createNeedleInput(canvas,callbacks,pick,isOrbit){
  let enabled=false,hovered=null;
  const cursor=()=>enabled?(hovered===null?'crosshair':'pointer'):(isOrbit()?'grab':'default');
  function show(fraction){
    if(fraction!==hovered){hovered=fraction;callbacks.onNeedleHover?.(fraction)}
    canvas.style.cursor=cursor();
  }
  return {
    get enabled(){return enabled},
    cursor,
    setEnabled(value){enabled=Boolean(value);show(null)},
    hover(e){if(enabled)show(pick(e))},
    leave(){if(enabled)show(null)},
    tap(e){
      if(!enabled)return false;
      const fraction=pick(e);show(fraction);
      if(fraction!==null)callbacks.onNeedleDrop?.(fraction);
      return true;
    }
  };
}
