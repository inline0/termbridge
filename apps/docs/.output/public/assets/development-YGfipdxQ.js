import{j as e}from"./main-CgXkS054.js";let l=`

Development [#development]

Requirements [#requirements]

* **Bun** for workspace installs and scripts
* **Node.js 18+**
* **tmux** and **cloudflared** for end-to-end tests
* **Playwright** for UI e2e tests

Install [#install]

\`\`\`bash
bun install
\`\`\`

Run the app [#run-the-app]

\`\`\`bash
bun run dev:beam
\`\`\`

This builds the CLI, starts the local server on a fixed port, and launches the Vite dev UI with proxies for \`/api\`, \`/ws\`, and \`/s\`.

Multiple sessions [#multiple-sessions]

\`\`\`bash
TERMBRIDGE_SESSIONS=2 bun run dev:beam
\`\`\`

Or use the shortcut:

\`\`\`bash
bun run dev:beam:multi
\`\`\`

Local cookie mode [#local-cookie-mode]

When developing without HTTPS:

\`\`\`bash
TERMBRIDGE_INSECURE_COOKIE=1 bun run dev:beam
\`\`\`

Tests [#tests]

\`\`\`bash
bun run test
\`\`\`

* \`test:mocked\` runs unit/integration tests with 100% coverage.
* \`test:cli\` runs real CLI + UI e2e tests (tmux + cloudflared + Playwright).

Docs site [#docs-site]

The docs live in \`apps/docs\` and use Onedocs + Fumadocs.

\`\`\`bash
bun run --cwd apps/docs dev
\`\`\`

Build:

\`\`\`bash
bun run --cwd apps/docs build
\`\`\`
`,h={title:"Development",description:"Local development, test suites, and docs."},r={contents:[{heading:"requirements",content:"Bun for workspace installs and scripts"},{heading:"requirements",content:"Node.js 18+"},{heading:"requirements",content:"tmux and cloudflared for end-to-end tests"},{heading:"requirements",content:"Playwright for UI e2e tests"},{heading:"run-the-app",content:"This builds the CLI, starts the local server on a fixed port, and launches the Vite dev UI with proxies for /api, /ws, and /s."},{heading:"multiple-sessions",content:"Or use the shortcut:"},{heading:"local-cookie-mode",content:"When developing without HTTPS:"},{heading:"tests",content:"test:mocked runs unit/integration tests with 100% coverage."},{heading:"tests",content:"test:cli runs real CLI + UI e2e tests (tmux + cloudflared + Playwright)."},{heading:"docs-site",content:"The docs live in apps/docs and use Onedocs + Fumadocs."},{heading:"docs-site",content:"Build:"}],headings:[{id:"development",content:"Development"},{id:"requirements",content:"Requirements"},{id:"install",content:"Install"},{id:"run-the-app",content:"Run the app"},{id:"multiple-sessions",content:"Multiple sessions"},{id:"local-cookie-mode",content:"Local cookie mode"},{id:"tests",content:"Tests"},{id:"docs-site",content:"Docs site"}]};const d=[{depth:1,url:"#development",title:e.jsx(e.Fragment,{children:"Development"})},{depth:2,url:"#requirements",title:e.jsx(e.Fragment,{children:"Requirements"})},{depth:2,url:"#install",title:e.jsx(e.Fragment,{children:"Install"})},{depth:2,url:"#run-the-app",title:e.jsx(e.Fragment,{children:"Run the app"})},{depth:3,url:"#multiple-sessions",title:e.jsx(e.Fragment,{children:"Multiple sessions"})},{depth:3,url:"#local-cookie-mode",title:e.jsx(e.Fragment,{children:"Local cookie mode"})},{depth:2,url:"#tests",title:e.jsx(e.Fragment,{children:"Tests"})},{depth:2,url:"#docs-site",title:e.jsx(e.Fragment,{children:"Docs site"})}];function n(i){const s={code:"code",h1:"h1",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...i.components};return e.jsxs(e.Fragment,{children:[e.jsx(s.h1,{id:"development",children:"Development"}),`
`,e.jsx(s.h2,{id:"requirements",children:"Requirements"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Bun"})," for workspace installs and scripts"]}),`
`,e.jsx(s.li,{children:e.jsx(s.strong,{children:"Node.js 18+"})}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"tmux"})," and ",e.jsx(s.strong,{children:"cloudflared"})," for end-to-end tests"]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Playwright"})," for UI e2e tests"]}),`
`]}),`
`,e.jsx(s.h2,{id:"install",children:"Install"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"bun"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" install"})]})})})}),`
`,e.jsx(s.h2,{id:"run-the-app",children:"Run the app"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"bun"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" run"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" dev:beam"})]})})})}),`
`,e.jsxs(s.p,{children:["This builds the CLI, starts the local server on a fixed port, and launches the Vite dev UI with proxies for ",e.jsx(s.code,{children:"/api"}),", ",e.jsx(s.code,{children:"/ws"}),", and ",e.jsx(s.code,{children:"/s"}),"."]}),`
`,e.jsx(s.h3,{id:"multiple-sessions",children:"Multiple sessions"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"TERMBRIDGE_SESSIONS"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"2"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" bun"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" run"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" dev:beam"})]})})})}),`
`,e.jsx(s.p,{children:"Or use the shortcut:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"bun"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" run"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" dev:beam:multi"})]})})})}),`
`,e.jsx(s.h3,{id:"local-cookie-mode",children:"Local cookie mode"}),`
`,e.jsx(s.p,{children:"When developing without HTTPS:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"TERMBRIDGE_INSECURE_COOKIE"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"1"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" bun"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" run"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" dev:beam"})]})})})}),`
`,e.jsx(s.h2,{id:"tests",children:"Tests"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"bun"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" run"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" test"})]})})})}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"test:mocked"})," runs unit/integration tests with 100% coverage."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"test:cli"})," runs real CLI + UI e2e tests (tmux + cloudflared + Playwright)."]}),`
`]}),`
`,e.jsx(s.h2,{id:"docs-site",children:"Docs site"}),`
`,e.jsxs(s.p,{children:["The docs live in ",e.jsx(s.code,{children:"apps/docs"})," and use Onedocs + Fumadocs."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"bun"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" run"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --cwd"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" apps/docs"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" dev"})]})})})}),`
`,e.jsx(s.p,{children:"Build:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"bun"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" run"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --cwd"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" apps/docs"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" build"})]})})})})]})}function a(i={}){const{wrapper:s}=i.components||{};return s?e.jsx(s,{...i,children:e.jsx(n,{...i})}):n(i)}export{l as _markdown,a as default,h as frontmatter,r as structuredData,d as toc};
