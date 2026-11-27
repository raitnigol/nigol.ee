import {copyCameraSnapshot} from './listening-angle.js';
import {STUDIO, RECORD} from './victor-camera.js';

/* Choose acceleration once. Camera input never changes the active scene or renderer. */
export function createDeck(container,callbacks={}) {
  const values=new Map();
  let disposed=false,active=null,backend='',generation=0,usedCpu=false;
  let view='studio',orbit=false,rigState=null,phase=0;
  function discard(){
    if(active){
      rigState=copyCameraSnapshot(active.getCamera?.())||rigState;
      phase=active.getSpinAngle?.()??phase;
      active.destroy();active=null;
    }
  }
  async function boot(software=false){
    if(disposed)return;
    const ticket=++generation;
    discard();
    backend=software?'cpu':'gpu';
    if(software)usedCpu=true;
    const lost=()=>{
      if(disposed||ticket!==generation)return;
      if(!usedCpu)void boot(true);else callbacks.onRenderError?.();
    };
    try{
      const create=software?(await import('./victor-cpu.js')).createCpuDeck:(await import('./victor-render.js')).createLiveDeck;
      if(disposed||ticket!==generation)return;
      const renderer=await create(container,{
        ...callbacks,onRendererLost:lost,onRenderError:lost,
        onOrbitChange(value){
          if(disposed||ticket!==generation)return;
          orbit=Boolean(value);callbacks.onOrbitChange?.(orbit);
        },
        onViewChange(value){
          if(disposed||ticket!==generation)return;
          if(value==='studio'||value==='overhead')view=value;
          callbacks.onViewChange?.(value);
        }
      });
      if(disposed||ticket!==generation){renderer.destroy();return}
      active=renderer;
      for(const [name,value] of values)renderer[name]?.(value);
      renderer.setView(view,false);if(rigState)renderer.setCamera?.(rigState);
      if(phase)renderer.setSpinAngle?.(phase);
      renderer.setOrbitEnabled(orbit,false);
      callbacks.onOrbitChange?.(orbit);
    }catch{if(!disposed&&ticket===generation){if(backend==='gpu')void boot(true);else callbacks.onRenderError?.()}}
  }
  void boot();
  const api={
    getCamera(){
      if(disposed)return null;
      const preset=view==='overhead'?RECORD:STUDIO;
      return copyCameraSnapshot(active?.getCamera?.())||copyCameraSnapshot(rigState)||
        {view,preset:view,yaw:preset.yaw,tilt:preset.tilt,target:preset.target.slice()};
    },
    restoreCamera(snapshot){
      const saved=copyCameraSnapshot(snapshot);
      if(disposed||!saved)return false;
      view=saved.view;rigState=saved;orbit=false;
      active?.setCamera?.(copyCameraSnapshot(saved));active?.setOrbitEnabled?.(false,false);
      callbacks.onOrbitChange?.(false);callbacks.onViewChange?.(saved.preset);
      return true;
    },
    setView(next){
      view=next==='overhead'?'overhead':'studio';rigState=null;orbit=false;
      active?.setOrbitEnabled?.(false,false);active?.setView?.(view,false);
      callbacks.onOrbitChange?.(false);callbacks.onViewChange?.(view);
    },
    resetView(){api.setView('studio')},
    setOrbitEnabled(value){orbit=!!value;active?.setOrbitEnabled?.(orbit)},
    destroy(){disposed=true;generation++;discard()}
  };
  for(const name of ['setSuspended','setCover','setRpm','setPitch','setPitchEnabled','setNeedleDropEnabled','setPlaying','setCue','setProgress','setLighting'])api[name]=value=>{
    if(values.has(name)&&Object.is(values.get(name),value))return;
    values.set(name,value);active?.[name]?.(value);
  };
  return api;
}
