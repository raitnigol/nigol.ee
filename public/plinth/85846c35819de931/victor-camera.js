/** A shared physical camera, expressed in the model's Blender Z-up coordinates. */
const length=v=>Math.hypot(...v);
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const direction=[5.5,-14,4.35];
// The apartment ceiling in annelinn.py starts at Z 14.04. Leave room for the near plane.
const ceilingHeight = 14.04;
const maxEyeHeight = ceilingHeight - .35;
const ceilingApproach = .75;
export const STUDIO={
  target:[0,0,3],yaw:Math.atan2(direction[0],-direction[1]),tilt:Math.asin(direction[2]/length(direction)),
  span:9.5,minWidth:8.35,distance:length(direction),perspective:true
};
export const RECORD={target:[0,-.30,2.14],yaw:0,tilt:Math.PI/2-1e-8,span:4.9,minWidth:5.95,distance:.95,perspective:false};

function indoorOrbitDistance(radius, vertical, targetHeight) {
  const headroom = maxEyeHeight - targetHeight;
  const rise = radius * vertical;
  if (vertical <= 0 || rise <= headroom - ceilingApproach) return radius;
  // Ease from the spherical orbit onto a level path underneath the ceiling.
  const remaining = Math.max(0, headroom + ceilingApproach - rise);
  return (headroom - remaining * remaining / (4 * ceilingApproach)) / vertical;
}

export function makeRig(view,yaw,tilt,target,width,height){
  const c=Math.cos(yaw),s=Math.sin(yaw),ct=Math.cos(tilt),st=Math.sin(tilt);
  const right=[c,s,0],up=[-s*st,c*st,ct],front=[s*ct,-c*ct,st];
  // Recover the instrument pivot if a stored target is up in the roof.
  if (target[2] > maxEyeHeight - ceilingApproach) target = view.target;
  const radius = view.perspective ? view.distance : view.distance + 6*ct*ct;
  const dist = indoorOrbitDistance(radius, st, target[2]);
  const eye=target.map((v,i)=>v+front[i]*dist),aspect=width/height;
  const near=.20,far=100;
  const requestedHalfHeight = Math.max(view.span, view.minWidth/aspect) * .5;
  // A tall, narrow viewport can reach the slab at its top edge even with the eye indoors.
  const nearCenterHeight = eye[2] - near*st;
  const edgeRise = Math.max(0, ct) * (view.perspective ? near/dist : 1);
  const availableHeight = ceilingHeight - .05 - nearCenterHeight;
  const h = edgeRise > 0 ? Math.min(requestedHalfHeight, availableHeight/edgeRise) : requestedHalfHeight;
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
