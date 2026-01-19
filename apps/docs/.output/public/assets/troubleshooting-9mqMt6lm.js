import{j as e}from"./main-CgXkS054.js";let i=`

Troubleshooting [#troubleshooting]

tmux not found [#tmux-not-found]

Install tmux and ensure it is on your PATH.

\`\`\`bash
brew install tmux
\`\`\`

cloudflared not found [#cloudflared-not-found]

Install Cloudflare's tunnel client.

\`\`\`bash
brew install cloudflared
\`\`\`

Tunnel failed to start [#tunnel-failed-to-start]

* Verify \`cloudflared\` runs on its own (\`cloudflared --version\`).
* Ensure you can reach \`https://trycloudflare.com\` from your network.
* Termbridge will still print the local URL if the tunnel fails.

Blank UI or "Unable to load terminals" [#blank-ui-or-unable-to-load-terminals]

* Confirm the local server is running.
* Check the browser console for 401 or 403 responses.
* Restart the CLI to get a fresh redemption token.

No terminal output [#no-terminal-output]

* Make sure the tmux session is running: \`tmux ls\`.
* If you are already inside tmux, the session should still appear.
* Check that your shell supports \`TERM=xterm-256color\`.

QR code opens but shows a blank page on mobile [#qr-code-opens-but-shows-a-blank-page-on-mobile]

* The QR URL is single-use. Run \`npx termbridge\` again to regenerate.
* Verify your phone can access the tunnel URL.

node-pty spawn-helper errors [#node-pty-spawn-helper-errors]

Termbridge attempts to mark \`node-pty\`'s spawn-helper as executable. If it fails:

\`\`\`bash
chmod +x node_modules/node-pty/prebuilds/**/spawn-helper
\`\`\`
`,o={title:"Troubleshooting",description:"Fix common setup and runtime issues."},r={contents:[{heading:"tmux-not-found",content:"Install tmux and ensure it is on your PATH."},{heading:"cloudflared-not-found",content:"Install Cloudflare's tunnel client."},{heading:"tunnel-failed-to-start",content:"Verify cloudflared runs on its own (cloudflared --version)."},{heading:"tunnel-failed-to-start",content:"Ensure you can reach https://trycloudflare.com from your network."},{heading:"tunnel-failed-to-start",content:"Termbridge will still print the local URL if the tunnel fails."},{heading:"blank-ui-or-unable-to-load-terminals",content:"Confirm the local server is running."},{heading:"blank-ui-or-unable-to-load-terminals",content:"Check the browser console for 401 or 403 responses."},{heading:"blank-ui-or-unable-to-load-terminals",content:"Restart the CLI to get a fresh redemption token."},{heading:"no-terminal-output",content:"Make sure the tmux session is running: tmux ls."},{heading:"no-terminal-output",content:"If you are already inside tmux, the session should still appear."},{heading:"no-terminal-output",content:"Check that your shell supports TERM=xterm-256color."},{heading:"qr-code-opens-but-shows-a-blank-page-on-mobile",content:"The QR URL is single-use. Run npx termbridge again to regenerate."},{heading:"qr-code-opens-but-shows-a-blank-page-on-mobile",content:"Verify your phone can access the tunnel URL."},{heading:"node-pty-spawn-helper-errors",content:"Termbridge attempts to mark node-pty's spawn-helper as executable. If it fails:"}],headings:[{id:"troubleshooting",content:"Troubleshooting"},{id:"tmux-not-found",content:"tmux not found"},{id:"cloudflared-not-found",content:"cloudflared not found"},{id:"tunnel-failed-to-start",content:"Tunnel failed to start"},{id:"blank-ui-or-unable-to-load-terminals",content:'Blank UI or "Unable to load terminals"'},{id:"no-terminal-output",content:"No terminal output"},{id:"qr-code-opens-but-shows-a-blank-page-on-mobile",content:"QR code opens but shows a blank page on mobile"},{id:"node-pty-spawn-helper-errors",content:"node-pty spawn-helper errors"}]};const a=[{depth:1,url:"#troubleshooting",title:e.jsx(e.Fragment,{children:"Troubleshooting"})},{depth:2,url:"#tmux-not-found",title:e.jsxs(e.Fragment,{children:[e.jsx("code",{children:"tmux"})," not found"]})},{depth:2,url:"#cloudflared-not-found",title:e.jsxs(e.Fragment,{children:[e.jsx("code",{children:"cloudflared"})," not found"]})},{depth:2,url:"#tunnel-failed-to-start",title:e.jsx(e.Fragment,{children:"Tunnel failed to start"})},{depth:2,url:"#blank-ui-or-unable-to-load-terminals",title:e.jsx(e.Fragment,{children:'Blank UI or "Unable to load terminals"'})},{depth:2,url:"#no-terminal-output",title:e.jsx(e.Fragment,{children:"No terminal output"})},{depth:2,url:"#qr-code-opens-but-shows-a-blank-page-on-mobile",title:e.jsx(e.Fragment,{children:"QR code opens but shows a blank page on mobile"})},{depth:2,url:"#node-pty-spawn-helper-errors",title:e.jsxs(e.Fragment,{children:[e.jsx("code",{children:"node-pty"})," spawn-helper errors"]})}];function l(t){const n={code:"code",h1:"h1",h2:"h2",li:"li",p:"p",pre:"pre",span:"span",ul:"ul",...t.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h1,{id:"troubleshooting",children:"Troubleshooting"}),`
`,e.jsxs(n.h2,{id:"tmux-not-found",children:[e.jsx(n.code,{children:"tmux"})," not found"]}),`
`,e.jsx(n.p,{children:"Install tmux and ensure it is on your PATH."}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"brew"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" install"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" tmux"})]})})})}),`
`,e.jsxs(n.h2,{id:"cloudflared-not-found",children:[e.jsx(n.code,{children:"cloudflared"})," not found"]}),`
`,e.jsx(n.p,{children:"Install Cloudflare's tunnel client."}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"brew"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" install"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" cloudflared"})]})})})}),`
`,e.jsx(n.h2,{id:"tunnel-failed-to-start",children:"Tunnel failed to start"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Verify ",e.jsx(n.code,{children:"cloudflared"})," runs on its own (",e.jsx(n.code,{children:"cloudflared --version"}),")."]}),`
`,e.jsxs(n.li,{children:["Ensure you can reach ",e.jsx(n.code,{children:"https://trycloudflare.com"})," from your network."]}),`
`,e.jsx(n.li,{children:"Termbridge will still print the local URL if the tunnel fails."}),`
`]}),`
`,e.jsx(n.h2,{id:"blank-ui-or-unable-to-load-terminals",children:'Blank UI or "Unable to load terminals"'}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Confirm the local server is running."}),`
`,e.jsx(n.li,{children:"Check the browser console for 401 or 403 responses."}),`
`,e.jsx(n.li,{children:"Restart the CLI to get a fresh redemption token."}),`
`]}),`
`,e.jsx(n.h2,{id:"no-terminal-output",children:"No terminal output"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Make sure the tmux session is running: ",e.jsx(n.code,{children:"tmux ls"}),"."]}),`
`,e.jsx(n.li,{children:"If you are already inside tmux, the session should still appear."}),`
`,e.jsxs(n.li,{children:["Check that your shell supports ",e.jsx(n.code,{children:"TERM=xterm-256color"}),"."]}),`
`]}),`
`,e.jsx(n.h2,{id:"qr-code-opens-but-shows-a-blank-page-on-mobile",children:"QR code opens but shows a blank page on mobile"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["The QR URL is single-use. Run ",e.jsx(n.code,{children:"npx termbridge"})," again to regenerate."]}),`
`,e.jsx(n.li,{children:"Verify your phone can access the tunnel URL."}),`
`]}),`
`,e.jsxs(n.h2,{id:"node-pty-spawn-helper-errors",children:[e.jsx(n.code,{children:"node-pty"})," spawn-helper errors"]}),`
`,e.jsxs(n.p,{children:["Termbridge attempts to mark ",e.jsx(n.code,{children:"node-pty"}),"'s spawn-helper as executable. If it fails:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"chmod"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" +x"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" node_modules/node-pty/prebuilds/"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"**"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"/spawn-helper"})]})})})})]})}function d(t={}){const{wrapper:n}=t.components||{};return n?e.jsx(n,{...t,children:e.jsx(l,{...t})}):l(t)}export{i as _markdown,d as default,o as frontmatter,r as structuredData,a as toc};
