import {createNeedleInput,pickGroove} from './needle-drop.js';
/* Software Z-buffer used for free orbit when WebGL is unavailable. The indexed
   geometry, camera and articulated transforms are the same as the GPU renderer. */
import {STUDIO, RECORD as TOP, makeRig, planeAt} from './victor-camera.js';
import {applySceneFinish} from './scene-finish.js';
import {roomLightClass,neonLight} from './victor-lighting.js';
const TAU = Math.PI * 2;
const SPINDLE = [0,-.30,2.14], LABEL_RADIUS = .64, PAPER_SIZE = 256;
const ARM = [1.74,1.35,2.24];
const clamp=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
const saturate=n=>clamp(n,0,1);
const tone=new Uint8Array(4097);
for(let i=0;i<tone.length;i++){
  const v=i/1024;
  tone[i]=Math.round(255*Math.pow(saturate(v*(2.51*v+.03)/(v*(2.43*v+.59)+.14)),1/2.2));
}
const channel=n=>tone[clamp(Math.round(n*1024),0,4096)];
const rgb=(r,g,b,a=255)=>(a<<24)|(b<<16)|(g<<8)|r;
function family(name){
  if(/walnut|mahogany|oak/i.test(name))return 1;
  if(/vinyl|shellac/i.test(name))return 2;
  return 0;
}
const textureCache = new Map();
function loadTexture(path){
  if(!textureCache.has(path)){
    textureCache.set(path,new Promise((resolve,reject)=>{
      const image=new Image();
      image.onerror=()=>reject(new Error('Could not load the room materials.'));
      image.onload=()=>{
        const aspect=(image.naturalWidth||image.width)/(image.naturalHeight||image.height);
        let w=Math.min(1024,image.naturalWidth||image.width),h=Math.max(1,Math.round(w/aspect));
        const c=document.createElement('canvas');c.width=w;c.height=h;
        const g=c.getContext('2d',{willReadFrequently:true});const levels=[];
        while(true){
          g.drawImage(image,0,0,w,h);
          levels.push({data:new Uint32Array(g.getImageData(0,0,w,h).data.buffer),w,h});
          if(w===1&&h===1)break;
          w=Math.max(1,w>>1);h=Math.max(1,h>>1);
        }
        resolve(levels);
      };
      image.src=new URL(path,import.meta.url).href;
    }).catch(e=>{textureCache.delete(path);throw e}));
  }
  return textureCache.get(path);
}
async function loadPart(prefix){
  const [data,bytes]=await Promise.all(['.json','.bin'].map(async(ext,i)=>{
    const r=await fetch(new URL(prefix+ext,import.meta.url));if(!r.ok)throw new Error('Could not load the listening room.');
    return i?r.arrayBuffer():r.json();
  }));
  const n=data.vertices,indexBytes=data.indices*4,aoStart=n*12+indexBytes,rawEnd=aoStart+(data.ao?n:0);
  const uvStart=Math.ceil(rawEnd/4)*4,expected=data.uv?uvStart+n*8:rawEnd;
  if(bytes.byteLength!==expected)throw new Error('Invalid room geometry.');
  const raw=new Int16Array(bytes,0,n*6),indices=new Uint32Array(bytes,n*12,data.indices);
  const p=new Float32Array(n*3),norm=new Float32Array(n*3);
  for(let i=0;i<n;i++)for(let j=0;j<3;j++){
    p[i*3+j]=raw[i*6+j]/data.scale;norm[i*3+j]=raw[i*6+j+3]/32767;
  }
  const ao=data.ao?new Uint8Array(bytes,aoStart,n):new Uint8Array(n).fill(255);
  const uv=data.uv?new Float32Array(bytes,uvStart,n*2):new Float32Array(n*2);
  const materials=await Promise.all(data.materials.map(async m=>({...m,kind:family(m.name),lightClass:roomLightClass(m.name),levels:m.texture?await loadTexture(m.texture):null})));
  const draws=data.draws.filter(d=>!materials[d.material].name.toLowerCase().includes('blank groove bands'));
  return {n,p,norm,uv,indices,draws,materials,ao};
}
let loading;
function loadModel(){
  if(!loading)loading=Promise.all([loadPart('victor-model'),loadPart('cafe-model')]).then(([model,room])=>{
    const n=model.n+room.n,combined={n,draws:model.draws.slice(),materials:[...model.materials,...room.materials]};
    for(const [key,width,Type] of [['p',3,Float32Array],['norm',3,Float32Array],['uv',2,Float32Array],['ao',1,Uint8Array]]){
      combined[key]=new Type(n*width);combined[key].set(model[key]);combined[key].set(room[key],model.n*width);
    }
    combined.indices=new Uint32Array(model.indices.length+room.indices.length);
    combined.indices.set(model.indices);
    for(let i=0;i<room.indices.length;i++)combined.indices[model.indices.length+i]=room.indices[i]+model.n;
    for(const d of room.draws)combined.draws.push({...d,start:d.start+model.indices.length,material:d.material+model.materials.length,group:4});
    return combined;
  }).catch(error=>{loading=undefined;throw error});
  return loading;
}
function blankTexture(){
  const c=document.createElement('canvas');c.width=c.height=PAPER_SIZE;
  const g=c.getContext('2d',{willReadFrequently:true});
  const enamel=g.createLinearGradient(0,0,PAPER_SIZE,PAPER_SIZE);
  enamel.addColorStop(0,'#482026');enamel.addColorStop(1,'#673139');
  g.fillStyle=enamel;g.fillRect(0,0,PAPER_SIZE,PAPER_SIZE);
  for(const r of [.46,.45,.18]){
    g.beginPath();g.arc(128,128,256*r,0,TAU);g.lineWidth=1;g.strokeStyle='#d8c49e';g.stroke();
  }
  g.fillStyle='#f0dfbf';g.font='italic 38px Georgia,serif';g.textAlign='center';g.fillText('$.pohhu¥',128,96);
  return new Uint32Array(g.getImageData(0,0,PAPER_SIZE,PAPER_SIZE).data.buffer);
}
function labelLevels(first){
  let data=first,size=PAPER_SIZE;
  const levels=[{data,size}];
  while(size>1){
    const half=size>>1,smaller=new Uint32Array(half*half);
    for(let j=0;j<half;j++)for(let i=0;i<half;i++){
      const at=(2*j)*size+2*i;
      const a=data[at],b=data[at+1],c=data[at+size],d=data[at+size+1];
      // The pair masks hold independent channels without overflow across bytes.
      const rb=((((a&0xff00ff)+(b&0xff00ff)+(c&0xff00ff)+(d&0xff00ff))>>>2)&0xff00ff);
      const g=((((a&0xff00)+(b&0xff00)+(c&0xff00)+(d&0xff00))>>>2)&0xff00);
      smaller[j*half+i]=0xff000000|rb|g;
    }
    data=smaller;size=half;levels.push({data,size});
  }
  return levels;
}
function project(rig,x,y,z){
  const t=rig.target;x-=t[0];y-=t[1];z-=t[2];
  const d=x*rig.front[0]+y*rig.front[1]+z*rig.front[2],inv=1/(rig.distance-d);
  const sc=rig.perspective?rig.focal*inv:rig.scale;
  return [rig.ox+sc*(x*rig.right[0]+y*rig.right[1]),rig.oy-sc*(x*rig.up[0]+y*rig.up[1]+z*rig.up[2]),rig.perspective?inv:d];
}
function plane(rig,x,y,z){
  const onPlane=planeAt(rig,(x-rig.ox)/rig.ox,(rig.oy-y)/rig.oy,z);
  if(!onPlane)return null;
  const t=rig.target,f=rig.front,d=(onPlane[0]-t[0])*f[0]+(onPlane[1]-t[1])*f[1]+(z-t[2])*f[2];
  return [onPlane[0],onPlane[1],rig.perspective?1/(rig.distance-d):d];
}
// Each vertex lit in world coordinates. Broad, directional studio panels give
// brass and nickel distinct curved reflections as the observer orbits the horn.
const lamps=[[-8,5.8,6.5,18],[4.7,8.2,6.5,18],[-8.3,13.4,4.9,10]];
const softColor=[1,.96,.83],rimColor=[.78,.92,1.10],practicalColor=[1,.584,.273];
const ambientLow=[.215,.163,.131],ambientHigh=[.52,.51,.51],sunColor=[1.15,.885,.648];
const roomLow=[.19,.155,.132],roomHigh=[.32,.292,.27],windowColor=[.33,.35,.38],poolColor=[.48,.36,.23];
const nightAmbient=[[.028,.024,.035],[.067,.064,.095]],nightWindow=[.029,.053,.116];
const nightFill=[.30,.195,.125],nightSoft=[.82,.43,.17],nightRim=[.17,.32,.68],nightSky=[.11,.205,.37];
function vertexColor(colors,index,mat,nx,ny,nz,ao,ex,ey,ez,room,x,y,z,afterhours){
  let nv=nx*ex+ny*ey+nz*ez;
  if(nv<0){nx=-nx;ny=-ny;nz=-nz;nv=-nv}
  const rx=2*nv*nx-ex,ry=2*nv*ny-ey,rz=2*nv*nz-ez;
  const key=Math.max(0,nx*-.43+ny*-.41+nz*.805);
  const sky=.5+.5*nz,rough=mat.roughness,metal=mat.metallic;
  const soft=Math.max(0,(rx*-.69+ry*-.45+rz*.57-.44)/.56);
  const rim=Math.max(0,(rx*.70+ry*.55+rz*.45-.67)/.33);
  const darkFlag=saturate((rx*.90-ry*.43+rz*.08-.88)/.12);
  const gloss=(.99-.15*rough)*(1-.49*darkFlag);
  const f0Fresnel=.038+.35*(1-nv)**5;
  const diffuseScale=(1-metal)*(.25+.75*ao);
  const highlightScale=(.35+.65*ao)*gloss;
  const windowLight=Math.max(0,-nx*.79+ny*.47+nz*.40);
  const pool=.29+1.8*Math.exp(-.024*((x-.4)**2+(y-1)**2));
  let practical=0,globeReflection=0;
  for(const lamp of lamps){
    const dx=lamp[0]-x,dy=lamp[1]-y,dz=lamp[2]-z;
    const ds=Math.max(.3,dx*dx+dy*dy+dz*dz);
    const invLen=1/Math.sqrt(ds);
    practical+=lamp[3]*Math.max(0,(nx*dx+ny*dy+nz*dz)*invLen)/(1.2+ds);
    if(afterhours&&metal>.10){
      // A visible globe subtends a larger angle on nearby curved metal.
      const align=Math.max(0,(rx*dx+ry*dy+rz*dz)*invLen);
      globeReflection+=lamp[3]*Math.pow(align,10+55*(1-rough)**2)/(1+ds*.13);
    }
  }
  let focusSpot=0,focusSpec=0;
  if(afterhours){
    const dx=-4-x,dy=-4-y,dz=8.8-z,ds=dx*dx+dy*dy+dz*dz;
    const invLen=1/Math.sqrt(Math.max(.001,ds));
    const aim=(-.452*dx-.452*dy+.768*dz)*invLen;
    const cone=saturate((aim-.73)/.23);
    const lit=cone*cone*(3-2*cone)*86/(6+ds);
    focusSpot=lit*Math.max(0,(nx*dx+ny*dy+nz*dz)*invLen);
    focusSpec=lit*1.65*Math.max(0,(rx*dx+ry*dy+rz*dz)*invLen)**(4+21*(1-rough));
  }
  const k=index*3;
  for(let c=0;c<3;c++){
    const ambient=room?roomLow[c]+(roomHigh[c]-roomLow[c])*sky:
      ambientLow[c]+(ambientHigh[c]-ambientLow[c])*sky;
    const light=room?ambient+windowColor[c]*windowLight+practicalColor[c]*practical*1.7+poolColor[c]*pool*key:
      ambient+sunColor[c]*key+practicalColor[c]*practical;
    const tint=mat.color[c],f0=metal*tint+(1-metal)*f0Fresnel;
    const reflection=.19+.18*rz+2.4*soft*soft*softColor[c]+1.14*rim*rim*rimColor[c];
    let radiance=tint*light*diffuseScale+f0*reflection*highlightScale+((mat.lightClass===4||mat.lightClass===6)?0:(mat.emission?.[c]||0));
    if(afterhours){
      const external=mat.lightClass===1||mat.lightClass===5;
      const distantWindow=mat.lightClass===2;
      const ambientNight=nightAmbient[0][c]+(nightAmbient[1][c]-nightAmbient[0][c])*sky;
      const lantern=practicalColor[c]*practical*(room?2.65:3.1);
      const base=ambientNight+nightWindow[c]*windowLight;
      const returnedLight=room?0:(.128+.105*sky)*softColor[c];
      let illumination=base+lantern+returnedLight+nightFill[c]*(key*(room?.12:.57)+focusSpot*2.8);
      let nightReflection=.085+.035*rz+1.6*nightSoft[c]*soft*soft+.90*nightRim[c]*rim*rim;
      nightReflection+=(globeReflection*1.82+focusSpec)*practicalColor[c];
      let emission=mat.emission?.[c]||0;
      if(external){
        illumination=nightSky[c]*(.38+.40*sky);
        nightReflection*=.18;emission*=nightSky[c];
      }else if(distantWindow){
        illumination=.03;nightReflection*=.21;emission*=.88;
      }else if(mat.lightClass===4||mat.lightClass===6){
        emission*=1.08;
      }
      radiance=tint*illumination*diffuseScale+f0*nightReflection*highlightScale+emission;
    }
    colors[k+c]=channel(radiance);
  }
}
// Store the nearest instrument face from the cafe window's direction. The map
// is measured on a world-space plane, so shadows stay put as the camera orbits.
function instrumentShadows(model,afterhours=false){
  const side=576,low=-5,high=9,scale=side/(high-low);
  const dx=afterhours?-4/6.8:-.52/.74,dy=afterhours?-4/6.8:-.42/.74;
  const points=new Float32Array(model.n*3),field=new Float32Array(side*side).fill(-Infinity);
  const {p,indices}=model;
  for(let i=0;i<model.n;i++){
    const n=i*3,z=p[n+2];
    points[n]=(p[n]-z*dx-low)*scale;points[n+1]=(p[n+1]-z*dy-low)*scale;points[n+2]=z;
  }
  for(const draw of model.draws){
    if(draw.group===4)continue;
    for(let i=draw.start,stop=i+draw.count;i<stop;i+=3){
      const a=indices[i]*3,b=indices[i+1]*3,c=indices[i+2]*3;
      const ax=points[a],ay=points[a+1],bx=points[b]-ax,by=points[b+1]-ay,cx=points[c]-ax,cy=points[c+1]-ay;
      const det=bx*cy-cx*by;if(Math.abs(det)<.005)continue;
      const r=1/det;
      const xmin=Math.max(0,Math.ceil(ax+Math.min(0,bx,cx)-.5)),xmax=Math.min(side-1,Math.floor(ax+Math.max(0,bx,cx)-.5));
      const ymin=Math.max(0,Math.ceil(ay+Math.min(0,by,cy)-.5)),ymax=Math.min(side-1,Math.floor(ay+Math.max(0,by,cy)-.5));
      const za=points[a+2],zb=points[b+2]-za,zc=points[c+2]-za;
      for(let y=ymin;y<=ymax;y++){
        const sy=y+.5-ay;
        let u=((xmin+.5-ax)*cy-sy*cx)*r,v=(bx*sy-by*(xmin+.5-ax))*r;
        for(let x=xmin,index=y*side+x;x<=xmax;x++,index++,u+=cy*r,v-=by*r){
          if(u<0||v<0||u+v>1)continue;
          const z=za+u*zb+v*zc;if(z>field[index])field[index]=z;
        }
      }
    }
  }
  const offsets=[[-.78,-.51],[.13,-.93],[-.04,.62],[.82,-.22],[.61,.75],[-.85,.54],[0,0]];
  return (wx,wy,wz)=>{
    const sx=(wx-wz*dx-low)*scale,sy=(wy-wz*dy-low)*scale;
    if(sx<6||sy<6||sx>side-7||sy>side-7)return 1;
    const h=field[(sy|0)*side+(sx|0)]-wz;
    const radius=1.25+Math.min(4,Math.max(0,h)*.92);
    let blocked=0;
    for(let j=0;j<7;j++){
      const u=(sx+offsets[j][0]*radius)|0,v=(sy+offsets[j][1]*radius)|0;
      blocked+=saturate((field[v*side+u]-wz-.072)/.22);
    }
    return 1-blocked/7;
  };
}

export async function createCpuDeck(container, callbacks={}){
  const model=await loadModel();
  const cv=document.createElement('canvas'),ctx=cv.getContext('2d',{alpha:true});
  if(!ctx)throw new Error('Canvas rendering unavailable.');
  cv.tabIndex=0;cv.setAttribute('role','img');cv.setAttribute('aria-label','Three-dimensional gramophone. Drag or use arrow keys to orbit. Space toggles playback.');
  cv.style.cssText='display:block;width:100%;height:100%;user-select:none;outline-offset:-3px';
  let view=STUDIO,yaw=view.yaw,tilt=view.tilt,target=view.target.slice(),preset='studio',orbit=false,rig;
  let suspended=false,playing=false,cue=0,progress=0,rpm=100/3,pitch=0,pitchEnabled=true;
  let angle=0,velocity=0,armPose=.23,armLift=.055;
  let lastArm=NaN,lastLift=NaN,needsScene=true,started=0,raf=0,timer=0,ended=false;
  let buffer,output,base,depth,kind,staticColor,staticDepth,planeMap,drag=null,sizeX=0,sizeY=0,coverRequest=0;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const texBlank=labelLevels(blankTexture()),shadowDay=instrumentShadows(model);
  let afterhours=false,shadowNight,visibility=shadowDay,texture=texBlank,labelLevel=0;
  const slots=model.n+12;
  const projected=new Float32Array(slots*3),cameraSpace=new Float32Array(slots*3),colors=new Uint8Array(slots*3),stamps=new Uint32Array(model.n);
  const uv=new Float32Array(slots*2);uv.set(model.uv);
  const clipping=[];
  let pass=0;
  function refreshCamera(){rig=makeRig(view,yaw,tilt,target,sizeX||1,sizeY||1);needsScene=true;wake()}
  function resize(){
    const w=container.clientWidth||container.getBoundingClientRect().width,h=container.clientHeight||container.getBoundingClientRect().height;
    if(!w||!h)return;
    // Bound pixel work on software-only devices, including full-screen displays.
    const moving=Boolean(orbit&&drag?.moved);
    const ratio=moving?Math.min(1.0,880/w,Math.sqrt(370000/(w*h))):
      Math.min(Math.max(1,window.devicePixelRatio||1),1.45,1600/w,Math.sqrt(1050000/(w*h)));
    const rw=Math.max(1,Math.round(w*ratio)),rh=Math.max(1,Math.round(h*ratio));
    if(rw===sizeX&&rh===sizeY)return;
    cv.width=sizeX=rw;cv.height=sizeY=rh;buffer=ctx.createImageData(rw,rh);output=new Uint32Array(buffer.data.buffer);
    base=new Uint32Array(rw*rh);depth=new Float32Array(rw*rh);kind=new Uint8Array(rw*rh);
    staticColor=new Uint32Array(base.length);staticDepth=new Float32Array(depth.length);
    refreshCamera();
  }
  function raster(a,b,c,mat,materialKind){
    const ua=a*2,ub=b*2,uc=c*2;
    a*=3;b*=3;c*=3;
    const v=projected;
    const ax=v[a],ay=v[a+1],bx=v[b],by=v[b+1],cx=v[c],cy=v[c+1];
    const det=(bx-ax)*(cy-ay)-(cx-ax)*(by-ay);
    if(Math.abs(det)<.006)return;
    const minX=Math.max(0,Math.ceil(Math.min(ax,bx,cx)-.5));
    const maxX=Math.min(sizeX-1,Math.floor(Math.max(ax,bx,cx)-.5));
    const minY=Math.max(0,Math.ceil(Math.min(ay,by,cy)-.5));
    const maxY=Math.min(sizeY-1,Math.floor(Math.max(ay,by,cy)-.5));
    if(minX>maxX||minY>maxY)return;
    const inv=1/det,ubx=(cy-ay)*inv,uby=(ax-cx)*inv,ucx=(ay-by)*inv,ucy=(bx-ax)*inv;
    const z0=v[a+2],z1=v[b+2],z2=v[c+2],zb=z1-z0,zc=z2-z0;
    let level=null,ut=0,us=0,uz=0,vt=0,vs=0,vz=0;
    const pc=rig.perspective;
    if(mat.levels){
      const u0=uv[ua],u1=uv[ub],u2=uv[uc],v0=uv[ua+1],v1=uv[ub+1],v2=uv[uc+1];
      const uDelta1=u1-u0,uDelta2=u2-u0,vDelta1=v1-v0,vDelta2=v2-v0;
      const tex0=mat.levels[0];
      const footprint=Math.max(Math.abs(ubx*uDelta1+ucx*uDelta2)*tex0.w,
        Math.abs(uby*uDelta1+ucy*uDelta2)*tex0.w,
        Math.abs(ubx*vDelta1+ucx*vDelta2)*tex0.h,Math.abs(uby*vDelta1+ucy*vDelta2)*tex0.h,1);
      level=mat.levels[clamp(Math.floor(Math.log2(footprint)),0,mat.levels.length-1)];
      ut=pc?u0*z0:u0;uz=(pc?u1*z1:u1)-ut;us=(pc?u2*z2:u2)-ut;
      vt=pc?v0*z0:v0;vz=(pc?v1*z1:v1)-vt;vs=(pc?v2*z2:v2)-vt;
    }
    const xs=minX+.5-ax,ys=minY+.5-ay;
    let lb=ubx*xs+uby*ys,lc=ucx*xs+ucy*ys;
    for(let y=minY;y<=maxY;y++,lb+=uby,lc+=ucy){
      let u=lb,t=lc,idx=y*sizeX+minX;
      for(let x=minX;x<=maxX;x++,idx++,u+=ubx,t+=ucx){
        if(u<-.00001||t<-.00001||u+t>1.00001)continue;
        const z=z0+u*zb+t*zc;
        if(z<depth[idx])continue;
        depth[idx]=z;kind[idx]=materialKind;
        const p=1-u-t;
        let r=colors[a]*p+colors[b]*u+colors[c]*t,
          g=colors[a+1]*p+colors[b+1]*u+colors[c+1]*t,bv=colors[a+2]*p+colors[b+2]*u+colors[c+2]*t;
        if(level){
          const correction=pc?1/z:1,tx=(ut+uz*u+us*t)*correction,ty=1-(vt+vz*u+vs*t)*correction;
          const f=(tx-Math.floor(tx))*level.w-.5,h=(ty-Math.floor(ty))*level.h-.5;
          const x0=Math.floor(f),y0=Math.floor(h),fx=f-x0,fy=h-y0;
          const x1=(x0+1)%level.w,x2=x0<0?level.w-1:x0,y1=((y0+1)%level.h)*level.w,y2=(y0<0?level.h-1:y0)*level.w;
          const col00=level.data[y2+x2],col10=level.data[y2+x1],col01=level.data[y1+x2],col11=level.data[y1+x1];
          const w00=(1-fx)*(1-fy)/255,w10=fx*(1-fy)/255,w01=(1-fx)*fy/255,w11=fx*fy/255;
          r*=w00*(col00&255)+w10*(col10&255)+w01*(col01&255)+w11*(col11&255);
          g*=w00*((col00>>>8)&255)+w10*((col10>>>8)&255)+w01*((col01>>>8)&255)+w11*((col11>>>8)&255);
          bv*=w00*((col00>>>16)&255)+w10*((col10>>>16)&255)+w01*((col01>>>16)&255)+w11*((col11>>>16)&255);
        }
        base[idx]=rgb(r|0,g|0,bv|0);
      }
    }
  }
  function place(i,vx,vy,dist){
    const n=i*3,sc=rig.perspective?rig.focal/dist:rig.scale;
    cameraSpace[n]=vx;cameraSpace[n+1]=vy;cameraSpace[n+2]=dist;
    projected[n]=rig.ox+sc*vx;projected[n+1]=rig.oy-sc*vy;
    projected[n+2]=rig.perspective?1/dist:rig.distance-dist;
  }
  function clipNear(a,b,c,mat,materialKind){
    clipping.length=0;const tri=[a,b,c];let virtual=model.n;
    for(let i=0;i<3;i++){
      const current=tri[i],previous=tri[(i+2)%3],cn=current*3,pn=previous*3;
      const distance=cameraSpace[cn+2],before=cameraSpace[pn+2];
      if((distance<rig.near)!==(before<rig.near)){
        const f=(rig.near-before)/(distance-before),id=virtual++,next=id*3;
        place(id,cameraSpace[pn]+f*(cameraSpace[cn]-cameraSpace[pn]),cameraSpace[pn+1]+f*(cameraSpace[cn+1]-cameraSpace[pn+1]),rig.near);
        for(let j=0;j<3;j++)colors[next+j]=colors[pn+j]+f*(colors[cn+j]-colors[pn+j]);
        for(let j=0;j<2;j++)uv[id*2+j]=uv[previous*2+j]+f*(uv[current*2+j]-uv[previous*2+j]);
        clipping.push(id);
      }
      if(distance>=rig.near)clipping.push(current);
    }
    for(let i=1;i+1<clipping.length;i++)raster(clipping[0],clipping[i],clipping[i+1],mat,materialKind);
  }
  function surfaces(armOnly){
    const {p,norm,ao,indices}=model,{right,up,front,target:t}=rig;
    const cs=Math.cos(armPose),sn=Math.sin(armPose);
    for(const draw of model.draws){
      if((draw.group===2)!==armOnly)continue;
      const mat=model.materials[draw.material],room=draw.group===4;
      const materialKind=room?3:(mat.kind||4);
      const stamp=++pass,end=draw.start+draw.count;
      for(let k=draw.start;k<end;k+=3){
        for(let j=k;j<k+3;j++){
          const i=indices[j];if(stamps[i]===stamp)continue;stamps[i]=stamp;
          const n=i*3;let x=p[n],y=p[n+1],z=p[n+2],nx=norm[n],ny=norm[n+1],nz=norm[n+2];
          if(armOnly){
            const ox=x-ARM[0],oy=y-ARM[1],on=nx;
            x=ARM[0]+cs*ox-sn*oy;y=ARM[1]+sn*ox+cs*oy;z+=armLift;
            nx=cs*nx-sn*ny;ny=sn*on+cs*ny;
          }
          x-=t[0];y-=t[1];z-=t[2];
          place(i,right[0]*x+right[1]*y,up[0]*x+up[1]*y+up[2]*z,
            rig.distance-(front[0]*x+front[1]*y+front[2]*z));
          let vx=front[0],vy=front[1],vz=front[2];
          if(rig.perspective){
            const veX=front[0]*rig.distance-x,veY=front[1]*rig.distance-y,veZ=front[2]*rig.distance-z;
            const length=Math.sqrt(veX*veX+veY*veY+veZ*veZ)||1;
            vx=veX/length;vy=veY/length;vz=veZ/length;
          }
          vertexColor(colors,i,mat,nx,ny,nz,ao[i]/255,vx,vy,vz,room,x+t[0],y+t[1],z+t[2],afterhours);
        }
        const a=indices[k],b=indices[k+1],c=indices[k+2];
        if(Math.min(cameraSpace[a*3+2],cameraSpace[b*3+2],cameraSpace[c*3+2])<rig.near){
          if(Math.max(cameraSpace[a*3+2],cameraSpace[b*3+2],cameraSpace[c*3+2])>=rig.near)clipNear(a,b,c,mat,materialKind);
        }else raster(a,b,c,mat,materialKind);
      }
    }
  }
  function bake(){
    const {front,right,up,target:t,ox,oy,scale:sc}=rig;
    if(needsScene){
      kind.fill(0);base.fill(afterhours?rgb(21,23,35):rgb(77,62,45));depth.fill(-Infinity);surfaces(false);
      const lightPhase=(afterhours?-.81:.60)+.32*Math.atan2(front[0],-front[1]);
      for(let y=0;y<sizeY;y++){
        const screenY=oy-y-.5;
        for(let x=0,i=y*sizeX;x<sizeX;x++,i++){
          const type=kind[i],bufferZ=depth[i];if(!type||bufferZ===-Infinity)continue;
          const d=rig.perspective?1/bufferZ:rig.distance-bufferZ;
          const factor=rig.perspective?d/rig.focal:1/sc;
          const horizontally=(x+.5-ox)*factor,vertically=screenY*factor,z=rig.distance-d;
          const wx=t[0]+right[0]*horizontally+up[0]*vertically+front[0]*z;
          const wy=t[1]+right[1]*horizontally+up[1]*vertically+front[1]*z;
          const wz=t[2]+up[2]*vertically+front[2]*z;
          const windowLight=type===3&&(Math.abs(wz)>.12||Math.abs(wx)>8||Math.abs(wy)>8)?1:visibility(wx,wy,wz);
          const shadow=(1-windowLight)*(type===3?.30:type===4?.19:.26);
          if(type===2&&wz>2.12){
            const qy=wy+.30,r=Math.hypot(wx,qy),theta=Math.atan2(qy,wx);
            const fan=.5+.5*Math.cos(2*(theta-lightPhase));
            const line=.5+.5*Math.cos(r*TAU*17),cut=(.5+.5*Math.cos(r*TAU*3.8))**20;
            const value=(afterhours?15+40*fan**4.6+28*fan**22+2*line+4*cut:20+34*fan**3.5+24*fan**20+2.5*line+5*cut)*(1-shadow);
            base[i]=afterhours?rgb(value*1.083|0,value*.958|0,value*.866|0):rgb(value*1.03|0,value|0,value*.99|0);
          }else{
            let factor=1;
            if(type===1){
              const board=Math.abs(wx)>2.42?wy:wx;
              const grain=wz*12+(Math.abs(wx)>2.42?wx:wy)*3.9+.32*Math.sin(board*2+wz*4);
              const pore=.5+.5*Math.sin(grain*6.24+.8*Math.sin(grain*1.23));
              factor=1.04-.13*pore**3+.035*Math.sin(board*.7+grain*2.6);
            }else if(type===3&&Math.abs(wz)<.085){
              const dx=Math.max(0,Math.abs(wx-.14)-2.33),dy=Math.max(0,Math.abs(wy-.2)-1.8),ds=dx*dx+dy*dy;
              if(ds<6)factor=1-.26*Math.exp(-ds*2)-.05*Math.exp(-ds*.45);
            }
            factor*=1-shadow;
            // Emissive letters and their reflected coral glow occupy the back wall.
            // Evaluate the spill in geometry space to retain that location in orbit.
            let neonSpill=0;
            if(afterhours&&type===3&&wy>17.72&&wy<18.35&&Math.abs(wx-neonLight.x)<4.8&&Math.abs(wz-neonLight.z)<2.45){
              const u=(wx-neonLight.x)/(neonLight.halfLength+.56),v=(wz-neonLight.z)/.92,w=(wy-neonLight.y-.49)/.7;
              neonSpill=Math.exp(-1.5*(u*u+v*v+w*w));
            }
            if(factor!==1||neonSpill>.005){
              const pixel=base[i];base[i]=rgb(clamp((pixel&255)*factor+neonSpill*67|0,0,255),clamp(((pixel>>>8)&255)*factor+neonSpill*14|0,0,255),clamp(((pixel>>>16)&255)*factor+neonSpill*9|0,0,255));
            }
          }
        }
      }
      applySceneFinish(base,depth,sizeX,sizeY,rig,kind);
      staticColor.set(base);staticDepth.set(depth);needsScene=false;
    }else{base.set(staticColor);depth.set(staticDepth)}
    surfaces(true);lastArm=armPose;lastLift=armLift;
    let minX=sizeX,maxX=0,minY=sizeY,maxY=0;
    for(let i=0;i<40;i++){
      const a=i/40*TAU,p=project(rig,SPINDLE[0]+LABEL_RADIUS*Math.cos(a),SPINDLE[1]+LABEL_RADIUS*Math.sin(a),SPINDLE[2]);
      minX=Math.min(minX,p[0]);maxX=Math.max(maxX,p[0]);minY=Math.min(minY,p[1]);maxY=Math.max(maxY,p[1]);
    }
    const x1=clamp(Math.floor(minX-1),0,sizeX-1),x2=clamp(Math.ceil(maxX+1),0,sizeX-1);
    const y1=clamp(Math.floor(minY-1),0,sizeY-1),y2=clamp(Math.ceil(maxY+1),0,sizeY-1);
    labelLevel=clamp(Math.floor(Math.log2(PAPER_SIZE/Math.max(1,Math.sqrt((x2-x1+1)*(y2-y1+1))))) ,0,8);
    const samples=[];
    for(let y=y1;y<=y2;y++)for(let x=x1;x<=x2;x++){
      const point=plane(rig,x+.5,y+.5,SPINDLE[2]);if(!point)continue;
      const dx=point[0]-SPINDLE[0],dy=point[1]-SPINDLE[1],i=y*sizeX+x;
      if(dx*dx+dy*dy<=LABEL_RADIUS*LABEL_RADIUS&&point[2]+1e-7>=depth[i])samples.push(i,dx/LABEL_RADIUS,dy/LABEL_RADIUS,(afterhours?.88:1)*(.81+.19*visibility(point[0],point[1],SPINDLE[2])));
    }
    planeMap=new Float32Array(samples);
  }
  function stamp(){
    output.set(base);
    // Inverse rotor transform from the world-space label point to square image UV.
    const ca=Math.cos(angle),sa=Math.sin(angle);
    const {data,size}=texture[labelLevel];
    for(let j=0;j<planeMap.length;j+=4){
      const dx=planeMap[j+1],dy=planeMap[j+2],light=planeMap[j+3];
      const u=clamp((1+ca*dx-sa*dy)*(.5*size)-.5,0,size-1),v=clamp((1-sa*dx-ca*dy)*(.5*size)-.5,0,size-1);
      const x=u|0,y=v|0,nx=Math.min(size-1,x+1),ny=Math.min(size-1,y+1);
      const a=data[y*size+x],b=data[y*size+nx],c=data[ny*size+x],d=data[ny*size+nx];
      const fx=u-x,fy=v-y,wa=(1-fx)*(1-fy)*light,wb=fx*(1-fy)*light,wc=(1-fx)*fy*light,wd=fx*fy*light;
      output[planeMap[j]]=rgb(
        ((a&255)*wa+(b&255)*wb+(c&255)*wc+(d&255)*wd)|0,
        (((a>>>8)&255)*wa+((b>>>8)&255)*wb+((c>>>8)&255)*wc+((d>>>8)&255)*wd)|0,
        (((a>>>16)&255)*wa+((b>>>16)&255)*wb+((c>>>16)&255)*wc+((d>>>16)&255)*wd)|0);
    }
    ctx.putImageData(buffer,0,0);callbacks.onFrame?.();
  }
  function frame(now){
    raf=0;if(ended||suspended||document.hidden||!buffer)return;
    const dt=started?Math.min(.22,(now-started)/1000):1/60;started=now;
    const motion=playing&&!reduced.matches?rpm*(1+(pitchEnabled?pitch:0)/100)*TAU/60:0;
    velocity+=(motion-velocity)*(reduced.matches?1:1-Math.exp(-dt*(playing?4:6)));
    angle=(angle+velocity*dt)%TAU;
    const goal=playing?-.445*progress:.23,lift=playing?.055*cue:.055;
    const ease=reduced.matches?1:1-Math.exp(-dt*6);
    armPose+=(goal-armPose)*ease;armLift+=(lift-armLift)*ease;
    if(needsScene||Math.abs(lastArm-armPose)>.009||Math.abs(lastLift-armLift)>.008)bake();
    stamp();
    if(Math.abs(velocity)>.0009||Math.abs(goal-armPose)>.004||Math.abs(lift-armLift)>.005){
      timer=setTimeout(()=>{timer=0;wake()},65);
    }else started=0;
  }
  function wake(){
    if(!raf&&!ended&&!suspended&&!document.hidden){if(timer){clearTimeout(timer);timer=0}raf=requestAnimationFrame(frame)}
  }
  function setCover(url){
    const id=++coverRequest;texture=texBlank;wake();if(!url)return;
    const img=new Image();if(/^https?:/i.test(url))img.crossOrigin='anonymous';
    img.onload=()=>{
      if(ended||id!==coverRequest)return;
      try{
        const c=document.createElement('canvas');c.width=c.height=PAPER_SIZE;const g=c.getContext('2d',{willReadFrequently:true});
        const w=img.naturalWidth||img.width,h=img.naturalHeight||img.height,s=Math.min(w,h);
        g.fillStyle='#b99b70';g.fillRect(0,0,PAPER_SIZE,PAPER_SIZE);
        g.drawImage(img,(w-s)/2,(h-s)/2,s,s,0,0,PAPER_SIZE,PAPER_SIZE);
        texture=labelLevels(new Uint32Array(g.getImageData(0,0,PAPER_SIZE,PAPER_SIZE).data.buffer));wake();
      }catch{texture=texBlank;wake()}
    };img.src=url;
  }
  function setLighting(mode){
    const night=mode==='afterhours';
    if(night===afterhours)return;
    if(night&&!shadowNight)shadowNight=instrumentShadows(model,true);
    afterhours=night;visibility=night?shadowNight:shadowDay;
    needsScene=true;wake();
  }
  function setView(v,notify=true){
    preset=v==='overhead'?'overhead':'studio';view=preset==='overhead'?TOP:STUDIO;
    yaw=view.yaw;tilt=view.tilt;target=view.target.slice();refreshCamera();
    if(notify)callbacks.onViewChange?.(preset);
  }
  const needle=createNeedleInput(cv,callbacks,event=>pickGroove(rig,cv,event,(_from,_to,u,v,z)=>{
    if(needsScene||!depth)return true;
    const idx=Math.floor(v*sizeY)*sizeX+Math.floor(u*sizeX),sample=depth[idx];
    if(!Number.isFinite(sample))return true;
    const visible=rig.perspective?1/sample:rig.distance-sample;
    // Allow for pixel-center quantization of the groove plane at grazing angles.
    return z-visible>.007+.009/Math.max(.18,Math.abs(rig.front[2]));
  }),()=>orbit);
  function setOrbitEnabled(enabled,notify=true){
    orbit=Boolean(enabled);drag=null;cv.style.cursor=needle.cursor();cv.style.touchAction=orbit?'none':'pan-y';
    if(notify)callbacks.onOrbitChange?.(orbit);
  }
  function orbitBy(dx,dy){
    yaw-=dx;tilt=clamp(tilt+dy,.14,Math.PI/2-.004);
    if(preset!=='custom'){preset='custom';callbacks.onViewChange?.(preset)}
    refreshCamera();
  }
  function eventPlane(e,z){
    const b=cv.getBoundingClientRect();
    return plane(rig,(e.clientX-b.left)*sizeX/b.width,(e.clientY-b.top)*sizeY/b.height,z)||[Infinity,Infinity,0];
  }
  function setPitch(v,notify=false){if(Number.isFinite(+v)){pitch=clamp(+v,-8,8);wake();if(notify)callbacks.onPitch?.(pitch)}}
  function down(e){
    if(e.button!==0||!e.isPrimary||!rig)return;
    const p=eventPlane(e,2.04);
    drag={id:e.pointerId,initialX:e.clientX,initialY:e.clientY,x:e.clientX,y:e.clientY,control:!needle.enabled&&Math.hypot(p[0]-2.4,p[1]+1.37)<.29,pitch,moved:false};
    cv.setPointerCapture?.(e.pointerId);if(orbit)cv.style.cursor='grabbing';
  }
  function move(e){
    if(!drag){needle.hover(e);return}
    if(e.pointerId!==drag.id)return;
    if(!drag.moved&&Math.hypot(e.clientX-drag.initialX,e.clientY-drag.initialY)<5)return;
    if(!drag.moved){needle.leave();drag.moved=true;if(orbit&&!drag.control)resize()}
    if(drag.control&&pitchEnabled)setPitch(Math.round((drag.pitch+(drag.initialY-e.clientY)*.1)*10)/10,true);
    else if(orbit)orbitBy((e.clientX-drag.x)*.009,(e.clientY-drag.y)*.008);
    drag.x=e.clientX;drag.y=e.clientY;
  }
  function up(e){
    if(!drag||e.pointerId!==drag.id)return;
    const tap=!drag.moved&&e.type==='pointerup',control=drag.control;drag=null;
    if(cv.hasPointerCapture?.(e.pointerId))cv.releasePointerCapture(e.pointerId);
    cv.style.cursor=needle.cursor();
    if(orbit&&!tap)resize();
    if(!tap||needle.tap(e))return;if(control){callbacks.onRpm?.(rpm<40?45:100/3);return}
    const p=eventPlane(e,2.14);
    if(Math.hypot(p[0],p[1]+.3)<1.9||Math.hypot(p[0]+2.42,p[1]+.28)<.31)callbacks.onToggle?.();
  }
  function key(e){
    if(e.key===' '||e.key==='Enter'){e.preventDefault();if(!needle.enabled)callbacks.onToggle?.();return}
    if(e.key==='Home'){e.preventDefault();setOrbitEnabled(false);setView('studio');return}
    if(!orbit||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;
    e.preventDefault();orbitBy(e.key==='ArrowLeft'?.10:e.key==='ArrowRight'?-.10:0,e.key==='ArrowUp'?.075:e.key==='ArrowDown'?-.075:0);
  }
  const events=[['pointerdown',down],['pointermove',move],['pointerup',up],['pointercancel',up],['pointerleave',needle.leave],['keydown',key]];
  for(const [k,f] of events)cv.addEventListener(k,f);
  function visible(){if(!document.hidden){started=0;wake()}}
  const observer=new ResizeObserver(resize);container.append(cv);resize();observer.observe(container);
  document.addEventListener('visibilitychange',visible);reduced.addEventListener?.('change',wake);setOrbitEnabled(false,false);
  return {setCover,setView,setOrbitEnabled,setPitch,setLighting,
    getCamera(){return {view:view===TOP?'overhead':'studio',preset,yaw,tilt,target:target.slice()}},
    setCamera(snapshot){
      if(!snapshot||!Number.isFinite(snapshot.yaw)||!Number.isFinite(snapshot.tilt)||
          !Array.isArray(snapshot.target)||snapshot.target.length!==3||!snapshot.target.every(Number.isFinite))return;
      view=snapshot.view==='overhead'?TOP:STUDIO;
      preset=snapshot.preset==='custom'?'custom':view===TOP?'overhead':'studio';
      yaw=snapshot.yaw;tilt=snapshot.tilt;target=snapshot.target.slice();refreshCamera();
    },
    getSpinAngle(){return angle},
    setSpinAngle(value){
      if(!Number.isFinite(value))return;
      angle=((value%TAU)+TAU)%TAU;
      if(!suspended&&!document.hidden)wake();
    },
    setSuspended(v){suspended=!!v;if(suspended){clearTimeout(timer);cancelAnimationFrame(raf);raf=timer=started=0}else wake()},
    setPitchEnabled(v){pitchEnabled=!!v;wake()},
    setRpm(v){if(Number.isFinite(+v)&&v>0){rpm=+v;wake()}},
    setPlaying(v){playing=!!v;wake()},setCue(v){cue=saturate(+v||0);wake()},
    setProgress(v){const p=saturate(+v||0);if(p!==progress){progress=p;if(playing)wake()}},
    setNeedleDropEnabled(v){drag=null;needle.setEnabled(v)},
    resetView(){setOrbitEnabled(false);setView('studio')},
    destroy(){ended=true;coverRequest++;clearTimeout(timer);cancelAnimationFrame(raf);observer.disconnect();
      for(const [k,f] of events)cv.removeEventListener(k,f);document.removeEventListener('visibilitychange',visible);
      reduced.removeEventListener?.('change',wake);cv.remove();}
  };
}
