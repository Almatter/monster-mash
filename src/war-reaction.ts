type Point={x:number;y:number};
export const WAR_REACTION={noticeMin:.45,noticeSpread:.30,castMin:.80,castSpread:.35,aimMin:.20,aimSpread:.10};
export type WarReaction={focus:number|null;readyAt:number;aimAt:number;aim:Point|null};
export const createWarReaction=():WarReaction=>({focus:null,readyAt:Infinity,aimAt:0,aim:null});
export const warReactionReady=(r:WarReaction|undefined,time:number)=>!!r&&r.focus!==null&&time>=r.readyAt;
// Perception/aim updates are separate from physics and from attack cooldowns.
export function observeWarTarget(r:WarReaction,focus:number|null,point:Point|null,time:number,random:()=>number){
 if(focus===null||!point){r.focus=null;r.readyAt=Infinity;r.aim=null;return;}
 if(r.focus!==focus){r.focus=focus;r.readyAt=time+WAR_REACTION.noticeMin+random()*WAR_REACTION.noticeSpread;r.aimAt=0;}
 if(time>=r.aimAt){r.aim={x:point.x,y:point.y};r.aimAt=time+WAR_REACTION.aimMin+random()*WAR_REACTION.aimSpread;}
}
