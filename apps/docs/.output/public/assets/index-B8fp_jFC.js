import{j as e}from"./main-CgXkS054.js";let s=`

Introduction [#introduction]

Termbridge is a local-first CLI that beams your terminal to any browser. It runs a local server, streams a real tmux session into an xterm.js UI, and exposes the server through a Cloudflare Quick Tunnel so you can open it on your phone.

What you get [#what-you-get]

* **One command**: \`npx termbridge\` starts the server, creates a tmux session, and prints a QR code.
* **Real terminal**: tmux + node-pty means true colors, TUIs, and proper key handling.
* **Multi-session**: one server can host multiple tmux sessions, switchable in-app.
* **No backend**: everything runs on your machine. The tunnel is the only public surface.

Core ideas [#core-ideas]

Local-first by default [#local-first-by-default]

The server, WebSocket, and terminal registry live locally. There is no Termbridge-operated backend, and no data is stored externally.

Secure handoff [#secure-handoff]

Termbridge issues a one-time token and redeems it into a cookie session. The token URL is what you scan on mobile.

Mobile-friendly UI [#mobile-friendly-ui]

The UI is intentionally minimal: a full-height terminal with a compact control bar and a terminal switcher sheet.

Quick peek [#quick-peek]

\`\`\`bash
npx termbridge
\`\`\`

Scan the QR code, open the URL, and you should see your terminal instantly.

Next: head to **Getting Started** for setup and prerequisites.
`,a={title:"Introduction",description:"Local-first terminal beaming for any device."},o={contents:[{heading:"introduction",content:"Termbridge is a local-first CLI that beams your terminal to any browser. It runs a local server, streams a real tmux session into an xterm.js UI, and exposes the server through a Cloudflare Quick Tunnel so you can open it on your phone."},{heading:"what-you-get",content:"One command: npx termbridge starts the server, creates a tmux session, and prints a QR code."},{heading:"what-you-get",content:"Real terminal: tmux + node-pty means true colors, TUIs, and proper key handling."},{heading:"what-you-get",content:"Multi-session: one server can host multiple tmux sessions, switchable in-app."},{heading:"what-you-get",content:"No backend: everything runs on your machine. The tunnel is the only public surface."},{heading:"local-first-by-default",content:"The server, WebSocket, and terminal registry live locally. There is no Termbridge-operated backend, and no data is stored externally."},{heading:"secure-handoff",content:"Termbridge issues a one-time token and redeems it into a cookie session. The token URL is what you scan on mobile."},{heading:"mobile-friendly-ui",content:"The UI is intentionally minimal: a full-height terminal with a compact control bar and a terminal switcher sheet."},{heading:"quick-peek",content:"Scan the QR code, open the URL, and you should see your terminal instantly."},{heading:"quick-peek",content:"Next: head to Getting Started for setup and prerequisites."}],headings:[{id:"introduction",content:"Introduction"},{id:"what-you-get",content:"What you get"},{id:"core-ideas",content:"Core ideas"},{id:"local-first-by-default",content:"Local-first by default"},{id:"secure-handoff",content:"Secure handoff"},{id:"mobile-friendly-ui",content:"Mobile-friendly UI"},{id:"quick-peek",content:"Quick peek"}]};const l=[{depth:1,url:"#introduction",title:e.jsx(e.Fragment,{children:"Introduction"})},{depth:2,url:"#what-you-get",title:e.jsx(e.Fragment,{children:"What you get"})},{depth:2,url:"#core-ideas",title:e.jsx(e.Fragment,{children:"Core ideas"})},{depth:3,url:"#local-first-by-default",title:e.jsx(e.Fragment,{children:"Local-first by default"})},{depth:3,url:"#secure-handoff",title:e.jsx(e.Fragment,{children:"Secure handoff"})},{depth:3,url:"#mobile-friendly-ui",title:e.jsx(e.Fragment,{children:"Mobile-friendly UI"})},{depth:2,url:"#quick-peek",title:e.jsx(e.Fragment,{children:"Quick peek"})}];function i(t){const n={code:"code",h1:"h1",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...t.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h1,{id:"introduction",children:"Introduction"}),`
`,e.jsx(n.p,{children:"Termbridge is a local-first CLI that beams your terminal to any browser. It runs a local server, streams a real tmux session into an xterm.js UI, and exposes the server through a Cloudflare Quick Tunnel so you can open it on your phone."}),`
`,e.jsx(n.h2,{id:"what-you-get",children:"What you get"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"One command"}),": ",e.jsx(n.code,{children:"npx termbridge"})," starts the server, creates a tmux session, and prints a QR code."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Real terminal"}),": tmux + node-pty means true colors, TUIs, and proper key handling."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Multi-session"}),": one server can host multiple tmux sessions, switchable in-app."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"No backend"}),": everything runs on your machine. The tunnel is the only public surface."]}),`
`]}),`
`,e.jsx(n.h2,{id:"core-ideas",children:"Core ideas"}),`
`,e.jsx(n.h3,{id:"local-first-by-default",children:"Local-first by default"}),`
`,e.jsx(n.p,{children:"The server, WebSocket, and terminal registry live locally. There is no Termbridge-operated backend, and no data is stored externally."}),`
`,e.jsx(n.h3,{id:"secure-handoff",children:"Secure handoff"}),`
`,e.jsx(n.p,{children:"Termbridge issues a one-time token and redeems it into a cookie session. The token URL is what you scan on mobile."}),`
`,e.jsx(n.h3,{id:"mobile-friendly-ui",children:"Mobile-friendly UI"}),`
`,e.jsx(n.p,{children:"The UI is intentionally minimal: a full-height terminal with a compact control bar and a terminal switcher sheet."}),`
`,e.jsx(n.h2,{id:"quick-peek",children:"Quick peek"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"npx"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" termbridge"})]})})})}),`
`,e.jsx(n.p,{children:"Scan the QR code, open the URL, and you should see your terminal instantly."}),`
`,e.jsxs(n.p,{children:["Next: head to ",e.jsx(n.strong,{children:"Getting Started"})," for setup and prerequisites."]})]})}function d(t={}){const{wrapper:n}=t.components||{};return n?e.jsx(n,{...t,children:e.jsx(i,{...t})}):i(t)}export{s as _markdown,d as default,a as frontmatter,o as structuredData,l as toc};
