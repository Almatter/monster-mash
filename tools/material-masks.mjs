// Authoring only: bridge black guide ink without blurring material boundaries.
// Nearby source color selects the right side of an ink gap; source ink is retained later.
export function materialLabels(source,guide,width,height,count=5){
 const colors=[[0,0,255],[255,0,255],[255,255,0],[255,0,0],[0,255,255],[0,255,0]],labels=new Uint8Array(width*height);
 for(let p=0;p<labels.length;p++){const i=p*4;if(source[i+3]<3||guide[i+3]<20||Math.max(guide[i],guide[i+1],guide[i+2])<90)continue;let best=Infinity;for(let c=0;c<count;c++){const rgb=colors[c],d=(guide[i]-rgb[0])**2+(guide[i+1]-rgb[1])**2+(guide[i+2]-rgb[2])**2;if(d<best){best=d;labels[p]=c+1;}}}
 const filled=labels.slice();
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){const p=y*width+x,i=p*4;if(labels[p]||source[i+3]<16)continue;let best=Infinity,label=0;
  for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){if(x+dx<0||x+dx>=width||y+dy<0||y+dy>=height)continue;const q=(y+dy)*width+x+dx;if(!labels[q]||source[q*4+3]<16)continue;const d=dx*dx+dy*dy+((source[i]-source[q*4])**2+(source[i+1]-source[q*4+1])**2+(source[i+2]-source[q*4+2])**2)/256;if(d<best){best=d;label=labels[q];}}
  filled[p]=label;
 }return filled;
}
