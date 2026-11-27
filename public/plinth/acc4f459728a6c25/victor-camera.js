/** A shared physical camera, expressed in the model's Blender Z-up coordinates. */
const length=v=>Math.hypot(...v);
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const direction=[5.5,-14,4.35];
// Clear space inside annelinn.py: stay in front of the wall unit, curtains and
// walls, and below the ceiling. These include clearance for the near plane.
export const cameraBounds={min:[-11.8,-18,-8],max:[14.8,15.7,13.2]};
// Conservative spheres include the fittings and their hanging cables.
export const orbitObstacles=[
  {center:[-5,5,11.4],radius:2.95},
  {center:[-4.15,-4.15,11.5],radius:2.95},
  {center:[8,13.4,5.5],radius:1.95}
];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const smooth=t=>t*t*(3-2*t);
export const STUDIO={
  target:[-1.3,0,3],yaw:Math.atan2(direction[0],-direction[1]),tilt:Math.asin(direction[2]/length(direction)),
  span:9.5,minWidth:14,distance:length(direction),perspective:true
};
// Orthographic framing does not depend on distance. Keep the eye outside the
// entire gramophone instead of placing it less than one unit above the record.
export const RECORD={target:[0,-.30,2.14],yaw:0,tilt:.90,span:4.9,minWidth:5.95,distance:9.7,perspective:false};

export function safeOrbitDistance(radius,front,target){
  let distance=radius;
  for(let i=0;i<3;i++){
    if(Math.abs(front[i])<1e-8)continue;
    const boundary=front[i]>0?cameraBounds.max[i]:cameraBounds.min[i];
    const limit=(boundary-target[i])/front[i],band=.6;
    // Round the boundary approach without letting the eye cross it.
    if(distance>limit-band)distance=distance>=limit+band?limit:limit-(limit+band-distance)**2/(4*band);
  }
  for(const {center,radius:r} of orbitObstacles){
    const offset=center.map((v,i)=>v-target[i]),along=dot(offset,front);
    if(along<=0)continue;
    const lateral=Math.sqrt(Math.max(0,dot(offset,offset)-along*along));
    const shoulder=2.5;
    if(lateral>=r+shoulder)continue;
    // A flat conservative cap avoids the infinite slope of a ray/sphere
    // tangent, which otherwise makes the camera jump when grazing a fitting.
    const entry=along-r;
    const influence=1-smooth(clamp((lateral-r)/shoulder,0,1));
    distance-=Math.max(0,distance-entry)*influence;
  }
  return distance;
}

export function makeRig(view,yaw,tilt,target,width,height){
  yaw=Number.isFinite(yaw)?yaw%(Math.PI*2):view.yaw;
  tilt=clamp(Number.isFinite(tilt)?tilt:view.tilt,.14,Math.PI/2-1e-8);
  // Older saved angles may contain a pivot from a previous room layout.
  if(!Array.isArray(target)||target.length!==3||target.some((v,i)=>!Number.isFinite(v)||Math.abs(v-view.target[i])>2))target=view.target;
  width=Math.max(1,width||1);height=Math.max(1,height||1);
  const c=Math.cos(yaw),s=Math.sin(yaw),ct=Math.cos(tilt),st=Math.sin(tilt);
  const right=[c,s,0],up=[-s*st,c*st,ct],front=[s*ct,-c*ct,st];
  const dist=safeOrbitDistance(view.distance,front,target);
  const eye=target.map((v,i)=>v+front[i]*dist),aspect=width/height;
  const near=.20,far=100;
  // Keep framing stable while orbiting. The previous ceiling workaround changed
  // the projection itself, causing abrupt zooms in tall/narrow viewports.
  const h=Math.max(view.span,view.minWidth/aspect)*.5;
  const w = h*aspect;
  let matrix;
  if(view.perspective){
    const fx=dist/w,fy=dist/h,a=(far+near)/(far-near),b=-2*far*near/(far-near);
    matrix=[right[0]*fx,up[0]*fy,-front[0]*a,-front[0],right[1]*fx,up[1]*fy,-front[1]*a,-front[1],
      right[2]*fx,up[2]*fy,-front[2]*a,-front[2],-dot(eye,right)*fx,-dot(eye,up)*fy,dot(eye,front)*a+b,dot(eye,front)];
  }else{
    const clip=2/(far-near);
    matrix=[right[0]/w,up[0]/h,-front[0]*clip,0,right[1]/w,up[1]/h,-front[1]*clip,0,
      right[2]/w,up[2]/h,-front[2]*clip,0,-dot(target,right)/w,-dot(target,up)/h,(dot(eye,front)-near)*clip-1,1];
  }
  return {right,up,front,forward:front,target,eye,w,h,width,height,near,far,ox:width*.5,oy:height*.5,
    scale:height/(2*h),focal:height*dist/(2*h),distance:dist,perspective:view.perspective,matrix:new Float32Array(matrix)};
}
/** Unproject normalized screen coordinates onto the horizontal plane at world Z. */
export function planeAt(rig,nx,ny,z){
  if(rig.perspective){
    const ray=rig.front.map((v,i)=>-v+(rig.right[i]*nx*rig.w+rig.up[i]*ny*rig.h)/rig.distance);
    const lambda=(z-rig.eye[2])/ray[2];
    if(!Number.isFinite(lambda)||lambda<=0)return null;
    return rig.eye.map((v,i)=>v+ray[i]*lambda);
  }
  const p=rig.target.map((v,i)=>v+rig.right[i]*nx*rig.w+rig.up[i]*ny*rig.h);
  if(Math.abs(rig.front[2])<1e-6)return null;
  const t=(z-p[2])/rig.front[2];return p.map((v,i)=>v+rig.front[i]*t);
}
