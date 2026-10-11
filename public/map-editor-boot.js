const version=new URL(import.meta.url).searchParams.get('v')||'';
const modules=/*__MODULES__*/[];
const map=document.createElement('script');map.type='importmap';map.textContent=JSON.stringify({imports:Object.fromEntries(modules.map(path=>[new URL(path,location.href).href,new URL(path+'?v='+version,location.href).href]))});document.head.append(map);
import('./src/map-editor.js?v='+version).catch(error=>{document.getElementById('status').textContent='The editor could not start. Reload to retry. '+error.message;});
