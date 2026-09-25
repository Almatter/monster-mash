// Match the stone feet of the eight rendered braziers, below their flame anchor.
export const TORCHES=Array.from({length:8},(_,i)=>({x:Math.cos(i*Math.PI/4)*580,y:Math.sin(i*Math.PI/4)*580+31,radius:19}));
export function slideTorches(body:{x:number;y:number},radius:number){for(const t of TORCHES){const dx=body.x-t.x,dy=body.y-t.y,r=radius+t.radius;if(Math.abs(dx)>=r||Math.abs(dy)>=r)continue;const d=Math.hypot(dx,dy);if(d<r){body.x=t.x+(d?dx/d:1)*r;body.y=t.y+(d?dy/d:0)*r;}}}
