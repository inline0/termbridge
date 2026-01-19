import{j as e}from"./main-CgXkS054.js";let r=`

Getting Started [#getting-started]

Prerequisites [#prerequisites]

Termbridge depends on local tools that must be available in your PATH:

* **Node.js 18+** (for \`npx termbridge\`)
* **tmux** (terminal session manager)
* **cloudflared** (Cloudflare Quick Tunnel)

macOS (Homebrew) [#macos-homebrew]

\`\`\`bash
brew install node tmux cloudflared
\`\`\`

Linux [#linux]

Install Node and tmux through your package manager, then install cloudflared from Cloudflare:

\`\`\`bash
# Example (Ubuntu)
sudo apt-get update
sudo apt-get install -y nodejs tmux
\`\`\`

Cloudflare installation guide: [https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/)

Run Termbridge [#run-termbridge]

\`\`\`bash
npx termbridge
\`\`\`

You should see:

* A local URL (ex: \`http://127.0.0.1:51234\`)
* A public tunnel URL
* An ASCII QR code

Open the public URL on your phone (or scan the QR code) to connect.

What happens next [#what-happens-next]

1. A local HTTP server starts on \`127.0.0.1\`.
2. A tmux session is created (or reused if it already exists).
3. A Cloudflare Quick Tunnel is launched.
4. A one-time token URL is printed and encoded into the QR code.
5. Your phone redeems the token and receives a session cookie.
6. The UI connects to the terminal via WebSocket.

First session behavior [#first-session-behavior]

* Termbridge creates a tmux session (default name is derived from the port).
* The first terminal in the list is loaded automatically.
* You can create multiple sessions in dev by setting \`TERMBRIDGE_SESSIONS\`.

Using an existing tmux session [#using-an-existing-tmux-session]

If you pass \`--session <name>\` and that session already exists, Termbridge will attach to it instead of creating a new one.

Next steps [#next-steps]

* **CLI Reference** for flags and environment variables.
* **Usage** for multi-session workflows and mobile controls.
`,a={title:"Getting Started",description:"Install prerequisites and run Termbridge for the first time."},l={contents:[{heading:"prerequisites",content:"Termbridge depends on local tools that must be available in your PATH:"},{heading:"prerequisites",content:"Node.js 18+ (for npx termbridge)"},{heading:"prerequisites",content:"tmux (terminal session manager)"},{heading:"prerequisites",content:"cloudflared (Cloudflare Quick Tunnel)"},{heading:"linux",content:"Install Node and tmux through your package manager, then install cloudflared from Cloudflare:"},{heading:"linux",content:"Cloudflare installation guide: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/"},{heading:"run-termbridge",content:"You should see:"},{heading:"run-termbridge",content:"A local URL (ex: http://127.0.0.1:51234)"},{heading:"run-termbridge",content:"A public tunnel URL"},{heading:"run-termbridge",content:"An ASCII QR code"},{heading:"run-termbridge",content:"Open the public URL on your phone (or scan the QR code) to connect."},{heading:"what-happens-next",content:"A local HTTP server starts on 127.0.0.1."},{heading:"what-happens-next",content:"A tmux session is created (or reused if it already exists)."},{heading:"what-happens-next",content:"A Cloudflare Quick Tunnel is launched."},{heading:"what-happens-next",content:"A one-time token URL is printed and encoded into the QR code."},{heading:"what-happens-next",content:"Your phone redeems the token and receives a session cookie."},{heading:"what-happens-next",content:"The UI connects to the terminal via WebSocket."},{heading:"first-session-behavior",content:"Termbridge creates a tmux session (default name is derived from the port)."},{heading:"first-session-behavior",content:"The first terminal in the list is loaded automatically."},{heading:"first-session-behavior",content:"You can create multiple sessions in dev by setting TERMBRIDGE_SESSIONS."},{heading:"using-an-existing-tmux-session",content:"If you pass --session <name> and that session already exists, Termbridge will attach to it instead of creating a new one."},{heading:"next-steps",content:"CLI Reference for flags and environment variables."},{heading:"next-steps",content:"Usage for multi-session workflows and mobile controls."}],headings:[{id:"getting-started",content:"Getting Started"},{id:"prerequisites",content:"Prerequisites"},{id:"macos-homebrew",content:"macOS (Homebrew)"},{id:"linux",content:"Linux"},{id:"run-termbridge",content:"Run Termbridge"},{id:"what-happens-next",content:"What happens next"},{id:"first-session-behavior",content:"First session behavior"},{id:"using-an-existing-tmux-session",content:"Using an existing tmux session"},{id:"next-steps",content:"Next steps"}]};const o=[{depth:1,url:"#getting-started",title:e.jsx(e.Fragment,{children:"Getting Started"})},{depth:2,url:"#prerequisites",title:e.jsx(e.Fragment,{children:"Prerequisites"})},{depth:3,url:"#macos-homebrew",title:e.jsx(e.Fragment,{children:"macOS (Homebrew)"})},{depth:3,url:"#linux",title:e.jsx(e.Fragment,{children:"Linux"})},{depth:2,url:"#run-termbridge",title:e.jsx(e.Fragment,{children:"Run Termbridge"})},{depth:2,url:"#what-happens-next",title:e.jsx(e.Fragment,{children:"What happens next"})},{depth:2,url:"#first-session-behavior",title:e.jsx(e.Fragment,{children:"First session behavior"})},{depth:2,url:"#using-an-existing-tmux-session",title:e.jsx(e.Fragment,{children:"Using an existing tmux session"})},{depth:2,url:"#next-steps",title:e.jsx(e.Fragment,{children:"Next steps"})}];function i(s){const n={a:"a",code:"code",h1:"h1",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h1,{id:"getting-started",children:"Getting Started"}),`
`,e.jsx(n.h2,{id:"prerequisites",children:"Prerequisites"}),`
`,e.jsx(n.p,{children:"Termbridge depends on local tools that must be available in your PATH:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Node.js 18+"})," (for ",e.jsx(n.code,{children:"npx termbridge"}),")"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"tmux"})," (terminal session manager)"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"cloudflared"})," (Cloudflare Quick Tunnel)"]}),`
`]}),`
`,e.jsx(n.h3,{id:"macos-homebrew",children:"macOS (Homebrew)"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"brew"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" install"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" node"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" tmux"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" cloudflared"})]})})})}),`
`,e.jsx(n.h3,{id:"linux",children:"Linux"}),`
`,e.jsx(n.p,{children:"Install Node and tmux through your package manager, then install cloudflared from Cloudflare:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# Example (Ubuntu)"})}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"sudo"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" apt-get"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" update"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"sudo"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" apt-get"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" install"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -y"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" nodejs"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" tmux"})]})]})})}),`
`,e.jsxs(n.p,{children:["Cloudflare installation guide: ",e.jsx(n.a,{href:"https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/",children:"https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/"})]}),`
`,e.jsx(n.h2,{id:"run-termbridge",children:"Run Termbridge"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"npx"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" termbridge"})]})})})}),`
`,e.jsx(n.p,{children:"You should see:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["A local URL (ex: ",e.jsx(n.code,{children:"http://127.0.0.1:51234"}),")"]}),`
`,e.jsx(n.li,{children:"A public tunnel URL"}),`
`,e.jsx(n.li,{children:"An ASCII QR code"}),`
`]}),`
`,e.jsx(n.p,{children:"Open the public URL on your phone (or scan the QR code) to connect."}),`
`,e.jsx(n.h2,{id:"what-happens-next",children:"What happens next"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:["A local HTTP server starts on ",e.jsx(n.code,{children:"127.0.0.1"}),"."]}),`
`,e.jsx(n.li,{children:"A tmux session is created (or reused if it already exists)."}),`
`,e.jsx(n.li,{children:"A Cloudflare Quick Tunnel is launched."}),`
`,e.jsx(n.li,{children:"A one-time token URL is printed and encoded into the QR code."}),`
`,e.jsx(n.li,{children:"Your phone redeems the token and receives a session cookie."}),`
`,e.jsx(n.li,{children:"The UI connects to the terminal via WebSocket."}),`
`]}),`
`,e.jsx(n.h2,{id:"first-session-behavior",children:"First session behavior"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Termbridge creates a tmux session (default name is derived from the port)."}),`
`,e.jsx(n.li,{children:"The first terminal in the list is loaded automatically."}),`
`,e.jsxs(n.li,{children:["You can create multiple sessions in dev by setting ",e.jsx(n.code,{children:"TERMBRIDGE_SESSIONS"}),"."]}),`
`]}),`
`,e.jsx(n.h2,{id:"using-an-existing-tmux-session",children:"Using an existing tmux session"}),`
`,e.jsxs(n.p,{children:["If you pass ",e.jsx(n.code,{children:"--session <name>"})," and that session already exists, Termbridge will attach to it instead of creating a new one."]}),`
`,e.jsx(n.h2,{id:"next-steps",children:"Next steps"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"CLI Reference"})," for flags and environment variables."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Usage"})," for multi-session workflows and mobile controls."]}),`
`]})]})}function d(s={}){const{wrapper:n}=s.components||{};return n?e.jsx(n,{...s,children:e.jsx(i,{...s})}):i(s)}export{r as _markdown,d as default,a as frontmatter,l as structuredData,o as toc};
