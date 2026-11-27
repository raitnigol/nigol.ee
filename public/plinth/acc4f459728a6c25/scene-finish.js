/** The two rasterizers use the same focal range and the same image-space lens radius. */
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const lensRadius = height => 2.45 * clamp(height / 680, .66, 1.65);

const vertex = `#version 300 es
out vec2 uv;
void main(){
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  uv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const fragment = `#version 300 es
precision highp float;
uniform sampler2D uColor;
uniform highp sampler2D uDepth;
uniform vec2 uTexel;
uniform vec2 uClip;
uniform float uFocusEnd;
uniform float uMaxRadius;
uniform bool uStudio;
uniform bool uNeedAA;
in vec2 uv;
out vec4 outColor;

const vec2 taps[12] = vec2[12](
  vec2(.42,.12), vec2(-.12,.42), vec2(-.42,-.12), vec2(.12,-.42),
  vec2(.91,.18), vec2(.51,.77), vec2(-.18,.91), vec2(-.77,.51),
  vec2(-.91,-.18), vec2(-.51,-.77), vec2(.18,-.91), vec2(.77,-.51)
);
float axial(vec2 at){
  float z = texture(uDepth, at).r;
  return uClip.x * uClip.y / max(uClip.y - z * (uClip.y-uClip.x), .00001);
}
float luminance(vec3 v){return dot(v, vec3(.25,.62,.13));}
vec3 smoothEdge(vec3 center){
  // Directional FXAA is used only when hardware multisampling is unavailable.
  vec3 nw=texture(uColor,uv+vec2(-1,-1)*uTexel).rgb;
  vec3 ne=texture(uColor,uv+vec2(1,-1)*uTexel).rgb;
  vec3 sw=texture(uColor,uv+vec2(-1,1)*uTexel).rgb;
  vec3 se=texture(uColor,uv+uTexel).rgb;
  float a=luminance(nw),b=luminance(ne),c=luminance(sw),d=luminance(se),m=luminance(center);
  float lo=min(m,min(min(a,b),min(c,d))), hi=max(m,max(max(a,b),max(c,d)));
  if(hi-lo < max(.045,hi*.14)) return center;
  vec2 dir=vec2(c+d-a-b,a+c-b-d);
  float reduce=max((a+b+c+d)*.03125,.008);
  dir=clamp(dir/(min(abs(dir.x),abs(dir.y))+reduce),vec2(-3),vec2(3))*uTexel;
  vec3 pair=.5*(texture(uColor,uv-dir*.20).rgb+texture(uColor,uv+dir*.20).rgb);
  return mix(center,pair,.64);
}
void main(){
  vec4 pixel=texture(uColor,uv);
  vec3 color=pixel.rgb;
  float z=uStudio?axial(uv):0.0;
  float aperture=uStudio?smoothstep(0.0,1.0,clamp((1.0-uFocusEnd/max(z,.001))*3.8,0.0,1.0)):0.0;
  float radius=uMaxRadius*aperture;
  if(radius>.19){
    vec3 sum=color*1.70;
    float weight=1.70;
    float glow=0.0;
    for(int i=0;i<12;i++){
      vec2 sampleUV=uv+taps[i]*radius*uTexel;
      float other=axial(sampleUV);
      // Keep the sharp brass rim from bleeding into a table or window behind it.
      float accept=smoothstep(-.23,1.0,(other-z+max(1.2,z*.055)) / max(1.2,z*.055));
      accept*=smoothstep(uFocusEnd-.40,uFocusEnd+.35,other);
      vec3 rgb=texture(uColor,sampleUV).rgb;
      float w=accept*(i<4?1.0:.82);
      sum+=rgb*w;weight+=w;
      float warm=smoothstep(.008,.17,rgb.r-rgb.b+.012);
      glow+=w*warm*smoothstep(.75,.97,luminance(rgb));
    }
    color=mix(color,sum/weight,smoothstep(.19,.82,radius));
    color+=vec3(.020,.010,.004)*glow/weight*(1.0-smoothstep(.65,.96,luminance(color)));
  }else if(uNeedAA) color=smoothEdge(color);
  if(uStudio){
    vec2 corner=uv*2.0-1.0;
    float falloff=smoothstep(.21,1.86,dot(corner,corner));
    color*=1.0-.031*falloff;
  }
  outColor=vec4(color,pixel.a);
}`;

function createProgram(gl){
  const shaders = [], program = gl.createProgram();
  if(!program)return null;
  let ok = false;
  try {
    for(const [type,source] of [[gl.VERTEX_SHADER,vertex],[gl.FRAGMENT_SHADER,fragment]]){
      const shader=gl.createShader(type);
      if(!shader) return null;
      shaders.push(shader);
      gl.shaderSource(shader,source);gl.compileShader(shader);
      if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) return null;
      gl.attachShader(program,shader);
    }
    gl.linkProgram(program);
    ok=Boolean(gl.getProgramParameter(program,gl.LINK_STATUS));
    return ok?program:null;
  } finally {
    shaders.forEach(shader=>gl.deleteShader(shader));
    if(!ok)gl.deleteProgram(program);
  }
}

// begin() is called with the default framebuffer active, immediately before the scene draw.
// Offscreen attachments follow the viewport on resize. Allocation failure keeps direct rendering.
export function createSceneFinish(gl){
  if(!gl || typeof gl.blitFramebuffer!=='function')return null;
  const program=createProgram(gl);
  if(!program)return null;
  const vao=gl.createVertexArray();
  if(!vao){gl.deleteProgram(program);return null;}
  const uniforms={};
  for(const name of ['uColor','uDepth','uClip','uTexel','uStudio','uMaxRadius','uFocusEnd','uNeedAA']){
    uniforms[name]=gl.getUniformLocation(program,name);
  }
  const colorSamples=Array.from(gl.getInternalformatParameter(gl.RENDERBUFFER,gl.RGBA8,gl.SAMPLES)||[]);
  const depthSamples=Array.from(gl.getInternalformatParameter(gl.RENDERBUFFER,gl.DEPTH_COMPONENT24,gl.SAMPLES)||[]);
  const supported=colorSamples.filter(n=>n>1&&depthSamples.includes(n)).sort((a,b)=>b-a);
  const maxSize=Math.min(gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),gl.getParameter(gl.MAX_TEXTURE_SIZE));
  let frame=null,failedWidth=-1,failedHeight=-1,working=false;
  function release(f){
    if(!f)return;
    gl.deleteTexture(f.color);gl.deleteTexture(f.depth);
    gl.deleteRenderbuffer(f.rbColor);gl.deleteRenderbuffer(f.rbDepth);
    gl.deleteFramebuffer(f.resolve);gl.deleteFramebuffer(f.ms);
  }
  function targetTexture(format,filter,w,h){
    const texture=gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.texStorage2D(gl.TEXTURE_2D,1,format,w,h);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,filter);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,filter);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    return texture;
  }
  function attachment(format,point,samples,w,h){
    const rb=gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER,rb);
    gl.renderbufferStorageMultisample(gl.RENDERBUFFER,samples,format,w,h);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER,point,gl.RENDERBUFFER,rb);
    return rb;
  }
  function setup(w,h){
    if(w<1||h<1||w>maxSize||h>maxSize||w*h>5500000)return null;
    const f={w,h,samples:1,resolve:null,ms:null,rbColor:null,rbDepth:null,color:null,depth:null};
    const oldTexture=gl.getParameter(gl.TEXTURE_BINDING_2D), oldRB=gl.getParameter(gl.RENDERBUFFER_BINDING);
    let ok=false;
    try{
      f.resolve=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,f.resolve);
      f.color=targetTexture(gl.RGBA8,gl.LINEAR,w,h);
      gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,f.color,0);
      f.depth=targetTexture(gl.DEPTH_COMPONENT24,gl.NEAREST,w,h);
      gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,f.depth,0);
      if(!f.resolve||!f.color||!f.depth||gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)return null;
      // Avoid unexpectedly large multisample allocations on high-DPI displays.
      const maxSamples=w*h<=1450000?4:w*h<=2600000?2:1;
      const samples=supported.find(v=>v<=maxSamples);
      if(samples){
        f.ms=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,f.ms);
        f.rbColor=attachment(gl.RGBA8,gl.COLOR_ATTACHMENT0,samples,w,h);
        f.rbDepth=attachment(gl.DEPTH_COMPONENT24,gl.DEPTH_ATTACHMENT,samples,w,h);
        let valid=f.ms&&f.rbColor&&f.rbDepth&&gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE;
        if(valid){
          gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER,f.resolve);
          gl.blitFramebuffer(0,0,w,h,0,0,w,h,gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT,gl.NEAREST);
          valid=gl.getError()===gl.NO_ERROR;
        }
        if(valid){f.samples=samples;}
        else{
          gl.deleteFramebuffer(f.ms);gl.deleteRenderbuffer(f.rbColor);gl.deleteRenderbuffer(f.rbDepth);
          f.ms=f.rbColor=f.rbDepth=null;
        }
      }
      ok=true;return f;
    } finally {
      gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.bindTexture(gl.TEXTURE_2D,oldTexture);gl.bindRenderbuffer(gl.RENDERBUFFER,oldRB);
      if(!ok)release(f);
    }
  }
  return {
    begin(w,h){
      if(!frame||w!==frame.w||h!==frame.h){
        if(failedWidth===w&&failedHeight===h)return false;
        // The old set is no longer usable at this resolution and needn't consume VRAM.
        release(frame);frame=null;
        try{frame=setup(w,h)}catch{gl.bindFramebuffer(gl.FRAMEBUFFER,null)}
        if(!frame){failedWidth=w;failedHeight=h;return false;}
        failedWidth=failedHeight=-1;
      }
      working=true;gl.bindFramebuffer(gl.FRAMEBUFFER,frame.ms||frame.resolve);return true;
    },
    end({near=.20,far=100,focusDistance=15.7,focusRadius=3.2,perspective=true}={}){
      if(!working||!frame)return;
      working=false;
      const {w,h,ms,resolve,color,depth,samples}=frame;
      if(ms){
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER,ms);gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER,resolve);
        gl.blitFramebuffer(0,0,w,h,0,0,w,h,gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT,gl.NEAREST);
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER,null);
      const prevActive=gl.getParameter(gl.ACTIVE_TEXTURE),prevProgram=gl.getParameter(gl.CURRENT_PROGRAM);
      const prevVao=gl.getParameter(gl.VERTEX_ARRAY_BINDING),hadDepth=gl.isEnabled(gl.DEPTH_TEST);
      const hadBlend=gl.isEnabled(gl.BLEND),hadCull=gl.isEnabled(gl.CULL_FACE);
      gl.disable(gl.DEPTH_TEST);if(hadBlend)gl.disable(gl.BLEND);if(hadCull)gl.disable(gl.CULL_FACE);
      gl.useProgram(program);gl.bindVertexArray(vao);
      gl.activeTexture(gl.TEXTURE6);const prev6=gl.getParameter(gl.TEXTURE_BINDING_2D);gl.bindTexture(gl.TEXTURE_2D,color);
      gl.activeTexture(gl.TEXTURE7);const prev7=gl.getParameter(gl.TEXTURE_BINDING_2D);gl.bindTexture(gl.TEXTURE_2D,depth);
      gl.uniform1i(uniforms.uColor,6);gl.uniform1i(uniforms.uDepth,7);
      gl.uniform2f(uniforms.uClip,near,far);gl.uniform2f(uniforms.uTexel,1/w,1/h);
      gl.uniform1f(uniforms.uFocusEnd,focusDistance+focusRadius);gl.uniform1f(uniforms.uMaxRadius,lensRadius(h));
      gl.uniform1i(uniforms.uStudio,perspective?1:0);gl.uniform1i(uniforms.uNeedAA,samples===1?1:0);
      gl.drawArrays(gl.TRIANGLES,0,3);
      gl.bindTexture(gl.TEXTURE_2D,prev7);gl.activeTexture(gl.TEXTURE6);gl.bindTexture(gl.TEXTURE_2D,prev6);
      gl.activeTexture(prevActive);gl.bindVertexArray(prevVao);gl.useProgram(prevProgram);
      if(hadDepth)gl.enable(gl.DEPTH_TEST);if(hadBlend)gl.enable(gl.BLEND);if(hadCull)gl.enable(gl.CULL_FACE);
    },
    destroy(){release(frame);frame=null;working=false;gl.deleteVertexArray(vao);gl.deleteProgram(program);}
  };
}

const cpuCache=new WeakMap();
const smooth=x=>x*x*(3-2*x);
const luminancePacked=c=>(((c&255)*64+((c>>>8)&255)*158+((c>>>16)&255)*34)>>>8);
const pack=(r,g,b,a)=>((r+.5)|0)|(((g+.5)|0)<<8)|(((b+.5)|0)<<16)|(a&0xff000000);

function cpuScratch(base,w,h){
  let state=cpuCache.get(base);
  if(state&&state.w===w&&state.h===h)return state;
  const vignette=new Float32Array(w+h);
  for(let x=0;x<w;x++)vignette[x]=((x+.5)*2/w-1)**2;
  for(let y=0;y<h;y++)vignette[w+y]=((y+.5)*2/h-1)**2;
  // Quantize the short lens kernel once. Eight cardinal/diagonal apertures are
  // sufficient at this resolution, and repeated offsets implement fractional weights.
  const kernels=Array.from({length:17},(_,b)=>{
    const r=Math.max(1,b*.25);
    const offsets=[];
    for(const [x,y] of [[1,0],[-1,0],[0,1],[0,-1],[.69,.69],[-.69,.69],[.69,-.69],[-.69,-.69]]){
      offsets.push(Math.round(x*r)+Math.round(y*r)*w);
    }
    return offsets;
  });
  state={w,h,src:new Uint32Array(w*h),vignette,kernels};
  cpuCache.set(base,state);return state;
}

/** Apply once while baking a new camera view, before the moving label and tonearm.
 *  Depth is the reciprocal axial distance for the perspective camera. Room material
 *  pixels have kind=3. Other visible geometry stays on its focus plane.
 */
export function applySceneFinish(base,depth,w,h,rig,kind){
  if(!base||!depth||!rig||w<6||h<6||base.length!==w*h||depth.length!==base.length)return;
  const {src,kernels,vignette}=cpuScratch(base,w,h);
  src.set(base);
  const studio=rig.perspective, focusEnd=rig.distance+(rig.focusRadius??3.2), radiusMax=lensRadius(h);
  const maxReciprocal=1/focusEnd,border=Math.ceil(radiusMax)+1;
  for(let y=1;y<h-1;y++){
    const vY=vignette[w+y],roomRow=y>=border&&y<h-border;
    for(let x=1,i=y*w+1;x<w-1;x++,i++){
      const c=src[i], z=depth[i];
      let r=c&255,g=(c>>>8)&255,b=(c>>>16)&255;
      let lens=0;
      if(studio&&roomRow&&x>=border&&x<w-border&&(!kind||kind[i]===3)&&z>0&&z<maxReciprocal){
        const aperture=clamp((1-focusEnd*z)*3.8,0,1), radius=radiusMax*smooth(aperture);
        if(radius>.19){
          const offsets=kernels[clamp(Math.round(radius*4),1,16)];
          const dist=1/z, limit=1/(dist-Math.max(1.2,dist*.055));
          let rr=2*r,gg=2*g,bb=2*b,weight=2,hot=0;
          for(let j=0;j<8;j++){
            const k=i+offsets[j],other=depth[k];
            if((kind&&kind[k]!==3)||other>limit)continue;
            const q=src[k],qr=q&255,qg=(q>>>8)&255,qb=(q>>>16)&255;
            rr+=qr;gg+=qg;bb+=qb;weight++;
            if(qr-qb>8&&qg>190)hot+=Math.min(1,(qg-190)/52)*Math.min(1,(qr-qb-8)/34);
          }
          lens=smooth(clamp((radius-.19)/.63,0,1));
          r+=lens*(rr/weight-r);g+=lens*(gg/weight-g);b+=lens*(bb/weight-b);
          const halo=(hot/weight)*(1-clamp((g-166)/79,0,1));
          r+=5*halo;g+=2.5*halo;b+=halo;
        }
      }
      if(lens<.12){
        // Smooth staircase corners only. A straight molding, a thin groove and
        // fine material shading retain their full original contrast.
        const center=luminancePacked(c),left=src[i-1],right=src[i+1],top=src[i-w],bottom=src[i+w];
        const dl=luminancePacked(left)-center,dr=luminancePacked(right)-center;
        const dt=luminancePacked(top)-center,db=luminancePacked(bottom)-center;
        const th=Math.max(25,center*.16);
        if((Math.abs(dl)>th)!==(Math.abs(dr)>th)&&(Math.abs(dt)>th)!==(Math.abs(db)>th)){
          const dx=Math.abs(dl)>th?dl:dr,dy=Math.abs(dt)>th?dt:db;
          if(dx*dy>0&&Math.abs(dx-dy)<Math.max(38,Math.abs(dx)*.6)){
            const q=Math.abs(dl)>th?left:right,p=Math.abs(dt)>th?top:bottom;
            r+=(((q&255)+(p&255))*.5-r)*.19;
            g+=((((q>>>8)&255)+((p>>>8)&255))*.5-g)*.19;
            b+=((((q>>>16)&255)+((p>>>16)&255))*.5-b)*.19;
          }
        }
      }
      const v=studio?1-.031*smooth(clamp((vignette[x]+vY-.21)/1.65,0,1)):1;
      base[i]=pack(Math.min(255,r*v),Math.min(255,g*v),Math.min(255,b*v),c);
    }
  }
  if(studio){
    // The convolution has no neighbors at the image boundary, but illumination
    // continues smoothly to the edge of the framebuffer.
    const shadeBorder=(x,y)=>{
      const i=y*w+x,c=src[i],v=1-.031*smooth(clamp((vignette[x]+vignette[w+y]-.21)/1.65,0,1));
      base[i]=pack((c&255)*v,((c>>>8)&255)*v,((c>>>16)&255)*v,c);
    };
    for(let x=0;x<w;x++){shadeBorder(x,0);shadeBorder(x,h-1)}
    for(let y=1;y<h-1;y++){shadeBorder(0,y);shadeBorder(w-1,y)}
  }
}
