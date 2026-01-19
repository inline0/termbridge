import{j as e}from"./main-CgXkS054.js";let l=`

Architecture [#architecture]

High-level flow [#high-level-flow]

\`\`\`
Browser (phone)
  |
  | HTTPS
  v
Cloudflare Quick Tunnel
  |
  | HTTP/WS
  v
Local Termbridge server
  |
  | PTY
  v
Tmux session
\`\`\`

Components [#components]

CLI process [#cli-process]

* Starts the HTTP server that serves the UI assets.
* Starts the WebSocket server for terminal I/O.
* Creates one or more tmux sessions.
* Issues one-time redemption tokens.
* Starts and monitors the Cloudflare tunnel.

Terminal backend [#terminal-backend]

* Uses \`node-pty\` to attach to tmux for real keystrokes and output.
* Sets \`TERM=xterm-256color\` and \`COLORTERM=truecolor\` for full color support.
* Disables the tmux status bar to keep the UI clean.

Terminal registry [#terminal-registry]

* Tracks available terminal sessions.
* Provides a list for the UI and validates selected terminal IDs.

Auth and session [#auth-and-session]

* One-time token is printed as a URL and encoded in a QR code.
* \`GET /s/:token\` redeems the token and sets a cookie session.
* WebSocket connections require a valid session cookie.

API endpoints [#api-endpoints]

* \`GET /healthz\` - health check
* \`GET /api/terminals\` - list terminals
* \`POST /api/terminals\` - create a new tmux session
* \`WS /ws/terminal/:terminalId\` - stream terminal I/O

WebSocket protocol [#websocket-protocol]

Client -> server:

\`\`\`json
{ "type": "input", "data": "ls -la" }
{ "type": "resize", "cols": 120, "rows": 32 }
{ "type": "control", "key": "ctrl_c" }
\`\`\`

Server -> client:

\`\`\`json
{ "type": "output", "data": "..." }
{ "type": "status", "state": "connected" }
\`\`\`

UI stack [#ui-stack]

* Vite + TanStack Router
* xterm.js + Fit addon + WebGL renderer
* Mobile-first layout with a fixed input bar
`,r={title:"Architecture",description:"How the local server, tunnel, and terminal streaming fit together."},a={contents:[{heading:"cli-process",content:"Starts the HTTP server that serves the UI assets."},{heading:"cli-process",content:"Starts the WebSocket server for terminal I/O."},{heading:"cli-process",content:"Creates one or more tmux sessions."},{heading:"cli-process",content:"Issues one-time redemption tokens."},{heading:"cli-process",content:"Starts and monitors the Cloudflare tunnel."},{heading:"terminal-backend",content:"Uses node-pty to attach to tmux for real keystrokes and output."},{heading:"terminal-backend",content:"Sets TERM=xterm-256color and COLORTERM=truecolor for full color support."},{heading:"terminal-backend",content:"Disables the tmux status bar to keep the UI clean."},{heading:"terminal-registry",content:"Tracks available terminal sessions."},{heading:"terminal-registry",content:"Provides a list for the UI and validates selected terminal IDs."},{heading:"auth-and-session",content:"One-time token is printed as a URL and encoded in a QR code."},{heading:"auth-and-session",content:"GET /s/:token redeems the token and sets a cookie session."},{heading:"auth-and-session",content:"WebSocket connections require a valid session cookie."},{heading:"api-endpoints",content:"GET /healthz - health check"},{heading:"api-endpoints",content:"GET /api/terminals - list terminals"},{heading:"api-endpoints",content:"POST /api/terminals - create a new tmux session"},{heading:"api-endpoints",content:"WS /ws/terminal/:terminalId - stream terminal I/O"},{heading:"websocket-protocol",content:"Client -> server:"},{heading:"websocket-protocol",content:"Server -> client:"},{heading:"ui-stack",content:"Vite + TanStack Router"},{heading:"ui-stack",content:"xterm.js + Fit addon + WebGL renderer"},{heading:"ui-stack",content:"Mobile-first layout with a fixed input bar"}],headings:[{id:"architecture",content:"Architecture"},{id:"high-level-flow",content:"High-level flow"},{id:"components",content:"Components"},{id:"cli-process",content:"CLI process"},{id:"terminal-backend",content:"Terminal backend"},{id:"terminal-registry",content:"Terminal registry"},{id:"auth-and-session",content:"Auth and session"},{id:"api-endpoints",content:"API endpoints"},{id:"websocket-protocol",content:"WebSocket protocol"},{id:"ui-stack",content:"UI stack"}]};const h=[{depth:1,url:"#architecture",title:e.jsx(e.Fragment,{children:"Architecture"})},{depth:2,url:"#high-level-flow",title:e.jsx(e.Fragment,{children:"High-level flow"})},{depth:2,url:"#components",title:e.jsx(e.Fragment,{children:"Components"})},{depth:3,url:"#cli-process",title:e.jsx(e.Fragment,{children:"CLI process"})},{depth:3,url:"#terminal-backend",title:e.jsx(e.Fragment,{children:"Terminal backend"})},{depth:3,url:"#terminal-registry",title:e.jsx(e.Fragment,{children:"Terminal registry"})},{depth:3,url:"#auth-and-session",title:e.jsx(e.Fragment,{children:"Auth and session"})},{depth:2,url:"#api-endpoints",title:e.jsx(e.Fragment,{children:"API endpoints"})},{depth:2,url:"#websocket-protocol",title:e.jsx(e.Fragment,{children:"WebSocket protocol"})},{depth:2,url:"#ui-stack",title:e.jsx(e.Fragment,{children:"UI stack"})}];function n(i){const s={code:"code",h1:"h1",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",span:"span",ul:"ul",...i.components};return e.jsxs(e.Fragment,{children:[e.jsx(s.h1,{id:"architecture",children:"Architecture"}),`
`,e.jsx(s.h2,{id:"high-level-flow",children:"High-level flow"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"Browser (phone)"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"  |"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"  | HTTPS"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"  v"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"Cloudflare Quick Tunnel"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"  |"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"  | HTTP/WS"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"  v"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"Local Termbridge server"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"  |"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"  | PTY"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"  v"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"Tmux session"})})]})})}),`
`,e.jsx(s.h2,{id:"components",children:"Components"}),`
`,e.jsx(s.h3,{id:"cli-process",children:"CLI process"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"Starts the HTTP server that serves the UI assets."}),`
`,e.jsx(s.li,{children:"Starts the WebSocket server for terminal I/O."}),`
`,e.jsx(s.li,{children:"Creates one or more tmux sessions."}),`
`,e.jsx(s.li,{children:"Issues one-time redemption tokens."}),`
`,e.jsx(s.li,{children:"Starts and monitors the Cloudflare tunnel."}),`
`]}),`
`,e.jsx(s.h3,{id:"terminal-backend",children:"Terminal backend"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:["Uses ",e.jsx(s.code,{children:"node-pty"})," to attach to tmux for real keystrokes and output."]}),`
`,e.jsxs(s.li,{children:["Sets ",e.jsx(s.code,{children:"TERM=xterm-256color"})," and ",e.jsx(s.code,{children:"COLORTERM=truecolor"})," for full color support."]}),`
`,e.jsx(s.li,{children:"Disables the tmux status bar to keep the UI clean."}),`
`]}),`
`,e.jsx(s.h3,{id:"terminal-registry",children:"Terminal registry"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"Tracks available terminal sessions."}),`
`,e.jsx(s.li,{children:"Provides a list for the UI and validates selected terminal IDs."}),`
`]}),`
`,e.jsx(s.h3,{id:"auth-and-session",children:"Auth and session"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"One-time token is printed as a URL and encoded in a QR code."}),`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"GET /s/:token"})," redeems the token and sets a cookie session."]}),`
`,e.jsx(s.li,{children:"WebSocket connections require a valid session cookie."}),`
`]}),`
`,e.jsx(s.h2,{id:"api-endpoints",children:"API endpoints"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"GET /healthz"})," - health check"]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"GET /api/terminals"})," - list terminals"]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"POST /api/terminals"})," - create a new tmux session"]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"WS /ws/terminal/:terminalId"})," - stream terminal I/O"]}),`
`]}),`
`,e.jsx(s.h2,{id:"websocket-protocol",children:"WebSocket protocol"}),`
`,e.jsx(s.p,{children:"Client -> server:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"{ "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'"type"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"input"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'"data"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"ls -la"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"{ "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'"type"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"resize"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'"cols"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"120"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'"rows"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"32"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"{ "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'"type"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"control"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'"key"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"ctrl_c"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }"})]})]})})}),`
`,e.jsx(s.p,{children:"Server -> client:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"{ "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'"type"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"output"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'"data"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"..."'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"{ "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'"type"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"status"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'"state"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"connected"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }"})]})]})})}),`
`,e.jsx(s.h2,{id:"ui-stack",children:"UI stack"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"Vite + TanStack Router"}),`
`,e.jsx(s.li,{children:"xterm.js + Fit addon + WebGL renderer"}),`
`,e.jsx(s.li,{children:"Mobile-first layout with a fixed input bar"}),`
`]})]})}function c(i={}){const{wrapper:s}=i.components||{};return s?e.jsx(s,{...i,children:e.jsx(n,{...i})}):n(i)}export{l as _markdown,c as default,r as frontmatter,a as structuredData,h as toc};
