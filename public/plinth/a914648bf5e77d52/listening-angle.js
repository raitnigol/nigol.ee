const storageKey = 'plinth.listening-angle.v1';

export function copyCameraSnapshot(value) {
  if (!value || !['studio','overhead'].includes(value.view)) return null;
  if (value.preset !== value.view && value.preset !== 'custom') return null;
  if (!Number.isFinite(value.yaw) || !Number.isFinite(value.tilt) || value.tilt < 0 || value.tilt > Math.PI/2) return null;
  if (!Array.isArray(value.target) || value.target.length !== 3) return null;
  const target = Array.from(value.target);
  if (!target.every(n=>Number.isFinite(n) && Math.abs(n)<=100)) return null;
  return {view:value.view,preset:value.preset,yaw:value.yaw,tilt:value.tilt,target};
}

export function createListeningAngle(deck) {
  function read() {
    try {
      const data=window.localStorage.getItem(storageKey);
      if (!data || data.length>1024) return null;
      const stored=JSON.parse(data);
      return stored?.version===1 ? copyCameraSnapshot(stored.camera) : null;
    } catch {
      return null;
    }
  }
  return {
    has:()=>Boolean(read()),
    save() {
      const camera=copyCameraSnapshot(deck.getCamera());
      if (!camera) return false;
      try {
        window.localStorage.setItem(storageKey,JSON.stringify({version:1,camera}));
      } catch {
        return false;
      }
      return deck.restoreCamera(camera);
    },
    recall() {
      const camera=read();
      return camera ? deck.restoreCamera(camera) : false;
    }
  };
}
