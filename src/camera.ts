// A bounded world view: screen resolution changes detail, never scout distance.
// Portrait rotates the same rectangle; both orientations show 912,000 world units.
export const FIELD_VIEW={wide:1200,short:760};
export function cameraViewport(width:number,height:number){
 const portrait=height>width,worldWidth=portrait?FIELD_VIEW.short:FIELD_VIEW.wide,worldHeight=portrait?FIELD_VIEW.wide:FIELD_VIEW.short;
 const scale=Math.min(width/worldWidth,height/worldHeight),pixelWidth=worldWidth*scale,pixelHeight=worldHeight*scale;
 return {scale,worldWidth,worldHeight,width:pixelWidth,height:pixelHeight,left:(width-pixelWidth)/2,top:(height-pixelHeight)/2};
}
