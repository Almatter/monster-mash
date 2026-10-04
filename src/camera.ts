// A bounded world view: screen resolution changes detail, never scout distance.
// Match the screen aspect while preserving the same visible world area on every device.
export const FIELD_VIEW={wide:1200,short:760};
export function cameraViewport(width:number,height:number){
 const area=FIELD_VIEW.wide*FIELD_VIEW.short,aspect=Math.max(1/3.6,Math.min(3.6,width/height)),worldWidth=Math.sqrt(area*aspect),worldHeight=Math.sqrt(area/aspect);
 const scale=Math.min(width/worldWidth,height/worldHeight),pixelWidth=worldWidth*scale,pixelHeight=worldHeight*scale;
 return {scale,worldWidth,worldHeight,width:pixelWidth,height:pixelHeight,left:(width-pixelWidth)/2,top:(height-pixelHeight)/2};
}
