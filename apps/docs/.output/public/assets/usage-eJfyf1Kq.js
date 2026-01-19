import{j as e}from"./main-CgXkS054.js";let l=`

Usage [#usage]

Multiple terminals [#multiple-terminals]

Termbridge can host multiple tmux sessions from a single server. The UI includes a terminal switcher sheet for selecting a session.

Termbridge only lists sessions it created or attached to in the current run.

Development shortcut [#development-shortcut]

\`\`\`bash
TERMBRIDGE_SESSIONS=3 bun run dev:beam
\`\`\`

This will create three sessions: \`<base>\`, \`<base>-2\`, and \`<base>-3\`.

Switching sessions [#switching-sessions]

1. Tap the terminal switcher button (terminal icon) in the input bar.
2. Select a session from the list.
3. The UI navigates to \`/app/terminal/:terminalId\` and connects the WebSocket.

Mobile controls [#mobile-controls]

The action bar provides common terminal keys:

* \`Enter\`
* Arrow keys
* \`Tab\`
* \`Esc\`
* \`Ctrl+C\`

The bar is horizontally scrollable on mobile and uses scroll snapping for quick access.

Sending input [#sending-input]

* Type in the input field and press **Enter** to send.
* Use the send button to submit the input immediately.

Tips [#tips]

* For TUIs that rely on size (like \`htop\`), rotate the device or resize the browser to trigger a terminal fit.
* Use tmux panes/windows as you normally would; Termbridge streams the active tmux session.

Beaming AI tools [#beaming-ai-tools]

If you run tools like Codex, OpenCode, or Claude Code inside tmux, Termbridge will stream them like any other terminal.

Example flow:

\`\`\`bash
tmux new-session -d -s codex
tmux send-keys -t codex "codex" Enter
termbridge start --session codex
\`\`\`
`,r={title:"Usage",description:"Multi-session workflows and mobile controls."},o={contents:[{heading:"multiple-terminals",content:"Termbridge can host multiple tmux sessions from a single server. The UI includes a terminal switcher sheet for selecting a session."},{heading:"multiple-terminals",content:"Termbridge only lists sessions it created or attached to in the current run."},{heading:"development-shortcut",content:"This will create three sessions: <base>, <base>-2, and <base>-3."},{heading:"switching-sessions",content:"Tap the terminal switcher button (terminal icon) in the input bar."},{heading:"switching-sessions",content:"Select a session from the list."},{heading:"switching-sessions",content:"The UI navigates to /app/terminal/:terminalId and connects the WebSocket."},{heading:"mobile-controls",content:"The action bar provides common terminal keys:"},{heading:"mobile-controls",content:"Enter"},{heading:"mobile-controls",content:"Arrow keys"},{heading:"mobile-controls",content:"Tab"},{heading:"mobile-controls",content:"Esc"},{heading:"mobile-controls",content:"Ctrl+C"},{heading:"mobile-controls",content:"The bar is horizontally scrollable on mobile and uses scroll snapping for quick access."},{heading:"sending-input",content:"Type in the input field and press Enter to send."},{heading:"sending-input",content:"Use the send button to submit the input immediately."},{heading:"tips",content:"For TUIs that rely on size (like htop), rotate the device or resize the browser to trigger a terminal fit."},{heading:"tips",content:"Use tmux panes/windows as you normally would; Termbridge streams the active tmux session."},{heading:"beaming-ai-tools",content:"If you run tools like Codex, OpenCode, or Claude Code inside tmux, Termbridge will stream them like any other terminal."},{heading:"beaming-ai-tools",content:"Example flow:"}],headings:[{id:"usage",content:"Usage"},{id:"multiple-terminals",content:"Multiple terminals"},{id:"development-shortcut",content:"Development shortcut"},{id:"switching-sessions",content:"Switching sessions"},{id:"mobile-controls",content:"Mobile controls"},{id:"sending-input",content:"Sending input"},{id:"tips",content:"Tips"},{id:"beaming-ai-tools",content:"Beaming AI tools"}]};const h=[{depth:1,url:"#usage",title:e.jsx(e.Fragment,{children:"Usage"})},{depth:2,url:"#multiple-terminals",title:e.jsx(e.Fragment,{children:"Multiple terminals"})},{depth:3,url:"#development-shortcut",title:e.jsx(e.Fragment,{children:"Development shortcut"})},{depth:3,url:"#switching-sessions",title:e.jsx(e.Fragment,{children:"Switching sessions"})},{depth:2,url:"#mobile-controls",title:e.jsx(e.Fragment,{children:"Mobile controls"})},{depth:2,url:"#sending-input",title:e.jsx(e.Fragment,{children:"Sending input"})},{depth:2,url:"#tips",title:e.jsx(e.Fragment,{children:"Tips"})},{depth:2,url:"#beaming-ai-tools",title:e.jsx(e.Fragment,{children:"Beaming AI tools"})}];function s(i){const n={code:"code",h1:"h1",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...i.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h1,{id:"usage",children:"Usage"}),`
`,e.jsx(n.h2,{id:"multiple-terminals",children:"Multiple terminals"}),`
`,e.jsx(n.p,{children:"Termbridge can host multiple tmux sessions from a single server. The UI includes a terminal switcher sheet for selecting a session."}),`
`,e.jsx(n.p,{children:"Termbridge only lists sessions it created or attached to in the current run."}),`
`,e.jsx(n.h3,{id:"development-shortcut",children:"Development shortcut"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"TERMBRIDGE_SESSIONS"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"3"}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" bun"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" run"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" dev:beam"})]})})})}),`
`,e.jsxs(n.p,{children:["This will create three sessions: ",e.jsx(n.code,{children:"<base>"}),", ",e.jsx(n.code,{children:"<base>-2"}),", and ",e.jsx(n.code,{children:"<base>-3"}),"."]}),`
`,e.jsx(n.h3,{id:"switching-sessions",children:"Switching sessions"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsx(n.li,{children:"Tap the terminal switcher button (terminal icon) in the input bar."}),`
`,e.jsx(n.li,{children:"Select a session from the list."}),`
`,e.jsxs(n.li,{children:["The UI navigates to ",e.jsx(n.code,{children:"/app/terminal/:terminalId"})," and connects the WebSocket."]}),`
`]}),`
`,e.jsx(n.h2,{id:"mobile-controls",children:"Mobile controls"}),`
`,e.jsx(n.p,{children:"The action bar provides common terminal keys:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:e.jsx(n.code,{children:"Enter"})}),`
`,e.jsx(n.li,{children:"Arrow keys"}),`
`,e.jsx(n.li,{children:e.jsx(n.code,{children:"Tab"})}),`
`,e.jsx(n.li,{children:e.jsx(n.code,{children:"Esc"})}),`
`,e.jsx(n.li,{children:e.jsx(n.code,{children:"Ctrl+C"})}),`
`]}),`
`,e.jsx(n.p,{children:"The bar is horizontally scrollable on mobile and uses scroll snapping for quick access."}),`
`,e.jsx(n.h2,{id:"sending-input",children:"Sending input"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Type in the input field and press ",e.jsx(n.strong,{children:"Enter"})," to send."]}),`
`,e.jsx(n.li,{children:"Use the send button to submit the input immediately."}),`
`]}),`
`,e.jsx(n.h2,{id:"tips",children:"Tips"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["For TUIs that rely on size (like ",e.jsx(n.code,{children:"htop"}),"), rotate the device or resize the browser to trigger a terminal fit."]}),`
`,e.jsx(n.li,{children:"Use tmux panes/windows as you normally would; Termbridge streams the active tmux session."}),`
`]}),`
`,e.jsx(n.h2,{id:"beaming-ai-tools",children:"Beaming AI tools"}),`
`,e.jsx(n.p,{children:"If you run tools like Codex, OpenCode, or Claude Code inside tmux, Termbridge will stream them like any other terminal."}),`
`,e.jsx(n.p,{children:"Example flow:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"tmux"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" new-session"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -d"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -s"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" codex"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"tmux"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" send-keys"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -t"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" codex"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "codex"'}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Enter"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"termbridge"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" start"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --session"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" codex"})]})]})})})]})}function a(i={}){const{wrapper:n}=i.components||{};return n?e.jsx(n,{...i,children:e.jsx(s,{...i})}):s(i)}export{l as _markdown,a as default,r as frontmatter,o as structuredData,h as toc};
