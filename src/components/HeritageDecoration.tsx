import React from 'react';
/** Decorative only. No IDs, relationships or hit targets are created here. */
export default function HeritageDecoration({simple}:{simple:boolean}){
 const leaves=simple?[[210,270],[790,270],[340,180],[660,180]]:[[130,310],[210,270],[300,230],[340,180],[420,130],[570,140],[660,180],[710,230],[790,270],[870,310],[160,430],[840,430],[260,520],[740,520]];
 return <svg className="heritage-decoration" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true" focusable="false">
  <defs><linearGradient id="bark" x1="0" x2="1"><stop stopColor="#68533a"/><stop offset=".5" stopColor="#a58a60"/><stop offset="1" stopColor="#665039"/></linearGradient></defs>
  <path d="M460 1000 Q490 850 480 680 Q475 470 495 220 L514 220 Q503 470 525 680 Q515 870 554 1000Z" fill="url(#bark)" opacity=".42"/>
  <g fill="none" stroke="#8b7953" strokeWidth={simple?6:10} strokeLinecap="round" opacity=".38"><path d="M498 470 Q360 350 150 330 M505 470 Q650 350 850 330 M497 330 Q405 210 300 170 M505 330 Q600 210 700 170 M500 650 Q345 550 200 520 M510 650 Q670 550 800 520"/></g>
  {leaves.map(([x,y],i)=><g key={i} transform={`translate(${x} ${y}) rotate(${i%2?35:-35})`}><ellipse rx="30" ry="13" fill={i%3?'#709b64':'#b7c88e'} opacity=".32"/><path d="M-24 0H24" stroke="#446946" opacity=".3"/></g>)}
  {!simple&&[[185,355],[815,355],[345,175],[655,175],[240,535],[760,535]].map(([x,y],i)=><g key={i} transform={`translate(${x} ${y})`} fill="#e5b9a4" opacity=".55">{[0,72,144,216,288].map(deg=><ellipse key={deg} cy="-7" rx="4" ry="7" transform={`rotate(${deg})`}/>)}<circle r="3" fill="#c69f45"/></g>)}
 </svg>;
}
