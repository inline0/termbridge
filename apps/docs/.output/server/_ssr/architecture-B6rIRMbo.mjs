import { j as jsxRuntimeExports } from "../_libs/react.mjs";
let _markdown = '\n\nArchitecture [#architecture]\n\nHigh-level flow [#high-level-flow]\n\n```\nBrowser (phone)\n  |\n  | HTTPS\n  v\nCloudflare Quick Tunnel\n  |\n  | HTTP/WS\n  v\nLocal Termbridge server\n  |\n  | PTY\n  v\nTmux session\n```\n\nComponents [#components]\n\nCLI process [#cli-process]\n\n* Starts the HTTP server that serves the UI assets.\n* Starts the WebSocket server for terminal I/O.\n* Creates one or more tmux sessions.\n* Issues one-time redemption tokens.\n* Starts and monitors the Cloudflare tunnel.\n\nTerminal backend [#terminal-backend]\n\n* Uses `node-pty` to attach to tmux for real keystrokes and output.\n* Sets `TERM=xterm-256color` and `COLORTERM=truecolor` for full color support.\n* Disables the tmux status bar to keep the UI clean.\n\nTerminal registry [#terminal-registry]\n\n* Tracks available terminal sessions.\n* Provides a list for the UI and validates selected terminal IDs.\n\nAuth and session [#auth-and-session]\n\n* One-time token is printed as a URL and encoded in a QR code.\n* `GET /s/:token` redeems the token and sets a cookie session.\n* WebSocket connections require a valid session cookie.\n\nAPI endpoints [#api-endpoints]\n\n* `GET /healthz` - health check\n* `GET /api/terminals` - list terminals\n* `POST /api/terminals` - create a new tmux session\n* `WS /ws/terminal/:terminalId` - stream terminal I/O\n\nWebSocket protocol [#websocket-protocol]\n\nClient -> server:\n\n```json\n{ "type": "input", "data": "ls -la" }\n{ "type": "resize", "cols": 120, "rows": 32 }\n{ "type": "control", "key": "ctrl_c" }\n```\n\nServer -> client:\n\n```json\n{ "type": "output", "data": "..." }\n{ "type": "status", "state": "connected" }\n```\n\nUI stack [#ui-stack]\n\n* Vite + TanStack Router\n* xterm.js + Fit addon + WebGL renderer\n* Mobile-first layout with a fixed input bar\n';
let frontmatter = {
  "title": "Architecture",
  "description": "How the local server, tunnel, and terminal streaming fit together."
};
let structuredData = {
  "contents": [{
    "heading": "cli-process",
    "content": "Starts the HTTP server that serves the UI assets."
  }, {
    "heading": "cli-process",
    "content": "Starts the WebSocket server for terminal I/O."
  }, {
    "heading": "cli-process",
    "content": "Creates one or more tmux sessions."
  }, {
    "heading": "cli-process",
    "content": "Issues one-time redemption tokens."
  }, {
    "heading": "cli-process",
    "content": "Starts and monitors the Cloudflare tunnel."
  }, {
    "heading": "terminal-backend",
    "content": "Uses node-pty to attach to tmux for real keystrokes and output."
  }, {
    "heading": "terminal-backend",
    "content": "Sets TERM=xterm-256color and COLORTERM=truecolor for full color support."
  }, {
    "heading": "terminal-backend",
    "content": "Disables the tmux status bar to keep the UI clean."
  }, {
    "heading": "terminal-registry",
    "content": "Tracks available terminal sessions."
  }, {
    "heading": "terminal-registry",
    "content": "Provides a list for the UI and validates selected terminal IDs."
  }, {
    "heading": "auth-and-session",
    "content": "One-time token is printed as a URL and encoded in a QR code."
  }, {
    "heading": "auth-and-session",
    "content": "GET /s/:token redeems the token and sets a cookie session."
  }, {
    "heading": "auth-and-session",
    "content": "WebSocket connections require a valid session cookie."
  }, {
    "heading": "api-endpoints",
    "content": "GET /healthz - health check"
  }, {
    "heading": "api-endpoints",
    "content": "GET /api/terminals - list terminals"
  }, {
    "heading": "api-endpoints",
    "content": "POST /api/terminals - create a new tmux session"
  }, {
    "heading": "api-endpoints",
    "content": "WS /ws/terminal/:terminalId - stream terminal I/O"
  }, {
    "heading": "websocket-protocol",
    "content": "Client -> server:"
  }, {
    "heading": "websocket-protocol",
    "content": "Server -> client:"
  }, {
    "heading": "ui-stack",
    "content": "Vite + TanStack Router"
  }, {
    "heading": "ui-stack",
    "content": "xterm.js + Fit addon + WebGL renderer"
  }, {
    "heading": "ui-stack",
    "content": "Mobile-first layout with a fixed input bar"
  }],
  "headings": [{
    "id": "architecture",
    "content": "Architecture"
  }, {
    "id": "high-level-flow",
    "content": "High-level flow"
  }, {
    "id": "components",
    "content": "Components"
  }, {
    "id": "cli-process",
    "content": "CLI process"
  }, {
    "id": "terminal-backend",
    "content": "Terminal backend"
  }, {
    "id": "terminal-registry",
    "content": "Terminal registry"
  }, {
    "id": "auth-and-session",
    "content": "Auth and session"
  }, {
    "id": "api-endpoints",
    "content": "API endpoints"
  }, {
    "id": "websocket-protocol",
    "content": "WebSocket protocol"
  }, {
    "id": "ui-stack",
    "content": "UI stack"
  }]
};
const toc = [{
  depth: 1,
  url: "#architecture",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Architecture"
  })
}, {
  depth: 2,
  url: "#high-level-flow",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "High-level flow"
  })
}, {
  depth: 2,
  url: "#components",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Components"
  })
}, {
  depth: 3,
  url: "#cli-process",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "CLI process"
  })
}, {
  depth: 3,
  url: "#terminal-backend",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Terminal backend"
  })
}, {
  depth: 3,
  url: "#terminal-registry",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Terminal registry"
  })
}, {
  depth: 3,
  url: "#auth-and-session",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Auth and session"
  })
}, {
  depth: 2,
  url: "#api-endpoints",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "API endpoints"
  })
}, {
  depth: 2,
  url: "#websocket-protocol",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "WebSocket protocol"
  })
}, {
  depth: 2,
  url: "#ui-stack",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "UI stack"
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
    ul: "ul",
    ...props.components
  };
  return jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, {
    children: [jsxRuntimeExports.jsx(_components.h1, {
      id: "architecture",
      children: "Architecture"
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "high-level-flow",
      children: "High-level flow"
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
        icon: '<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',
        children: jsxRuntimeExports.jsxs(_components.code, {
          children: [jsxRuntimeExports.jsx(_components.span, {
            className: "line",
            children: jsxRuntimeExports.jsx(_components.span, {
              children: "Browser (phone)"
            })
          }), "\n", jsxRuntimeExports.jsx(_components.span, {
            className: "line",
            children: jsxRuntimeExports.jsx(_components.span, {
              children: "  |"
            })
          }), "\n", jsxRuntimeExports.jsx(_components.span, {
            className: "line",
            children: jsxRuntimeExports.jsx(_components.span, {
              children: "  | HTTPS"
            })
          }), "\n", jsxRuntimeExports.jsx(_components.span, {
            className: "line",
            children: jsxRuntimeExports.jsx(_components.span, {
              children: "  v"
            })
          }), "\n", jsxRuntimeExports.jsx(_components.span, {
            className: "line",
            children: jsxRuntimeExports.jsx(_components.span, {
              children: "Cloudflare Quick Tunnel"
            })
          }), "\n", jsxRuntimeExports.jsx(_components.span, {
            className: "line",
            children: jsxRuntimeExports.jsx(_components.span, {
              children: "  |"
            })
          }), "\n", jsxRuntimeExports.jsx(_components.span, {
            className: "line",
            children: jsxRuntimeExports.jsx(_components.span, {
              children: "  | HTTP/WS"
            })
          }), "\n", jsxRuntimeExports.jsx(_components.span, {
            className: "line",
            children: jsxRuntimeExports.jsx(_components.span, {
              children: "  v"
            })
          }), "\n", jsxRuntimeExports.jsx(_components.span, {
            className: "line",
            children: jsxRuntimeExports.jsx(_components.span, {
              children: "Local Termbridge server"
            })
          }), "\n", jsxRuntimeExports.jsx(_components.span, {
            className: "line",
            children: jsxRuntimeExports.jsx(_components.span, {
              children: "  |"
            })
          }), "\n", jsxRuntimeExports.jsx(_components.span, {
            className: "line",
            children: jsxRuntimeExports.jsx(_components.span, {
              children: "  | PTY"
            })
          }), "\n", jsxRuntimeExports.jsx(_components.span, {
            className: "line",
            children: jsxRuntimeExports.jsx(_components.span, {
              children: "  v"
            })
          }), "\n", jsxRuntimeExports.jsx(_components.span, {
            className: "line",
            children: jsxRuntimeExports.jsx(_components.span, {
              children: "Tmux session"
            })
          })]
        })
      })
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "components",
      children: "Components"
    }), "\n", jsxRuntimeExports.jsx(_components.h3, {
      id: "cli-process",
      children: "CLI process"
    }), "\n", jsxRuntimeExports.jsxs(_components.ul, {
      children: ["\n", jsxRuntimeExports.jsx(_components.li, {
        children: "Starts the HTTP server that serves the UI assets."
      }), "\n", jsxRuntimeExports.jsx(_components.li, {
        children: "Starts the WebSocket server for terminal I/O."
      }), "\n", jsxRuntimeExports.jsx(_components.li, {
        children: "Creates one or more tmux sessions."
      }), "\n", jsxRuntimeExports.jsx(_components.li, {
        children: "Issues one-time redemption tokens."
      }), "\n", jsxRuntimeExports.jsx(_components.li, {
        children: "Starts and monitors the Cloudflare tunnel."
      }), "\n"]
    }), "\n", jsxRuntimeExports.jsx(_components.h3, {
      id: "terminal-backend",
      children: "Terminal backend"
    }), "\n", jsxRuntimeExports.jsxs(_components.ul, {
      children: ["\n", jsxRuntimeExports.jsxs(_components.li, {
        children: ["Uses ", jsxRuntimeExports.jsx(_components.code, {
          children: "node-pty"
        }), " to attach to tmux for real keystrokes and output."]
      }), "\n", jsxRuntimeExports.jsxs(_components.li, {
        children: ["Sets ", jsxRuntimeExports.jsx(_components.code, {
          children: "TERM=xterm-256color"
        }), " and ", jsxRuntimeExports.jsx(_components.code, {
          children: "COLORTERM=truecolor"
        }), " for full color support."]
      }), "\n", jsxRuntimeExports.jsx(_components.li, {
        children: "Disables the tmux status bar to keep the UI clean."
      }), "\n"]
    }), "\n", jsxRuntimeExports.jsx(_components.h3, {
      id: "terminal-registry",
      children: "Terminal registry"
    }), "\n", jsxRuntimeExports.jsxs(_components.ul, {
      children: ["\n", jsxRuntimeExports.jsx(_components.li, {
        children: "Tracks available terminal sessions."
      }), "\n", jsxRuntimeExports.jsx(_components.li, {
        children: "Provides a list for the UI and validates selected terminal IDs."
      }), "\n"]
    }), "\n", jsxRuntimeExports.jsx(_components.h3, {
      id: "auth-and-session",
      children: "Auth and session"
    }), "\n", jsxRuntimeExports.jsxs(_components.ul, {
      children: ["\n", jsxRuntimeExports.jsx(_components.li, {
        children: "One-time token is printed as a URL and encoded in a QR code."
      }), "\n", jsxRuntimeExports.jsxs(_components.li, {
        children: [jsxRuntimeExports.jsx(_components.code, {
          children: "GET /s/:token"
        }), " redeems the token and sets a cookie session."]
      }), "\n", jsxRuntimeExports.jsx(_components.li, {
        children: "WebSocket connections require a valid session cookie."
      }), "\n"]
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "api-endpoints",
      children: "API endpoints"
    }), "\n", jsxRuntimeExports.jsxs(_components.ul, {
      children: ["\n", jsxRuntimeExports.jsxs(_components.li, {
        children: [jsxRuntimeExports.jsx(_components.code, {
          children: "GET /healthz"
        }), " - health check"]
      }), "\n", jsxRuntimeExports.jsxs(_components.li, {
        children: [jsxRuntimeExports.jsx(_components.code, {
          children: "GET /api/terminals"
        }), " - list terminals"]
      }), "\n", jsxRuntimeExports.jsxs(_components.li, {
        children: [jsxRuntimeExports.jsx(_components.code, {
          children: "POST /api/terminals"
        }), " - create a new tmux session"]
      }), "\n", jsxRuntimeExports.jsxs(_components.li, {
        children: [jsxRuntimeExports.jsx(_components.code, {
          children: "WS /ws/terminal/:terminalId"
        }), " - stream terminal I/O"]
      }), "\n"]
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "websocket-protocol",
      children: "WebSocket protocol"
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "Client -> server:"
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
        icon: '<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',
        children: jsxRuntimeExports.jsxs(_components.code, {
          children: [jsxRuntimeExports.jsxs(_components.span, {
            className: "line",
            children: [jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "{ "
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: '"type"'
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: ": "
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: '"input"'
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: ", "
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: '"data"'
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: ": "
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: '"ls -la"'
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: " }"
            })]
          }), "\n", jsxRuntimeExports.jsxs(_components.span, {
            className: "line",
            children: [jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "{ "
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: '"type"'
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: ": "
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: '"resize"'
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: ", "
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: '"cols"'
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: ": "
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: "120"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: ", "
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: '"rows"'
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: ": "
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: "32"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: " }"
            })]
          }), "\n", jsxRuntimeExports.jsxs(_components.span, {
            className: "line",
            children: [jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "{ "
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: '"type"'
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: ": "
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: '"control"'
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: ", "
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: '"key"'
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: ": "
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: '"ctrl_c"'
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: " }"
            })]
          })]
        })
      })
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "Server -> client:"
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
        icon: '<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',
        children: jsxRuntimeExports.jsxs(_components.code, {
          children: [jsxRuntimeExports.jsxs(_components.span, {
            className: "line",
            children: [jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "{ "
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: '"type"'
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: ": "
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: '"output"'
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: ", "
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: '"data"'
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: ": "
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: '"..."'
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: " }"
            })]
          }), "\n", jsxRuntimeExports.jsxs(_components.span, {
            className: "line",
            children: [jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "{ "
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: '"type"'
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: ": "
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: '"status"'
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: ", "
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: '"state"'
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: ": "
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: '"connected"'
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: " }"
            })]
          })]
        })
      })
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "ui-stack",
      children: "UI stack"
    }), "\n", jsxRuntimeExports.jsxs(_components.ul, {
      children: ["\n", jsxRuntimeExports.jsx(_components.li, {
        children: "Vite + TanStack Router"
      }), "\n", jsxRuntimeExports.jsx(_components.li, {
        children: "xterm.js + Fit addon + WebGL renderer"
      }), "\n", jsxRuntimeExports.jsx(_components.li, {
        children: "Mobile-first layout with a fixed input bar"
      }), "\n"]
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
