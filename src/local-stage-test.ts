export function localStageTest(location:{hostname:string;search:string;pathname?:string}){
 return /\/stage2-test\/(?:index\.html)?$/.test(location.pathname||'')||['localhost','127.0.0.1','[::1]','::1'].includes(location.hostname)&&new URLSearchParams(location.search).get('stage2-test')==='1';
}
