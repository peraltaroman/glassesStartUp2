// Frame Match: live 3D try-on prototype.
// Face tracking: MediaPipe Face Mesh (Apache-2.0), 3D: three.js (MIT). Both are vendored in /vendor and run on-device.
import * as THREE from './vendor/three/three.module.min.js';
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ---------- sample data ---------- */
const CATALOG0=[
 {id:'f01',name:'Harlow',brand:'Kestrel',shape:'rectangle',color:'Matte black',hex:'#1b1b1d',tone:'cool',val:'dark',price:189,stock:4,basic:false},
 {id:'f02',name:'Harlow',brand:'Kestrel',shape:'rectangle',color:'Tortoise',hex:'#6b3e1f',tone:'warm',val:'dark',price:189,stock:2,basic:false},
 {id:'f03',name:'Bea',brand:'Wren Optical',shape:'round',color:'Honey',hex:'#c08a3e',tone:'warm',val:'light',price:149,stock:3,basic:false},
 {id:'f04',name:'Bea',brand:'Wren Optical',shape:'round',color:'Crystal grey',hex:'#9aa3ad',tone:'cool',val:'light',price:149,stock:0,basic:false},
 {id:'f05',name:'Marlow',brand:'Harbor & Lane',shape:'square',color:'Navy',hex:'#1e2a55',tone:'cool',val:'dark',price:219,stock:2,basic:false},
 {id:'f06',name:'Marlow',brand:'Harbor & Lane',shape:'square',color:'Olive',hex:'#5d6236',tone:'warm',val:'mid',price:219,stock:1,basic:false},
 {id:'f07',name:'Celia',brand:'Wren Optical',shape:'cateye',color:'Burgundy',hex:'#6d1a2c',tone:'cool',val:'dark',price:169,stock:3,basic:false},
 {id:'f08',name:'Celia',brand:'Wren Optical',shape:'cateye',color:'Tortoise',hex:'#7a4622',tone:'warm',val:'dark',price:169,stock:2,basic:false},
 {id:'f09',name:'Pilot',brand:'Novo',shape:'aviator',color:'Gold',hex:'#c9a24a',tone:'warm',val:'light',price:239,stock:2,basic:false},
 {id:'f10',name:'Pilot',brand:'Novo',shape:'aviator',color:'Silver',hex:'#aab1ba',tone:'cool',val:'light',price:239,stock:3,basic:false},
 {id:'f11',name:'Facet',brand:'Novo',shape:'geometric',color:'Rose gold',hex:'#c98f7a',tone:'warm',val:'light',price:259,stock:1,basic:false},
 {id:'f12',name:'Facet',brand:'Novo',shape:'geometric',color:'Gunmetal',hex:'#4a4f57',tone:'cool',val:'mid',price:259,stock:2,basic:false},
 {id:'f13',name:'Dean',brand:'Harbor & Lane',shape:'browline',color:'Black / silver',hex:'#151515',tone:'cool',val:'dark',price:199,stock:3,basic:false},
 {id:'f14',name:'Dean',brand:'Harbor & Lane',shape:'browline',color:'Tortoise / gold',hex:'#6b3e1f',tone:'warm',val:'dark',price:199,stock:0,basic:false},
 {id:'f15',name:'Ivy',brand:'Kestrel',shape:'oval',color:'Blush',hex:'#d79aa0',tone:'cool',val:'light',price:129,stock:4,basic:false},
 {id:'f16',name:'Ivy',brand:'Kestrel',shape:'oval',color:'Champagne',hex:'#d2bb8c',tone:'warm',val:'light',price:129,stock:2,basic:false},
 {id:'f17',name:'Everyday 1',brand:'Practice Basics',shape:'rectangle',color:'Grey',hex:'#6f737a',tone:'neutral',val:'mid',price:89,stock:8,basic:true},
 {id:'f18',name:'Everyday 2',brand:'Practice Basics',shape:'oval',color:'Brown',hex:'#5a3d2b',tone:'warm',val:'dark',price:89,stock:6,basic:true},
 {id:'f19',name:'Everyday 3',brand:'Practice Basics',shape:'round',color:'Black',hex:'#1a1a1a',tone:'cool',val:'dark',price:89,stock:5,basic:true},
 {id:'f20',name:'Sol',brand:'Wren Optical',shape:'square',color:'Caramel',hex:'#a0612d',tone:'warm',val:'mid',price:159,stock:2,basic:false},
 {id:'f21',name:'Tide',brand:'Kestrel',shape:'round',color:'Teal',hex:'#1f6f75',tone:'cool',val:'mid',price:179,stock:1,basic:false},
 {id:'f22',name:'Vera',brand:'Harbor & Lane',shape:'cateye',color:'Taupe',hex:'#8c7a6b',tone:'neutral',val:'mid',price:209,stock:2,basic:false},
 {id:'f23',name:'Atlas',brand:'Novo',shape:'rectangle',color:'Gunmetal',hex:'#4a4f57',tone:'cool',val:'mid',price:279,stock:1,basic:false},
 {id:'f24',name:'Juno',brand:'Kestrel',shape:'oval',color:'Slate',hex:'#56616e',tone:'neutral',val:'mid',price:139,stock:3,basic:false},
];
const PLANS0=[
 {id:'a',name:'Vision plan A',allow:150,disc:20},
 {id:'b',name:'Vision plan B',allow:130,disc:20},
 {id:'c',name:'Vision plan C',allow:100,disc:0},
 {id:'basic',name:'Basic coverage',allow:0,disc:0},
 {id:'none',name:'No insurance (self-pay)',allow:0,disc:0},
];
// lens width - bridge - temple length, in mm, as printed inside the temple arm
const SIZE0={rectangle:'54-17-140',round:'48-21-145',square:'52-18-145',cateye:'53-17-140',aviator:'58-14-140',geometric:'50-20-145',browline:'51-20-145',oval:'50-19-140'};
CATALOG0.forEach(f=>f.size=f.basic?'52-18-140':SIZE0[f.shape]);
const clone=o=>JSON.parse(JSON.stringify(o));
let catalog=clone(CATALOG0),plans=clone(PLANS0);
try{const s=JSON.parse(localStorage.getItem('frame-match-settings')||'null');if(s&&s.catalog&&s.plans){catalog=s.catalog;plans=s.plans}}catch(e){}
const save=()=>{try{localStorage.setItem('frame-match-settings',JSON.stringify({catalog,plans}))}catch(e){}};
const parseSize=s=>{const m=String(s||'').match(/(\d{2})\D+(\d{2})(?:\D+(\d{3}))?/);return m?{lens:+m[1],bridge:+m[2],temple:+(m[3]||140)}:{lens:52,bridge:18,temple:140}};
const frameMm=f=>{const z=parseSize(f.size);return 2*z.lens+z.bridge+10}; // + ~5 mm end piece each side

/* ---------- frame photos (kept in this browser's IndexedDB) ---------- */
const photos={}; // id -> {img,w,h,lensY,hex}
const sides={};  // id -> {img,lenPx,hPx,offPx}
let db=null;
function idb(){return new Promise(res=>{try{const r=indexedDB.open('frame-match',1);r.onupgradeneeded=()=>r.result.createObjectStore('photos');r.onsuccess=()=>res(r.result);r.onerror=()=>res(null);}catch(e){res(null)}});}
function idbAll(){return new Promise(res=>{if(!db)return res([]);try{const out=[],tx=db.transaction('photos').objectStore('photos').openCursor();tx.onsuccess=e=>{const c=e.target.result;if(c){out.push([c.key,c.value]);c.continue()}else res(out)};tx.onerror=()=>res([]);}catch(e){res([])}});}
function idbPut(k,v){try{if(db)db.transaction('photos','readwrite').objectStore('photos').put(v,k)}catch(e){}}
function idbDel(k){try{if(db)db.transaction('photos','readwrite').objectStore('photos').delete(k)}catch(e){}}
async function useSide(id,rec){const img=new Image();img.src=rec.url;await img.decode();sides[id]={img,lenPx:rec.lenPx,hPx:rec.hPx,offPx:rec.offPx};models.clear();}
const models=new Map();
async function usePhoto(id,rec){models.clear();const img=new Image();img.src=rec.url;await img.decode();photos[id]={img,w:img.naturalWidth,h:img.naturalHeight,lensY:rec.lensY,hex:rec.hex};}

/* ---------- style rules ---------- */
const SHAPES=['oval','round','square','oblong','heart','diamond'];
const FRAME_LABEL={rectangle:'rectangle',round:'round',square:'square',cateye:'cat-eye',aviator:'aviator',geometric:'geometric',browline:'browline',oval:'oval'};
// 2 = strong fit, 1 = good, 0 = neutral, -2 = works against the face
const FIT={
 oval:{rectangle:2,square:1,geometric:2,aviator:2,browline:1,cateye:1,round:1,oval:0},
 round:{rectangle:2,square:2,geometric:2,browline:1,cateye:1,aviator:0,oval:-2,round:-2},
 square:{round:2,oval:2,aviator:1,cateye:1,browline:0,geometric:0,rectangle:-2,square:-2},
 oblong:{square:2,aviator:2,browline:2,round:1,geometric:1,cateye:0,oval:0,rectangle:-2},
 heart:{aviator:2,oval:2,round:1,rectangle:1,geometric:0,square:0,browline:-2,cateye:-2},
 diamond:{cateye:2,oval:2,browline:2,round:1,square:0,aviator:0,geometric:0,rectangle:-2},
};
const WHY_SHAPE={
 oval:'balanced proportions suit most shapes',round:'angles add definition to soft curves',square:'curves soften a strong jaw',
 oblong:'deep frames shorten a long face',heart:'light bottoms balance a wider forehead',diamond:'top-weighted frames widen the brow line'};

let profile={shape:'oval',tone:'neutral',depth:'medium',detected:false,skin:null};
let selected=null,showAll=false;

/* ---------- frame drawing (canvas) ---------- */
const LENS_H={round:.9,oval:.68,rectangle:.5,square:.8,cateye:.62,aviator:.86,geometric:.82,browline:.64};
function lensPath(c,shape,w,h){
  c.beginPath();
  if(shape==='round'||shape==='oval'){c.ellipse(0,0,w/2,h/2,0,0,Math.PI*2);}
  else if(shape==='rectangle'||shape==='square'){const r=h*.2;c.roundRect(-w/2,-h/2,w,h,r);}
  else if(shape==='browline'){c.roundRect(-w/2,-h/2,w,h,[h*.12,h*.12,h*.45,h*.45]);}
  else if(shape==='cateye'){c.moveTo(-w*.5,-h*.3);c.quadraticCurveTo(0,-h*.55,w*.52,-h*.62);c.quadraticCurveTo(w*.58,-h*.05,w*.32,h*.38);c.quadraticCurveTo(0,h*.58,-w*.38,h*.36);c.quadraticCurveTo(-w*.56,h*.05,-w*.5,-h*.3);c.closePath();}
  else if(shape==='aviator'){c.moveTo(-w*.46,-h*.42);c.lineTo(w*.44,-h*.47);c.quadraticCurveTo(w*.6,-h*.3,w*.4,h*.15);c.quadraticCurveTo(w*.12,h*.6,-w*.24,h*.5);c.quadraticCurveTo(-w*.56,h*.32,-w*.46,-h*.42);c.closePath();}
  else if(shape==='geometric'){c.moveTo(-w/2,0);c.lineTo(-w/4,-h/2);c.lineTo(w/4,-h/2);c.lineTo(w/2,0);c.lineTo(w/4,h/2);c.lineTo(-w/4,h/2);c.closePath();}
}
function drawFrame(c,f,cx,cy,W,ang){
  const lw=W*.4,br=W*.12,lh=lw*LENS_H[f.shape],off=br/2+lw/2,metal=/aviator|geometric/.test(f.shape)||/gold|silver/i.test(f.color)&&f.shape!=='browline';
  const t=metal?Math.max(1.5,W*.012):Math.max(2.5,W*.03);
  c.save();c.translate(cx,cy);c.rotate(ang);c.lineJoin='round';c.lineCap='round';
  for(const s of [-1,1]){
    c.save();c.translate(s*off,0);c.scale(s,1);lensPath(c,f.shape,lw,lh);
    c.fillStyle='rgba(200,220,255,.10)';c.fill();
    if(f.shape==='browline'){c.strokeStyle='#9aa0a8';c.lineWidth=Math.max(1.2,W*.008);c.stroke();
      c.beginPath();c.moveTo(-lw/2,-lh*.18);c.quadraticCurveTo(-lw/2,-lh/2,-lw*.3,-lh/2);c.lineTo(lw*.36,-lh/2);c.quadraticCurveTo(lw/2,-lh/2,lw/2,-lh*.1);
      c.strokeStyle=f.hex;c.lineWidth=W*.045;c.stroke();}
    else{c.strokeStyle=f.hex;c.lineWidth=t;c.stroke();
      c.strokeStyle='rgba(255,255,255,.28)';c.lineWidth=Math.max(.6,t*.25);c.beginPath();c.ellipse(0,0,lw*.36,lh*.36,0,Math.PI*1.1,Math.PI*1.45);c.stroke();}
    c.restore();
  }
  // bridge and temples
  c.strokeStyle=f.shape==='browline'?f.hex:f.hex;c.lineWidth=metal?t:t*.8;
  c.beginPath();c.moveTo(-br/2-1,-lh*.2);c.quadraticCurveTo(0,-lh*.38,br/2+1,-lh*.2);c.stroke();
  if(f.shape==='aviator'){c.beginPath();c.moveTo(-br/2,-lh*.44);c.lineTo(br/2,-lh*.44);c.stroke();}
  c.beginPath();c.moveTo(-W/2+W*.02,-lh*.3);c.lineTo(-W/2-W*.02,-lh*.28);c.moveTo(W/2-W*.02,-lh*.3);c.lineTo(W/2+W*.02,-lh*.28);c.lineWidth=t;c.stroke();
  c.restore();
}

/* ---------- face outline for manual mode ---------- */
const OUTLINE={oval:[1.45,.9,.78,.3],round:[1.15,.9,.88,.42],square:[1.2,.97,.98,.58],oblong:[1.7,.92,.88,.42],heart:[1.4,1.0,.66,.16],diamond:[1.45,.7,.7,.2]};
const SKIN={light:{warm:'#f1cfae',cool:'#f0c9c2',neutral:'#efcbb5'},medium:{warm:'#c98f5e',cool:'#c08a76',neutral:'#c58d6a'},deep:{warm:'#7a4a2a',cool:'#6e4436',neutral:'#744830'}};
function drawOutline(c,W,H){
  const [L,fw,jw,ch]=OUTLINE[profile.shape],cw=Math.min(W*.3,H*.42/L),fl=L*cw,cx=W/2,cy=H*.48;
  const pts=[[0,-.5*fl],[fw*.62*cw,-.48*fl],[fw*cw,-.3*fl],[cw,-.04*fl],[jw*cw,.27*fl],[ch*cw,.47*fl],[0,.5*fl]];
  const all=pts.concat(pts.slice(1,-1).reverse().map(([x,y])=>[-x,y]));
  c.save();c.translate(cx,cy);c.beginPath();
  const mid=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];let m=mid(all[all.length-1],all[0]);c.moveTo(m[0],m[1]);
  for(let i=0;i<all.length;i++){const p=all[i],n=all[(i+1)%all.length],q=mid(p,n);c.quadraticCurveTo(p[0],p[1],q[0],q[1]);}
  c.closePath();
  const skin=profile.skin||SKIN[profile.depth][profile.tone];
  const g=c.createLinearGradient(-cw,0,cw,0);g.addColorStop(0,shade(skin,-.12));g.addColorStop(.45,skin);g.addColorStop(1,shade(skin,-.18));
  c.fillStyle=g;c.fill();c.strokeStyle='rgba(0,0,0,.18)';c.lineWidth=1.5;c.stroke();
  // features
  const ey=-.06*fl,ex=cw*.4;c.fillStyle='rgba(20,20,30,.55)';
  for(const s of[-1,1]){c.beginPath();c.ellipse(s*ex,ey,cw*.11,cw*.05,0,0,Math.PI*2);c.fill();}
  c.strokeStyle='rgba(60,30,20,.35)';c.lineWidth=2;c.beginPath();c.moveTo(0,ey+cw*.12);c.quadraticCurveTo(cw*.08,.12*fl,0,.15*fl);c.stroke();
  c.beginPath();c.moveTo(-cw*.2,.29*fl);c.quadraticCurveTo(0,.33*fl,cw*.2,.29*fl);c.stroke();
  c.restore();
  return {cx,cy:cy+ey,W:cw*1.95,ang:0};
}
function shade(hex,k){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const f=v=>Math.round(Math.max(0,Math.min(255,k<0?v*(1+k):v+(255-v)*k)));return '#'+[f(r),f(g),f(b)].map(v=>v.toString(16).padStart(2,'0')).join('');}

function drawPhotoFrame(c,f,ph,cx,cy,Wpx,ang,cosY,shadow){
  const Hpx=Wpx*ph.h/ph.w;
  c.save();c.translate(cx,cy);c.rotate(ang);c.scale(cosY,1);
  if(shadow){c.shadowColor='rgba(0,0,0,.38)';c.shadowBlur=shadow*2;c.shadowOffsetY=shadow*1.2;}
  // pupil sits a little above the lens centre (typical fitting height)
  c.drawImage(ph.img,-Wpx/2,-ph.lensY*Hpx+Hpx*.04,Wpx,Hpx);
  c.restore();
}
function drawAny(c,f,cx,cy,W,ang,cosY=1,shadow=0){
  const ph=photos[f.id];
  if(ph)drawPhotoFrame(c,f,ph,cx,cy,W,ang,cosY,shadow);
  else{c.save();if(shadow){c.shadowColor='rgba(0,0,0,.35)';c.shadowBlur=shadow*2;c.shadowOffsetY=shadow*1.2;}
    c.translate(cx,cy);c.rotate(ang);c.scale(cosY,1);drawFrame(c,f,0,0,W,0);c.restore();}
}

/* ---------- state ---------- */
let face=null;   // finished face analysis {faceMm, ...} used for size fit
let trk=null;    // latest raw tracking result
let pose=null;   // smoothed pose in source pixels {mid,iris,pupilPx,pxmm,q}
let mode='none'; // none | live | image
let srcImg=null,stream=null;
const cv=$('tryon'),video=$('cam'),stage=$('stage');
const status=(t,err)=>{$('status').textContent=t;$('status').className='status'+(err?' err':'');};

/* ---------- 3D ---------- */
let GL=null;
function gl(){
  if(GL!==null)return GL;
  try{const r=new THREE.WebGLRenderer({canvas:$('gl'),alpha:true,antialias:true,preserveDrawingBuffer:true});r.setClearColor(0,0);
    GL={r,scene:new THREE.Scene(),cam:new THREE.OrthographicCamera(0,1,0,-1,-20000,20000)};}
  catch(e){GL=false}
  return GL;
}
function texOf(img){const t=new THREE.Texture(img);t.colorSpace=THREE.SRGBColorSpace;t.needsUpdate=true;t.anisotropy=8;return t;}
// Frames without photos get a generated front, drawn from their shape and colour.
const synthCache=new Map();
function synthPhoto(f){
  const key=[f.id,f.shape,f.hex,f.color].join('|');let s=synthCache.get(key);if(s)return s;
  const W=1000,cw=Math.round(W*1.08),ch=Math.round(W*.5),c=document.createElement('canvas');c.width=cw;c.height=ch;
  drawFrame(c.getContext('2d'),f,cw/2,ch/2,W,0);
  s={img:c,w:cw,h:ch,lensY:.5,hex:f.hex};synthCache.set(key,s);return s;
}
/* Photo (or generated) front with thickness and face-form wrap, arms from the side photo,
   and an invisible head shape that hides whatever goes behind the head. Units: mm. Origin: between the pupils. */
// Find where the arms attach, from the front image itself: the outermost opaque pixels on each side
// (the end pieces). Works the same for photographed and generated fronts, whatever the frame shape.
function alphaOf(img,w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(img,0,0,w,h);return x.getImageData(0,0,w,h).data;}
function hingesOf(ph){
  if(ph.hinges)return ph.hinges;
  const k=Math.min(1,600/ph.w),w=Math.max(8,Math.round(ph.w*k)),h=Math.max(4,Math.round(ph.h*k)),a=alphaOf(ph.img,w,h),A=(x,y)=>a[(y*w+x)*4+3]>128;
  const side=dir=>{let edge=-1;
    for(let i=0;i<w&&edge<0;i++){const x=dir<0?i:w-1-i;for(let y=0;y<h;y++)if(A(x,y)){edge=x;break;}}
    if(edge<0)return{x:dir<0?0:1,y:.4};
    const band=Math.max(2,Math.round(w*.025)),rows=[];
    for(let i=0;i<band;i++){const x=edge-dir*i;if(x<0||x>=w)break;for(let y=0;y<h;y++)if(A(x,y))rows.push(y);}
    rows.sort((p,q)=>p-q);const top=rows[0],mid=rows[rows.length>>1];
    // hinges sit in the upper part of the end piece
    return{x:(edge+.5)/w,y:(Math.min(mid,top+(mid-top)*.6)+.5)/h};};
  return ph.hinges={L:side(-1),R:side(1)};
}
// Where the arm's front end is in the side image (vertical centre of its first few millimetres).
function armStartOf(sd){
  if(sd.start!=null)return sd.start;
  const w=sd.img.naturalWidth||sd.img.width,h=sd.img.naturalHeight||sd.img.height,a=alphaOf(sd.img,w,h),rows=[];
  for(let x=0;x<Math.max(3,Math.round(w*.03));x++)for(let y=0;y<h;y++)if(a[(y*w+x)*4+3]>128)rows.push(y);
  rows.sort((p,q)=>p-q);return sd.start=rows.length?(rows[rows.length>>1]+.5)/h:.5;
}
function buildModel(f){
  const ph=photos[f.id]||synthPhoto(f),sd=sides[f.id],z=parseSize(f.size),Wmm=frameMm(f),Hmm=Wmm*ph.h/ph.w,WRAP=240;
  const root=new THREE.Group(),k=new THREE.Group();root.add(k);k.position.z=12; // refined per face in fitModel
  const frontY=-(Hmm/2-ph.lensY*Hmm)-.04*Hmm,frameTop=frontY+Hmm/2,tex=texOf(ph.img);
  const geo=new THREE.PlaneGeometry(Wmm,Hmm,32,1),pos=geo.attributes.position;
  for(let i=0;i<pos.count;i++){const x=pos.getX(i);pos.setZ(i,-x*x/(2*WRAP));}
  for(let i=12;i>=0;i--){ // stacked layers give visible rim thickness at an angle
    const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map:tex,transparent:true,side:THREE.DoubleSide,alphaTest:i?.5:.02,depthWrite:!!i,color:i?0x5a5a5a:0xffffff}));
    m.position.set(0,frontY,-i*.25);m.renderOrder=i?1:3;k.add(m);
  }
  // hinges sit exactly on each end piece of the wrapped front, found from the image, so every arm starts where the front ends
  const hg=hingesOf(ph),arms=[],wrapZ=x=>-(x*x)/(2*WRAP);
  for(const s of[-1,1]){
    const H=s<0?hg.L:hg.R,hx=(H.x-.5)*Wmm-s*1.2,hy=frontY+Hmm/2-H.y*Hmm,hz=wrapZ(hx)-1.6;
    const piv=new THREE.Group();piv.rotation.order='YXZ';piv.position.set(hx,hy,hz);k.add(piv);
    const arm={s,piv,photo:!!sd};
    if(sd){const sc=z.temple*.96/sd.lenPx,L=sd.lenPx*sc,Ha=sd.hPx*sc,st=armStartOf(sd);
      const g=new THREE.PlaneGeometry(L,Ha);g.rotateY(Math.PI/2);
      const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({map:texOf(sd.img),transparent:true,alphaTest:.5,side:THREE.DoubleSide}));
      m.position.set(0,st*Ha-Ha/2,-L/2+1.5);m.renderOrder=1;piv.add(m); // starts 1.5 mm inside the end piece: no gap
    }else{const mat=new THREE.MeshBasicMaterial({color:new THREE.Color(ph.hex)});
      const knuckle=new THREE.Mesh(new THREE.BoxGeometry(3,4.6,4),mat);knuckle.position.set(0,0,0);
      const straight=new THREE.Mesh(new THREE.BoxGeometry(2.4,4.2,1),mat),tail=new THREE.Group(),tm=new THREE.Mesh(new THREE.BoxGeometry(2.2,3.6,1),mat);
      tail.add(tm);piv.add(knuckle,straight,tail);knuckle.renderOrder=straight.renderOrder=tm.renderOrder=1;Object.assign(arm,{straight,tail,tm,temple:z.temple});}
    arms.push(arm);
  }
  // occluders: the person's own face surface (updated every frame) and a head shape behind it
  const faceGeo=new THREE.BufferGeometry();faceGeo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(478*3),3));
  if(FACE_TRIS)faceGeo.setIndex(FACE_TRIS);
  const occ=new THREE.MeshBasicMaterial({colorWrite:false,side:THREE.DoubleSide});
  const faceOcc=new THREE.Mesh(faceGeo,occ);faceOcc.renderOrder=0;faceOcc.visible=false;faceOcc.frustumCulled=false;root.add(faceOcc);
  const head=new THREE.Mesh(new THREE.SphereGeometry(1,40,24),occ);head.renderOrder=0;root.add(head);
  root.userData={k,arms,head,faceOcc};
  fitModel(root,null);
  return root;
}
// Default head when no face is tracked (3D view): ears ~72 mm out, ~70 mm back.
const DEFAULT_EARS={L:new THREE.Vector3(-72,-4,-72),R:new THREE.Vector3(72,-4,-72)};
const _t=new THREE.Vector3();
function aimArm(arm,target,k){
  // hinge position in root space -> direction to the point where the arm should rest on the ear
  const h=_t.set(arm.piv.position.x,arm.piv.position.y,arm.piv.position.z+k.position.z),t=target.clone();
  // keep the ear point plausible relative to the hinge: behind it, not inside the frame width, near hinge height
  t.z=Math.min(t.z,h.z-60);t.x=arm.s>0?Math.max(t.x,h.x+2):Math.min(t.x,h.x-2);t.y=Math.max(h.y-6,Math.min(h.y+12,t.y));
  const d=t.sub(h);
  const flat=Math.hypot(d.x,d.z);
  arm.piv.rotation.set(Math.atan2(d.y,flat),Math.atan2(-d.x,-d.z),0);
  if(arm.straight){const L=Math.max(arm.temple-40,Math.min(arm.temple-18,d.length()+4)); // the bend behind the ear is ~25-40 mm
    arm.straight.scale.z=L+1.5;arm.straight.position.z=-L/2+.75;
    const T=arm.temple-L;arm.tail.position.z=-L;arm.tail.rotation.x=-.75;arm.tm.scale.z=T;arm.tm.position.z=-T/2;}
}
// Fit the frame to this face: front rests on the nose bridge, arms aim at the ears, occluders follow the head.
function fitModel(root,loc){
  const u=root.userData;
  if(!loc){u.k.position.z=12;u.faceOcc.visible=false;u.head.scale.set(66,100,90);u.head.position.set(0,-12,-88);
    for(const a of u.arms)aimArm(a,a.s<0?DEFAULT_EARS.L:DEFAULT_EARS.R,u.k);return;}
  const P=i=>new THREE.Vector3(loc[i*3],loc[i*3+1],loc[i*3+2]);
  const bridge=P(168);u.k.position.z=Math.max(6,Math.min(22,bridge.z+5));
    const eL=P(234),eR=P(454);
  // Where the arm rests: the top of the ear root. The mesh stops in front of the ear; its contour point 127/356
  // sits at the top of the tragus, and the ear root is ~14 mm above that and ~15 mm further back.
  const tL=P(127),tR=P(356);
  const ears={L:new THREE.Vector3(tL.x-2,tL.y+14,tL.z-15),R:new THREE.Vector3(tR.x+2,tR.y+14,tR.z-15)};
  for(const a of u.arms)aimArm(a,a.s<0?ears.L:ears.R,u.k);
  const half=(eR.x-eL.x)/2;
  u.head.scale.set(Math.max(50,half-3),105,85);u.head.position.set((eR.x+eL.x)/2,(eL.y+eR.y)/2-8,(eL.z+eR.z)/2-35);
  if(FACE_TRIS){const a=u.faceOcc.geometry.attributes.position;
    for(let i=0;i<478;i++){a.array[i*3]=loc[i*3]*.88;a.array[i*3+1]=loc[i*3+1];a.array[i*3+2]=loc[i*3+2]-4;}
    a.needsUpdate=true;u.faceOcc.visible=true;}
}
// triangles of the face mesh, rebuilt from MediaPipe's tessellation edge list
const FACE_TRIS=(()=>{const E=window.FACEMESH_TESSELATION;if(!E)return null;
  const adj=Array.from({length:478},()=>new Set());for(const [a,b] of E){adj[a].add(b);adj[b].add(a);}
  const tris=[];for(let a=0;a<478;a++)for(const b of adj[a])if(b>a)for(const c of adj[b])if(c>b&&adj[a].has(c))tris.push(a,b,c);
  return tris;})();
let glSize='';
function render3D(f,p,W,H){
  const G=gl();if(!G)return false;
  const key=W+'x'+H;if(key!==glSize){glSize=key;G.r.setPixelRatio(window.devicePixelRatio||1);G.r.setSize(W,H,false);
    G.cam.left=0;G.cam.right=W;G.cam.top=0;G.cam.bottom=-H;G.cam.updateProjectionMatrix();}
  G.scene.clear();
  if(f){let m=models.get(f.id);if(!m){m=buildModel(f);models.set(f.id,m);}
    fitModel(m,p.loc||null);m.position.set(p.cx,-p.cy,0);m.scale.setScalar(p.pxmm);m.quaternion.copy(p.q);G.scene.add(m);}
  G.r.render(G.scene,G.cam);return true;
}
function clear3D(){const G=gl();if(G){G.scene.clear();G.r.clear();}}

/* ---------- face geometry from MediaPipe Face Mesh (478 points incl. irises) ---------- */
const V3=THREE.Vector3;
const IRIS_MM=11.7;   // adult iris diameter is close to constant
const PITCH0=-14*Math.PI/180; // calibration: the forehead–chin line leans ~14° toward the camera on a level head
const MAT_TRANSPOSE=false;
// MediaPipe's canonical face model is tilted ~18° relative to the line glasses sit on (eyes to ear tops)
const MAT_PITCH0=-18*Math.PI/180;
function derive(lm,w,h,mat){
  const p=i=>({x:lm[i].x*w,y:lm[i].y*h,z:lm[i].z*w}),d3=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
  const iA=p(468),iB=p(473),dia=(a,b,c,e)=>(d3(p(a),p(b))+d3(p(c),p(e)))/2;
  const iris=(dia(469,471,470,472)+dia(474,476,475,477))/2,pupilPx=d3(iA,iB);
  const v=(a,b)=>new V3(b.x-a.x,-(b.y-a.y),-(b.z-a.z)); // to y-up, z-toward-camera
  const r=v(p(33),p(263)).normalize(),u0=v(p(152),p(10)).normalize(),fw=new V3().crossVectors(r,u0).normalize(),u=new V3().crossVectors(fw,r).normalize();
  let q;
  if(mat){const M=new THREE.Matrix4().fromArray(mat);if(MAT_TRANSPOSE)M.transpose();q=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().extractRotation(M));
    q.multiply(new THREE.Quaternion().setFromAxisAngle(new V3(1,0,0),MAT_PITCH0));}
  else{q=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(r,u,fw));
    if(PITCH0)q.multiply(new THREE.Quaternion().setFromAxisAngle(new V3(1,0,0),PITCH0));}
  const qLm=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(r,u,fw)).multiply(new THREE.Quaternion().setFromAxisAngle(new V3(1,0,0),PITCH0));
  const cheek=d3(p(234),p(454)),jaw=d3(p(172),p(397)),fore=d3(p(54),p(284)),len=d3(p(10),p(152));
  const c=p(152),a1=p(148),a2=p(377),va={x:a1.x-c.x,y:a1.y-c.y},vb={x:a2.x-c.x,y:a2.y-c.y};
  const chin=Math.acos((va.x*vb.x+va.y*vb.y)/(Math.hypot(va.x,va.y)*Math.hypot(vb.x,vb.y)))*180/Math.PI;
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const l of lm){const X=l.x*w,Y=l.y*h;if(X<x0)x0=X;if(X>x1)x1=X;if(Y<y0)y0=Y;if(Y>y1)y1=Y;}
  const pitchDeg=Math.atan2(u0.z,u0.y)*180/Math.PI;
  // every landmark in head-local coordinates (source px, origin between the pupils, head pose removed)
  const inv=q.clone().invert(),mx=(iA.x+iB.x)/2,my=(iA.y+iB.y)/2,mz=(iA.z+iB.z)/2,locPx=new Float32Array(lm.length*3),t=new V3();
  for(let i=0;i<lm.length;i++){t.set(lm[i].x*w-mx,-(lm[i].y*h-my),-(lm[i].z*w-mz)).applyQuaternion(inv);locPx[i*3]=t.x;locPx[i*3+1]=t.y;locPx[i*3+2]=t.z;}
  const e=new THREE.Euler().setFromQuaternion(q,'YXZ');
  return{qLm,hasMat:!!mat,mid:{x:mx,y:my},iris,pupilPx,q,cheek,jaw,fore,len,chin,box:{x:x0,y:y0,w:x1-x0,h:y1-y0},pitchDeg,locPx,yaw:e.y,pitch:e.x,
    pdMm:pupilPx/(iris/IRIS_MM)};
}
const pdManual=()=>{const v=+$('pd').value;return v>=45&&v<=80?v:0};
function scaleOf(n){const pd=pdManual();return pd?n.pupilPx/pd:n.iris/IRIS_MM;} // source px per mm
// light adaptive smoothing: steady when still, quick when moving
function smoothPose(n){
  const px=scaleOf(n);
  const N=n.locPx.length,cur=new Float32Array(N);for(let i=0;i<N;i++)cur[i]=n.locPx[i]/px;
  if(!pose){pose={mid:{...n.mid},pxmm:px,q:n.q.clone(),iris:n.iris,loc:cur};return;}
  for(let i=0;i<N;i++)pose.loc[i]+=(cur[i]-pose.loc[i])*.25;
  const sp=Math.hypot(n.mid.x-pose.mid.x,n.mid.y-pose.mid.y)/Math.max(1,pose.iris),a=Math.min(.9,.3+sp*.5);
  pose.mid.x+=(n.mid.x-pose.mid.x)*a;pose.mid.y+=(n.mid.y-pose.mid.y)*a;
  pose.pxmm+=(px-pose.pxmm)*Math.min(a,.25);pose.iris+=(n.iris-pose.iris)*.3;pose.q.slerp(n.q,a);
}

/* ---------- face-shape measurement ----------
   The face outline (MediaPipe's 36-point face oval) is taken in head-local millimetres, so head turn and tilt
   don't distort it. From it: length, the width profile from forehead to chin, and the jaw-corner angle. */
const OVAL=(()=>{const E=window.FACEMESH_FACE_OVAL;if(!E)return null;const nx=new Map();for(const [a,b] of E){if(!nx.has(a))nx.set(a,[]);if(!nx.has(b))nx.set(b,[]);nx.get(a).push(b);nx.get(b).push(a);}
  const out=[10];let prev=-1,cur=10;for(let k=0;k<64;k++){const n=nx.get(cur).find(v=>v!==prev);if(n===10||n==null)break;out.push(n);prev=cur;cur=n;}return out;})();
function shapeFeatures(loc){
  const X=i=>loc[i*3],Y=i=>loc[i*3+1],poly=OVAL.map(i=>[X(i),Y(i)]),top=Y(10),bot=Y(152),L=top-bot;
  const widthAt=t=>{const y=top-t*L;let lo=1e9,hi=-1e9;for(let k=0;k<poly.length;k++){const [x1,y1]=poly[k],[x2,y2]=poly[(k+1)%poly.length];
    if((y1-y)*(y2-y)<=0&&y1!==y2){const x=x1+(y-y1)/(y2-y1)*(x2-x1);if(x<lo)lo=x;if(x>hi)hi=x;}}return hi>lo?hi-lo:0;};
  const prof=[];for(let t=.05;t<.96;t+=.05)prof.push(widthAt(t));
  const W=Math.max(...prof),tmax=(prof.indexOf(W)+1)*.05;
  const ang=(a,b,c)=>{const v1=[X(a)-X(b),Y(a)-Y(b)],v2=[X(c)-X(b),Y(c)-Y(b)];return Math.acos((v1[0]*v2[0]+v1[1]*v2[1])/(Math.hypot(...v1)*Math.hypot(...v2)))*180/Math.PI;};
  const jawAng=(ang(234,172,152)+ang(454,397,152))/2;
  return{L,W,R:L/W,F:widthAt(.15)/W,J:widthAt(.72)/W,Ch:widthAt(.88)/W,tmax,jawAng,fore:widthAt(.15),jaw:widthAt(.72),prof:prof.map(v=>v/W),poly:poly.map(([x,y])=>[x/W,(y-top)/W])};
}
/* ---------- analysis: face shape, skin tone, PD ---------- */
let samples=[],pdHist=[],analysed=false;
const med=a=>{const s=[...a].sort((x,y)=>x-y);return s[s.length>>1]};
// Each shape is a typical point in (length/width, forehead, jaw, chin widths, jaw-corner angle); the face gets a
// closeness score to every shape, so in-between faces read as a mix instead of being forced into one box.
const PROTO={oval:[1.18,.94,.80,.54,140],round:[1.02,.95,.82,.56,145],square:[1.06,.96,.87,.60,134],
  oblong:[1.34,.93,.85,.57,138],heart:[1.10,.99,.74,.48,144],diamond:[1.16,.88,.76,.50,141]};
const SIG=[.08,.03,.035,.035,4];
function classifyMix(f){
  const v=[f.R,f.F,f.J,f.Ch,f.jawAng],e={};let tot=0;
  for(const k of SHAPES){const d2=PROTO[k].reduce((a,p,i)=>a+((v[i]-p)/SIG[i])**2,0);e[k]=Math.exp(-d2/4);tot+=e[k];}
  const mix={};for(const k of SHAPES)mix[k]=e[k]/tot;
  const shape=SHAPES.reduce((a,b)=>mix[b]>mix[a]?b:a);
  return{mix,shape};
}
function sampleSkin(lm,w,h,iris){
  const oc=document.createElement('canvas');oc.width=w;oc.height=h;const c=oc.getContext('2d',{willReadFrequently:true});
  c.drawImage(mode==='live'?video:srcImg,0,0,w,h);
  const rad=Math.max(2,Math.round(iris*.6)),px=[];
  for(const i of[50,280,151]){const x0=Math.max(0,Math.round(lm[i].x*w-rad)),y0=Math.max(0,Math.round(lm[i].y*h-rad)),ww=Math.min(rad*2,w-x0),hh=Math.min(rad*2,h-y0);if(ww<1||hh<1)continue;
    const d=c.getImageData(x0,y0,ww,hh).data;for(let k=0;k<d.length;k+=4)px.push([d[k],d[k+1],d[k+2]]);}
  if(!px.length)return null;
  px.sort((a,b)=>(a[0]+a[1]+a[2])-(b[0]+b[1]+b[2]));const mid=px.slice(Math.floor(px.length*.25),Math.ceil(px.length*.8));
  const m=[0,1,2].map(k=>Math.round(mid.reduce((s,p)=>s+p[k],0)/mid.length));
  const lab=srgb2lab(...m),ita=Math.atan2(lab.L-50,lab.b)*180/Math.PI,hue=Math.atan2(lab.b,lab.a)*180/Math.PI;
  return{hex:'#'+m.map(v=>v.toString(16).padStart(2,'0')).join(''),lab,ita,hue,depth:ita>41?'light':ita>10?'medium':'deep',tone:hue>=60?'warm':hue<=48?'cool':'neutral'};
}
const NEED=30;
function addSample(n,lm,w,h){
  pdHist.push(n.pdMm);if(pdHist.length>60)pdHist.shift();
  if(analysed)return;
  const live=mode==='live';
  if(live&&(Math.abs(n.yaw)>.38||Math.abs(n.pitch)>.4)){status('Look straight at the camera to measure the face shape…');return;}
  const sc=scaleOf(n),loc=n.locPx.map(v=>v/sc),f=shapeFeatures(loc);
  samples.push(f);
  const need=live?NEED:1;
  if(samples.length<need){status('Hold still: measuring face shape and skin tone… '+Math.round(samples.length/need*100)+'%');return;}
  const m={};for(const k of['L','W','R','F','J','Ch','jawAng','fore','jaw','tmax'])m[k]=med(samples.map(s=>s[k]));
  m.poly=f.poly;const{mix,shape}=classifyMix(m),skin=sampleSkin(lm,w,h,n.iris);
  analysed=true;face={faceMm:m.W,m};
  profile.shape=shape;profile.mix=mix;profile.trace=m.poly;$('detShape').hidden=false;
  if(skin){profile.tone=skin.tone;profile.depth=skin.depth;profile.skin=skin.hex;$('detTone').hidden=false;$('detDepth').hidden=false;}
  const top=SHAPES.slice().sort((a,b)=>mix[b]-mix[a]);
  $('measureBody').innerHTML=`<p>Face ${Math.round(m.W)} mm wide × ${Math.round(m.L)} mm long (eyebrow-line forehead to chin) · forehead ${Math.round(m.fore)} mm · jaw ${Math.round(m.jaw)} mm · jaw-corner angle ${Math.round(m.jawAng)}° · widest at ${Math.round(m.tmax*100)}% down the face.</p>`+
    `<p>Ratios: length/width ${m.R.toFixed(2)} · forehead ${m.F.toFixed(2)} · jaw ${m.J.toFixed(2)} · chin ${m.Ch.toFixed(2)} (of max width). Shape mix: ${top.map(k=>k+' '+Math.round(mix[k]*100)+'%').join(', ')}.</p>`+
    (skin?`<p>Skin colour ${esc(skin.hex)} · lightness ${skin.lab.L.toFixed(0)} · ITA ${skin.ita.toFixed(0)}° (depth) · hue ${skin.hue.toFixed(0)}° (undertone).</p>`:'')+
    `<p>Measured on the 3D face mesh with head turn and tilt removed, ${live?'as the median of '+samples.length+' frames':'from one photo'}. Millimetres come from the iris (or the PD entered above). Lighting and white balance shift the colour reading, so staff should confirm or correct.</p>`;
  status('Measured: '+top.slice(0,2).map(k=>k+' '+Math.round(mix[k]*100)+'%').join(', ')+(skin?' · '+skin.tone+' undertone, '+skin.depth+' skin depth':'')+'. Tap any frame to try it on.');
  $('rescan').hidden=false;selected=null;renderProfile();render();
}
function rescan(){samples=[];analysed=false;face=null;profile.mix=null;profile.trace=null;}
$('rescan').addEventListener('click',()=>{rescan();if(mode==='image'&&srcImg)runImage();});

/* ---------- tracking ---------- */
// Primary tracker: Google MediaPipe Face Landmarker (478 points + a full 3D head-pose matrix). The runtime is
// vendored in /vendor/tasks-vision; the model loads from Google's official model storage. If that fails
// (offline, blocked, old browser) the app falls back to the vendored MediaPipe Face Mesh.
const MODEL_URL='https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';
let engine=null,engineReady=null;
function initTracker(){
  if(engineReady)return engineReady;
  engineReady=(async()=>{
    try{engine=await makeTasksEngine();}
    catch(e){console.warn('Face Landmarker unavailable, falling back to Face Mesh:',e);engine=await makeMeshEngine();}
    return engine;
  })();
  engineReady.catch(()=>{engineReady=null;});
  return engineReady;
}
async function makeTasksEngine(){
  const {FaceLandmarker,FilesetResolver}=await import('./vendor/tasks-vision/vision_bundle.mjs');
  const fs=await FilesetResolver.forVisionTasks(new URL('vendor/tasks-vision/wasm',location.href).href);
  const opts=d=>({baseOptions:{modelAssetPath:MODEL_URL,delegate:d},runningMode:'VIDEO',numFaces:1,
    outputFacialTransformationMatrixes:true,outputFaceBlendshapes:false,minFaceDetectionConfidence:.5,minFacePresenceConfidence:.5,minTrackingConfidence:.5});
  let fl;try{fl=await FaceLandmarker.createFromOptions(fs,opts('GPU'));}catch(e){fl=await FaceLandmarker.createFromOptions(fs,opts('CPU'));}
  let run='VIDEO',lastTs=0;
  const pick=r=>r&&r.faceLandmarks&&r.faceLandmarks[0]?{lm:r.faceLandmarks[0],mat:r.facialTransformationMatrixes&&r.facialTransformationMatrixes[0]?r.facialTransformationMatrixes[0].data:null}:null;
  const to=async m=>{if(run!==m){await fl.setOptions({runningMode:m});run=m;}};
  return{name:'Google MediaPipe Face Landmarker',
    async video(v){await to('VIDEO');let ts=performance.now();if(ts<=lastTs)ts=lastTs+1;lastTs=ts;return pick(fl.detectForVideo(v,ts));},
    async image(c){await to('IMAGE');return pick(fl.detect(c));},reset(){}};
}
async function makeMeshEngine(){
  if(!window.FaceMesh)throw new Error('face tracking library did not load');
  const m=new window.FaceMesh({locateFile:f=>'vendor/face_mesh/'+f});
  m.setOptions({maxNumFaces:1,refineLandmarks:true,minDetectionConfidence:.5,minTrackingConfidence:.5});
  let next=null;m.onResults(r=>{const f=next;next=null;f&&f(r.multiFaceLandmarks&&r.multiFaceLandmarks[0]?{lm:r.multiFaceLandmarks[0],mat:null}:null);});
  await m.initialize();
  const run=src=>new Promise(res=>{next=res;m.send({image:src}).catch(()=>{next=null;res(null)});});
  return{name:'MediaPipe Face Mesh (fallback)',video:run,async image(c){m.reset();return run(c);},reset(){m.reset();}};
}
let lost=0;
function handle(r,w,h){
  if(!r){if(++lost>10){pose=null;trk=null;}if(mode==='live'&&lost>10)status('Looking for a face… face the camera in even light.');return false;}
  lost=0;const n=derive(r.lm,w,h,r.mat);trk={...n,lm:r.lm,w,h};smoothPose(n);addSample(n,r.lm,w,h);
  if(pdHist.length%6===0||mode==='image'){$('pdPill').hidden=false;$('pdPill').textContent='Camera PD ≈ '+med(pdHist).toFixed(1)+' mm';$('usePd').hidden=!!pdManual();}
  return true;
}
let busy=false,lastT=-1;
async function tick(){
  if(mode!=='live')return;
  if(video.readyState>=2&&!busy&&video.currentTime!==lastT){busy=true;lastT=video.currentTime;
    try{handle(await engine.video(video),video.videoWidth,video.videoHeight);}catch(e){console.error(e)}busy=false;}
  drawStage();requestAnimationFrame(tick);
}
function stopCamera(){if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;}video.srcObject=null;}
function setMode(m){mode=m;stage.classList.toggle('mirror',m==='live');video.hidden=m!=='live';
  $('gate').hidden=true;$('snap').hidden=m==='none';$('stopCam').hidden=m!=='live';$('openGate').hidden=m==='live';
  if(m!=='live')stopCamera();if(m==='none'){pose=null;trk=null;$('pdPill').hidden=true;$('usePd').hidden=true;}
  pdHist=[];rescan();lost=0;drawStage();}
async function startCamera(){
  if(!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia)){status('This browser cannot open the camera here. Camera access needs an HTTPS address (or localhost).',true);return;}
  status('Starting camera…');
  try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:1280},height:{ideal:960}},audio:false});}
  catch(e){status(e.name==='NotAllowedError'?'Camera permission was blocked. Allow camera access for this site in the browser settings, or use a photo.':'Could not open the camera: '+e.message,true);return;}
  video.srcObject=stream;try{await video.play();}catch(e){}
  status('Loading face tracking…');
  try{await initTracker();}catch(e){status('Face tracking could not start: '+e.message,true);return;}
  engine.reset();setMode('live');status('Looking for a face… ('+engine.name+')');tick();
}
// Still photos: search the whole image, then overlapping tiles (small faces in group shots), and map back.
async function runImage(){
  status('Scanning…');trk=null;pose=null;
  const W=srcImg.naturalWidth,H=srcImg.naturalHeight,t=Math.round(Math.min(W,H)*.6),tiles=[[0,0,W,H]];
  for(const fy of[0,.5,1])for(const fx of[.5,0,1])tiles.push([Math.round((W-t)*fx),Math.round((H-t)*fy),t,t]);
  for(const [x0,y0,cw,ch] of tiles){
    const k=Math.min(1,1280/Math.max(cw,ch)),c=document.createElement('canvas');c.width=Math.round(cw*k);c.height=Math.round(ch*k);
    c.getContext('2d').drawImage(srcImg,x0,y0,cw,ch,0,0,c.width,c.height);
    let r=null;try{r=await engine.image(c);}catch(e){console.error(e)}
    if(r){const lm=r.lm.map(l=>({x:(x0+l.x*cw)/W,y:(y0+l.y*ch)/H,z:l.z*cw/W}));handle({lm,mat:r.mat},W,H);drawStage();return;}
  }
  status('No face found. Try a front-facing photo with the whole face visible and even light.',true);drawStage();
}
$('startCam').addEventListener('click',startCamera);
$('stopCam').addEventListener('click',()=>{setMode('none');status('Camera stopped.');});
$('skipGate').addEventListener('click',()=>{setMode('none');status('No face yet. Set the profile by hand, or tap Camera / photo.');});
$('openGate').addEventListener('click',()=>{$('gate').hidden=false;});
$('photo').addEventListener('change',async e=>{
  const file=e.target.files[0];if(!file)return;const img=new Image();img.src=URL.createObjectURL(file);
  try{await img.decode();}catch(err){status('That file could not be opened as an image.',true);return;}
  status('Loading face tracking…');try{await initTracker();}catch(err){status('Face tracking could not start: '+err.message,true);return;}
  srcImg=img;setMode('image');await runImage();e.target.value='';
});
$('pd').addEventListener('change',()=>{if(face&&trk)face.faceMm=trk.cheek/scaleOf(trk);pose&&trk&&(pose.pxmm=scaleOf(trk));$('usePd').hidden=!!pdManual();render();});
$('usePd').addEventListener('click',()=>{if(pdHist.length){$('pd').value=med(pdHist).toFixed(1);$('pd').dispatchEvent(new Event('change'));}});

/* ---------- stage drawing ---------- */
let spinning=false,spinT0=0,raf=0,cvKey='';
function drawStage(){
  const r=cv.getBoundingClientRect(),dpr=window.devicePixelRatio||1,W=r.width,H=r.height;if(!W)return;
  const key=W+'x'+H+'x'+dpr;if(key!==cvKey){cvKey=key;cv.width=W*dpr;cv.height=H*dpr;}
  const c=cv.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,W,H);
  const f=catalog.find(x=>x.id===selected);
  $('spin').hidden=!(mode==='none'&&f&&gl());
  $('wearing').textContent=f?'Wearing: '+f.name+' · '+f.color+' · '+f.size:'Wearing: —';
  if(mode==='none'){
    if(spinning&&f&&gl()){const t=(performance.now()-spinT0)/1000,reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
      const q=new THREE.Quaternion().setFromEuler(new THREE.Euler(.18,reduce?.55:Math.sin(t*.8)*1.1,0,'ZYX'));
      render3D(f,{cx:W/2,cy:H*.42,pxmm:W*.58/frameMm(f),q},W,H);return;}
    clear3D();const p=drawOutline(c,W,H);if(f)drawAny(c,f,p.cx,p.cy,p.W,0,1,2);return;
  }
  let s,ox,oy;
  if(mode==='live'){const vw=video.videoWidth||1,vh=video.videoHeight||1;s=Math.max(W/vw,H/vh);ox=(W-vw*s)/2;oy=(H-vh*s)/2;}
  else{const iw=srcImg.naturalWidth,ih=srcImg.naturalHeight,b=trk&&trk.box;
    if(b){const side=Math.max(b.w,b.h)*2.1;s=Math.max(W/side,H/side);ox=W/2-(b.x+b.w/2)*s;oy=H*.5-(b.y+b.h*.45)*s;}
    else{s=Math.max(W/iw,H/ih);ox=(W-iw*s)/2;oy=(H-ih*s)/2;}
    c.drawImage(srcImg,ox,oy,iw*s,ih*s);}
  if(!f||!pose){clear3D();return;}
  const cx=ox+pose.mid.x*s,cy=oy+pose.mid.y*s,pxmm=pose.pxmm*s;
  if(render3D(f,{cx,cy,pxmm,q:pose.q,loc:pose.loc},W,H))return;
  const e=new THREE.Euler().setFromQuaternion(pose.q,'ZYX');drawAny(c,f,cx,cy,frameMm(f)*pxmm,-e.z,Math.cos(e.y),Math.max(1,pxmm*1.2));
}
function setSpin(on){spinning=on;$('spin').setAttribute('aria-pressed',on);$('spin').textContent=on?'Stop 3D view':'3D view';cancelAnimationFrame(raf);
  if(on){spinT0=performance.now();const loop=()=>{drawStage();if(spinning)raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop);}else drawStage();}
$('spin').addEventListener('click',()=>setSpin(!spinning));
const stageRO=new ResizeObserver(()=>{if(mode!=='live')drawStage();});stageRO.observe(cv);

/* ---------- snapshots ---------- */
const shots=[];
$('snap').addEventListener('click',()=>{
  const r=stage.getBoundingClientRect(),W=Math.round(r.width),H=Math.round(r.height),k=2,o=document.createElement('canvas');o.width=W*k;o.height=H*k;
  const x=o.getContext('2d');x.scale(k,k);
  if(mode==='live'){const vw=video.videoWidth,vh=video.videoHeight,s=Math.max(W/vw,H/vh);x.save();x.translate(W,0);x.scale(-1,1);
    x.drawImage(video,(W-vw*s)/2,(H-vh*s)/2,vw*s,vh*s);x.drawImage($('gl'),0,0,W,H);x.restore();}
  else{x.drawImage(cv,0,0,W,H);x.drawImage($('gl'),0,0,W,H);}
  const f=catalog.find(z=>z.id===selected);shots.unshift({url:o.toDataURL('image/jpeg',.9),name:f?f.name+' · '+f.color:'No frame'});
  if(shots.length>12)shots.pop();renderShots();
});
function renderShots(){$('shots').innerHTML=shots.map((s,i)=>`<figure><img src="${s.url}" alt="${esc(s.name)}" data-shot="${i}"><figcaption>${esc(s.name)}</figcaption></figure>`).join('');}
$('shots').addEventListener('click',e=>{const i=e.target.dataset&&e.target.dataset.shot;if(i==null)return;const s=shots[+i];
  const m=document.createElement('div');m.className='modal';m.innerHTML=`<img src="${s.url}" alt="${esc(s.name)}"><div class="row"><a class="btn" href="${s.url}" download="frame-match-${Date.now()}.jpg">Download</a><button>Close</button></div>`;
  m.addEventListener('click',ev=>{if(ev.target===m||ev.target.tagName==='BUTTON')m.remove();});document.body.appendChild(m);});

/* ---------- scoring ---------- */
function coverage(f,plan){
  if(!plan||plan.id==='none')return{oop:f.price,full:false,label:'Self-pay $'+f.price};
  if(plan.id==='basic')return f.basic?{oop:0,full:true,label:'Covered in full'}:{oop:f.price,full:false,label:'Not on basic plan'};
  const over=Math.max(0,f.price-plan.allow);if(!over)return{oop:0,full:true,label:'Covered in full'};
  const oop=Math.round(over*(1-plan.disc/100));return{oop,full:false,label:'$'+oop+' out of pocket'};
}
function score(f){
  const why=[];let s=profile.mix?SHAPES.reduce((a,k)=>a+profile.mix[k]*(FIT[k][f.shape]??0),0):(FIT[profile.shape][f.shape]??0);
  if(s>=.8)why.push(FRAME_LABEL[f.shape]+': '+WHY_SHAPE[profile.shape]);else if(s<-.5)why.push(FRAME_LABEL[f.shape]+' can exaggerate a '+profile.shape+' face');
  let col=0;
  if(f.tone==='neutral'){col=1;}
  else if(profile.tone==='neutral'){col=1.5;}
  else if(f.tone===profile.tone){col=2;why.push(f.color.toLowerCase()+' suits '+profile.tone+' undertones');}
  else{col=-1;why.push(f.color.toLowerCase()+' leans '+f.tone+', against '+profile.tone+' undertones');}
  const contrast=(profile.depth==='light'&&f.val==='dark')||(profile.depth==='deep'&&f.val==='light')||(profile.depth==='medium'&&f.val!=='mid');
  if(contrast){col+=.5;why.push('good contrast with '+profile.depth+' skin');}
  let size=0;
  if(face){const fm=frameMm(f),d=fm-face.faceMm;
    if(Math.abs(d)<=5){size=1;why.push('size fits ('+fm+' mm frame, '+Math.round(face.faceMm)+' mm face)');}
    else if(d>9){size=-1.5;why.push('too wide by about '+Math.round(d)+' mm');}
    else if(d<-9){size=-1.5;why.push('too narrow by about '+Math.round(-d)+' mm');}}
  const raw=s+col+size,lo=face?-4.5:-3,hi=face?5.5:4.5,pct=Math.round(Math.max(0,Math.min(100,(raw-lo)/(hi-lo)*100)));
  return{pct,why};
}
function render(){
  const plan=plans.find(p=>p.id===$('plan').value),sort=$('sort').value;
  let rows=catalog.map(f=>({f,...score(f),cov:coverage(f,plan)}));
  if($('instock').checked)rows=rows.filter(r=>r.f.stock>0);
  if($('covered').checked)rows=rows.filter(r=>r.cov.full);
  rows.sort(sort==='oop'?(a,b)=>a.cov.oop-b.cov.oop||b.pct-a.pct:sort==='price'?(a,b)=>a.f.price-b.f.price:(a,b)=>b.pct-a.pct||a.cov.oop-b.cov.oop);
  const shown=showAll?rows:rows.slice(0,8);
  $('count').textContent=rows.length+' of '+catalog.length+' frames match these filters'+(rows.length>shown.length?' · showing top '+shown.length:'');
  $('more').hidden=rows.length<=8;$('more').textContent=showAll?'Show top 8':'Show all '+rows.length;
  if(!selected||!rows.some(r=>r.f.id===selected))selected=rows[0]?.f.id||null;
  const bestId=sort==='match'&&rows[0]?rows[0].f.id:null;
  $('rack').innerHTML=shown.length?shown.map(r=>`<article class="card${r.f.id===selected?' sel':''}" data-id="${esc(r.f.id)}">
    <canvas width="300" height="128" data-thumb="${esc(r.f.id)}" aria-hidden="true"></canvas>
    <div><div class="cname">${esc(r.f.name)} <span class="cmeta">· ${esc(r.f.brand)}</span>${r.f.id===bestId?'<span class="best">Best match</span>':''}</div>
      <div class="cmeta"><span class="swatch" style="width:12px;height:12px;background:${esc(r.f.hex)}"></span> ${esc(r.f.color)} · ${esc(FRAME_LABEL[r.f.shape])} · ${esc(r.f.size)} · ${r.f.stock>0?esc(r.f.stock)+' in stock':'order only'}</div>
      <div class="why">${r.why.map(esc).join(' · ')||'neutral fit'}</div>
      <div class="meter"><i style="width:${r.pct}%"></i></div></div>
    <div class="right"><div class="score">${r.pct}<small>% match</small></div>
      <span class="price">$${esc(r.f.price)}</span><span class="tag ${r.cov.full?'ok':'warn'}">${esc(r.cov.label)}</span>
      <button data-try="${esc(r.f.id)}" aria-label="Try on ${esc(r.f.name)} ${esc(r.f.color)}">Try on</button></div>
  </article>`).join(''):'<div class="empty">No frames match. Turn off a filter, or add stock in practice settings.</div>';
  document.querySelectorAll('canvas[data-thumb]').forEach(t=>{const f=catalog.find(x=>x.id===t.dataset.thumb),c=t.getContext('2d');c.clearRect(0,0,300,128);if(photos[f.id]){const ph=photos[f.id],k=Math.min(280/ph.w,120/ph.h);c.drawImage(ph.img,150-ph.w*k/2,64-ph.h*k/2,ph.w*k,ph.h*k);}else drawFrame(c,f,150,66,260,0);});
  drawStage();
}

/* ---------- profile chips ---------- */
function chips(el,key,vals){
  $(el).innerHTML=vals.map(v=>`<button class="chip" aria-pressed="${profile[key]===v}" data-k="${key}" data-v="${v}">${v[0].toUpperCase()+v.slice(1)}</button>`).join('');
}
function renderProfile(){chips('shapeChips','shape',SHAPES);
  const mx=profile.mix;$('shapeMix').innerHTML=mx?SHAPES.slice().sort((a,b)=>mx[b]-mx[a]).map(k=>`<div class="mixrow"><span>${k[0].toUpperCase()+k.slice(1)}</span><i style="width:${Math.round(mx[k]*100)}%"></i><b>${Math.round(mx[k]*100)}%</b></div>`).join(''):'';
  const tr=profile.trace;$('faceTrace').innerHTML=tr?`<path d="M${tr.map(([x,y])=>(x*100+60).toFixed(1)+' '+(-y*100+8).toFixed(1)).join('L')}Z"/>`:'';tr?$('faceTrace').removeAttribute('hidden'):$('faceTrace').setAttribute('hidden','');chips('toneChips','tone',['warm','neutral','cool']);chips('depthChips','depth',['light','medium','deep']);
  $('skinSwatch').style.background=profile.skin||SKIN[profile.depth][profile.tone];}
document.addEventListener('click',e=>{
  const ch=e.target.closest('.chip');
  if(ch){profile[ch.dataset.k]=ch.dataset.v;if(ch.dataset.k==='shape')profile.mix=null;$('det'+{shape:'Shape',tone:'Tone',depth:'Depth'}[ch.dataset.k]).hidden=true;if(ch.dataset.k!=='shape'&&!face)profile.skin=null;renderProfile();render();return;}
  const tr=e.target.closest('[data-try]')||e.target.closest('.card');
  if(tr&&e.target.closest('#rack')){selected=tr.dataset.try||tr.dataset.id;render();if(window.innerWidth<900)$('stage').scrollIntoView({behavior:'smooth',block:'start'});}
});
['plan','sort','instock','covered'].forEach(id=>$(id).addEventListener('change',render));
$('more').addEventListener('click',()=>{showAll=!showAll;render();});

/* ---------- settings tables ---------- */
function renderSettings(){
  const keep=$('plan').value||'a';
  $('plan').innerHTML=plans.map(p=>`<option value="${esc(p.id)}">${esc(p.name)}${p.id!=='basic'&&p.id!=='none'?' · $'+esc(p.allow)+' allowance':''}</option>`).join('');
  $('plan').value=plans.some(p=>p.id===keep)?keep:'a';
  $('planTable').tBodies[0].innerHTML=plans.map((p,i)=>`<tr><td><input type="text" value="${esc(p.name)}" data-p="${i}" data-f="name" aria-label="Plan name"></td>
    <td class="num">${p.id==='basic'||p.id==='none'?'—':`<input type="number" min="0" step="5" value="${esc(p.allow)}" data-p="${i}" data-f="allow" aria-label="${esc(p.name)} allowance">`}</td>
    <td class="num">${p.id==='basic'||p.id==='none'?'—':`<input type="number" min="0" max="100" step="5" value="${esc(p.disc)}" data-p="${i}" data-f="disc" aria-label="${esc(p.name)} discount">`}</td></tr>`).join('');
  const shapeOpts=v=>Object.keys(FRAME_LABEL).map(k=>`<option value="${k}"${k===v?' selected':''}>${FRAME_LABEL[k]}</option>`).join('');
  $('invTable').tBodies[0].innerHTML=catalog.map((f,i)=>{const ph=photos[f.id];return `<tr>
    <td>${ph?`<img class="ph" src="${esc(ph.img.src)}" alt="${esc(f.name)} front photo">${sides[f.id]?`<img class="ph" src="${esc(sides[f.id].img.src)}" alt="${esc(f.name)} arm" style="height:22px;margin-top:4px">`:`<label class="btn phbtn" style="margin-top:4px">Add side photo<input type="file" accept="image/*" data-side="${esc(f.id)}"></label>`}<button class="phbtn" data-rm="${esc(f.id)}" style="margin-top:4px">Remove</button>`:`<label class="btn phbtn">Add front photo<input type="file" accept="image/*" data-photo="${esc(f.id)}"></label>`}</td>
    <td><input type="text" value="${esc(f.name)}" data-i="${i}" data-f="name" aria-label="Frame name"><input type="text" value="${esc(f.color)}" data-i="${i}" data-f="color" aria-label="Colour name" style="margin-top:4px"><span class="cmeta">${esc(f.brand)}${f.basic?' · basic plan':''} · ${esc(f.tone)}, ${esc(f.val)}</span></td>
    <td><select data-i="${i}" data-f="shape" aria-label="Shape" style="min-width:130px">${shapeOpts(f.shape)}</select></td>
    <td><input type="text" value="${esc(f.size)}" data-i="${i}" data-f="size" aria-label="Size" style="width:120px"></td>
    <td class="num"><input type="number" min="0" value="${esc(f.price)}" data-i="${i}" data-f="price" aria-label="Price" style="width:96px"></td>
    <td class="num"><input type="number" min="0" value="${esc(f.stock)}" data-i="${i}" data-f="stock" aria-label="Stock" style="max-width:80px"></td></tr>`}).join('');
}
$('planTable').addEventListener('change',e=>{const t=e.target,p=plans[+t.dataset.p];if(!p)return;p[t.dataset.f]=t.dataset.f==='name'?t.value.slice(0,60):Math.max(0,+t.value||0);save();renderSettings();render();});
$('invTable').addEventListener('change',async e=>{
  const t=e.target;
  if(t.dataset.photo){const file=t.files[0],f=catalog.find(x=>x.id===t.dataset.photo);if(!file||!f)return;
    $('invStatus').textContent='Cutting out the background…';
    try{const rec=await processFramePhoto(file);await usePhoto(f.id,rec);idbPut(f.id,rec);
      Object.assign(f,{hex:rec.hex,tone:rec.tone,val:rec.val});save();selected=f.id;
      $('invStatus').textContent=f.name+': photo added. Frame colour read as '+rec.tone+', '+rec.val+'.';}
    catch(err){$('invStatus').textContent='Could not use that photo: '+err.message;}
    renderSettings();render();return;}
  if(t.dataset.side){const file=t.files[0],f=catalog.find(x=>x.id===t.dataset.side);if(!file||!f)return;
    $('invStatus').textContent='Extracting the arm…';
    try{const rec=await processSidePhoto(file);await useSide(f.id,rec);idbPut(f.id+'|side',rec);selected=f.id;$('invStatus').textContent=f.name+': side photo added. The 3D model now uses the real arm.';}
    catch(err){$('invStatus').textContent='Could not use that side photo: '+err.message;}
    renderSettings();render();return;}
  const f=catalog[+t.dataset.i];if(!f)return;const k=t.dataset.f;models.clear();
  if(k==='price'||k==='stock')f[k]=Math.max(0,Math.round(+t.value||0));
  else if(k==='size'){const z=parseSize(t.value);f.size=z.lens+'-'+z.bridge+'-'+z.temple;}
  else if(k==='shape'){if(FRAME_LABEL[t.value])f.shape=t.value;}
  else f[k]=t.value.slice(0,40);
  save();renderSettings();render();
});
$('invTable').addEventListener('click',e=>{const id=e.target.dataset&&e.target.dataset.rm;if(!id)return;delete photos[id];delete sides[id];idbDel(id);idbDel(id+'|side');models.clear();renderSettings();render();});
$('addFrame').addEventListener('click',()=>{const id='u'+Date.now().toString(36);
  catalog.unshift({id,name:'New frame',brand:'Your practice',shape:'rectangle',color:'Add a photo',hex:'#333333',tone:'neutral',val:'dark',price:150,stock:1,basic:false,size:'52-18-140'});
  save();renderSettings();render();$('invStatus').textContent='Added at the top of the list. Name it, add a photo and set its size.';});
$('reset').addEventListener('click',()=>{catalog=clone(CATALOG0);plans=clone(PLANS0);for(const k in photos){delete photos[k];idbDel(k);}for(const k in sides){delete sides[k];idbDel(k+'|side');}models.clear();save();renderSettings();render();});

/* Background removal: estimate the backdrop colour from the photo's border and fade out pixels close to it.
   Returns the cut-out pixels and the bounding box of what is left. */
async function cutout(file,maxW){
  const src=new Image();src.src=URL.createObjectURL(file);await src.decode();
  const k=Math.min(1,maxW/src.naturalWidth),w=Math.round(src.naturalWidth*k),h=Math.round(src.naturalHeight*k);
  const oc=document.createElement('canvas');oc.width=w;oc.height=h;const c=oc.getContext('2d',{willReadFrequently:true});c.drawImage(src,0,0,w,h);
  const im=c.getImageData(0,0,w,h),d=im.data,border=[];
  for(let x=0;x<w;x+=3){border.push(x*4,((h-1)*w+x)*4)}for(let y=0;y<h;y+=3){border.push(y*w*4,(y*w+w-1)*4)}
  const med=ch=>{const v=border.map(i=>d[i+ch]).sort((a,b)=>a-b);return v[v.length>>1]};const bg=[med(0),med(1),med(2)];
  let x0=w,y0=h,x1=0,y1=0;
  for(let i=0,p=0;i<d.length;i+=4,p++){
    const dist=Math.hypot(d[i]-bg[0],d[i+1]-bg[1],d[i+2]-bg[2]),a=Math.max(0,Math.min(1,(dist-10)/30));
    d[i+3]=Math.round(a*255);
    if(a>.3){const x=p%w,y=(p/w)|0;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
  }
  if(x1-x0<w*.2||y1<=y0)throw new Error('no frame found against the background. Use a plain white backdrop.');
  return{w,h,im,x0,y0,x1,y1};
}
const toCanvas=(im,x0,y0,cw,ch)=>{const t=document.createElement('canvas');t.width=im.width;t.height=im.height;t.getContext('2d').putImageData(im,0,0);
  const o=document.createElement('canvas');o.width=cw;o.height=ch;o.getContext('2d').drawImage(t,x0,y0,cw,ch,0,0,cw,ch);return o;};
// summed-area table over a 0/1 mask, for fast box dilation and erosion
function boxOp(m,w,h,r,all){
  const S=new Int32Array((w+1)*(h+1));
  for(let y=0;y<h;y++){let row=0;for(let x=0;x<w;x++){row+=m[y*w+x];S[(y+1)*(w+1)+x+1]=S[y*(w+1)+x+1]+row;}}
  const o=new Uint8Array(w*h);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const ax=Math.max(0,x-r),ay=Math.max(0,y-r),bx=Math.min(w,x+r+1),by=Math.min(h,y+r+1);
    const sum=S[by*(w+1)+bx]-S[ay*(w+1)+bx]-S[by*(w+1)+ax]+S[ay*(w+1)+ax];o[y*w+x]=all?(sum===(bx-ax)*(by-ay)?1:0):(sum>0?1:0);}
  return o;
}
async function processFramePhoto(file){
  const{im,x0,y0,x1,y1}=await cutout(file,1100);
  const cw=x1-x0+1,ch=y1-y0+1,out=toCanvas(im,x0,y0,cw,ch),oc=out.getContext('2d',{willReadFrequently:true}),od0=oc.getImageData(0,0,cw,ch),od=od0.data;
  // Lens openings = background enclosed by the rim. Closing them removes things seen *through* the lens
  // (the folded-back arms in a product photo), then the openings get a faint lens with a glare band.
  const n=cw*ch,bgm=new Uint8Array(n),out_=new Uint8Array(n),st=[];
  for(let p=0;p<n;p++)bgm[p]=od[p*4+3]<110?1:0;
  for(let x=0;x<cw;x++){st.push(x,(ch-1)*cw+x)}for(let y=0;y<ch;y++){st.push(y*cw,y*cw+cw-1)}
  while(st.length){const p=st.pop();if(!bgm[p]||out_[p])continue;out_[p]=1;const x=p%cw;
    if(x>0)st.push(p-1);if(x<cw-1)st.push(p+1);if(p>=cw)st.push(p-cw);if(p<n-cw)st.push(p+cw);}
  const hole=new Uint8Array(n);let ha=0;for(let p=0;p<n;p++)if(bgm[p]&&!out_[p]){hole[p]=1;ha++}
  let lensMask=null;
  if(ha>n*.08){const r=Math.max(3,Math.round(cw*.022));lensMask=boxOp(boxOp(boxOp(hole,cw,ch,r,false),cw,ch,r,true),cw,ch,Math.max(2,Math.round(cw*.006)),true);for(let p=0;p<n;p++)if(hole[p])lensMask[p]=1; // keep the rim itself
    for(let p=0;p<n;p++)if(lensMask[p]){const x=p%cw,y=(p/cw)|0,u=(x%(cw/2))/(cw/2),v=y/ch,band=Math.max(0,1-Math.abs(u+v*.55-.5)/.07);
      od[p*4]=od[p*4+1]=od[p*4+2]=255;od[p*4+3]=Math.round(14+34*band);}
    oc.putImageData(od0,0,0);}
  // lens centre height: midpoint between top and bottom rim at each lens's centre column
  const ys=[];for(const fx of[.27,.73]){for(let dx=-3;dx<=3;dx++){const x=Math.round(cw*fx)+dx;let t=-1,b=-1;
    for(let y=0;y<ch;y++)if(od[(y*cw+x)*4+3]>128){t=y;break}for(let y=ch-1;y>=0;y--)if(od[(y*cw+x)*4+3]>128){b=y;break}
    if(t>=0&&b>t)ys.push((t+b)/2/ch);}}
  ys.sort((a,b)=>a-b);const lensY=ys.length?ys[ys.length>>1]:.5;
  let k=0,r=0,g=0,bl=0;for(let i=0;i<od.length;i+=4)if(od[i+3]>220){r+=od[i];g+=od[i+1];bl+=od[i+2];k++}
  const m=k?[r/k,g/k,bl/k].map(Math.round):[60,60,60],lab=srgb2lab(...m),chroma=Math.hypot(lab.a,lab.b),hue=(Math.atan2(lab.b,lab.a)*180/Math.PI+360)%360;
  const tone=chroma<7?(lab.L<35?'cool':'neutral'):(hue>=30&&hue<=105?'warm':'cool'),val=lab.L<35?'dark':lab.L<65?'mid':'light';
  return{url:out.toDataURL('image/png'),lensY,hex:'#'+m.map(v=>v.toString(16).padStart(2,'0')).join(''),tone,val};
}
/* Side photo: find where the front ends (the hinge), then keep only the nearest arm
   (the topmost run of pixels in each column), from hinge to tip. */
async function processSidePhoto(file){
  const{w,h,im}=await cutout(file,1400),d=im.data,A=(x,y)=>d[(y*w+x)*4+3]>120;
  const top=new Int32Array(w).fill(-1),bot=new Int32Array(w).fill(-1);
  for(let x=0;x<w;x++){let y=0;while(y<h&&!A(x,y))y++;if(y>=h)continue;top[x]=y;let gap=0,last=y;
    for(;y<h;y++){if(A(x,y)){last=y;gap=0}else if(++gap>3)break}bot[x]=last;}
  const cols=[];for(let x=0;x<w;x++)if(top[x]>=0)cols.push(x);if(cols.length<20)throw new Error('no arm found in the side photo.');
  const xs=cols[0],xe=cols[cols.length-1],span=x=>bot[x]-top[x];let mx=0;for(let x=xs;x<xs+(xe-xs)*.3;x++)if(top[x]>=0)mx=Math.max(mx,span(x));
  let xm=xs;while(xm<xe&&(top[xm]<0||span(xm)<mx*.8))xm++;
  let hinge=xm;for(let x=xm;x<xe;x++){let ok=true;for(let j=0;j<15;j++){const q=x+j;if(top[q]<0||span(q)>mx*.5){ok=false;break}}if(ok){hinge=x;break}}
  let fTop=1e9;for(let x=xs;x<hinge;x++)if(top[x]>=0)fTop=Math.min(fTop,top[x]);if(fTop>1e8)fTop=top[hinge];
  let aT=1e9,aB=0;for(let x=hinge;x<=xe;x++)if(top[x]>=0){aT=Math.min(aT,top[x]);aB=Math.max(aB,bot[x])}
  const cw=xe-hinge+1,ch=aB-aT+1,o=document.createElement('canvas');o.width=cw;o.height=ch;const oc=o.getContext('2d'),od=oc.createImageData(cw,ch);
  for(let x=hinge;x<=xe;x++){if(top[x]<0)continue;for(let y=top[x];y<=bot[x];y++){const si=(y*w+x)*4,di=((y-aT)*cw+(x-hinge))*4;for(let k=0;k<4;k++)od.data[di+k]=d[si+k];}}
  oc.putImageData(od,0,0);
  return{url:o.toDataURL('image/png'),lenPx:cw,hPx:ch,offPx:aT-fTop};
}
function srgb2lab(r,g,b){
  const lin=v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4};
  const R=lin(r),G=lin(g),B=lin(b);
  let X=(R*.4124+G*.3576+B*.1805)/.95047,Y=R*.2126+G*.7152+B*.0722,Z=(R*.0193+G*.1192+B*.9505)/1.08883;
  const f=t=>t>.008856?Math.cbrt(t):7.787*t+16/116;X=f(X);Y=f(Y);Z=f(Z);
  return{L:116*Y-16,a:500*(X-Y),b:200*(Y-Z)};
}

/* ---------- start ---------- */
renderSettings();renderProfile();render();
(async()=>{db=await idb();for(const [k,v] of await idbAll()){try{if(k.endsWith('|side'))await useSide(k.slice(0,-5),v);else await usePhoto(k,v)}catch(e){}}if(Object.keys(photos).length){renderSettings();render();}})();
