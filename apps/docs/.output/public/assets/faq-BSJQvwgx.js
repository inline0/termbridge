import{j as e}from"./main-CgXkS054.js";let s=`

FAQ [#faq]

Does Termbridge run any backend server? [#does-termbridge-run-any-backend-server]

No. Everything runs locally on your machine. The only public surface is the Cloudflare tunnel.

Can I run multiple terminals? [#can-i-run-multiple-terminals]

Yes. One server can host multiple tmux sessions. Use the terminal switcher in the UI to select a session.

Is the tunnel URL secure? [#is-the-tunnel-url-secure]

Termbridge issues a one-time token and redeems it for a cookie session. The token URL should only be shared with devices you trust.

Can I use it without Cloudflare? [#can-i-use-it-without-cloudflare]

Not yet. The tunnel provider is currently Cloudflare only.

Does it support Windows? [#does-it-support-windows]

Not officially. macOS and Linux are the target platforms for the MVP.

Can I beam other tools (Codex, OpenCode, Claude Code)? [#can-i-beam-other-tools-codex-opencode-claude-code]

Yes. If those tools run inside a tmux session on your machine, Termbridge will stream them just like any other terminal.
`,i={title:"FAQ",description:"Quick answers to common questions."},l={contents:[{heading:"does-termbridge-run-any-backend-server",content:"No. Everything runs locally on your machine. The only public surface is the Cloudflare tunnel."},{heading:"can-i-run-multiple-terminals",content:"Yes. One server can host multiple tmux sessions. Use the terminal switcher in the UI to select a session."},{heading:"is-the-tunnel-url-secure",content:"Termbridge issues a one-time token and redeems it for a cookie session. The token URL should only be shared with devices you trust."},{heading:"can-i-use-it-without-cloudflare",content:"Not yet. The tunnel provider is currently Cloudflare only."},{heading:"does-it-support-windows",content:"Not officially. macOS and Linux are the target platforms for the MVP."},{heading:"can-i-beam-other-tools-codex-opencode-claude-code",content:"Yes. If those tools run inside a tmux session on your machine, Termbridge will stream them just like any other terminal."}],headings:[{id:"faq",content:"FAQ"},{id:"does-termbridge-run-any-backend-server",content:"Does Termbridge run any backend server?"},{id:"can-i-run-multiple-terminals",content:"Can I run multiple terminals?"},{id:"is-the-tunnel-url-secure",content:"Is the tunnel URL secure?"},{id:"can-i-use-it-without-cloudflare",content:"Can I use it without Cloudflare?"},{id:"does-it-support-windows",content:"Does it support Windows?"},{id:"can-i-beam-other-tools-codex-opencode-claude-code",content:"Can I beam other tools (Codex, OpenCode, Claude Code)?"}]};const a=[{depth:1,url:"#faq",title:e.jsx(e.Fragment,{children:"FAQ"})},{depth:2,url:"#does-termbridge-run-any-backend-server",title:e.jsx(e.Fragment,{children:"Does Termbridge run any backend server?"})},{depth:2,url:"#can-i-run-multiple-terminals",title:e.jsx(e.Fragment,{children:"Can I run multiple terminals?"})},{depth:2,url:"#is-the-tunnel-url-secure",title:e.jsx(e.Fragment,{children:"Is the tunnel URL secure?"})},{depth:2,url:"#can-i-use-it-without-cloudflare",title:e.jsx(e.Fragment,{children:"Can I use it without Cloudflare?"})},{depth:2,url:"#does-it-support-windows",title:e.jsx(e.Fragment,{children:"Does it support Windows?"})},{depth:2,url:"#can-i-beam-other-tools-codex-opencode-claude-code",title:e.jsx(e.Fragment,{children:"Can I beam other tools (Codex, OpenCode, Claude Code)?"})}];function o(t){const n={h1:"h1",h2:"h2",p:"p",...t.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h1,{id:"faq",children:"FAQ"}),`
`,e.jsx(n.h2,{id:"does-termbridge-run-any-backend-server",children:"Does Termbridge run any backend server?"}),`
`,e.jsx(n.p,{children:"No. Everything runs locally on your machine. The only public surface is the Cloudflare tunnel."}),`
`,e.jsx(n.h2,{id:"can-i-run-multiple-terminals",children:"Can I run multiple terminals?"}),`
`,e.jsx(n.p,{children:"Yes. One server can host multiple tmux sessions. Use the terminal switcher in the UI to select a session."}),`
`,e.jsx(n.h2,{id:"is-the-tunnel-url-secure",children:"Is the tunnel URL secure?"}),`
`,e.jsx(n.p,{children:"Termbridge issues a one-time token and redeems it for a cookie session. The token URL should only be shared with devices you trust."}),`
`,e.jsx(n.h2,{id:"can-i-use-it-without-cloudflare",children:"Can I use it without Cloudflare?"}),`
`,e.jsx(n.p,{children:"Not yet. The tunnel provider is currently Cloudflare only."}),`
`,e.jsx(n.h2,{id:"does-it-support-windows",children:"Does it support Windows?"}),`
`,e.jsx(n.p,{children:"Not officially. macOS and Linux are the target platforms for the MVP."}),`
`,e.jsx(n.h2,{id:"can-i-beam-other-tools-codex-opencode-claude-code",children:"Can I beam other tools (Codex, OpenCode, Claude Code)?"}),`
`,e.jsx(n.p,{children:"Yes. If those tools run inside a tmux session on your machine, Termbridge will stream them just like any other terminal."})]})}function d(t={}){const{wrapper:n}=t.components||{};return n?e.jsx(n,{...t,children:e.jsx(o,{...t})}):o(t)}export{s as _markdown,d as default,i as frontmatter,l as structuredData,a as toc};
