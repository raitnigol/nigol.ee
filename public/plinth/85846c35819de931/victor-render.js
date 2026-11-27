import {createNeedleInput,makeNeedleOccluder,pickGroove} from './needle-drop.js';
import {STUDIO,RECORD,makeRig,planeAt} from './victor-camera.js';
import {roomLightClass,neonLight} from './victor-lighting.js';
/* The mesh and its surface normals are authored in Blender's Z-up coordinate system.
   All passes share the same model transform, including the matching circular paper mesh. */
const TAU = Math.PI * 2;
const spindle = [0, -.30, 2.14];
const labelType=8;
const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
const dot = (a,b) => a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const normalize = a => { const n=Math.hypot(...a)||1;return a.map(v=>v/n) };
const cross = (a,b) => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const lightDirection=normalize([-5.5,-5.3,10.4]);
const afterhoursDirection=normalize([-4,-4,6.8]);

function camera(target, direction, span, aspect) {
  const forward=normalize(direction);
  const right=normalize(cross([0,0,1],forward)),up=cross(forward,right);
  const h=span/2,w=h*aspect;
  // Symmetric clipping volume in front of and behind target; stable regardless of azimuth.
  const z=1/20;
  const matrix=new Float32Array([right[0]/w,up[0]/h,-forward[0]*z,0,
    right[1]/w,up[1]/h,-forward[1]*z,0,right[2]/w,up[2]/h,-forward[2]*z,0,
    -dot(target,right)/w,-dot(target,up)/h,dot(target,forward)*z,1]);
  return {matrix,forward,right,up,h,w,target};
}

const transform=`
uniform float uScale;
uniform int uGroup;
uniform float uRotor;
uniform vec2 uArm;
vec3 swivel(vec3 p, vec3 center, float a) {
  vec3 q=p-center;float c=cos(a),s=sin(a);
  return center+vec3(c*q.x-s*q.y,s*q.x+c*q.y,q.z);
}
vec3 modelPosition(vec3 p) {
  if(uGroup==1)return swivel(p,vec3(0.,-.30,2.14),uRotor);
  if(uGroup==2)return swivel(p,vec3(1.74,1.35,2.24),uArm.x)+vec3(0.,0.,uArm.y);
  return p;
}
`;
const meshVertex=`#version 300 es
precision highp float;
layout(location=0) in vec3 aPosition;
layout(location=1) in vec3 aNormal;
layout(location=2) in float aAo;
layout(location=3) in vec2 aUV;
uniform mat4 uCamera;
uniform mat4 uLight;
${transform}
out vec3 wpos;
out vec3 mpos;
out vec3 normal;
out vec3 shadowPos;
out float ao;
out vec2 surfaceUV;
void main(){
  mpos=aPosition/uScale;
  wpos=modelPosition(mpos);
  normal=uGroup==1?swivel(aNormal,vec3(0),uRotor):(uGroup==2?swivel(aNormal,vec3(0),uArm.x):aNormal);
  shadowPos=(uLight*vec4(wpos,1)).xyz*.5+.5;
  ao=aAo;surfaceUV=aUV;
  gl_Position=uCamera*vec4(wpos,1);
}`;
const depthVertex=`#version 300 es
precision highp float;
layout(location=0) in vec3 aPosition;
uniform mat4 uCamera;
${transform}
void main(){ gl_Position=uCamera*vec4(modelPosition(aPosition/uScale),1.); }`;
const depthFragment=`#version 300 es
precision highp float;
void main(){}`;

const meshFragment=`#version 300 es
precision highp float;
precision highp sampler2D;
in vec3 wpos;
in vec3 mpos;
in vec3 normal;
in vec3 shadowPos;
in float ao;
in vec2 surfaceUV;
uniform vec3 uEye;
uniform vec3 uColor;
uniform vec3 uCameraPosition;
uniform int uPerspective;
uniform int uCafe;
uniform int uRoomClass;
uniform bool uAfterhours;
uniform int uBaseTexture;
uniform vec3 uEmission;
uniform sampler2D uPaint;
uniform vec3 uSun;
uniform float uMetal;
uniform float uRough;
uniform int uType;
uniform int uArt;
uniform sampler2D uPaper;
uniform sampler2D uShadow;
uniform float uTexel;
uniform float uLabelRadius;
out vec4 outColor;
const float PI=3.14159265;
float hash(vec3 p){
  p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);
}
float noise3(vec3 p) {
  vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
}
vec3 displayColor(vec3 c){
  c=max(vec3(0),c);
  // A filmic shoulder holds detail in polished brass while dark lacquer remains saturated.
  c=clamp((c*(2.51*c+.03))/(c*(2.43*c+.59)+.14),0.,1.);
  return pow(c,vec3(1./2.2));
}
float shadow(vec3 n,float spread){
  if(any(lessThan(shadowPos,vec3(.001)))||any(greaterThan(shadowPos,vec3(.999))))return 1.;
  float bias=.00025+.00085*(1.-max(0.,dot(n,uSun)));
  float receiver=shadowPos.z-bias;
  float sum=0.;
  for(int i=0;i<16;i++){
    float f=float(i)+.5;
    float theta=f*2.39996323;
    vec2 q=vec2(cos(theta),sin(theta))*sqrt(f/16.)*uTexel*spread;
    sum+=step(receiver,texture(uShadow,shadowPos.xy+q).r);
  }
  return sum/16.;
}
float softPanel(vec3 r,vec3 front,vec3 top,vec2 aperture,float rough) {
  vec3 f=normalize(front);float d=dot(r,f);
  if(d<.03)return 0.;
  vec3 t=normalize(cross(top,f));vec3 b=cross(f,t);
  vec2 uv=abs(vec2(dot(r,t),dot(r,b)))/d-aperture;
  float edge=max(uv.x,uv.y), softness=.03+rough*rough*2.4;
  return (1.-smoothstep(-softness,softness,edge))*smoothstep(.03,.20,d);
}
vec3 room(vec3 r,float rough){
  // Cool window reflections and warm pools cast by the café pendants.
  float sky=smoothstep(-.35,.9,r.z);
  if(uAfterhours){
    vec3 reflection=mix(vec3(.066,.027,.014),vec3(.063,.085,.139),sky);
    reflection+=vec3(.27,.40,.68)*softPanel(r,vec3(-.78,-.57,.95),vec3(0,0,1),vec2(.62,.72),rough);
    reflection+=vec3(1.95,1.05,.49)*softPanel(r,vec3(.85,.63,.58),vec3(0,0,1),vec2(.19,.60),rough);
    reflection+=vec3(1.55,.69,.29)*softPanel(r,vec3(-.52,.90,.35),vec3(0,0,1),vec2(.34,.27),rough);
    vec3 counterLamp=normalize(vec3(-4.,-4.,8.8)-wpos);
    reflection+=vec3(2.10,1.48,.93)*softPanel(r,counterLamp,vec3(0,0,1),vec2(.39,.36),rough);
    return reflection;
  }
  vec3 e=mix(vec3(.135,.075,.035),vec3(.205,.235,.265),sky);
  e+=vec3(.72,.84,1.)*1.67*softPanel(r,vec3(-.78,-.57,.95),vec3(0,0,1),vec2(.69,.77),rough);
  e+=vec3(1.,.68,.34)*1.92*softPanel(r,vec3(.85,.63,.58),vec3(0,0,1),vec2(.23,.88),rough);
  e+=vec3(1.,.71,.42)*1.24*softPanel(r,vec3(-.52,.90,.35),vec3(0,0,1),vec2(.47,.35),rough);
  float flag=softPanel(r,vec3(.91,-.43,.17),vec3(0,0,1),vec2(.20,.40),rough)*.69;
  return e*(1.-flag);
}
float timber(vec3 p,vec3 n){
  // Channel cut and long vessels follow the board continuously across beveled mouldings.
  float side=smoothstep(.55,.85,abs(n.x));
  float length=mix(p.x,p.y,side),crossboard=mix(p.y,p.x,side);
  float crown=noise3(vec3(length*.39,crossboard*.8,p.z*.75));
  float grain=11.*p.z+4.1*crossboard+1.2*crown+.24*sin(length*1.25+p.z);
  float ring=pow(.5+.5*sin(grain*6.28+1.1*sin(grain*1.7)),4.);
  float vessel=noise3(vec3(length*1.6,crossboard*34.,p.z*51.));
  float med=noise3(vec3(length*.54,crossboard*7.,p.z*9.));
  float damp=1.-smoothstep(.15,.67,fwidth(grain));
  float flame=noise3(vec3(length*.64,crossboard*4.7,p.z*6.4)+vec3(0,crown*1.8,0));
  float grainRipple=.5+.5*sin(grain*11.3+.85*sin(length*2.3+grain*.56));
  return .61+.31*med+.25*(vessel-.5)-(.18*ring-.035)*damp+.12*crown+.17*flame+.055*grainRipple*damp;
}
void main(){
  vec3 n=normalize(normal);
  if(!gl_FrontFacing)n=-n;
  vec3 albedo=uColor;float rough=clamp(uRough,.045,.95);
  float metal=uMetal;
  if(uBaseTexture==1)albedo*=pow(max(texture(uPaint,surfaceUV).rgb,vec3(.001)),vec3(2.2));
  if(uType==1){albedo*=timber(mpos,n);rough=clamp(rough,.24,.56);}
  if(uType==2){ // Brass retains tooling, patina and broad mirror reflections.
    float stain=noise3(mpos*2.3)*.7+noise3(mpos*10.6)*.3;
    albedo*=.88+.21*stain;rough=clamp(rough+.045*(stain-.5),.10,.62);
  }
  if(uType==3)rough=clamp(rough,.105,.37);
  if(uType==4){
    vec2 q=mpos.xy-vec2(0,-.30);float rad=length(q);

    float phase=rad*118.;float filtered=1.-smoothstep(.23,.65,fwidth(phase));
    float cuts=.5+.5*cos(phase*2.*PI);
    float tracks=pow(.5+.5*cos(rad*2.*PI*4.05),22.);
    float theta=atan(q.y,q.x);
    float fan=pow(.5+.5*cos(2.*(theta-atan(uEye.y,uEye.x)+.6)),5.);
    albedo=(max(uColor,vec3(.0045))*(.83+.24*cuts*filtered+tracks*.3))+vec3(.021,.021,.019)*fan;
    rough=clamp(.22+.095*filtered*cuts+.035*tracks,.18,.38);
    if(abs(n.z)>.77){n=normalize(n+(vec3(q/rad,0))*.035*(cuts-.5)*filtered);}
    metal=.17;
    if(abs(n.z)>.80){
      // An engraved record is an anisotropic reflector; its mirror bands stay aligned
      // with the studio lights while small pressing variations follow the physical disc.
      vec2 worldQ=wpos.xy-vec2(0,-.30);
      float a=atan(worldQ.y,worldQ.x);
      float reflection=.5+.5*cos(2.*(a-.60-.32*atan(uEye.x,-uEye.y)));
      float band=pow(reflection,3.5),stripe=pow(reflection,20.);
      float grazing=1.-max(.0,dot(n,uEye));
      float l=.083+.153*band+.116*stripe*(.58+.62*grazing);
      l+=(cuts-.5)*.031*filtered+tracks*.023;
      float edge=1.-smoothstep(1.84,1.88,rad);
      l=mix(.078+.11*band,l,edge);
      vec3 shellac=l*vec3(1.029,1.017,.986);
      if(uAfterhours){
        float lampBand=pow(.5+.5*cos(2.*(a-.78-.29*atan(uEye.x,-uEye.y))),6.);
        shellac=shellac*vec3(.69,.75,.90)+lampBand*vec3(.074,.050,.023);
      }
      shellac*=mix(.57,1.,ao)*mix(.72,1.,shadow(n,2.5));
      outColor=vec4(shellac,1.);return;
    }
  }
  if(uType==8){
    vec2 uv=(mpos.xy-vec2(0,-.30))/(2.*uLabelRadius)+.5;
    if(uArt==1){albedo=pow(texture(uPaper,uv).rgb,vec3(2.2));}
    else {albedo=vec3(.54,.40,.19);}
    float r=length(uv-.5);
    float imprint=(1.-smoothstep(.002,.008,abs(r-.181)));
    albedo*=1.-imprint*.085;
    rough=.83;metal=0.;
  }
  vec3 v=uPerspective==1?normalize(uCameraPosition-wpos):uEye,r=reflect(-v,n);
  float nv=max(.001,dot(n,v)),nl=max(0.,dot(n,uSun));
  float shade=shadow(n,uCafe==1?6.0:2.6);
  vec3 diffuseLight=mix(vec3(.215,.163,.131),vec3(.52,.51,.51),clamp(n.z*.5+.5,0.,1.));
  diffuseLight+=vec3(1.15,.885,.648)*nl*shade;
  vec3 practical=vec3(0);
  for(int i=0;i<3;i++){
    vec3 lamp=i==0?vec3(-5.,5.,9.6):(i==1?vec3(8.,13.4,5.2):vec3(-4.,-4.,8.8));
    vec3 ray=lamp-wpos;
    float d2=max(.3,dot(ray,ray));
    float ndl=max(0.,dot(n,ray*inversesqrt(d2)));
    practical+=vec3(1.,.584,.273)*ndl*(i==2?10.:18.)/(1.2+d2);
  }
  diffuseLight+=practical;
  if(uCafe==1){
    // Close surfaces receive reflected light from the amber globes; the rest of
    // the room stays dusky enough for the instrument to remain the focal point.
    vec3 ambientRoom=mix(vec3(.19,.155,.132),vec3(.32,.292,.27),.5+.5*n.z);
    float window=max(0.,dot(n,normalize(vec3(-.79,.47,.40))));
    float pool=.29+1.8*exp(-.024*dot(wpos.xy-vec2(.4,1.),wpos.xy-vec2(.4,1.)));
    diffuseLight=ambientRoom+vec3(.33,.35,.38)*window+practical*1.7+vec3(.48,.36,.23)*pool*nl*shade;
    if(abs(wpos.z)<.06){
      vec2 edge=abs(wpos.xy-vec2(0,.03))-vec2(2.44,1.87);
      float dist=length(max(edge,vec2(0)))+min(max(edge.x,edge.y),0.);
      diffuseLight*=1.-.32*exp(-max(0.,dist)*2.7);
    }
  }
  if(uAfterhours){
    vec3 toLamp=vec3(-4.,-4.,8.8)-wpos;
    float lampDistance2=max(dot(toLamp,toLamp),.05);
    vec3 lampRay=toLamp*inversesqrt(lampDistance2);
    float beam=smoothstep(.66,.94,dot(lampRay,normalize(vec3(-4.,-4.,6.8))));
    float counterLight=beam*max(0.,dot(n,lampRay))*76./(6.+lampDistance2)*shade;
    float window=max(0.,dot(n,normalize(vec3(-.79,.47,.40))));
    vec3 ambientRoom=mix(vec3(.058,.044,.058),vec3(.127,.109,.118),.5+.5*n.z);
    diffuseLight=ambientRoom+vec3(.056,.094,.181)*window+practical*2.05+vec3(1.13,.84,.58)*counterLight;
    if(uCafe==1){
      if(uRoomClass==1)diffuseLight=vec3(.068,.108,.208)*(.70+.30*window);
      else if(uRoomClass==2)diffuseLight=vec3(.21,.21,.26);
      else{
        // Warm local bounce from the apartment floor lamp.
        const vec3 center=vec3(${neonLight.x},${neonLight.y},${neonLight.z});
        vec3 sign=center+vec3(clamp(wpos.x-center.x,-${neonLight.halfLength},${neonLight.halfLength}),0.,0.);
        vec3 toSign=sign-wpos;
        float distance2=max(dot(toSign,toSign),.03);
        float facing=.16+.84*max(0.,dot(n,toSign*inversesqrt(distance2)));
        diffuseLight+=vec3(.42,.28,.12)*exp(-.65*distance2)*facing;
        if(abs(wpos.z)<.06){
          vec2 edge=abs(wpos.xy-vec2(0,.03))-vec2(2.44,1.87);
          float d=length(max(edge,vec2(0)))+min(max(edge.x,edge.y),0.);
          diffuseLight*=1.-.30*exp(-max(0.,d)*2.7);
        }
      }
    }
  }
  float ambient=mix(.25,1.,pow(ao,.96));
  vec3 f0=mix(vec3(.038),albedo,metal);
  vec3 fres=f0+(max(vec3(1.-rough*.65),f0)-f0)*pow(1.-nv,5.);
  vec3 diffuse=albedo*(1.-metal)*(vec3(1)-fres)*diffuseLight*ambient;
  vec3 env=room(r,rough)*fres*mix(.965,.63,rough)*mix(.29,1.,ao);
  // The highlight is broad enough to retain its shape on the scrolled lip and bright screws.
  vec3 halfway=normalize(uSun+v);
  float nh=max(0.,dot(n,halfway));
  float exponent=mix(175.,8.,rough);
  vec3 direct=f0*vec3(1.16,1.08,.9)*pow(nh,exponent)*nl*shade*(1.-rough)*1.2;
  vec3 emission=uEmission*(uBaseTexture==1?pow(texture(uPaint,surfaceUV).rgb,vec3(2.2)):vec3(1));
  if(uRoomClass==4&&!uAfterhours)emission*=.041;
  if(uRoomClass==6&&!uAfterhours)emission*=.16;
  if(uAfterhours){
    direct*=vec3(.97,.73,.56);
    if(uRoomClass==1){emission*=vec3(.080,.135,.25);env*=.31;direct*=.10;}
    if(uRoomClass==2)emission*=vec3(.92,.75,.68);
    if(uRoomClass==3)emission*=vec3(1.08,.97,.84);
    if(uRoomClass==5)emission*=vec3(.22,.32,.56);
  }
  vec3 radiance=diffuse+env+direct+emission;
  if(uCafe==1&&dot(uEmission,vec3(1))<.01)radiance*=mix(.97,.71,smoothstep(8.,25.,distance(wpos,uCameraPosition)));
  outColor=vec4(displayColor(radiance),1);
}`;

function linkedProgram(gl,vertex,fragment) {
  const shaders=[gl.VERTEX_SHADER,gl.FRAGMENT_SHADER].map((type,i)=>{
    const shader=gl.createShader(type);gl.shaderSource(shader,i?fragment:vertex);gl.compileShader(shader);
    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){const error=new Error(gl.getShaderInfoLog(shader)||'3D shader unavailable');gl.deleteShader(shader);throw error}
    return shader;
  });
  const program=gl.createProgram();for(const shader of shaders)gl.attachShader(program,shader);
  gl.linkProgram(program);for(const shader of shaders)gl.deleteShader(shader);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program)||'3D lighting unavailable');
  const uniforms={};
  for(let i=0;i<gl.getProgramParameter(program,gl.ACTIVE_UNIFORMS);i++){
    const {name}=gl.getActiveUniform(program,i);uniforms[name]=gl.getUniformLocation(program,name);
  }
  return {program,uniforms};
}
function family(name) {
  const n=name.toLowerCase();
  if(n.includes('walnut')||n.includes('mahogany')||n.includes('oak'))return 1;
  if(n.includes('brass')||n.includes('bronze')||n.includes('gold'))return 2;
  if(n.includes('nickel')||n.includes('silver')||n.includes('steel'))return 3;
  return /vinyl|shellac/.test(n)?4:0;
}

function textureCanvas(){
  const c=document.createElement('canvas');c.width=c.height=512;
  return c;
}
function blankPaper(c) {
  const g=c.getContext('2d'),w=c.width;
  g.fillStyle='#57252a';g.fillRect(0,0,w,w);
  const grad=g.createRadialGradient(w*.45,w*.40,0,w*.5,w*.5,w*.6);
  grad.addColorStop(0,'#673139');grad.addColorStop(1,'#482026');g.fillStyle=grad;g.fillRect(0,0,w,w);
  for(const [r,c,l] of [[.466,'#ceb88b',.003],[.453,'#ac8b5d',.002],[.180,'#79513e',.003]]){
    g.beginPath();g.arc(w/2,w/2,w*r,0,TAU);g.lineWidth=w*l;g.strokeStyle=c;g.stroke();
  }
  g.fillStyle='#ebd6ab';g.font='italic 62px Georgia,serif';g.textAlign='center';g.fillText('$.pohhu¥',w*.5,w*.375);
}
function drawImageSquare(image,c){
  const w=image.naturalWidth,h=image.naturalHeight,size=Math.min(w,h);
  if(!size)throw new Error('Empty record label');
  const ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);
  ctx.drawImage(image,(w-size)/2,(h-size)/2,size,size,0,0,c.width,c.height);
}

function paperMesh(gl) {
  const pts=[0,-.30,2.14],indices=[];
  for(let i=0;i<160;i++){const a=i/160*TAU;pts.push(.64*Math.cos(a),-.30+.64*Math.sin(a),2.14);indices.push(0,1+i,1+((i+1)%160));}
  const vao=gl.createVertexArray();gl.bindVertexArray(vao);
  const vb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(pts),gl.STATIC_DRAW);
  gl.vertexAttribPointer(0,3,gl.FLOAT,false,12,0);gl.enableVertexAttribArray(0);
  const eb=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,eb);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW);
  gl.bindVertexArray(null);
  return {vao,vb,eb,count:indices.length};
}
function modelBuffers(gl,meta,bytes){
  const vlen=meta.vertices*12,ilen=meta.indices*4;
  const endAo=vlen+ilen+(meta.ao?meta.vertices:0),uvOffset=Math.ceil(endAo/4)*4;
  const expected=meta.uv?uvOffset+meta.vertices*8:endAo;
  if(!Number.isSafeInteger(expected)||bytes.byteLength!==expected)throw new Error('Invalid scene mesh');
  const vb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,bytes,gl.STATIC_DRAW);
  const eb=gl.createBuffer(),vao=gl.createVertexArray();gl.bindVertexArray(vao);
  gl.vertexAttribPointer(0,3,gl.SHORT,false,12,0);gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(1,3,gl.SHORT,true,12,6);gl.enableVertexAttribArray(1);
  if(meta.ao){gl.vertexAttribPointer(2,1,gl.UNSIGNED_BYTE,true,1,vlen+ilen);gl.enableVertexAttribArray(2);}
  if(meta.uv){gl.vertexAttribPointer(3,2,gl.FLOAT,false,8,uvOffset);gl.enableVertexAttribArray(3);}
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,eb);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint8Array(bytes,vlen,ilen),gl.STATIC_DRAW);
  gl.bindVertexArray(null);
  return {vao,vb,eb};
}

async function loadGeometry(gl,stem){
  const [meta,bytes]=await Promise.all(['json','bin'].map(async ext=>{
    const r=await fetch(new URL(stem+'.'+ext,import.meta.url));if(!r.ok)throw Error('The listening room could not be loaded.');
    return ext==='bin'?r.arrayBuffer():r.json();
  }));
  return {buffers:modelBuffers(gl,meta,bytes),meta,blocksNeedle:makeNeedleOccluder(meta,bytes)};
}
async function loadRoomTextures(gl,materials) {
  const textures=new Map();
  await Promise.all([...new Set(materials.map(m=>m.texture).filter(Boolean))].map(async src=>{
    const image=new Image();image.src=new URL(src,import.meta.url).href;await image.decode();
    const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.generateMipmap(gl.TEXTURE_2D);
    const ext=gl.getExtension('EXT_texture_filter_anisotropic');
    if(ext)gl.texParameterf(gl.TEXTURE_2D,ext.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(8,gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
    textures.set(src,tex);
  }));
  return textures;
}
export async function createLiveDeck(container,callbacks={}){
  const cv=document.createElement('canvas');
  const gl=cv.getContext('webgl2',{alpha:true,antialias:true,depth:true,stencil:false,premultipliedAlpha:false,powerPreference:'default'});
  if(!gl)throw new Error('WebGL 2 unavailable');
  let main,depthProgram,instrument,cafe,roomTextures,label,shadowFbo,shadowTex,paper;
  try {
    [instrument,cafe]=await Promise.all([loadGeometry(gl,'victor-model'),loadGeometry(gl,'cafe-model')]);
    for(const m of cafe.meta.materials)m.lightClass=roomLightClass(m.name);
    roomTextures=await loadRoomTextures(gl,cafe.meta.materials);
    main=linkedProgram(gl,meshVertex,meshFragment);depthProgram=linkedProgram(gl,depthVertex,depthFragment);
    label=paperMesh(gl);
    shadowTex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,shadowTex);
    const shadowSize=Math.min(2048,gl.getParameter(gl.MAX_TEXTURE_SIZE));
    gl.texStorage2D(gl.TEXTURE_2D,1,gl.DEPTH_COMPONENT24,shadowSize,shadowSize);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    shadowFbo=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,shadowFbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,shadowTex,0);
    gl.drawBuffers([gl.NONE]);gl.readBuffer(gl.NONE);
    if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw new Error('Shadow buffer unavailable');
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);
    paper=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,paper);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    const aniso=gl.getExtension('EXT_texture_filter_anisotropic');
    if(aniso){gl.texParameterf(gl.TEXTURE_2D,aniso.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(8,gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));}
    let finish=null;
    try{const finishing=await import('./scene-finish.js');finish=finishing.createSceneFinish(gl)}catch{/* Direct rendering remains available on limited hardware. */}
    return activate({gl,cv,container,callbacks,instrument,cafe,roomTextures,label,main,depthProgram,shadowSize,shadowFbo,shadowTex,paper,finish});
  }catch(error){
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    throw error;
  }
}

function activate({gl,cv,container,callbacks,instrument,cafe,roomTextures,label,main,depthProgram,shadowSize,shadowFbo,shadowTex,paper,finish}){
  let base=STUDIO,yaw=base.yaw,tilt=base.tilt,target=base.target.slice(),rig;
  let preset='studio',orbit=false,playing=false,cue=0,progress=0,rpm=100/3,pitch=0,pitchEnabled=true;
  let frameNotice=true,suspended=false,holdPhase=false,coverUrl;
  let angle=0,armAngle=.23,armLift=.055,speed=0,freshShadow=true;
  let raf=0,last=0,disposed=false,coverSeq=0,drag=null;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  let afterhours=false,sun=lightDirection,shadowCamera=camera([0,0,2.0],sun,11.5,1);
  function setLighting(mode){
    const next=mode==='afterhours';
    if(next===afterhours)return;
    afterhours=next;sun=afterhours?afterhoursDirection:lightDirection;
    shadowCamera=camera([0,0,2],sun,11.5,1);freshShadow=true;wake();
  }
  const paint=textureCanvas();
  function upload(){
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,paper);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,paint);
    gl.generateMipmap(gl.TEXTURE_2D);wake();
  }
  function useBlank(){blankPaper(paint);upload()}
  function setCover(url){
    if(url===coverUrl)return;
    coverUrl=url;const seq=++coverSeq;
    // Clear the preceding release immediately, including when a late image request fails.
    useBlank();
    if(!url)return;
    const image=new Image();
    if(/^https?:/i.test(url))image.crossOrigin='anonymous';
    image.onload=()=>{
      if(disposed||seq!==coverSeq)return;
      try{drawImageSquare(image,paint);upload()}catch{paint.width=paint.width;useBlank()}
    };
    image.src=url;
  }
  function refreshCamera(){rig=makeRig(base,yaw,tilt,target,cv.width,cv.height)}
  function view(next,notify=true){
    base=next==='overhead'?RECORD:STUDIO;preset=next==='overhead'?'overhead':'studio';
    target=base.target.slice();yaw=base.yaw;tilt=base.tilt;
    refreshCamera();wake();if(notify)callbacks.onViewChange?.(preset);
  }
  function resize(){
    const width=container.clientWidth,height=container.clientHeight;
    if(!width||!height)return;
    const dpr=Math.min(window.devicePixelRatio||1,1.7,2300/width);
    cv.width=Math.max(1,Math.round(width*dpr));cv.height=Math.max(1,Math.round(height*dpr));
    refreshCamera();wake();
  }
  function transforms(program,cam){
    const u=program.uniforms;
    gl.useProgram(program.program);
    gl.uniformMatrix4fv(u.uCamera,false,cam.matrix);
    gl.uniform1f(u.uRotor,-angle);gl.uniform2f(u.uArm,armAngle,armLift);
  }
  function drawModel(program,shading,scene,isCafe){
    const {meta,buffers:model}=scene,u=program.uniforms;
    if(shading)gl.uniform1i(u.uCafe,isCafe?1:0);
    gl.bindVertexArray(model.vao);
    gl.uniform1f(u.uScale,meta.scale);
    let previousGroup=-1,previousMaterial=-1;
    for(const draw of meta.draws){
      // The source's hairline rings are subpixel at this scale. Use the filtered
      // radial bands in the shellac shader rather than overlapping coplanar faces.
      if(meta.materials[draw.material].name.toLowerCase().includes('blank groove bands'))continue;
      if(draw.group!==previousGroup){gl.uniform1i(u.uGroup,draw.group);previousGroup=draw.group;}
      if(shading&&draw.material!==previousMaterial){
        const m=meta.materials[draw.material];
        gl.uniform1i(u.uType,isCafe?0:family(m.name));gl.uniform3fv(u.uColor,m.color);
        gl.uniform1i(u.uRoomClass,m.lightClass||0);
        gl.uniform3fv(u.uEmission,m.emission||[0,0,0]);
        const texture=isCafe&&m.texture&&roomTextures.get(m.texture);
        gl.uniform1i(u.uBaseTexture,texture?1:0);
        if(texture){gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,texture);}
        gl.uniform1f(u.uMetal,m.metallic);gl.uniform1f(u.uRough,m.roughness);
        previousMaterial=draw.material;
      }
      gl.drawElements(gl.TRIANGLES,draw.count,gl.UNSIGNED_INT,draw.start*4);
    }
  }
  function drawSimple(mesh,type,group){
    const u=main.uniforms;
    gl.bindVertexArray(mesh.vao);gl.vertexAttrib3f(1,0,0,1);gl.vertexAttrib1f(2,1);
    gl.uniform1i(u.uCafe,0);gl.uniform1i(u.uBaseTexture,0);gl.uniform3f(u.uEmission,0,0,0);
    gl.uniform1i(u.uRoomClass,0);
    gl.uniform1f(u.uScale,1);gl.uniform1i(u.uGroup,group);gl.uniform1i(u.uType,type);
    gl.drawElements(gl.TRIANGLES,mesh.count,gl.UNSIGNED_SHORT,0);
  }
  function render(){
    if(freshShadow){
      gl.bindFramebuffer(gl.FRAMEBUFFER,shadowFbo);gl.viewport(0,0,shadowSize,shadowSize);
      gl.clear(gl.DEPTH_BUFFER_BIT);gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(1.1,1.8);
      transforms(depthProgram,shadowCamera);drawModel(depthProgram,false,instrument,false);
      gl.disable(gl.POLYGON_OFFSET_FILL);freshShadow=false;
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);
    const finishActive=finish?.begin(cv.width,cv.height);
    gl.viewport(0,0,cv.width,cv.height);
    gl.clearColor(.119,.097,.085,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    transforms(main,rig);
    const u=main.uniforms;
    gl.uniformMatrix4fv(u.uLight,false,shadowCamera.matrix);
    gl.uniform1i(u.uPerspective,base.perspective?1:0);gl.uniform3fv(u.uCameraPosition,rig.eye);
    gl.uniform1i(u.uPaint,2);gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,paper);
    gl.uniform3fv(u.uEye,rig.forward);gl.uniform3fv(u.uSun,sun);gl.uniform1i(u.uAfterhours,afterhours?1:0);
    gl.uniform1f(u.uTexel,1/shadowSize);gl.uniform1f(u.uLabelRadius,.64);
    gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,shadowTex);gl.uniform1i(u.uShadow,1);
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,paper);gl.uniform1i(u.uPaper,0);gl.uniform1i(u.uArt,1);
    drawModel(main,true,cafe,true);drawModel(main,true,instrument,false);
    drawSimple(label,labelType,1);gl.bindVertexArray(null);
    if(finishActive)finish.end({near:rig.near,far:rig.far,focusDistance:rig.distance,focusRadius:3.2,perspective:rig.perspective});
  }
  function frame(now){
    raf=0;if(disposed||suspended||document.hidden||!rig)return;
    const dt=last?Math.min(.075,(now-last)/1000):1/60;last=now;
    const targetSpeed=playing&&!reduce.matches?rpm*(1+(pitchEnabled?pitch:0)/100)*TAU/60:0;
    speed+=(targetSpeed-speed)*(reduce.matches?1:1-Math.exp(-dt*(playing?4:6)));
    if(!holdPhase)angle=(angle+speed*dt)%TAU;
    holdPhase=false;
    const targetArm=playing?-.445*progress:.23;
    const targetLift=playing?.055*cue:.055;
    const interp=reduce.matches?1:1-Math.exp(-dt*5.3);
    const delta=(targetArm-armAngle)*interp,deltaLift=(targetLift-armLift)*interp;
    armAngle+=delta;armLift+=deltaLift;
    if(Math.abs(delta)>.0005||Math.abs(deltaLift)>.0009)freshShadow=true;
    render();
    if(frameNotice){frameNotice=false;callbacks.onFrame?.(preset)}
    if(Math.abs(speed)>.0008||Math.abs(targetArm-armAngle)>.0005||Math.abs(targetLift-armLift)>.0005)wake();else last=0;
  }
  function wake(){if(!raf&&!disposed&&!suspended&&!document.hidden)raf=requestAnimationFrame(frame)}
  function onVisibility(){if(!document.hidden){last=0;wake()}}
  const needle=createNeedleInput(cv,callbacks,event=>pickGroove(rig,cv,event,(from,to)=>
    instrument.blocksNeedle(from,to,armAngle,armLift)||cafe.blocksNeedle(from,to)),()=>orbit);
  function setOrbitEnabled(value,notify=true){
    orbit=Boolean(value);drag=null;cv.style.cursor=needle.cursor();
    cv.style.touchAction=orbit?'none':'pan-y';
    if(notify)callbacks.onOrbitChange?.(orbit);
  }
  function setPitch(value,notify=false){
    if(!Number.isFinite(Number(value)))return;
    pitch=clamp(Math.round(Number(value)*10)/10,-8,8);
    wake();if(notify)callbacks.onPitch?.(pitch);
  }
  function onPlane(e,z){
    const b=cv.getBoundingClientRect();
    return planeAt(rig,2*(e.clientX-b.left)/b.width-1,1-2*(e.clientY-b.top)/b.height,z);
  }
  function near(pos,x,y,radius){return pos&&Math.hypot(pos[0]-x,pos[1]-y)<=radius}
  function pointerDown(e){
    if(!e.isPrimary||e.button!==0)return;
    const p=onPlane(e,2.04);
    const control=!needle.enabled&&near(p,2.40,-1.37,.29);
    drag={id:e.pointerId,startX:e.clientX,startY:e.clientY,x:e.clientX,y:e.clientY,moved:false,control,initialPitch:pitch};
    cv.setPointerCapture?.(e.pointerId);if(orbit)cv.style.cursor='grabbing';
  }
  function pointerMove(e){
    if(!drag){needle.hover(e);return}
    if(e.pointerId!==drag.id)return;
    if(!drag.moved&&Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)<5)return;
    if(!drag.moved)needle.leave();drag.moved=true;
    if(drag.control&&pitchEnabled){
      setPitch(drag.initialPitch+(drag.startY-e.clientY)*.1,true);
    }else if(orbit){
      yaw-=(e.clientX-drag.x)*.009;tilt=clamp(tilt+(e.clientY-drag.y)*.008,.14,Math.PI*.5-.004);
      if(preset!=='custom'){preset='custom';callbacks.onViewChange?.('custom')}
      refreshCamera();wake();
    }
    drag.x=e.clientX;drag.y=e.clientY;
  }
  function pointerUp(e){
    if(!drag||drag.id!==e.pointerId)return;
    const tapped=!drag.moved&&e.type==='pointerup',control=drag.control;drag=null;
    if(cv.hasPointerCapture?.(e.pointerId))cv.releasePointerCapture(e.pointerId);
    cv.style.cursor=needle.cursor();
    if(!tapped||needle.tap(e))return;
    if(control){callbacks.onRpm?.(rpm<40?45:100/3);return}
    const p=onPlane(e,spindle[2]),b=onPlane(e,2.06);
    if(near(p,spindle[0],spindle[1],1.9)||near(b,-2.42,-.28,.31))callbacks.onToggle?.();
  }
  function key(e){
    if(e.key===' '||e.key==='Enter'){e.preventDefault();if(!needle.enabled)callbacks.onToggle?.();return}
    if(e.key==='Home'){e.preventDefault();setOrbitEnabled(false);view('studio');return}
    if(!orbit||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;
    e.preventDefault();if(e.key==='ArrowLeft')yaw-=.10;if(e.key==='ArrowRight')yaw+=.10;
    if(e.key==='ArrowUp')tilt=clamp(tilt+.075,.14,1.566);if(e.key==='ArrowDown')tilt=clamp(tilt-.075,.14,1.566);
    preset='custom';callbacks.onViewChange?.('custom');refreshCamera();wake();
  }
  function lost(e){e.preventDefault();if(!disposed)callbacks.onRendererLost?.()}
  const events=[['pointerdown',pointerDown],['pointermove',pointerMove],['pointerup',pointerUp],['pointercancel',pointerUp],['pointerleave',needle.leave],['keydown',key],['webglcontextlost',lost]];
  for(const [type,fn] of events)cv.addEventListener(type,fn);
  cv.tabIndex=0;cv.setAttribute('role','img');cv.setAttribute('aria-label','Three-dimensional acoustic gramophone. Press space to play or pause. Unlock the view to orbit with drag or arrow keys.');
  cv.style.cssText='display:block;width:100%;height:100%;touch-action:pan-y;outline-offset:-3px;user-select:none';
  gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.clearDepth(1);gl.disable(gl.CULL_FACE);gl.disable(gl.BLEND);
  container.append(cv);resize();useBlank();
  const ro=new ResizeObserver(resize);ro.observe(container);
  document.addEventListener('visibilitychange',onVisibility);reduce.addEventListener?.('change',wake);
  return {
    getCamera(){return {view:base===RECORD?'overhead':'studio',preset,yaw,tilt,target:target.slice()}},
    setCamera(state){base=state.view==='overhead'?RECORD:STUDIO;preset=state.preset;yaw=state.yaw;tilt=state.tilt;target=state.target.slice();refreshCamera();wake()},
    getSpinAngle(){return angle},
    setSpinAngle(value){
      if(!Number.isFinite(value))return;
      angle=value%TAU;holdPhase=true;frameNotice=true;
      if(playing&&!reduce.matches)speed=rpm*(1+(pitchEnabled?pitch:0)/100)*TAU/60;
      wake();
    },
    setSuspended(value){
      suspended=!!value;
      if(suspended){cancelAnimationFrame(raf);raf=last=0}
      else{frameNotice=true;wake()}
    },
    setCover,setLighting, setPlaying(v){playing=!!v;wake()},
    setRpm(n){if(Number.isFinite(Number(n))&&n>0){rpm=Number(n);wake()}},
    setCue(n){cue=clamp(Number(n)||0,0,1);wake()},
    setPitch,setPitchEnabled(v){pitchEnabled=!!v;wake()},
    setProgress(n){const next=clamp(Number(n)||0,0,1);if(next!==progress){progress=next;if(playing)wake()}},
    setNeedleDropEnabled(v){drag=null;needle.setEnabled(v)},
    setView:view,resetView(){setOrbitEnabled(false);view('studio')},setOrbitEnabled,
    destroy(){
      if(disposed)return;
      disposed=true;coverSeq++;cancelAnimationFrame(raf);ro.disconnect();
      document.removeEventListener('visibilitychange',onVisibility);reduce.removeEventListener?.('change',wake);
      for(const [t,fn] of events)cv.removeEventListener(t,fn);
      for(const mesh of [instrument.buffers,cafe.buffers,label]){gl.deleteVertexArray(mesh.vao);gl.deleteBuffer(mesh.vb);gl.deleteBuffer(mesh.eb)}
      for(const tex of roomTextures.values())gl.deleteTexture(tex);
      gl.deleteFramebuffer(shadowFbo);gl.deleteTexture(shadowTex);gl.deleteTexture(paper);
      finish?.destroy();gl.deleteProgram(main.program);gl.deleteProgram(depthProgram.program);cv.remove();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
  };
}
