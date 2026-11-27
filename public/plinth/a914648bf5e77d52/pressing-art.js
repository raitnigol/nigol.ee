// Spotify supplies the exact album or single cover; printed text is fallback only.
function fitText(context, text, y, maxWidth, maximumSize, family, style) {
  if (!text) return;
  let size = maximumSize;
  const font = () => {context.font = style+' '+size+'px '+family;};
  font();
  while (size > 15 && context.measureText(text).width > maxWidth) {size--; font();}
  context.fillText(text, 256, y, maxWidth);
}
export function printedLabel(track) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const context = canvas.getContext('2d');
  const ink = '#efdcab';
  context.fillStyle = '#702d2a';
  context.fillRect(0,0,512,512);
  // Repeatable fine paper mottling avoids a sparkling label when the scene rotates.
  let seed = 391771;
  for (let i=0;i<4200;i++) {
    seed = (Math.imul(seed,1664525) + 1013904223) >>> 0;
    const x = seed & 511;
    const y = (seed >>> 14) & 511;
    context.fillStyle = (seed & 0x2000) ? '#e1b77b13' : '#250c0917';
    context.fillRect(x,y,1+(seed>>>30),1);
  }
  const ring = (radius, weight, color) => {
    context.strokeStyle=color;context.lineWidth=weight;
    context.beginPath();context.arc(256,256,radius,0,Math.PI*2);context.stroke();
  };
  ring(244,2.3,'#cfac72');ring(237,1,'#d8b680');ring(231,2,'#ae8457');
  ring(49,1.4,'#b58d60');ring(44,.8,'#bd9a69');
  context.fillStyle=ink;context.textAlign='center';context.textBaseline='middle';
  const italic='Georgia,"Times New Roman",serif';
  fitText(context,track.album || track.title || '',129,342,38,italic,'italic');
  context.strokeStyle='#bd986c';context.lineWidth=1.2;
  for(const y of [164,344]) {
    context.beginPath();context.moveTo(178,y);context.lineTo(334,y);context.stroke();
  }
  fitText(context,track.title || '',306,391,38,italic,'bold');
  fitText(context,track.artist || '',373,324,29,italic,'normal');
  fitText(context,'$.pohhu¥',421,160,23,italic,'italic');
  return canvas.toDataURL('image/png');
}

/** Public artwork URLs from Spotify metadata; never accept credentials or local URLs. */
export function spotifyArtworkUrl(track) {
  try {
    const url = new URL(track?.art || '');
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : '';
  } catch { return ''; }
}

async function decodeArtwork(blob, signal) {
  if (typeof createImageBitmap === 'function') {
    const image = await createImageBitmap(blob);
    if (signal.aborted) { image.close(); signal.throwIfAborted(); }
    return {image, width:image.width, height:image.height, dispose:()=>image.close()};
  }
  // Safari versions without createImageBitmap still decode a same-origin blob.
  const url=URL.createObjectURL(blob), image=new Image();
  try {
    await new Promise((resolve,reject)=>{
      const cleanup=()=>{image.onload=null;image.onerror=null;signal.removeEventListener('abort',abort)};
      const abort=()=>{cleanup();image.src='';reject(signal.reason || new Error('Artwork cancelled'))};
      image.onload=()=>{cleanup();resolve()};
      image.onerror=()=>{cleanup();reject(new Error('Artwork could not be decoded'))};
      signal.addEventListener('abort',abort,{once:true});
      if(signal.aborted){abort();return;}
      image.src=url;
    });
    return {image,width:image.naturalWidth,height:image.naturalHeight,dispose:()=>URL.revokeObjectURL(url)};
  } catch(error) { URL.revokeObjectURL(url);throw error; }
}

/** Decode before publication so the renderer receives a complete replacement image. */
export async function loadSpotifyArtwork(url, signal) {
  const response=await fetch(url,{signal,mode:'cors',credentials:'omit',referrerPolicy:'no-referrer'});
  if(!response.ok)throw new Error('Spotify artwork unavailable');
  const type=(response.headers.get('Content-Type') || '').split(';')[0].trim();
  const maxBytes=5*1024*1024;
  if(!/^image\/(jpeg|png|webp|avif)$/i.test(type) || Number(response.headers.get('Content-Length'))>maxBytes)
    throw new Error('Unsupported Spotify artwork');
  const blob=await response.blob();
  if(!blob.size || blob.size>maxBytes)throw new Error('Unsupported Spotify artwork');
  signal.throwIfAborted();
  const decoded=await decodeArtwork(blob,signal);
  try {
    signal.throwIfAborted();
    const {image,width,height}=decoded;
    if(!width || !height || width>8192 || height>8192)throw new Error('Unsupported Spotify artwork dimensions');
    const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
    const context=canvas.getContext('2d');
    if(!context)throw new Error('Artwork canvas unavailable');
    const side=Math.min(width,height);
    context.drawImage(image,(width-side)/2,(height-side)/2,side,side,0,0,512,512);
    return canvas.toDataURL('image/png');
  } finally { decoded.dispose(); }
}

/** Shared by the private player and public read-only viewer. No Spotify API/auth calls. */
export function createPressingArtwork({onArtwork, loadArtwork=loadSpotifyArtwork, makeFallback=printedLabel, now=Date.now, timeoutMs=5000}) {
  let current=null,request=null,closed=false,displayed;
  const cache=new Map();
  function publish(url,kind) {
    if(closed || url===displayed)return;
    displayed=url;onArtwork(url,kind);
  }
  function stop() {
    if(request){clearTimeout(request.timer);request.abort.abort();request=null;}
  }
  function remember(url,art,ttl) {
    cache.delete(url);
    if(cache.size>=20)cache.delete(cache.keys().next().value);
    const entry={art,until:now()+ttl};cache.set(url,entry);return entry;
  }
  function failed(job) {
    if(closed || request!==job)return;
    request=null;clearTimeout(job.timer);job.abort.abort();
    if(job.url)remember(job.url,null,60000);
    current.settled=true;
    publish(makeFallback(job.track),'printed');
  }
  return {
    setTrack(track) {
      if(closed)return;
      if(!track){stop();current=null;publish(null,'empty');return;}
      const url=spotifyArtworkUrl(track);
      const signature=JSON.stringify([track.id,track.title,track.artist,track.album,url]);
      let cached=cache.get(url);
      if(cached && cached.until<=now()){cache.delete(url);cached=null;}
      if(current?.signature===signature && (request || cached || (!url && current.settled)))return;
      stop();current={signature,settled:false};
      if(cached){
        current.settled=true;
        publish(cached.art || makeFallback(track),cached.art?'spotify':'printed');return;
      }
      // Keep the previous texture until the next image is decoded. Sparse SDK
      // metadata gets the same grace period to acquire its Spotify cover URL.
      const job={abort:new AbortController(),timer:null,url,track};request=job;
      job.timer=setTimeout(()=>failed(job),timeoutMs);
      if(!url)return;
      // Promise.resolve also turns a synchronous loader error into fallback behavior.
      Promise.resolve().then(()=>{
        job.abort.signal.throwIfAborted();return loadArtwork(url,job.abort.signal);
      }).then(art=>{
        if(closed || request!==job || job.abort.signal.aborted)return;
        if(!art)throw new Error('Empty Spotify artwork');
        request=null;clearTimeout(job.timer);current.settled=true;
        remember(url,art,3600000);publish(art,'spotify');
      }).catch(()=>{
        failed(job);
      }).finally(()=>{
        clearTimeout(job.timer);if(request===job)request=null;
      });
    },
    destroy() {closed=true;stop();current=null;cache.clear();}
  };
}
