// Use real display intervals for diagnostics; simulation's catch-up cap is separate.
export class FrameTiming{
 private previous=0;private intervals:number[]=[];private elapsed=0;
 average=1000/60;fps=60;
 sample(stamp:number){const interval=this.previous?Math.max(1,stamp-this.previous):1000/60;this.previous=stamp;this.intervals.push(interval);this.elapsed+=interval;while(this.intervals.length>1&&this.elapsed-this.intervals[0]>=1000)this.elapsed-=this.intervals.shift()!;this.fps=Math.round(this.intervals.length*1000/this.elapsed);this.average=this.average*.97+Math.min(250,interval)*.03;return {delta:Math.min(.1,interval/1000),interval};}
}
