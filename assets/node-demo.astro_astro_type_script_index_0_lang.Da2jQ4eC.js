import"./playground-preview.Cvrxsvqu.js";import"./DemoTree.Bym4JiGz.js";import"./lion-progress-indicator.hHndt_rR.js";import{L as fe}from"./LionAccordion.CCw3hAmZ.js";const G="ui-portal-section-accordion";class ge extends fe{static get properties(){return{sections:{type:Boolean,reflect:!0},sectionsFrom:{type:String,attribute:"sections-from"}}}constructor(){super(),this.sections=!1,this.sectionsFrom="(min-width: 48.01rem)",this.__query=null,this.__onQueryChange=()=>{this.sections=!!this.__query?.matches},this.__swallowSectionClicks=e=>{if(!this.sections)return;const n=e.target;n.closest?.(".invoker")&&this.contains(n)&&e.stopPropagation()}}connectedCallback(){super.connectedCallback(),this.addEventListener("click",this.__swallowSectionClicks,!0),this.__watch()}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("click",this.__swallowSectionClicks,!0),this.__query?.removeEventListener("change",this.__onQueryChange)}updated(e){super.updated(e),e.has("sectionsFrom")&&this.isConnected&&this.__watch(),e.has("sections")&&(this.expanded=[...this.expanded])}__watch(){this.__query?.removeEventListener("change",this.__onQueryChange),this.__query=window.matchMedia(this.sectionsFrom),this.__query.addEventListener("change",this.__onQueryChange),this.__onQueryChange()}_setupInvoker(e){super._setupInvoker(e);const n=e.invoker.firstElementChild;n&&(n.__sectionKeydown||(n.__sectionKeydown=r=>{this.sections||r.key!=="Enter"&&r.key!==" "||(r.preventDefault(),n.click())},n.addEventListener("keydown",n.__sectionKeydown)),this.__applyControlSemantics(e))}_expand(e){super._expand(e),this.__applyControlSemantics(e)}_collapse(e){if(this.sections){this._expand(e);return}super._collapse(e),this.__applyControlSemantics(e)}__applyControlSemantics(e){const n=e.invoker.firstElementChild;n&&(this.sections?(n.removeAttribute("role"),n.removeAttribute("tabindex"),n.removeAttribute("aria-expanded"),n.removeAttribute("aria-controls")):(n.setAttribute("role","button"),n.setAttribute("tabindex","0"),n.setAttribute("aria-controls",e.content.id),n.setAttribute("aria-expanded",String(e.content.hasAttribute("expanded")))))}}customElements.get(G)||customElements.define(G,ge);const N="/lion",z=N.endsWith("/")?N:`${N}/`,$=`${z}lion-playground-node-demo/`,P=new URL(`${$}engine.js`,location.href).href,be=!1,L=document.querySelector("#project"),B=document.querySelector("#editor"),K=document.querySelector("#preview");B.project=L;K.project=L;K.htmlFile="index.html";const oe=document.querySelector("#modes"),p=document.querySelector("#status"),ye=document.querySelector("#content-check"),Z=document.querySelector("#findings"),Q=document.querySelector("#output"),ie=document.querySelector("#node-panes"),I=document.querySelector("#files"),ee=document.querySelector("#packages"),we=document.querySelector("#mode-note"),te=document.querySelector("#governance"),D=document.querySelector("#busy");let U=document.querySelector("#file-tree");const ae=t=>t.endsWith(".html")?"html":t.endsWith(".js")||t.endsWith(".mjs")?"javascript":t.endsWith(".json")?"data_object":t.endsWith(".css")?"css":t.endsWith(".md")?"description":"draft",J=(t,e)=>{const n=document.createElement("span");n.className="material-symbols-outlined",n.setAttribute("aria-hidden","true"),n.textContent=e,t.prepend(n)},ve={client:["web","in the browser"],server:["dns","on the server"]},xe=(t,e)=>{const n={children:new Map};for(const i of Object.keys(e)){const c=i.split("/");let o=n;c.forEach((l,u)=>{o.children.has(l)||o.children.set(l,{children:new Map}),o=o.children.get(l),u===c.length-1&&(o.file=i)})}const r=document.createElement("demo-tree");r.id=t.id;const s=(i,c,o)=>{const l=document.createElement("div");l.setAttribute("role","treeitem");const u=document.createElement("span");return u.textContent=c,l.append(u),J(l,o),i.appendChild(l),l},a=(i,c,o,l)=>{const u=l===0?ve[c]:void 0,f=s(i,c,u?u[0]:"folder_open");if(f.dataset.folder="",f.setAttribute("aria-expanded","true"),u){f.dataset.side=c;const y=document.createElement("span");y.className="tree-hint",y.textContent=u[1],f.append(y)}const S=document.createElement("demo-tree");h(S,o,l+1),i.appendChild(S),f.addEventListener("click",()=>{const y=f.getAttribute("aria-expanded")!=="true";f.setAttribute("aria-expanded",String(y)),u||(f.querySelector(".material-symbols-outlined").textContent=y?"folder_open":"folder"),S.hidden=!y})};function h(i,c,o){for(const[l,u]of c.children)if(u.file){const f=s(i,l,ae(l));f.dataset.file=u.file,f.addEventListener("click",()=>{le(u.file)})}else u.children.size&&a(i,l,u,o)}return h(r,n,0),t.replaceWith(r),r},w=document.querySelector("#open-files"),v=w.parentElement,V=()=>{const t=v.scrollWidth>v.clientWidth+1;v.classList.toggle("is-overflowing",t),v.classList.toggle("is-at-end",v.scrollLeft+v.clientWidth>=v.scrollWidth-1)};v.addEventListener("scroll",V,{passive:!0});new ResizeObserver(V).observe(v);let d=[],g=null,E=null;const A=()=>{w.textContent="",d.forEach(t=>{const e=document.createElement("div");e.slot="tab",e.draggable=!0,e.dataset.file=t;const n=document.createElement("span"),r=t.split("/").pop(),s=d.some(i=>i!==t&&i.split("/").pop()===r);n.textContent=s?t:r,e.title=t;const a=document.createElement("button");a.type="button",a.className="close",a.setAttribute("aria-label",`Close ${t}`),J(a,"close"),a.addEventListener("click",i=>{i.stopPropagation(),ke(t)}),e.append(n,a),J(e,ae(t)),e.addEventListener("dragstart",i=>{E=t,e.classList.add("dragging"),i.dataTransfer?.setData("text/plain",t)}),e.addEventListener("dragend",()=>{e.classList.remove("dragging"),E=null,ne()}),e.addEventListener("dragover",i=>{if(!E||E===t)return;i.preventDefault();const c=w.querySelector(`[slot="tab"][data-file="${CSS.escape(E)}"]`);if(!c||c===e)return;const o=e.getBoundingClientRect(),l=i.clientX>o.left+o.width/2;w.insertBefore(c,l?e.nextSibling:e),c.__panel&&w.insertBefore(c.__panel,c.nextSibling)}),e.addEventListener("drop",i=>{i.preventDefault(),ne()}),w.appendChild(e),e.getAttribute("role")||e.setAttribute("role","tab"),e.setAttribute("aria-selected",String(t===g)),e.tabIndex=t===g?0:-1,e.hasAttribute("aria-controls")||e.setAttribute("aria-controls","editor");const h=document.createElement("div");h.slot="panel",h.hidden=!0,h.setAttribute("aria-hidden","true"),e.__panel=h,w.appendChild(h)}),w.selectedIndex=Math.max(0,d.indexOf(g)),requestAnimationFrame(V);for(const t of U.querySelectorAll('[role="treeitem"][data-file]'))t.dataset.file===g?t.setAttribute("aria-current","true"):t.removeAttribute("aria-current")},le=t=>{d.includes(t)||(d=[...d,t]),g=t,B.filename=t,A()},ke=t=>{const e=d.indexOf(t);d=d.filter(n=>n!==t),g===t&&(g=d[Math.min(e,d.length-1)]??null,g&&(B.filename=g)),A()},ne=()=>{const t=[...w.querySelectorAll('[slot="tab"]')].map(e=>e.dataset.file);t.length===d.length&&(d=t),E=null,A()},je=(t,e)=>{const n=d.indexOf(t),r=n+e;r<0||r>=d.length||(d=d.map((s,a)=>a===n?d[r]:a===r?d[n]:s),A())};w.addEventListener("click",t=>{const e=t.target.closest('[slot="tab"]');e?.dataset.file&&le(e.dataset.file)});document.addEventListener("keydown",t=>{!t.altKey||t.key!=="ArrowLeft"&&t.key!=="ArrowRight"||t.target instanceof Element&&t.target.closest("#editor")||g&&(t.preventDefault(),je(g,t.key==="ArrowLeft"?-1:1))});function Y(t,e){const n=new Set("assert async_hooks buffer child_process cluster console crypto dgram diagnostics_channel dns events fs http http2 https inspector module net os path perf_hooks process querystring readline repl stream string_decoder timers tls tty url util v8 vm worker_threads zlib".split(" ")),r=[];for(const[s,a]of Object.entries(t))!s.startsWith("client/")||typeof a!="string"||a.split(`
`).forEach((h,i)=>{for(const c of h.matchAll(/(?:\bfrom\s*|\bimport\s*\(?\s*)(['"])([^'"\n]+)\1/g)){let o=c[2];e&&o.startsWith(e)&&(o=o.slice(e.length).replace(/^\/+/,"").replace(/\.js$/,"").replace("fs-promises","fs/promises").replace(/-/g,"_"));const l=`${s}:${i+1}`;o.startsWith("node:")||n.has(o.split("/")[0])?r.push({file:s,line:i+1,specifier:o,message:`${l} imports "${o}", a Node builtin — client/ runs in the browser, where there is no "${o}". Move this code to server/, or have the server send its result to the client.`}):/^\.\.?\//.test(o)&&new URL(o,`file:///${s}`).pathname.startsWith("/server/")&&r.push({file:s,line:i+1,specifier:o,message:`${l} imports "${o}", which is server code — client/ runs in the browser, and server/ is never sent to it. Have the server send its result to the client instead.`})}});return r}const Ce=({names:t,entry:e,hydrate:n})=>`const checkBoundary = ${Y.toString()};
const names = ${JSON.stringify(t)};
const files = {};
let styles = '';
for (const name of names) {
  const content = await (await fetch(name)).text();
  files['/' + name] = { content };
  if (name.startsWith('client/') && name.endsWith('.css')) styles += content;
}
const report = (log, exitCode, written) =>
  window.parent.postMessage({ source: 'lion-node-demo-runner', log, exitCode, files: written || {} }, '*');

// What this document can actually do, measured *here* rather than assumed by the page. The worker's policy is
// what stands in for a boundary in the same-origin posture, so its presence is checked instead of trusted.
const policy = await fetch(location.href).then(
  response => response.headers.get('content-security-policy'),
  () => null,
);
let evalOutcome = 'allowed';
try {
  (0, eval)('1 + 1');
} catch (error) {
  evalOutcome = 'blocked: ' + error.name;
}
let crossOriginOutcome = 'reached';
try {
  await fetch('https://example.com/', { mode: 'no-cors' });
} catch (error) {
  crossOriginOutcome = 'blocked';
}
window.parent.postMessage(
  {
    source: 'lion-node-demo-runner-governance',
    origin: location.origin,
    controlled: Boolean(navigator.serviceWorker.controller),
    policy,
    eval: evalOutcome,
    crossOrigin: crossOriginOutcome,
  },
  '*',
);

// 1. The build.
const violations = checkBoundary(
  Object.fromEntries(names.map(name => [name, files['/' + name].content])),
  ${JSON.stringify(new URL("./shims/",P).href)},
);
if (violations.length) {
  report(violations.map(violation => ({ stream: 'stderr', text: 'build failed: ' + violation.message + '\\n' })), 1);
} else {
  // 2. The server. The engine is imported without a payload on the window, so it does not start itself; the
  // harness runs it and keeps the report, because for ssr the run is not over when the server is.
  const { runDemo } = await import(${JSON.stringify(P)});
  const server = await runDemo({ payload: { entry: new URL(${JSON.stringify(e)}, location.href).href, files } });
  const log = server.log;
  let exitCode = server.exitCode;

  // 3. The client takes over what the server sent.
  const hydrate = ${JSON.stringify(n||null)};
  if (hydrate && exitCode === 0) {
    if (styles) {
      const style = document.createElement('style');
      style.textContent = styles;
      document.head.appendChild(style);
    }
    // The response is parsed the way a browser parses a page from a server: with its declarative shadow roots
    // attached (\`setHTMLUnsafe\`), which \`innerHTML\` would leave as inert templates for hydration to trip over.
    const response = server.files['/response.html'] || '';
    if (document.body.setHTMLUnsafe) document.body.setHTMLUnsafe(response);
    else document.body.innerHTML = response;
    const browserConsole = (...args) => log.push({ stream: 'browser', text: args.map(String).join(' ') + '\\n' });
    globalThis.console = { log: browserConsole, info: browserConsole, debug: browserConsole, warn: browserConsole, error: browserConsole };
    try {
      await import(new URL(hydrate, location.href).href);
    } catch (error) {
      log.push({ stream: 'stderr', text: hydrate + ': ' + (error && error.message ? error.message : error) + '\\n' });
      exitCode = 1;
    }
  }

  // Only what the run wrote or changed: the project's own files are the input, not the result.
  const written = Object.fromEntries(
    Object.entries(server.files).filter(([pathname, content]) => !files[pathname] || files[pathname].content !== content),
  );
  report(log, exitCode, written);
}
`,re=`:root {
  color-scheme: light;
}
body {
  font-family: system-ui, sans-serif;
  background: #f3f3f4;
  color: #1c1c20;
  line-height: 1.5;
  padding: 28px 32px;
  margin: 0;
}
h1 {
  font-size: 1.125rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  margin: 0 0 1rem;
}
lion-input, lion-button {
  display: block;
  max-width: 24rem;
  margin-bottom: 0.75rem;
}
`,C={client:{label:"client",hint:"browser",note:"client/ is what a browser runs: index.html is the document and main.js its module. There is no filesystem and no Node builtins on this side — a client file that imports fs, path or process fails the build check, the way a bundler fails it, and the document has no import for them either.",open:["client/index.html","client/main.js"],active:"client/index.html",files:{"client/index.html":['<link rel="stylesheet" href="./styles.css">',"<h1>A Lion component, running in the browser</h1>",'<lion-input label="Your name"></lion-input>',"<lion-button>Save</lion-button>",'<script type="module" src="./main.js"><\/script>',""].join(`
`),"client/main.js":`import '@lion/ui/define/lion-input.js';
import '@lion/ui/define/lion-button.js';

const button = document.querySelector('lion-button');
button.addEventListener('click', () => {
  button.textContent = 'Saved';
});
`,"client/styles.css":re}},server:{label:"server",hint:"node",note:"server/ is what a server runs: main.js reads server/data.json, writes out.txt, prints to stdout and starts a worker thread that answers with a message. There is no real server — this runs in your browser, against an in-memory filesystem and a dependency-free layer that answers Node’s API (fs, path, process, os, util, events, url, worker_threads); the worker is a real Web Worker. A server has no page, so its result is the console.",open:["server/main.js","server/worker.js"],active:"server/main.js",run:{entry:"server/main.js",status:"Running server/main.js…"},files:{"server/main.js":`import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { Worker } from 'worker_threads';

// Relative paths resolve against the working directory: the project root, under real Node as here.
const data = JSON.parse(readFileSync(join('server', 'data.json'), 'utf8'));
console.log('read server/data.json:', data.message);

writeFileSync('out.txt', data.message.toUpperCase());
console.log('wrote out.txt:', readFileSync('out.txt', 'utf8'));
console.log('in the project root:', readdirSync('.').join(', '));

// A real thread: server/worker.js runs beside this one and answers with a message.
const worker = new Worker(new URL('./worker.js', import.meta.url), { workerData: { value: data.value } });
worker.on('message', message => console.log('worker said', JSON.stringify(message)));
worker.on('error', error => console.error('worker failed:', error.message));
`,"server/worker.js":`import { parentPort, workerData, isMainThread } from 'worker_threads';

parentPort.postMessage({ doubled: workerData.value * 2, inWorker: !isMainThread });
`,"server/data.json":`{
  "message": "hello from the server",
  "value": 21
}
`}},ssr:{label:"ssr",hint:"render + hydrate",note:"One app, two halves. server/render.js renders client/app.js to a string with @lit-labs/ssr and writes it out as the response, with the data it rendered from; the client puts that markup in the page and client/hydrate.js takes over the same components in place, without rendering them again. The server may import client code to render it; the client may not import server code. The server’s stdout and the browser’s console are printed as two sections of the console.",open:["server/render.js","client/app.js","client/hydrate.js"],active:"server/render.js",run:{entry:"server/render.js",hydrate:"client/hydrate.js",status:"Rendering on the server…"},files:{"server/render.js":`import { readFileSync, writeFileSync } from 'fs';
import { render } from '@lit-labs/ssr';
// \`index.js\` re-exports \`render\` and the element renderers, not the collectors: those live in
// \`lib/render-result.js\`, and since this package has no exports map that subpath is a plain specifier the
// import map already carries.
import { collectResult } from '@lit-labs/ssr/lib/render-result.js';
// The server renders the client's own components: server code may import client code, never the reverse.
import { app } from '../client/app.js';

const data = JSON.parse(readFileSync('server/data.json', 'utf8'));

// What a server does: no document, no mount — a string.
const markup = await collectResult(render(app(data)));
console.log('rendered', markup.length, 'characters of markup:');
console.log(markup);

// The response: the markup, and the data it was rendered from, so the client can take over without a refetch.
writeFileSync(
  'response.html',
  '<div id="app">' + markup + '</div>' +
    '<script type="application/json" id="app-data">' + JSON.stringify(data).replace(/</g, '\\\\u003c') + '<\/script>',
);
`,"server/data.json":`{
  "title": "Rendered on the server, hydrated here",
  "field": "Your name",
  "action": "Save"
}
`,"client/app.js":`// One component tree, used by both halves: the server renders it to a string, the client hydrates it.
// The hydrate support has to load before any component is defined, so it comes first.
import '@lit-labs/ssr-client/lit-element-hydrate-support.js';
import { html } from 'lit';
import '@lion/ui/define/lion-button.js';
import '@lion/ui/define/lion-input.js';

export const app = data => html\`<h1>\${data.title}</h1>
<lion-input label="\${data.field}"></lion-input>
<lion-button>\${data.action}</lion-button>\`;
`,"client/hydrate.js":`import { hydrate } from '@lit-labs/ssr-client';
import { app } from './app.js';

// The server's markup is already in the page. Hydrating attaches the components to it instead of rendering again.
const data = JSON.parse(document.querySelector('#app-data').textContent);
hydrate(app(data), document.querySelector('#app'));

await customElements.whenDefined('lion-button');
console.log('hydrated: the button in the page is a', document.querySelector('lion-button').constructor.name);
`,"client/styles.css":re}}},Se=t=>t.endsWith(".html")?"text/html":t.endsWith(".css")?"text/css":t.endsWith(".json")?"application/json":"sample/js";let O="client",_=null;const F=t=>import(t),_e=async()=>{if(!_){const[t,e,n]=await Promise.all([F(`${$}importMapPerPackage.js`).then(s=>s.default),F(`${$}packageMains.js`).then(s=>s.default),F(`${$}host.js`),F(`${$}checkDemoContent.js`).then(s=>_={..._,...s}).catch(()=>{})]);_={..._,importMapPerPackage:(s=>s&&s.imports?{...s,imports:Object.fromEntries(Object.entries(s.imports).map(([a,h])=>[a,typeof h=="string"&&h[0]==="/"&&h[1]!=="/"?`${z}${h}`:h]))}:s)(t),packageMains:e,host:n}}return _},b={log:[],exitCode:null,files:{}},Ee=()=>{let e=b.log.some(r=>r.stream==="browser")?`── server · stdout
`:"",n=!1;for(const r of b.log)r.stream==="browser"&&!n&&(n=!0,e+=`
── client · browser console
`),e+=r.stream==="stderr"?`! ${r.text}`:r.text;Q.textContent=e,I.textContent="";for(const[r,s]of Object.entries(b.files||{})){const a=document.createElement("li");a.textContent=`${r} (${s.length} chars)`,I.appendChild(a)}};window.addEventListener("message",t=>{const e=t.data;if(!e)return;if((e.source==="lion-node-demo-runner"||e.source==="lion-node-demo-runner-governance")&&(D.hidden=!0),e.source==="lion-node-demo-runner-governance"){const r=!!e.policy,s=!0;te.textContent=[`served by the worker: ${e.controlled?"yes":"no"}`,`policy: ${r?"set by the worker":"none"}`,`eval: ${e.eval}`,`cross-origin fetch: ${e.crossOrigin}`,"own-origin posture: no policy expected, the browser is the boundary"].join(" · "),te.dataset.consistent=String(s);return}if(e.source!=="lion-node-demo-runner")return;b.log=e.log||[],b.exitCode=e.exitCode,b.files=e.files||{},Ee();const n=b.log.find(r=>r.text.startsWith("build failed: "));p.textContent=n?`Build failed (exit code ${b.exitCode}): ${n.text.slice(14).trim()}`:`Finished with exit code ${b.exitCode}.`,p.dataset.state=b.exitCode===0?"ok":"error"});const se=document.querySelector("#boundary");let W=[];const ce=t=>{const e=W.filter(n=>n.startsWith("client/")).length;se.dataset.consistent=String(t.length===0),se.textContent=t.length?`client/server boundary: ${t.length} violation(s) — ${t.map(n=>n.message).join(" · ")}`:e?`client/server boundary: ${e} client file(s) checked the way a bundler checks them — no Node builtins, no imports from server/`:"client/server boundary: no client/ files here — server/ may import anything, Node builtins included",C[O].run?t.length&&(p.textContent=`Build failed: ${t[0].message}`,p.dataset.state="error"):(ie.hidden=t.length===0,Q.textContent=t.map(n=>`! build failed: ${n.message}
`).join(""),t.length?(p.textContent=`Build failed: ${t[0].message}`,p.dataset.state="error"):p.dataset.state==="error"&&(p.textContent=C[O].status,p.dataset.state="ok"))},Le=t=>{const e=new Set(Object.keys(t.imports).filter(n=>n.startsWith("node:")).flatMap(n=>[n,n.slice(5)]));return{imports:Object.fromEntries(Object.entries(t.imports).filter(([n])=>!e.has(n)))}};C.client.status="Served by the worker; the preview renders client/index.html.";const de=async t=>{O=t;const e=C[t];document.body.dataset.mode=t;for(const m of oe.querySelectorAll('[role="tab"]'))m.setAttribute("aria-selected",String(m.dataset.mode===t));we.textContent=e.note,ie.hidden=!e.run,p.textContent="Not run yet.",p.dataset.state="running",D.hidden=!1,b.log=[],b.files={},Q.textContent="",I.textContent="";const{importMapPerPackage:n,packageMains:r,host:s,checkDemoContent:a,describeContentReport:h,decideRun:i}=await _e();if(!ee.childElementCount)for(const m of Object.keys(n)){const j=document.createElement("li");j.textContent=m,ee.appendChild(j)}const c=a(e.files),o=i({report:c,sameOriginSandbox:be});ye.textContent=`${h(c)} — ${o.reason}`,Z.textContent="";for(const m of c.findings){const j=document.createElement("li");j.textContent=`${m.file}:${m.line} ${m.rule} (${m.severity})`,Z.appendChild(j)}if(!o.allow){L.config={importMap:{imports:{}},files:{}},p.textContent=o.reason,p.dataset.state="error";return}const l=s.buildFenceImportMap({importMapPerPackage:n,packageMains:r},new URL(z,location.href).href.replace(/\/$/,""),new URL("./shims",P).href),u=e.run?l:Le(l),f=`<script type="importmap">${JSON.stringify(u).replace(/</g,"\\u003c")}<\/script>`;W=Object.keys(e.files);const S={...e.files},y=new Set;e.run&&(S["index.html"]=`<script type="module" src="./boot.js"><\/script>
`,S["boot.js"]=Ce({names:W,entry:e.run.entry,hydrate:e.run.hydrate}),y.add("index.html"),y.add("boot.js")),K.htmlFile=e.run?"index.html":"client/index.html",U=xe(U,e.files),L.config={importMap:u,files:Object.fromEntries(Object.entries(S).map(([m,j])=>[m,{filename:m,contentType:Se(m),content:m.endsWith(".html")?`${f}
${j}`:j,...y.has(m)?{hidden:!0}:{}}]))},d=[...e.open],g=e.active,B.filename=g,A(),p.textContent=e.run?e.run.status:e.status,p.dataset.state=e.run?"running":"ok",D.hidden=!0,ce(Y(e.files))};L.addEventListener("compileDone",()=>{const t=Object.fromEntries((L.files||[]).filter(n=>W.includes(n.name)).map(n=>[n.name,n.content])),e=Y(t);C[O].run&&!e.length&&p.dataset.state!=="running"&&(p.textContent=C[O].run.status,p.dataset.state="running"),ce(e)});for(const t of Object.keys(C)){const e=document.createElement("button");e.type="button",e.setAttribute("role","tab"),e.dataset.mode=t;const{label:n,hint:r}=C[t],s=document.createElement("span");s.className="mode-name",s.textContent=n;const a=document.createElement("span");a.className="mode-hint",a.textContent=r,e.append(s," ",a),e.addEventListener("click",()=>de(t)),oe.appendChild(e)}const $e=[...document.querySelectorAll(".view-rail button")],ue=t=>{document.body.dataset.view=t;for(const e of $e)e.classList.toggle("is-active",e.dataset.view===t)};document.querySelector(".view-rail").addEventListener("click",t=>{const e=t.target.closest("button[data-view]");e&&ue(e.dataset.view)});ue("files");const x=document.querySelector("#parts"),k=[...x.querySelectorAll(":scope > .part-head[data-part]")],Oe=[...document.querySelectorAll(".mobile-tabs button")],q=window.matchMedia("(max-width: 48rem)"),Ae=window.matchMedia("(prefers-reduced-motion: reduce)"),qe=()=>Ae.matches?"instant":"smooth";let M=null;const H=()=>{for(const t of Oe){const e=t.dataset.view===M;t.classList.toggle("is-active",e),e?t.setAttribute("aria-current","true"):t.removeAttribute("aria-current")}},he=t=>{requestAnimationFrame(()=>t.scrollIntoView({behavior:qe(),block:"start"}))},Fe=t=>{const e=k.findIndex(n=>n.dataset.part===t);e!==-1&&(x.expanded.includes(e)||(x.expanded=[...x.expanded,e]),H(),he(k[e]))};let T=[];x.addEventListener("expanded-changed",()=>{const t=x.expanded.filter(e=>!T.includes(e));if(T=[...x.expanded],!!q.matches)for(const e of t){const n=k[e].getBoundingClientRect().top;(n<48||n>window.innerHeight-57)&&he(k[e])}});let pe=0;const X=()=>{if(!q.matches){M=null,H();return}let t=null;for(const e of k)e.getBoundingClientRect().top<=pe+1&&(t=e.dataset.part??null);t===null&&(t=k[0]?.dataset.part??null),t!==M&&(M=t,H())};let R=!1;window.addEventListener("scroll",()=>{R||(R=!0,requestAnimationFrame(()=>{R=!1,X()}))},{passive:!0});document.querySelector(".mobile-tabs").addEventListener("click",t=>{const e=t.target.closest("button[data-view]");e&&q.matches&&Fe(e.dataset.view)});const me=()=>{q.matches&&(T=[k.findIndex(t=>t.dataset.part==="code")],x.expanded=[...T]),pe=k.length&&parseFloat(getComputedStyle(k[0]).scrollMarginTop)||0,X()};q.addEventListener("change",me);me();new ResizeObserver(()=>X()).observe(x);de("client");
