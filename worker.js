/** UltraPlus-Free v6.1.0 - full deployable Worker */
const LANGS = ["en","fa","zh"];
const T = {
en:{title:"UltraPlus-Free",login:"Login",pass:"Password",dash:"Dashboard",users:"Users",settings:"Settings",logout:"Logout",add:"Add user",name:"Name",sub:"Sub link",wrong:"Wrong password",enable:"On",disable:"Off",del:"Delete",welcome:"Welcome",wizard:"Wizard",never:"Never",copy:"Copy"},
fa:{title:"UltraPlus-Free",login:"ورود",pass:"رمز",dash:"داشبورد",users:"کاربران",settings:"تنظیمات",logout:"خروج",add:"افزودن",name:"نام",sub:"لینک ساب",wrong:"رمز اشتباه",enable:"فعال",disable:"غیرفعال",del:"حذف",welcome:"خوش آمدید",wizard:"ویزارد",never:"دائم",copy:"کپی"},
zh:{title:"UltraPlus-Free",login:"登录",pass:"密码",dash:"面板",users:"用户",settings:"设置",logout:"退出",add:"添加",name:"名称",sub:"订阅",wrong:"密码错误",enable:"开",disable:"关",del:"删",welcome:"欢迎",wizard:"向导",never:"永久",copy:"复制"}
};
function t(l,k){return (T[l]&&T[l][k])||T.en[k]||k;}
function lang(req){const u=new URL(req.url);const q=u.searchParams.get("lang");if(q&&LANGS.includes(q))return q;const a=req.headers.get("Accept-Language")||"";if(a.includes("fa"))return"fa";if(a.includes("zh"))return"zh";return"en";}
function uuid(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,c=>{const r=Math.random()*16|0;return(c==="x"?r:(r&3)|8).toString(16);});}
let memUsers=[];
let stats={ok:0,fail:0,auth:0,active:0};
let uuidAct=Object.create(null);
const MAX_WS=48;

async function loadUsers(env){
  if(env.ULTRA_KV){const d=await env.ULTRA_KV.get("users","json");return d||[];}
  return memUsers;
}
async function saveUsers(env,users){
  if(env.ULTRA_KV)await env.ULTRA_KV.put("users",JSON.stringify(users));
  else memUsers=users;
}
async function loadSettings(env){
  const def={path:"/",remark:"UltraPlus",sni:"",fp:"chrome",extraHosts:"",maintenance:false,enableVless:true,enableTrojan:true,maxPerUser:2,maxUsers:500,dohUpstream:"https://1.1.1.1/dns-query"};
  if(env.ULTRA_KV){const d=await env.ULTRA_KV.get("settings","json");return Object.assign({},def,d||{});}
  return def;
}
async function saveSettings(env,s){
  if(env.ULTRA_KV)await env.ULTRA_KV.put("settings",JSON.stringify(s));
}
function cookie(req,n){const m=(req.headers.get("Cookie")||"").match(new RegExp("(?:^|; )"+n+"=([^;]*)"));return m?decodeURIComponent(m[1]):null;}
async function adminPass(env){return env.ADMIN_PASSWORD||"admin";}
async function authed(req,env){return cookie(req,"up_auth")===btoa(await adminPass(env));}
function valid(u){if(!u||!u.enable)return false;if(u.expire&&u.expire>0&&Date.now()>u.expire)return false;return true;}

function vlessLink(user,host,st,addr){
  st=st||{};const server=addr||host;const path=encodeURIComponent(st.path||"/");
  const sni=st.sni||host;const fp=encodeURIComponent(st.fp||"chrome");
  const remark=encodeURIComponent((st.remark||"UP")+"-"+(user.name||"u"));
  return "vless://"+user.uuid+"@"+server+":443?encryption=none&security=tls&sni="+sni+"&fp="+fp+"&type=ws&host="+host+"&path="+path+"#"+remark;
}
function trojanLink(user,host,st,addr){
  st=st||{};const server=addr||host;const path=encodeURIComponent(st.path||"/");
  const sni=st.sni||host;const fp=encodeURIComponent(st.fp||"chrome");
  const remark=encodeURIComponent((st.remark||"UP")+"-TR-"+(user.name||"u"));
  return "trojan://"+user.uuid+"@"+server+":443?security=tls&sni="+sni+"&fp="+fp+"&type=ws&host="+host+"&path="+path+"#"+remark;
}
function allLinks(user,host,st){
  st=st||{};const list=[];const addrs=[host].concat((st.extraHosts||"").split(/[\s,]+/).map(s=>s.trim()).filter(Boolean));
  const seen={};
  for(const a of addrs){if(seen[a])continue;seen[a]=1;if(st.enableVless!==false)list.push(vlessLink(user,host,st,a===host?null:a));if(st.enableTrojan)list.push(trojanLink(user,host,st,a===host?null:a));}
  if(!list.length)list.push(vlessLink(user,host,st));
  return list;
}

function uuidStr(arr,o){const h=[];for(let i=0;i<16;i++)h.push(arr[o+i].toString(16).padStart(2,"0"));return h.slice(0,4).join("")+"-"+h.slice(4,6).join("")+"-"+h.slice(6,8).join("")+"-"+h.slice(8,10).join("")+"-"+h.slice(10,16).join("");}
function parseVless(buf){
  if(buf.length<24)return null;let i=0;const ver=buf[i++];const id=uuidStr(buf,i);i+=16;
  if(!/^[0-9a-f-]{36}$/i.test(id))return null;
  const al=buf[i++];if(buf.length<i+al+4)return null;i+=al;
  const cmd=buf[i++];const port=(buf[i]<<8)|buf[i+1];i+=2;const at=buf[i++];let addr="";
  if(at===1){if(buf.length<i+4)return null;addr=buf[i]+"."+buf[i+1]+"."+buf[i+2]+"."+buf[i+3];i+=4;}
  else if(at===2){const l=buf[i++];if(buf.length<i+l)return null;addr=new TextDecoder().decode(buf.slice(i,i+l));i+=l;}
  else if(at===3){if(buf.length<i+16)return null;const p=[];for(let j=0;j<16;j+=2)p.push(((buf[i+j]<<8)|buf[i+j+1]).toString(16));addr=p.join(":");i+=16;}
  else return null;
  return{version:ver,uuid:id,command:cmd,port,address:addr,payload:buf.length>i?buf.slice(i):new Uint8Array(0)};
}
function sha224(msg){
  function rotr(n,x){return(x>>>n)|(x<<(32-n));}
  const K=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
  let H=[0xc1059ed8,0x367cd507,0x3070dd17,0xf70e5939,0xffc00b31,0x68581511,0x64f98fa7,0xbefa4fa4];
  const m=new TextEncoder().encode(msg);const l=m.length;const bitLen=l*8;
  const pad=(64-((l+1+8)%64))%64;const buf=new Uint8Array(l+1+pad+8);buf.set(m);buf[l]=0x80;
  const dv=new DataView(buf.buffer);dv.setUint32(buf.length-8,Math.floor(bitLen/0x100000000),false);dv.setUint32(buf.length-4,bitLen>>>0,false);
  for(let off=0;off<buf.length;off+=64){
    const w=new Uint32Array(64);for(let i=0;i<16;i++)w[i]=dv.getUint32(off+i*4,false);
    for(let i=16;i<64;i++){const s0=rotr(7,w[i-15])^rotr(18,w[i-15])^(w[i-15]>>>3);const s1=rotr(17,w[i-2])^rotr(19,w[i-2])^(w[i-2]>>>10);w[i]=(w[i-16]+s0+w[i-7]+s1)>>>0;}
    let[a,b,c,d,e,f,g,h]=H;
    for(let i=0;i<64;i++){const S1=rotr(6,e)^rotr(11,e)^rotr(25,e);const ch=(e&f)^(~e&g);const t1=(h+S1+ch+K[i]+w[i])>>>0;const S0=rotr(2,a)^rotr(13,a)^rotr(22,a);const maj=(a&b)^(a&c)^(b&c);const t2=(S0+maj)>>>0;h=g;g=f;f=e;e=(d+t1)>>>0;d=c;c=b;b=a;a=(t1+t2)>>>0;}
    H=H.map((x,i)=>(x+[a,b,c,d,e,f,g,h][i])>>>0);
  }
  return H.slice(0,7).map(x=>x.toString(16).padStart(8,"0")).join("");
}
function parseTrojan(buf){
  if(buf.length<58)return null;const head=new TextDecoder().decode(buf.slice(0,56));
  if(!/^[0-9a-f]{56}$/i.test(head)||buf[56]!==0x0d||buf[57]!==0x0a)return null;
  let i=58;if(buf.length<i+3)return null;if(buf[i++]!==1)return null;const at=buf[i++];let addr="";
  if(at===1){if(buf.length<i+6)return null;addr=buf[i]+"."+buf[i+1]+"."+buf[i+2]+"."+buf[i+3];i+=4;}
  else if(at===3){const l=buf[i++];if(buf.length<i+l+2)return null;addr=new TextDecoder().decode(buf.slice(i,i+l));i+=l;}
  else if(at===4){if(buf.length<i+18)return null;const p=[];for(let j=0;j<16;j+=2)p.push(((buf[i+j]<<8)|buf[i+j+1]).toString(16));addr=p.join(":");i+=16;}
  else return null;
  const port=(buf[i]<<8)|buf[i+1];i+=2;
  return{address:addr,port,payload:buf.length>i?buf.slice(i):new Uint8Array(0),hash:head.toLowerCase()};
}
function concat(chunks){let n=0;for(const c of chunks)n+=c.length;const o=new Uint8Array(n);let p=0;for(const c of chunks){o.set(c,p);p+=c.length;}return o;}
function closeWs(ws,code,reason){try{if(ws.readyState<=1)ws.close(code||1000,reason||"");}catch(e){}}

async function handleSession(ws,env,request){
  if(stats.active>=MAX_WS){closeWs(ws,1013,"busy");return;}
  stats.active++;
  let writer=null,remote=null,parsedHdr=false,closed=false,sid=null;
  const early=[],q=[];let writing=false;
  async function flush(){if(writing||!writer)return;writing=true;try{while(q.length&&writer)await writer.write(q.shift());}catch(e){stop();}finally{writing=false;}}
  function stop(){if(closed)return;closed=true;if(stats.active>0)stats.active--;if(sid&&uuidAct[sid]){uuidAct[sid]--;if(uuidAct[sid]<=0)delete uuidAct[sid];}try{if(writer)writer.releaseLock();}catch(e){}try{if(remote&&remote.close)remote.close();}catch(e){}closeWs(ws);}
  async function pump(readable){const r=readable.getReader();try{while(true){const{done,value}=await r.read();if(done)break;if(ws.readyState!==1)break;ws.send(value);}}catch(e){}finally{try{r.releaseLock();}catch(e){}stop();}}
  ws.addEventListener("message",async ev=>{
    if(closed)return;
    try{
      let data;if(ev.data instanceof ArrayBuffer)data=new Uint8Array(ev.data);else if(typeof ev.data==="string")return;else data=new Uint8Array(await ev.data.arrayBuffer());
      if(!parsedHdr){
        early.push(data);const blob=concat(early);
        let p=parseVless(blob);let proto="vless";
        if(!p&&blob.length>=58){
          const tr=parseTrojan(blob);
          if(tr){const users=await loadUsers(env);for(const u of users){if(!valid(u))continue;if(sha224(u.uuid)===tr.hash){p={version:0,uuid:u.uuid,command:1,port:tr.port,address:tr.address,payload:tr.payload};proto="trojan";break;}}}
        }
        if(!p){if(blob.length>2048)stop();return;}
        parsedHdr=true;
        const users=await loadUsers(env);const st=await loadSettings(env);
        if(proto==="vless"&&st.enableVless===false){closeWs(ws,1008,"vless-off");return;}
        if(proto==="trojan"&&st.enableTrojan===false){closeWs(ws,1008,"trojan-off");return;}
        if(!users.some(u=>u.uuid.toLowerCase()===p.uuid.toLowerCase()&&valid(u))){stats.auth++;closeWs(ws,1008,"auth");return;}
        if(p.command!==1||!p.address||!p.port){stats.fail++;closeWs(ws,1008,"bad");return;}
        const key=p.uuid.toLowerCase();const max=Math.min(16,Math.max(1,parseInt(st.maxPerUser,10)||2));
        if((uuidAct[key]||0)>=max){closeWs(ws,1013,"limit");return;}
        uuidAct[key]=(uuidAct[key]||0)+1;sid=key;
        try{
          const sock=await import("cloudflare:sockets");
          remote=sock.connect({hostname:p.address,port:p.port});
          writer=remote.writable.getWriter();stats.ok++;
        }catch(e){stats.fail++;closeWs(ws,1011,"connect");return;}
        if(ws.readyState===1)ws.send(new Uint8Array([p.version||0,0]));
        if(p.payload&&p.payload.length){q.push(p.payload);await flush();}
        pump(remote.readable);return;
      }
      if(q.length<64)q.push(data);else{stop();return;}
      await flush();
    }catch(e){stop();}
  });
  ws.addEventListener("close",()=>stop());
  ws.addEventListener("error",()=>stop());
}

function html(l,title,body){
  const dir=l==="fa"?"rtl":"ltr";
  return`<!DOCTYPE html><html lang="${l}" dir="${dir}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
<style>body{font-family:system-ui;background:#0f172a;color:#f1f5f9;margin:0;padding:1rem}a{color:#0ea5e9;text-decoration:none}
.card{background:#1e293b;padding:1.25rem;border-radius:.75rem;max-width:960px;margin:0 auto 1rem;border:1px solid #334155}
input,button,textarea{padding:.5rem;border-radius:.4rem;border:1px solid #334155;background:#0f172a;color:#f1f5f9;margin:.2rem}
button,.btn{background:#0ea5e9;color:#fff;border:none;cursor:pointer;display:inline-block;padding:.4rem .7rem;border-radius:.4rem;font-size:.85rem}
.btn-d{background:#ef4444}.badge{background:#10b981;padding:.1rem .4rem;border-radius:999px;font-size:.75rem}
table{width:100%;border-collapse:collapse;font-size:.85rem}td,th{padding:.5rem;border-bottom:1px solid #334155;text-align:start}
.nav a{margin:0 .4rem}.sub{font-size:.7rem;word-break:break-all;background:#0f172a;padding:.3rem;border-radius:.3rem;margin-top:.3rem}
.warn{background:#422006;color:#fcd34d;padding:.75rem;border-radius:.5rem;margin-bottom:1rem}</style></head>
<body><div class="card"><div class="nav"><a href="/admin?lang=${l}">${t(l,"dash")}</a><a href="/admin/users?lang=${l}">${t(l,"users")}</a><a href="/admin/settings?lang=${l}">${t(l,"settings")}</a><a href="/wizard?lang=${l}">${t(l,"wizard")}</a><a href="/logout?lang=${l}">${t(l,"logout")}</a></div></div><div class="card">${body}</div>
<p style="text-align:center;opacity:.5;font-size:.75rem">UltraPlus-Free v6.1.0</p></body></html>`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const l = lang(request);
    const host = url.hostname;

    if ((request.headers.get("Upgrade") || "").toLowerCase() === "websocket") {
      try {
        const st = await loadSettings(env);
        const want = (st.path || "/").replace(/\/$/, "") || "/";
        const got = (path || "/").replace(/\/$/, "") || "/";
        if (want !== got) return new Response("Path mismatch", { status: 404 });
      } catch (e) {}
      const pair = new WebSocketPair();
      pair[1].accept();
      handleSession(pair[1], env, request).catch(() => {});
      return new Response(null, { status: 101, webSocket: pair[0] });
    }

    if (path === "/dns-query" || path === "/dns") {
      try {
        const st = await loadSettings(env);
        const up = st.dohUpstream || "https://1.1.1.1/dns-query";
        let body;
        if (request.method === "GET") {
          const dns = url.searchParams.get("dns");
          if (!dns) return new Response("missing dns", { status: 400 });
          body = Uint8Array.from(atob(dns.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
        } else body = new Uint8Array(await request.arrayBuffer());
        const r = await fetch(up, { method: "POST", headers: { "Content-Type": "application/dns-message", "Accept": "application/dns-message" }, body });
        return new Response(await r.arrayBuffer(), { status: r.status, headers: { "Content-Type": "application/dns-message", "Access-Control-Allow-Origin": "*" } });
      } catch (e) { return new Response("doh error", { status: 502 }); }
    }

    if (path === "/ip") {
      const cf = request.cf || {};
      return Response.json({ ip: request.headers.get("CF-Connecting-IP"), colo: cf.colo || null, country: cf.country || null, v: "6.1.0" });
    }
    if (path === "/health" || path === "/status") {
      const users = await loadUsers(env);
      return Response.json({ status: "ok", project: "UltraPlus-Free", version: "6.1.0", users: users.length, kv: !!env.ULTRA_KV, proxy: true, stats });
    }
    if (path === "/robots.txt") return new Response("User-agent: *\nDisallow: /\n", { headers: { "Content-Type": "text/plain" } });

    if (path === "/login" && request.method === "POST") {
      const form = await request.formData();
      const pass = (form.get("pass") || "") + "";
      const ll = (form.get("lang") || l) + "";
      if (pass === await adminPass(env)) {
        return new Response(null, { status: 302, headers: { Location: "/admin?lang=" + ll, "Set-Cookie": "up_auth=" + encodeURIComponent(btoa(pass)) + "; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400" } });
      }
      return new Response(loginPage(ll, true), { headers: { "Content-Type": "text/html;charset=utf-8" } });
    }
    if (path === "/logout") {
      return new Response(null, { status: 302, headers: { Location: "/?lang=" + l, "Set-Cookie": "up_auth=; Path=/; Max-Age=0" } });
    }
    if (path === "/" || path === "/login") {
      return new Response(loginPage(l, false), { headers: { "Content-Type": "text/html;charset=utf-8" } });
    }
    if (path === "/wizard") {
      return new Response(html(l, t(l, "wizard"), `<h2>${t(l, "wizard")}</h2>
<ol><li>Cloudflare → Workers → Create → paste <b>worker.js</b> → Deploy</li>
<li>KV binding name: <code>ULTRA_KV</code></li>
<li>Variable: <code>ADMIN_PASSWORD</code></li>
<li>Open <code>/admin</code></li></ol>
<p><a class="btn" href="/admin?lang=${l}">${t(l, "dash")}</a></p>`), { headers: { "Content-Type": "text/html;charset=utf-8" } });
    }

    if (path.startsWith("/sub/")) {
      const id = path.slice(5).split("?")[0];
      if (env.SUB_TOKEN) {
        const tok = url.searchParams.get("token") || "";
        if (tok !== String(env.SUB_TOKEN)) return new Response("Forbidden", { status: 403 });
      }
      const users = await loadUsers(env);
      const st = await loadSettings(env);
      if (st.maintenance) return new Response("Maintenance", { status: 503 });
      const user = users.find(u => u.uuid === id && valid(u));
      if (!user) return new Response("Not found", { status: 404 });
      const format = (url.searchParams.get("format") || "base64").toLowerCase();
      const links = allLinks(user, host, st);
      const headers = { "Profile-Update-Interval": "24" };
      if (format === "raw") return new Response(links.join("\n"), { headers: { ...headers, "Content-Type": "text/plain;charset=utf-8" } });
      if (format === "clash") {
        let y = "proxies:\n";
        for (let i = 0; i < links.length; i++) {
          const isTr = links[i].startsWith("trojan://");
          const name = (st.remark || "UP") + "-" + (user.name || "u") + "-" + i;
          if (isTr) y += "  - name: " + name + "\n    type: trojan\n    server: " + host + "\n    port: 443\n    password: " + user.uuid + "\n    network: ws\n    sni: " + (st.sni || host) + "\n    ws-opts:\n      path: \"" + (st.path || "/") + "\"\n      headers:\n        Host: " + host + "\n";
          else y += "  - name: " + name + "\n    type: vless\n    server: " + host + "\n    port: 443\n    uuid: " + user.uuid + "\n    network: ws\n    tls: true\n    servername: " + (st.sni || host) + "\n    ws-opts:\n      path: \"" + (st.path || "/") + "\"\n      headers:\n        Host: " + host + "\n";
        }
        y += "proxy-groups:\n  - name: PROXY\n    type: select\n    proxies:\n";
        for (let i = 0; i < links.length; i++) y += "      - " + (st.remark || "UP") + "-" + (user.name || "u") + "-" + i + "\n";
        y += "rules:\n  - MATCH,PROXY\n";
        return new Response(y, { headers: { ...headers, "Content-Type": "text/yaml;charset=utf-8" } });
      }
      const b64 = btoa(unescape(encodeURIComponent(links.join("\n"))));
      return new Response(b64, { headers: { ...headers, "Content-Type": "text/plain;charset=utf-8" } });
    }

    if (path.startsWith("/client/")) {
      const id = path.slice(8);
      const users = await loadUsers(env);
      const st = await loadSettings(env);
      const user = users.find(u => u.uuid === id && valid(u));
      if (!user) return new Response("Not found", { status: 404 });
      const sub = "https://" + host + "/sub/" + id;
      const links = allLinks(user, host, st);
      return new Response(`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${user.name}</title>
<style>body{font-family:system-ui;background:#0f172a;color:#f1f5f9;padding:1rem}code{word-break:break-all;background:#1e293b;padding:.5rem;display:block;border-radius:.4rem;margin:.5rem 0}</style></head>
<body><h1>${user.name}</h1><p>Sub:</p><code>${sub}</code><p>Links:</p>${links.map(x=>"<code>"+x+"</code>").join("")}</body></html>`, { headers: { "Content-Type": "text/html;charset=utf-8" } });
    }

    if (path.startsWith("/admin")) {
      if (!(await authed(request, env))) return new Response(null, { status: 302, headers: { Location: "/?lang=" + l } });
      let users = await loadUsers(env);
      const st = await loadSettings(env);

      if (path === "/admin/users/add" && request.method === "POST") {
        const form = await request.formData();
        const name = ((form.get("name") || "user") + "").trim() || "user";
        const days = parseInt((form.get("days") || "0") + "", 10) || 0;
        if (users.length >= (st.maxUsers || 500)) return new Response("Max users", { status: 400 });
        users.push({ id: uuid(), name, uuid: uuid(), created: Date.now(), enable: true, expire: days > 0 ? Date.now() + days * 86400000 : 0, totalGB: 0 });
        await saveUsers(env, users);
        return new Response(null, { status: 302, headers: { Location: "/admin/users?lang=" + l } });
      }
      if (path === "/admin/users/toggle" && request.method === "POST") {
        const form = await request.formData();
        const id = (form.get("id") || "") + "";
        users = users.map(u => u.id === id ? Object.assign({}, u, { enable: !u.enable }) : u);
        await saveUsers(env, users);
        return new Response(null, { status: 302, headers: { Location: "/admin/users?lang=" + l } });
      }
      if (path === "/admin/users/delete" && request.method === "POST") {
        const form = await request.formData();
        const id = (form.get("id") || "") + "";
        users = users.filter(u => u.id !== id);
        await saveUsers(env, users);
        return new Response(null, { status: 302, headers: { Location: "/admin/users?lang=" + l } });
      }
      if (path === "/admin/settings/save" && request.method === "POST") {
        const form = await request.formData();
        const next = Object.assign({}, st, {
          path: ((form.get("path") || "/") + "").trim() || "/",
          remark: ((form.get("remark") || "UltraPlus") + "").trim(),
          sni: ((form.get("sni") || "") + "").trim(),
          fp: ((form.get("fp") || "chrome") + "").trim() || "chrome",
          extraHosts: ((form.get("extraHosts") || "") + "").trim(),
          maintenance: form.get("maintenance") === "on",
          enableVless: form.get("enableVless") === "on",
          enableTrojan: form.get("enableTrojan") === "on",
          maxPerUser: Math.min(16, Math.max(1, parseInt((form.get("maxPerUser") || "2") + "", 10) || 2))
        });
        await saveSettings(env, next);
        return new Response(null, { status: 302, headers: { Location: "/admin/settings?lang=" + l } });
      }

      if (path === "/admin/users") {
        let rows = users.length ? "" : "<tr><td colspan=4>No users</td></tr>";
        for (const u of users) {
          const sub = "https://" + host + "/sub/" + u.uuid;
          const exp = u.expire && u.expire > 0 ? new Date(u.expire).toLocaleDateString() : t(l, "never");
          rows += `<tr><td>${u.name}<div class="sub">${sub}</div></td><td><code style="font-size:.65rem">${u.uuid}</code></td><td>${u.enable ? '<span class="badge">' + t(l, "enable") + '</span>' : t(l, "disable")}<br>${exp}</td><td>
<a class="btn" href="${sub}" target="_blank">${t(l, "sub")}</a>
<form method="POST" action="/admin/users/toggle" style="display:inline"><input type="hidden" name="id" value="${u.id}"><button type="submit">${t(l, "enable")}/${t(l, "disable")}</button></form>
<form method="POST" action="/admin/users/delete" style="display:inline"><input type="hidden" name="id" value="${u.id}"><button class="btn-d" type="submit">${t(l, "del")}</button></form></td></tr>`;
        }
        return new Response(html(l, t(l, "users"), `<h2>${t(l, "users")}</h2>
<form method="POST" action="/admin/users/add">${t(l, "name")}: <input name="name" required> days: <input name="days" type="number" value="0" style="width:4rem"> <button type="submit">${t(l, "add")}</button></form>
<table><tr><th>${t(l, "name")}</th><th>UUID</th><th>Status</th><th></th></tr>${rows}</table>`), { headers: { "Content-Type": "text/html;charset=utf-8" } });
      }

      if (path === "/admin/settings") {
        return new Response(html(l, t(l, "settings"), `<h2>${t(l, "settings")}</h2>
<div class="warn">Default password is admin — set ADMIN_PASSWORD in Worker variables. KV binding name: ULTRA_KV</div>
<form method="POST" action="/admin/settings/save">
WS Path <input name="path" value="${(st.path || "/").replace(/"/g, "")}"><br>
Remark <input name="remark" value="${(st.remark || "").replace(/"/g, "")}"><br>
SNI <input name="sni" value="${(st.sni || "").replace(/"/g, "")}"><br>
FP <input name="fp" value="${(st.fp || "chrome").replace(/"/g, "")}"><br>
Extra hosts <input name="extraHosts" value="${(st.extraHosts || "").replace(/"/g, "")}" style="width:100%"><br>
Max WS/user <input name="maxPerUser" type="number" value="${st.maxPerUser || 2}"><br>
<label><input type="checkbox" name="enableVless" ${st.enableVless !== false ? "checked" : ""}> VLESS</label>
<label><input type="checkbox" name="enableTrojan" ${st.enableTrojan !== false ? "checked" : ""}> Trojan</label>
<label><input type="checkbox" name="maintenance" ${st.maintenance ? "checked" : ""}> Maintenance</label><br>
<button type="submit">Save</button></form>`), { headers: { "Content-Type": "text/html;charset=utf-8" } });
      }

      const active = users.filter(valid).length;
      return new Response(html(l, t(l, "dash"), `<h2>${t(l, "welcome")}</h2>
<p>Worker: <code>${host}</code> · KV: ${env.ULTRA_KV ? "ON" : "OFF"} · v6.1.0</p>
<p>Users: ${users.length} · Active: ${active} · Proxy OK: ${stats.ok} · Fail: ${stats.fail} · WS: ${stats.active}</p>
<p><a class="btn" href="/admin/users?lang=${l}">${t(l, "users")}</a> <a class="btn" href="/admin/settings?lang=${l}">${t(l, "settings")}</a> <a class="btn" href="/health" target="_blank">/health</a></p>
<div class="warn">Set ADMIN_PASSWORD · Bind KV as ULTRA_KV · Client: type=ws, TLS, path from Settings</div>`), { headers: { "Content-Type": "text/html;charset=utf-8" } });
    }

    return new Response("UltraPlus-Free v6.1.0 — /admin or /wizard", { headers: { "Content-Type": "text/plain;charset=utf-8" } });
  }
};

function loginPage(l, err) {
  const dir = l === "fa" ? "rtl" : "ltr";
  return `<!DOCTYPE html><html lang="${l}" dir="${dir}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${t(l, "title")}</title>
<style>body{font-family:system-ui;background:#0f172a;color:#f1f5f9;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0}
.card{background:#1e293b;padding:2rem;border-radius:1rem;width:90%;max-width:380px}input,button{width:100%;padding:.75rem;margin:.4rem 0;border-radius:.5rem;border:1px solid #334155;background:#0f172a;color:#fff}
button{background:#0ea5e9;border:none;font-weight:600}.err{color:#ef4444;text-align:center}a{color:#0ea5e9}</style></head>
<body><div class="card"><h1 style="text-align:center">${t(l, "title")}</h1>
<p style="text-align:center;opacity:.6">v6.1.0</p>
${err ? '<p class="err">' + t(l, "wrong") + '</p>' : ""}
<form method="POST" action="/login"><input type="hidden" name="lang" value="${l}">
<input type="password" name="pass" placeholder="${t(l, "pass")}" required autofocus>
<button type="submit">${t(l, "login")}</button></form>
<p style="text-align:center;margin-top:1rem"><a href="/?lang=en">EN</a> · <a href="/?lang=fa">FA</a> · <a href="/?lang=zh">中文</a></p>
</div></body></html>`;
}
