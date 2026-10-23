/* 生成 assets/images/生成/gen-plate-01.jpg
   依赖：playwright-core（本机 Edge）+ 在 cual-flightlog 起的 8788 静态服务
   用法：node tools/gen-plate.cjs
   可改：step / 亮度阈值 / 橙圆位置 / 字号，全部集中在下方常量。 */
const { chromium } = require('C:/Users/lenovo/AppData/Local/Temp/pw-core/node_modules/playwright-core');
(async()=>{
  const b=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  const p=await b.newPage({viewport:{width:1300,height:1700},deviceScaleFactor:1});
  await p.goto('http://127.0.0.1:8788/',{waitUntil:'networkidle'});
  await p.evaluate(async()=>{
    document.body.innerHTML='';document.body.style.margin='0';
    const c=document.createElement('canvas');c.id='poster';c.width=1200;c.height=1600;c.style.display='block';c.style.width='900px';c.style.height='1200px';document.body.appendChild(c);
    const x=c.getContext('2d');
    const img=new Image();img.src='/assets/images/飞机/plane24.jpg';await img.decode();
    const W=1200,th=1000,paper='#f1eee5',ink='#0c0c0b',orange='#ff4a12';
    const s=Math.max(W/img.width,th/img.height),sw=W/s/1.16,sh=th/s/1.16,sx=(img.width-sw)*.56,sy=(img.height-sh)*.52;
    x.drawImage(img,sx,sy,sw,sh,0,0,W,th);
    const src=x.getImageData(0,0,W,th);
    x.fillStyle=paper;x.fillRect(0,0,W,th);
    const step=10;
    for(let yy=0;yy<th;yy+=step)for(let xx=0;xx<W;xx+=step){
      const i=((yy|0)*W+(xx|0))*4;
      const lum=(src.data[i]*.299+src.data[i+1]*.587+src.data[i+2]*.114)/255;
      let r=(0.74-lum)*5.2; if(r<=0.22)continue; if(r>5.0)r=5.0;
      x.fillStyle=ink;x.globalAlpha=.9;x.beginPath();x.arc(xx+step/2,yy+step/2,r,0,6.283);x.fill();
    }
    x.globalAlpha=1;
    x.fillStyle=orange;x.fillRect(0,1000,W,18);
    x.fillStyle=paper;x.fillRect(0,1018,W,1600-1018);
    // orange disc
    x.globalAlpha=.96;x.fillStyle=orange;x.beginPath();x.arc(930,1305,232,0,6.283);x.fill();x.globalAlpha=1;
    // tiny generated contour plot inside paper left of disc
    x.save();x.translate(735,1300);
    for(let k=0;k<15;k++){
      const rad=18+k*8;x.beginPath();
      for(let a=0;a<=6.283;a+=.08){const rr=rad+Math.sin(a*3+k*.7)*5+Math.cos(a*5-k)*3;const px=Math.cos(a)*rr,py=Math.sin(a)*rr;a?x.lineTo(px,py):x.moveTo(px,py);}
      x.closePath();x.strokeStyle=ink;x.globalAlpha=.18;x.lineWidth=.9;x.stroke();
    }
    x.restore();x.globalAlpha=1;
    // type
    x.fillStyle=ink;
    x.font='700 132px "Arial Narrow","Bahnschrift Condensed",sans-serif';
    x.fillText('AIRFRAME',64,1150);
    x.font='700 400px "Arial Narrow","Bahnschrift Condensed",sans-serif';
    x.fillText('24',58,1508);
    // rule
    x.globalAlpha=.35;x.fillStyle=ink;x.fillRect(66,1536,520,1);x.globalAlpha=1;
    // small text
    x.font='400 14px "Cascadia Mono",Consolas,monospace';x.fillStyle=ink;
    x.fillText('CUAL — CAUC UNMANNED AERIAL LAB',66,1552);
    x.fillText('GENERATED PLATE 01 / HALFTONE 10PX / INK 02',66,1572);
    x.font='400 11px "Cascadia Mono",Consolas,monospace';x.globalAlpha=.6;
    x.fillText('SOURCE: FIELD TEST 2026 · SEED 2401',66,1590);x.globalAlpha=1;
    // vertical right removed
    // registration
    const mark=(mx,my)=>{x.strokeStyle=ink;x.globalAlpha=.55;x.lineWidth=1;x.beginPath();x.moveTo(mx-14,my);x.lineTo(mx+14,my);x.moveTo(mx,my-14);x.lineTo(mx,my+14);x.stroke();x.beginPath();x.arc(mx,my,7,0,6.283);x.stroke();x.globalAlpha=1;};
    mark(40,40);mark(1160,40);mark(40,1560);mark(1160,1560);
    x.strokeStyle=ink;x.globalAlpha=.25;x.strokeRect(22,22,1156,1556);x.globalAlpha=1;
    x.fillStyle=orange;x.beginPath();x.arc(1120,1044,8,0,6.283);x.fill();
  });
  await p.waitForTimeout(400);
  const el=await p.$('#poster');
  await el.screenshot({path:'C:/Users/lenovo/Documents/deepseek-harness/default-workspace/cual-flightlog/assets/images/生成/gen-plate-01.jpg',type:'jpeg',quality:90});
  console.log('saved jpg');
  await b.close();
})();






