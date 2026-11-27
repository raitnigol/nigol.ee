function fitText(context, text, y, maxWidth, maximumSize, family, style) {
  if (!text) return;
  let size = maximumSize;
  const font = () => {context.font = style+' '+size+'px '+family;};
  font();
  while (size > 15 && context.measureText(text).width > maxWidth) {size--; font();}
  context.fillText(text, 256, y, maxWidth);
}
function printedLabel(track) {
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

export {printedLabel};
