import { j as jsxRuntimeExports } from "../_libs/react.mjs";
let _markdown = "\n\nIntroduction [#introduction]\n\nTermbridge is a local-first CLI that beams your terminal to any browser. It runs a local server, streams a real tmux session into an xterm.js UI, and exposes the server through a Cloudflare Quick Tunnel so you can open it on your phone.\n\nWhat you get [#what-you-get]\n\n* **One command**: `npx termbridge` starts the server, creates a tmux session, and prints a QR code.\n* **Real terminal**: tmux + node-pty means true colors, TUIs, and proper key handling.\n* **Multi-session**: one server can host multiple tmux sessions, switchable in-app.\n* **No backend**: everything runs on your machine. The tunnel is the only public surface.\n\nCore ideas [#core-ideas]\n\nLocal-first by default [#local-first-by-default]\n\nThe server, WebSocket, and terminal registry live locally. There is no Termbridge-operated backend, and no data is stored externally.\n\nSecure handoff [#secure-handoff]\n\nTermbridge issues a one-time token and redeems it into a cookie session. The token URL is what you scan on mobile.\n\nMobile-friendly UI [#mobile-friendly-ui]\n\nThe UI is intentionally minimal: a full-height terminal with a compact control bar and a terminal switcher sheet.\n\nQuick peek [#quick-peek]\n\n```bash\nnpx termbridge\n```\n\nScan the QR code, open the URL, and you should see your terminal instantly.\n\nNext: head to **Getting Started** for setup and prerequisites.\n";
let frontmatter = {
  "title": "Introduction",
  "description": "Local-first terminal beaming for any device."
};
let structuredData = {
  "contents": [{
    "heading": "introduction",
    "content": "Termbridge is a local-first CLI that beams your terminal to any browser. It runs a local server, streams a real tmux session into an xterm.js UI, and exposes the server through a Cloudflare Quick Tunnel so you can open it on your phone."
  }, {
    "heading": "what-you-get",
    "content": "One command: npx termbridge starts the server, creates a tmux session, and prints a QR code."
  }, {
    "heading": "what-you-get",
    "content": "Real terminal: tmux + node-pty means true colors, TUIs, and proper key handling."
  }, {
    "heading": "what-you-get",
    "content": "Multi-session: one server can host multiple tmux sessions, switchable in-app."
  }, {
    "heading": "what-you-get",
    "content": "No backend: everything runs on your machine. The tunnel is the only public surface."
  }, {
    "heading": "local-first-by-default",
    "content": "The server, WebSocket, and terminal registry live locally. There is no Termbridge-operated backend, and no data is stored externally."
  }, {
    "heading": "secure-handoff",
    "content": "Termbridge issues a one-time token and redeems it into a cookie session. The token URL is what you scan on mobile."
  }, {
    "heading": "mobile-friendly-ui",
    "content": "The UI is intentionally minimal: a full-height terminal with a compact control bar and a terminal switcher sheet."
  }, {
    "heading": "quick-peek",
    "content": "Scan the QR code, open the URL, and you should see your terminal instantly."
  }, {
    "heading": "quick-peek",
    "content": "Next: head to Getting Started for setup and prerequisites."
  }],
  "headings": [{
    "id": "introduction",
    "content": "Introduction"
  }, {
    "id": "what-you-get",
    "content": "What you get"
  }, {
    "id": "core-ideas",
    "content": "Core ideas"
  }, {
    "id": "local-first-by-default",
    "content": "Local-first by default"
  }, {
    "id": "secure-handoff",
    "content": "Secure handoff"
  }, {
    "id": "mobile-friendly-ui",
    "content": "Mobile-friendly UI"
  }, {
    "id": "quick-peek",
    "content": "Quick peek"
  }]
};
const toc = [{
  depth: 1,
  url: "#introduction",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Introduction"
  })
}, {
  depth: 2,
  url: "#what-you-get",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "What you get"
  })
}, {
  depth: 2,
  url: "#core-ideas",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Core ideas"
  })
}, {
  depth: 3,
  url: "#local-first-by-default",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Local-first by default"
  })
}, {
  depth: 3,
  url: "#secure-handoff",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Secure handoff"
  })
}, {
  depth: 3,
  url: "#mobile-friendly-ui",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Mobile-friendly UI"
  })
}, {
  depth: 2,
  url: "#quick-peek",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Quick peek"
  })
}];
function _createMdxContent(props) {
  const _components = {
    code: "code",
    h1: "h1",
    h2: "h2",
    h3: "h3",
    li: "li",
    p: "p",
    pre: "pre",
    span: "span",
    strong: "strong",
    ul: "ul",
    ...props.components
  };
  return jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, {
    children: [jsxRuntimeExports.jsx(_components.h1, {
      id: "introduction",
      children: "Introduction"
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "Termbridge is a local-first CLI that beams your terminal to any browser. It runs a local server, streams a real tmux session into an xterm.js UI, and exposes the server through a Cloudflare Quick Tunnel so you can open it on your phone."
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "what-you-get",
      children: "What you get"
    }), "\n", jsxRuntimeExports.jsxs(_components.ul, {
      children: ["\n", jsxRuntimeExports.jsxs(_components.li, {
        children: [jsxRuntimeExports.jsx(_components.strong, {
          children: "One command"
        }), ": ", jsxRuntimeExports.jsx(_components.code, {
          children: "npx termbridge"
        }), " starts the server, creates a tmux session, and prints a QR code."]
      }), "\n", jsxRuntimeExports.jsxs(_components.li, {
        children: [jsxRuntimeExports.jsx(_components.strong, {
          children: "Real terminal"
        }), ": tmux + node-pty means true colors, TUIs, and proper key handling."]
      }), "\n", jsxRuntimeExports.jsxs(_components.li, {
        children: [jsxRuntimeExports.jsx(_components.strong, {
          children: "Multi-session"
        }), ": one server can host multiple tmux sessions, switchable in-app."]
      }), "\n", jsxRuntimeExports.jsxs(_components.li, {
        children: [jsxRuntimeExports.jsx(_components.strong, {
          children: "No backend"
        }), ": everything runs on your machine. The tunnel is the only public surface."]
      }), "\n"]
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "core-ideas",
      children: "Core ideas"
    }), "\n", jsxRuntimeExports.jsx(_components.h3, {
      id: "local-first-by-default",
      children: "Local-first by default"
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "The server, WebSocket, and terminal registry live locally. There is no Termbridge-operated backend, and no data is stored externally."
    }), "\n", jsxRuntimeExports.jsx(_components.h3, {
      id: "secure-handoff",
      children: "Secure handoff"
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "Termbridge issues a one-time token and redeems it into a cookie session. The token URL is what you scan on mobile."
    }), "\n", jsxRuntimeExports.jsx(_components.h3, {
      id: "mobile-friendly-ui",
      children: "Mobile-friendly UI"
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "The UI is intentionally minimal: a full-height terminal with a compact control bar and a terminal switcher sheet."
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "quick-peek",
      children: "Quick peek"
    }), "\n", jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
      children: jsxRuntimeExports.jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: '<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',
        children: jsxRuntimeExports.jsx(_components.code, {
          children: jsxRuntimeExports.jsxs(_components.span, {
            className: "line",
            children: [jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "npx"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " termbridge"
            })]
          })
        })
      })
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "Scan the QR code, open the URL, and you should see your terminal instantly."
    }), "\n", jsxRuntimeExports.jsxs(_components.p, {
      children: ["Next: head to ", jsxRuntimeExports.jsx(_components.strong, {
        children: "Getting Started"
      }), " for setup and prerequisites."]
    })]
  });
}
function MDXContent(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsxRuntimeExports.jsx(MDXLayout, {
    ...props,
    children: jsxRuntimeExports.jsx(_createMdxContent, {
      ...props
    })
  }) : _createMdxContent(props);
}
export {
  _markdown,
  MDXContent as default,
  frontmatter,
  structuredData,
  toc
};
