export function localStageTest(location:{hostname:string;search:string;pathname?:string}){
 return /\/(test|stage2-test|stage3-test)\/(?:index\.html)?$/.test(location.pathname||'')||['localhost','127.0.0.1','[::1]','::1'].includes(location.hostname)&&['stage2-test','stage3-test','test'].some(key=>new URLSearchParams(location.search).get(key)==='1');
}
export const testStageAvailable=(phase:number)=>Number.isInteger(phase)&&phase>=0&&phase<=2;
