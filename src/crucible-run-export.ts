import {encodeRun,type RunRecord} from './run-code.ts';
// Keep export outside the score/rewards views so either view can share it.
export function presentCrucibleRunExport(root:HTMLElement,run:RunRecord|null){
 root.querySelector('#result-run-code')?.remove();root.querySelector('#result-run-export')?.remove();
 if(!run)return;
 const panel=document.createElement('section');panel.id='result-run-export';panel.className='result-run-export';panel.hidden=true;
 const label=document.createElement('label');label.htmlFor='result-run-code-text';label.textContent='Stage 4 run code';
 const code=document.createElement('textarea');code.id='result-run-code-text';code.readOnly=true;code.rows=4;code.setAttribute('aria-label','Stage 4 run code');
 const status=document.createElement('p');status.setAttribute('role','status');status.textContent='Select and copy this code to share your result.';
 const copy=document.createElement('button');copy.type='button';copy.textContent='Copy run code';copy.onclick=async()=>{try{await navigator.clipboard.writeText(code.value);status.textContent='Run code copied.';}catch{code.focus();code.select();status.textContent='Code selected. Use your browser’s Copy command.';}};
 panel.append(label,code,copy,status);
 const actions=root.querySelector('.result-actions'),button=document.createElement('button');button.id='result-run-code';button.type='button';button.textContent='Show run code';button.setAttribute('aria-controls',panel.id);button.setAttribute('aria-expanded','false');
 button.onclick=async()=>{button.disabled=true;panel.hidden=false;button.setAttribute('aria-expanded','true');status.textContent='Preparing run code…';try{code.value=await encodeRun(run);status.textContent='Select and copy this code to share your result.';code.focus();code.select();panel.scrollIntoView({block:'nearest'});}catch{status.textContent='Could not create the run code. Please try again.';}finally{button.disabled=false;}};
 if(actions){actions.before(panel);actions.prepend(button);}else root.append(panel,button);
}
