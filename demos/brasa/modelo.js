(()=>{const host=document.querySelector('#model'),state=document.querySelector('#state');
try{
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});renderer.outputEncoding=THREE.sRGBEncoding;renderer.setPixelRatio(Math.min(devicePixelRatio,2));host.append(renderer.domElement);
 const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-1,1,1,-1,.01,30),pivot=new THREE.Group();scene.add(pivot);scene.add(new THREE.HemisphereLight(0xfff6e9,0xe4c3a2,.87));const light=new THREE.DirectionalLight(0xffefd8,.86);light.position.set(-3,5,4);scene.add(light);
 new THREE.GLTFLoader().parse(JSON.stringify(window.modeloBrasa),'',g=>{
 const root=g.scene,box=new THREE.Box3().setFromObject(root),center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3());root.position.sub(center);pivot.add(root);camera.position.set(0,.55,4);camera.lookAt(0,0,0);
 const run=host.closest('.hero-run'), hero=host.closest('.hero');
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 const layers=['lower-bread','meat','cheese','tomate','upper-bread'].map((name,index)=>{
   const mesh=root.getObjectByName(name);
   return {mesh,base:mesh.position.y,offset:(index-2)*.24};
 });
 // Legendas das camadas: aparecem quando o lanche está desmontado.
 const nomes={'upper-bread':'Tampa tostada','tomate':'Tomate grosso','cheese':'Queijo no calor','meat':'Carne com crosta','lower-bread':'Pão com molho'};
 const palco=host.parentElement,caixa=document.createElement('div');caixa.className='legendas';caixa.setAttribute('aria-hidden','true');palco.append(caixa);
 const lados={'upper-bread':'d','tomate':'e','cheese':'d','meat':'e','lower-bread':'d'};
 for(const layer of layers){const n=layer.mesh.name,el=document.createElement('span');el.className='legenda legenda-'+lados[n];el.textContent=nomes[n];caixa.append(el);layer.label=el;layer.lado=lados[n]}
 const ponto=new THREE.Vector3(),caixaCamada=new THREE.Box3();
 let visible=false,frame=0,angle=-.3,drag=null;
 function draw(){
   frame=0;
   if(!visible)return;
   const distance=run.offsetHeight-hero.offsetHeight;
   const progress=distance<=0?0:Math.min(1,Math.max(0,((parseFloat(getComputedStyle(hero).top)||0)-run.getBoundingClientRect().top)/distance));
   for(const layer of layers)layer.mesh.position.y=layer.base+layer.offset*progress;
   camera.zoom=1/(1+.5*progress);
   const mostrar=Math.min(1,Math.max(0,(progress-.55)/.35));
   const espaco=palco.clientHeight>=290&&palco.clientWidth>=300;
   caixa.hidden=progress===0||!espaco;
   if(progress>0&&espaco){
     // Afasta a câmera o bastante para as legendas caberem ao lado do lanche.
     const w=host.clientWidth,meia=Math.max(size.x,size.z)/2*w*camera.zoom/(camera.right-camera.left);
     const pr=palco.getBoundingClientRect(),hr=hero.getBoundingClientRect(),hs=getComputedStyle(hero),cr=hero.querySelector('.hero-copy').getBoundingClientRect();
     const xz=(parseFloat(hs.getPropertyValue('--xadrez'))||20)+10,limiteE=(cr.bottom>pr.top+4?cr.right+16:hr.left+xz)-pr.left,limiteD=hr.right-xz-pr.left;
     const metade=Math.min(pr.width/2-limiteE,limiteD-pr.width/2);
     let maior=0;for(const layer of layers)maior=Math.max(maior,layer.label.offsetWidth+parseFloat(getComputedStyle(layer.label).marginLeft||0)+parseFloat(getComputedStyle(layer.label).marginRight||0));
     const cabe=(metade-maior-12)/meia;
     if(cabe<1)camera.zoom*=1+(Math.max(.3,cabe)-1)*progress;
   }
   camera.updateProjectionMatrix();
   pivot.rotation.y=angle+(motion.matches?0:progress*.28);
   renderer.render(scene,camera);
   caixa.style.opacity=mostrar;
   if(mostrar>0&&espaco){
     const w=host.clientWidth,h=host.clientHeight,ox=host.offsetLeft,oy=host.offsetTop;
     const meia=Math.max(size.x,size.z)/2*w*camera.zoom/(camera.right-camera.left);
     for(const layer of layers){
       caixaCamada.setFromObject(layer.mesh).getCenter(ponto);ponto.project(camera);
       const x=ox+(ponto.x+1)/2*w,y=oy+(1-ponto.y)/2*h,el=layer.label;
       layer.y=y;
       if(layer.lado==='d'){el.style.left=(x+meia+8)+'px';el.style.right='auto'}
       else{el.style.right=(palco.clientWidth-(x-meia-8))+'px';el.style.left='auto'}
       el.style.transform='translateY(-50%) translateX('+(motion.matches?0:(1-mostrar)*(layer.lado==='d'?-10:10))+'px)';
     }
     // Espaça as legendas de cada lado para não se sobreporem.
     for(const lado of ['d','e']){
       const lista=layers.filter(l=>l.lado===lado).sort((a,b)=>a.y-b.y);let fim=-Infinity;
       for(const l of lista){const alt=l.label.offsetHeight;let y=Math.max(l.y,fim+alt/2+6);l.label.style.top=y+'px';fim=y+alt/2}
     }
   }
 }
 window.addEventListener('scroll',refresh,{passive:true});
 function refresh(){if(!frame&&visible)frame=requestAnimationFrame(draw)}
 new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight,r=w/h,v=Math.max(size.y*1.42,size.x*1.25/r);camera.left=-v*r/2;camera.right=-camera.left;camera.top=v/2;camera.bottom=-v/2;camera.updateProjectionMatrix();renderer.setSize(w,h,false);refresh()}).observe(host);
 new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;refresh()}).observe(host);motion.addEventListener('change',refresh);state.hidden=true;
 host.onpointerdown=e=>{drag=e.clientX;host.setPointerCapture(e.pointerId)};host.onpointermove=e=>{if(drag===null)return;angle+=(e.clientX-drag)*.012;drag=e.clientX;refresh()};host.onlostpointercapture=()=>drag=null;host.onkeydown=e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();angle+=e.key==='ArrowRight'?.25:-.25;refresh()}}
 },()=>state.textContent='O modelo 3D não pôde ser carregado.');
}catch{state.textContent='Ative a aceleração gráfica do navegador para explorar o hambúrguer 3D.'}})();
