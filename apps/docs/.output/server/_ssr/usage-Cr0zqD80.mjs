import { j as jsxRuntimeExports } from "../_libs/react.mjs";
let _markdown = '\n\nUsage [#usage]\n\nMultiple terminals [#multiple-terminals]\n\nTermbridge can host multiple tmux sessions from a single server. The UI includes a terminal switcher sheet for selecting a session.\n\nTermbridge only lists sessions it created or attached to in the current run.\n\nDevelopment shortcut [#development-shortcut]\n\n```bash\nTERMBRIDGE_SESSIONS=3 bun run dev:beam\n```\n\nThis will create three sessions: `<base>`, `<base>-2`, and `<base>-3`.\n\nSwitching sessions [#switching-sessions]\n\n1. Tap the terminal switcher button (terminal icon) in the input bar.\n2. Select a session from the list.\n3. The UI navigates to `/app/terminal/:terminalId` and connects the WebSocket.\n\nMobile controls [#mobile-controls]\n\nThe action bar provides common terminal keys:\n\n* `Enter`\n* Arrow keys\n* `Tab`\n* `Esc`\n* `Ctrl+C`\n\nThe bar is horizontally scrollable on mobile and uses scroll snapping for quick access.\n\nSending input [#sending-input]\n\n* Type in the input field and press **Enter** to send.\n* Use the send button to submit the input immediately.\n\nTips [#tips]\n\n* For TUIs that rely on size (like `htop`), rotate the device or resize the browser to trigger a terminal fit.\n* Use tmux panes/windows as you normally would; Termbridge streams the active tmux session.\n\nBeaming AI tools [#beaming-ai-tools]\n\nIf you run tools like Codex, OpenCode, or Claude Code inside tmux, Termbridge will stream them like any other terminal.\n\nExample flow:\n\n```bash\ntmux new-session -d -s codex\ntmux send-keys -t codex "codex" Enter\ntermbridge start --session codex\n```\n';
let frontmatter = {
  "title": "Usage",
  "description": "Multi-session workflows and mobile controls."
};
let structuredData = {
  "contents": [{
    "heading": "multiple-terminals",
    "content": "Termbridge can host multiple tmux sessions from a single server. The UI includes a terminal switcher sheet for selecting a session."
  }, {
    "heading": "multiple-terminals",
    "content": "Termbridge only lists sessions it created or attached to in the current run."
  }, {
    "heading": "development-shortcut",
    "content": "This will create three sessions: <base>, <base>-2, and <base>-3."
  }, {
    "heading": "switching-sessions",
    "content": "Tap the terminal switcher button (terminal icon) in the input bar."
  }, {
    "heading": "switching-sessions",
    "content": "Select a session from the list."
  }, {
    "heading": "switching-sessions",
    "content": "The UI navigates to /app/terminal/:terminalId and connects the WebSocket."
  }, {
    "heading": "mobile-controls",
    "content": "The action bar provides common terminal keys:"
  }, {
    "heading": "mobile-controls",
    "content": "Enter"
  }, {
    "heading": "mobile-controls",
    "content": "Arrow keys"
  }, {
    "heading": "mobile-controls",
    "content": "Tab"
  }, {
    "heading": "mobile-controls",
    "content": "Esc"
  }, {
    "heading": "mobile-controls",
    "content": "Ctrl+C"
  }, {
    "heading": "mobile-controls",
    "content": "The bar is horizontally scrollable on mobile and uses scroll snapping for quick access."
  }, {
    "heading": "sending-input",
    "content": "Type in the input field and press Enter to send."
  }, {
    "heading": "sending-input",
    "content": "Use the send button to submit the input immediately."
  }, {
    "heading": "tips",
    "content": "For TUIs that rely on size (like htop), rotate the device or resize the browser to trigger a terminal fit."
  }, {
    "heading": "tips",
    "content": "Use tmux panes/windows as you normally would; Termbridge streams the active tmux session."
  }, {
    "heading": "beaming-ai-tools",
    "content": "If you run tools like Codex, OpenCode, or Claude Code inside tmux, Termbridge will stream them like any other terminal."
  }, {
    "heading": "beaming-ai-tools",
    "content": "Example flow:"
  }],
  "headings": [{
    "id": "usage",
    "content": "Usage"
  }, {
    "id": "multiple-terminals",
    "content": "Multiple terminals"
  }, {
    "id": "development-shortcut",
    "content": "Development shortcut"
  }, {
    "id": "switching-sessions",
    "content": "Switching sessions"
  }, {
    "id": "mobile-controls",
    "content": "Mobile controls"
  }, {
    "id": "sending-input",
    "content": "Sending input"
  }, {
    "id": "tips",
    "content": "Tips"
  }, {
    "id": "beaming-ai-tools",
    "content": "Beaming AI tools"
  }]
};
const toc = [{
  depth: 1,
  url: "#usage",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Usage"
  })
}, {
  depth: 2,
  url: "#multiple-terminals",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Multiple terminals"
  })
}, {
  depth: 3,
  url: "#development-shortcut",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Development shortcut"
  })
}, {
  depth: 3,
  url: "#switching-sessions",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Switching sessions"
  })
}, {
  depth: 2,
  url: "#mobile-controls",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Mobile controls"
  })
}, {
  depth: 2,
  url: "#sending-input",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Sending input"
  })
}, {
  depth: 2,
  url: "#tips",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Tips"
  })
}, {
  depth: 2,
  url: "#beaming-ai-tools",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Beaming AI tools"
  })
}];
function _createMdxContent(props) {
  const _components = {
    code: "code",
    h1: "h1",
    h2: "h2",
    h3: "h3",
    li: "li",
    ol: "ol",
    p: "p",
    pre: "pre",
    span: "span",
    strong: "strong",
    ul: "ul",
    ...props.components
  };
  return jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, {
    children: [jsxRuntimeExports.jsx(_components.h1, {
      id: "usage",
      children: "Usage"
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "multiple-terminals",
      children: "Multiple terminals"
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "Termbridge can host multiple tmux sessions from a single server. The UI includes a terminal switcher sheet for selecting a session."
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "Termbridge only lists sessions it created or attached to in the current run."
    }), "\n", jsxRuntimeExports.jsx(_components.h3, {
      id: "development-shortcut",
      children: "Development shortcut"
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
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "TERMBRIDGE_SESSIONS"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#D73A49",
                "--shiki-dark": "#F97583"
              },
              children: "="
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: "3"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: " bun"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " run"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " dev:beam"
            })]
          })
        })
      })
    }), "\n", jsxRuntimeExports.jsxs(_components.p, {
      children: ["This will create three sessions: ", jsxRuntimeExports.jsx(_components.code, {
        children: "<base>"
      }), ", ", jsxRuntimeExports.jsx(_components.code, {
        children: "<base>-2"
      }), ", and ", jsxRuntimeExports.jsx(_components.code, {
        children: "<base>-3"
      }), "."]
    }), "\n", jsxRuntimeExports.jsx(_components.h3, {
      id: "switching-sessions",
      children: "Switching sessions"
    }), "\n", jsxRuntimeExports.jsxs(_components.ol, {
      children: ["\n", jsxRuntimeExports.jsx(_components.li, {
        children: "Tap the terminal switcher button (terminal icon) in the input bar."
      }), "\n", jsxRuntimeExports.jsx(_components.li, {
        children: "Select a session from the list."
      }), "\n", jsxRuntimeExports.jsxs(_components.li, {
        children: ["The UI navigates to ", jsxRuntimeExports.jsx(_components.code, {
          children: "/app/terminal/:terminalId"
        }), " and connects the WebSocket."]
      }), "\n"]
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "mobile-controls",
      children: "Mobile controls"
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "The action bar provides common terminal keys:"
    }), "\n", jsxRuntimeExports.jsxs(_components.ul, {
      children: ["\n", jsxRuntimeExports.jsx(_components.li, {
        children: jsxRuntimeExports.jsx(_components.code, {
          children: "Enter"
        })
      }), "\n", jsxRuntimeExports.jsx(_components.li, {
        children: "Arrow keys"
      }), "\n", jsxRuntimeExports.jsx(_components.li, {
        children: jsxRuntimeExports.jsx(_components.code, {
          children: "Tab"
        })
      }), "\n", jsxRuntimeExports.jsx(_components.li, {
        children: jsxRuntimeExports.jsx(_components.code, {
          children: "Esc"
        })
      }), "\n", jsxRuntimeExports.jsx(_components.li, {
        children: jsxRuntimeExports.jsx(_components.code, {
          children: "Ctrl+C"
        })
      }), "\n"]
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "The bar is horizontally scrollable on mobile and uses scroll snapping for quick access."
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "sending-input",
      children: "Sending input"
    }), "\n", jsxRuntimeExports.jsxs(_components.ul, {
      children: ["\n", jsxRuntimeExports.jsxs(_components.li, {
        children: ["Type in the input field and press ", jsxRuntimeExports.jsx(_components.strong, {
          children: "Enter"
        }), " to send."]
      }), "\n", jsxRuntimeExports.jsx(_components.li, {
        children: "Use the send button to submit the input immediately."
      }), "\n"]
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "tips",
      children: "Tips"
    }), "\n", jsxRuntimeExports.jsxs(_components.ul, {
      children: ["\n", jsxRuntimeExports.jsxs(_components.li, {
        children: ["For TUIs that rely on size (like ", jsxRuntimeExports.jsx(_components.code, {
          children: "htop"
        }), "), rotate the device or resize the browser to trigger a terminal fit."]
      }), "\n", jsxRuntimeExports.jsx(_components.li, {
        children: "Use tmux panes/windows as you normally would; Termbridge streams the active tmux session."
      }), "\n"]
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "beaming-ai-tools",
      children: "Beaming AI tools"
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "If you run tools like Codex, OpenCode, or Claude Code inside tmux, Termbridge will stream them like any other terminal."
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "Example flow:"
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
        children: jsxRuntimeExports.jsxs(_components.code, {
          children: [jsxRuntimeExports.jsxs(_components.span, {
            className: "line",
            children: [jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tmux"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " new-session"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " -d"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " -s"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " codex"
            })]
          }), "\n", jsxRuntimeExports.jsxs(_components.span, {
            className: "line",
            children: [jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "tmux"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " send-keys"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " -t"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " codex"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: ' "codex"'
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " Enter"
            })]
          }), "\n", jsxRuntimeExports.jsxs(_components.span, {
            className: "line",
            children: [jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "termbridge"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " start"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --session"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " codex"
            })]
          })]
        })
      })
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
