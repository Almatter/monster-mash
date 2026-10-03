import {createRequire} from 'node:module';import {stat} from 'node:fs/promises';
const sharp=createRequire('C:/Users/novam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json')('sharp');
for(const [name,size] of [['court-slam',512],['court-guard-front',256]]){
 const source='art-source/stage2/'+name+'.png',target='public/assets/vfx/'+name+'.webp';
 if(!(await sharp(source).metadata()).hasAlpha)throw Error(name+' needs genuine transparency');
 // Keep the complete canvas: the center is the gameplay pivot, even for the asymmetric guard arc.
 await sharp(source).resize(size,size).webp({quality:90,alphaQuality:100,effort:5}).toFile(target);
 const {data}=await sharp(target).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 if(data[(Math.floor(size/2)*size+Math.floor(size/2))*4+3]>10)throw Error(name+' must leave its center clear');
 console.log(name+': '+Math.round((await stat(target)).size/1024)+' KiB; pivot and center transparency retained');
}
