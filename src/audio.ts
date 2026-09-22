export class AudioEngine {
 context:AudioContext|null=null; muted=false; last=0;
 unlock(){if(!this.context)this.context=new AudioContext();void this.context.resume();}
 play(kind:string){
  if(this.muted||!this.context)return;
  const c=this.context,t=c.currentTime;
  if(kind==='hit'&&t-this.last<.07)return;
  this.last=t;
  const osc=c.createOscillator(),gain=c.createGain();
  const f:Record<string,number>={hit:110,rupture:80,devour:180,beam:310,catastrophe:48,hurt:145,wave:330};
  const duration=kind==='catastrophe'?1.1:kind==='beam'?.5:.2;
  osc.type=kind==='beam'?'sawtooth':'triangle';
  osc.frequency.setValueAtTime(f[kind]||90,t);osc.frequency.exponentialRampToValueAtTime(kind==='wave'?660:22,t+duration);
  gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(kind==='hit'?.045:.13,t+.008);gain.gain.exponentialRampToValueAtTime(.001,t+duration);
  osc.connect(gain);gain.connect(c.destination);osc.start(t);osc.stop(t+duration+.01);
  osc.onended=()=>{osc.disconnect();gain.disconnect();};
 }
}
