export type DamageKind='contact'|'ranged'|'aoe';
// Only body/weapon contact is avoided by Briarflight. Spells and blasts still connect.
export function damageKind(source:string,rangedBasic=false):DamageKind{
 if(source==='direct')return rangedBasic?'ranged':'contact';
 if(['controlled','summoned','army','lunge','trample','ravage','moonfury'].includes(source))return 'contact';
 if(['army-ranged','hagvenom','scythe','reapingarc','beam','clawwave'].includes(source))return 'ranged';
 return 'aoe';
}
