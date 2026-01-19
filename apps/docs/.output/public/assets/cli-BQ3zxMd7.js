import{j as e}from"./main-CgXkS054.js";let r=`

CLI Reference [#cli-reference]

termbridge [#termbridge]

Running without a subcommand is equivalent to \`termbridge start\`.

\`\`\`bash
termbridge
\`\`\`

termbridge start [#termbridge-start]

Starts the local server, creates a tmux session, and launches the Cloudflare tunnel.

\`\`\`bash
termbridge start --port 8080 --session dev --kill-on-exit --no-qr --tunnel cloudflare
\`\`\`

Flags [#flags]

| Flag                  | Description                           | Default          |
| --------------------- | ------------------------------------- | ---------------- |
| \`--port <port>\`       | Bind the local server to a fixed port | random free port |
| \`--session <name>\`    | tmux session name override            | auto-generated   |
| \`--kill-on-exit\`      | kill tmux sessions on exit            | \`false\`          |
| \`--no-qr\`             | disable QR code output                | \`false\`          |
| \`--tunnel cloudflare\` | tunnel provider                       | \`cloudflare\`     |

Examples [#examples]

Default:

\`\`\`bash
npx termbridge
\`\`\`

Fixed port and custom session:

\`\`\`bash
termbridge start --port 8080 --session codex
\`\`\`

Exit cleanup:

\`\`\`bash
termbridge start --kill-on-exit
\`\`\`

No QR (for scripts):

\`\`\`bash
termbridge start --no-qr
\`\`\`

Environment variables [#environment-variables]

| Variable                                  | Description                                             |
| ----------------------------------------- | ------------------------------------------------------- |
| \`TERMBRIDGE_SESSIONS=2\`                   | Create multiple tmux sessions at startup (dev/testing). |
| \`TERMBRIDGE_INSECURE_COOKIE=1\`            | Allow HTTP cookies for local development.               |
| \`TERMBRIDGE_DEV_UI=http://127.0.0.1:5173\` | Override Vite dev UI URL when running \`dev:beam\`.       |

Exit behavior [#exit-behavior]

* The CLI must keep running for the tunnel to stay active.
* \`Ctrl+C\` shuts down the tunnel and the local server.
* With \`--kill-on-exit\`, Termbridge closes the tmux sessions it created.
`,l={title:"CLI Reference",description:"Commands, flags, and environment variables."},a={contents:[{heading:"termbridge",content:"Running without a subcommand is equivalent to termbridge start."},{heading:"termbridge-start",content:"Starts the local server, creates a tmux session, and launches the Cloudflare tunnel."},{heading:"flags",content:"Flag"},{heading:"flags",content:"Description"},{heading:"flags",content:"Default"},{heading:"flags",content:"--port <port>"},{heading:"flags",content:"Bind the local server to a fixed port"},{heading:"flags",content:"random free port"},{heading:"flags",content:"--session <name>"},{heading:"flags",content:"tmux session name override"},{heading:"flags",content:"auto-generated"},{heading:"flags",content:"--kill-on-exit"},{heading:"flags",content:"kill tmux sessions on exit"},{heading:"flags",content:"false"},{heading:"flags",content:"--no-qr"},{heading:"flags",content:"disable QR code output"},{heading:"flags",content:"false"},{heading:"flags",content:"--tunnel cloudflare"},{heading:"flags",content:"tunnel provider"},{heading:"flags",content:"cloudflare"},{heading:"examples",content:"Default:"},{heading:"examples",content:"Fixed port and custom session:"},{heading:"examples",content:"Exit cleanup:"},{heading:"examples",content:"No QR (for scripts):"},{heading:"environment-variables",content:"Variable"},{heading:"environment-variables",content:"Description"},{heading:"environment-variables",content:"TERMBRIDGE_SESSIONS=2"},{heading:"environment-variables",content:"Create multiple tmux sessions at startup (dev/testing)."},{heading:"environment-variables",content:"TERMBRIDGE_INSECURE_COOKIE=1"},{heading:"environment-variables",content:"Allow HTTP cookies for local development."},{heading:"environment-variables",content:"TERMBRIDGE_DEV_UI=http://127.0.0.1:5173"},{heading:"environment-variables",content:"Override Vite dev UI URL when running dev:beam."},{heading:"exit-behavior",content:"The CLI must keep running for the tunnel to stay active."},{heading:"exit-behavior",content:"Ctrl+C shuts down the tunnel and the local server."},{heading:"exit-behavior",content:"With --kill-on-exit, Termbridge closes the tmux sessions it created."}],headings:[{id:"cli-reference",content:"CLI Reference"},{id:"termbridge",content:"termbridge"},{id:"termbridge-start",content:"termbridge start"},{id:"flags",content:"Flags"},{id:"examples",content:"Examples"},{id:"environment-variables",content:"Environment variables"},{id:"exit-behavior",content:"Exit behavior"}]};const d=[{depth:1,url:"#cli-reference",title:e.jsx(e.Fragment,{children:"CLI Reference"})},{depth:2,url:"#termbridge",title:e.jsx(e.Fragment,{children:e.jsx("code",{children:"termbridge"})})},{depth:2,url:"#termbridge-start",title:e.jsx(e.Fragment,{children:e.jsx("code",{children:"termbridge start"})})},{depth:3,url:"#flags",title:e.jsx(e.Fragment,{children:"Flags"})},{depth:3,url:"#examples",title:e.jsx(e.Fragment,{children:"Examples"})},{depth:2,url:"#environment-variables",title:e.jsx(e.Fragment,{children:"Environment variables"})},{depth:2,url:"#exit-behavior",title:e.jsx(e.Fragment,{children:"Exit behavior"})}];function t(n){const i={code:"code",h1:"h1",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",span:"span",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(i.h1,{id:"cli-reference",children:"CLI Reference"}),`
`,e.jsx(i.h2,{id:"termbridge",children:e.jsx(i.code,{children:"termbridge"})}),`
`,e.jsxs(i.p,{children:["Running without a subcommand is equivalent to ",e.jsx(i.code,{children:"termbridge start"}),"."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"termbridge"})})})})}),`
`,e.jsx(i.h2,{id:"termbridge-start",children:e.jsx(i.code,{children:"termbridge start"})}),`
`,e.jsx(i.p,{children:"Starts the local server, creates a tmux session, and launches the Cloudflare tunnel."}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"termbridge"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" start"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --port"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 8080"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --session"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" dev"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --kill-on-exit"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --no-qr"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --tunnel"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" cloudflare"})]})})})}),`
`,e.jsx(i.h3,{id:"flags",children:"Flags"}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Flag"}),e.jsx(i.th,{children:"Description"}),e.jsx(i.th,{children:"Default"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"--port <port>"})}),e.jsx(i.td,{children:"Bind the local server to a fixed port"}),e.jsx(i.td,{children:"random free port"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"--session <name>"})}),e.jsx(i.td,{children:"tmux session name override"}),e.jsx(i.td,{children:"auto-generated"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"--kill-on-exit"})}),e.jsx(i.td,{children:"kill tmux sessions on exit"}),e.jsx(i.td,{children:e.jsx(i.code,{children:"false"})})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"--no-qr"})}),e.jsx(i.td,{children:"disable QR code output"}),e.jsx(i.td,{children:e.jsx(i.code,{children:"false"})})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"--tunnel cloudflare"})}),e.jsx(i.td,{children:"tunnel provider"}),e.jsx(i.td,{children:e.jsx(i.code,{children:"cloudflare"})})]})]})]}),`
`,e.jsx(i.h3,{id:"examples",children:"Examples"}),`
`,e.jsx(i.p,{children:"Default:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"npx"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" termbridge"})]})})})}),`
`,e.jsx(i.p,{children:"Fixed port and custom session:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"termbridge"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" start"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --port"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 8080"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --session"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" codex"})]})})})}),`
`,e.jsx(i.p,{children:"Exit cleanup:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"termbridge"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" start"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --kill-on-exit"})]})})})}),`
`,e.jsx(i.p,{children:"No QR (for scripts):"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"termbridge"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" start"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --no-qr"})]})})})}),`
`,e.jsx(i.h2,{id:"environment-variables",children:"Environment variables"}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Variable"}),e.jsx(i.th,{children:"Description"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"TERMBRIDGE_SESSIONS=2"})}),e.jsx(i.td,{children:"Create multiple tmux sessions at startup (dev/testing)."})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"TERMBRIDGE_INSECURE_COOKIE=1"})}),e.jsx(i.td,{children:"Allow HTTP cookies for local development."})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"TERMBRIDGE_DEV_UI=http://127.0.0.1:5173"})}),e.jsxs(i.td,{children:["Override Vite dev UI URL when running ",e.jsx(i.code,{children:"dev:beam"}),"."]})]})]})]}),`
`,e.jsx(i.h2,{id:"exit-behavior",children:"Exit behavior"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"The CLI must keep running for the tunnel to stay active."}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"Ctrl+C"})," shuts down the tunnel and the local server."]}),`
`,e.jsxs(i.li,{children:["With ",e.jsx(i.code,{children:"--kill-on-exit"}),", Termbridge closes the tmux sessions it created."]}),`
`]})]})}function h(n={}){const{wrapper:i}=n.components||{};return i?e.jsx(i,{...n,children:e.jsx(t,{...n})}):t(n)}export{r as _markdown,h as default,l as frontmatter,a as structuredData,d as toc};
