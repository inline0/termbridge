import { j as jsxRuntimeExports } from "../_libs/react.mjs";
let _markdown = "\n\nCLI Reference [#cli-reference]\n\ntermbridge [#termbridge]\n\nRunning without a subcommand is equivalent to `termbridge start`.\n\n```bash\ntermbridge\n```\n\ntermbridge start [#termbridge-start]\n\nStarts the local server, creates a tmux session, and launches the Cloudflare tunnel.\n\n```bash\ntermbridge start --port 8080 --session dev --kill-on-exit --no-qr --tunnel cloudflare\n```\n\nFlags [#flags]\n\n| Flag                  | Description                           | Default          |\n| --------------------- | ------------------------------------- | ---------------- |\n| `--port <port>`       | Bind the local server to a fixed port | random free port |\n| `--session <name>`    | tmux session name override            | auto-generated   |\n| `--kill-on-exit`      | kill tmux sessions on exit            | `false`          |\n| `--no-qr`             | disable QR code output                | `false`          |\n| `--tunnel cloudflare` | tunnel provider                       | `cloudflare`     |\n\nExamples [#examples]\n\nDefault:\n\n```bash\nnpx termbridge\n```\n\nFixed port and custom session:\n\n```bash\ntermbridge start --port 8080 --session codex\n```\n\nExit cleanup:\n\n```bash\ntermbridge start --kill-on-exit\n```\n\nNo QR (for scripts):\n\n```bash\ntermbridge start --no-qr\n```\n\nEnvironment variables [#environment-variables]\n\n| Variable                                  | Description                                             |\n| ----------------------------------------- | ------------------------------------------------------- |\n| `TERMBRIDGE_SESSIONS=2`                   | Create multiple tmux sessions at startup (dev/testing). |\n| `TERMBRIDGE_INSECURE_COOKIE=1`            | Allow HTTP cookies for local development.               |\n| `TERMBRIDGE_DEV_UI=http://127.0.0.1:5173` | Override Vite dev UI URL when running `dev:beam`.       |\n\nExit behavior [#exit-behavior]\n\n* The CLI must keep running for the tunnel to stay active.\n* `Ctrl+C` shuts down the tunnel and the local server.\n* With `--kill-on-exit`, Termbridge closes the tmux sessions it created.\n";
let frontmatter = {
  "title": "CLI Reference",
  "description": "Commands, flags, and environment variables."
};
let structuredData = {
  "contents": [{
    "heading": "termbridge",
    "content": "Running without a subcommand is equivalent to termbridge start."
  }, {
    "heading": "termbridge-start",
    "content": "Starts the local server, creates a tmux session, and launches the Cloudflare tunnel."
  }, {
    "heading": "flags",
    "content": "Flag"
  }, {
    "heading": "flags",
    "content": "Description"
  }, {
    "heading": "flags",
    "content": "Default"
  }, {
    "heading": "flags",
    "content": "--port <port>"
  }, {
    "heading": "flags",
    "content": "Bind the local server to a fixed port"
  }, {
    "heading": "flags",
    "content": "random free port"
  }, {
    "heading": "flags",
    "content": "--session <name>"
  }, {
    "heading": "flags",
    "content": "tmux session name override"
  }, {
    "heading": "flags",
    "content": "auto-generated"
  }, {
    "heading": "flags",
    "content": "--kill-on-exit"
  }, {
    "heading": "flags",
    "content": "kill tmux sessions on exit"
  }, {
    "heading": "flags",
    "content": "false"
  }, {
    "heading": "flags",
    "content": "--no-qr"
  }, {
    "heading": "flags",
    "content": "disable QR code output"
  }, {
    "heading": "flags",
    "content": "false"
  }, {
    "heading": "flags",
    "content": "--tunnel cloudflare"
  }, {
    "heading": "flags",
    "content": "tunnel provider"
  }, {
    "heading": "flags",
    "content": "cloudflare"
  }, {
    "heading": "examples",
    "content": "Default:"
  }, {
    "heading": "examples",
    "content": "Fixed port and custom session:"
  }, {
    "heading": "examples",
    "content": "Exit cleanup:"
  }, {
    "heading": "examples",
    "content": "No QR (for scripts):"
  }, {
    "heading": "environment-variables",
    "content": "Variable"
  }, {
    "heading": "environment-variables",
    "content": "Description"
  }, {
    "heading": "environment-variables",
    "content": "TERMBRIDGE_SESSIONS=2"
  }, {
    "heading": "environment-variables",
    "content": "Create multiple tmux sessions at startup (dev/testing)."
  }, {
    "heading": "environment-variables",
    "content": "TERMBRIDGE_INSECURE_COOKIE=1"
  }, {
    "heading": "environment-variables",
    "content": "Allow HTTP cookies for local development."
  }, {
    "heading": "environment-variables",
    "content": "TERMBRIDGE_DEV_UI=http://127.0.0.1:5173"
  }, {
    "heading": "environment-variables",
    "content": "Override Vite dev UI URL when running dev:beam."
  }, {
    "heading": "exit-behavior",
    "content": "The CLI must keep running for the tunnel to stay active."
  }, {
    "heading": "exit-behavior",
    "content": "Ctrl+C shuts down the tunnel and the local server."
  }, {
    "heading": "exit-behavior",
    "content": "With --kill-on-exit, Termbridge closes the tmux sessions it created."
  }],
  "headings": [{
    "id": "cli-reference",
    "content": "CLI Reference"
  }, {
    "id": "termbridge",
    "content": "termbridge"
  }, {
    "id": "termbridge-start",
    "content": "termbridge start"
  }, {
    "id": "flags",
    "content": "Flags"
  }, {
    "id": "examples",
    "content": "Examples"
  }, {
    "id": "environment-variables",
    "content": "Environment variables"
  }, {
    "id": "exit-behavior",
    "content": "Exit behavior"
  }]
};
const toc = [{
  depth: 1,
  url: "#cli-reference",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "CLI Reference"
  })
}, {
  depth: 2,
  url: "#termbridge",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: jsxRuntimeExports.jsx("code", {
      children: "termbridge"
    })
  })
}, {
  depth: 2,
  url: "#termbridge-start",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: jsxRuntimeExports.jsx("code", {
      children: "termbridge start"
    })
  })
}, {
  depth: 3,
  url: "#flags",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Flags"
  })
}, {
  depth: 3,
  url: "#examples",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Examples"
  })
}, {
  depth: 2,
  url: "#environment-variables",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Environment variables"
  })
}, {
  depth: 2,
  url: "#exit-behavior",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Exit behavior"
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
    table: "table",
    tbody: "tbody",
    td: "td",
    th: "th",
    thead: "thead",
    tr: "tr",
    ul: "ul",
    ...props.components
  };
  return jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, {
    children: [jsxRuntimeExports.jsx(_components.h1, {
      id: "cli-reference",
      children: "CLI Reference"
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "termbridge",
      children: jsxRuntimeExports.jsx(_components.code, {
        children: "termbridge"
      })
    }), "\n", jsxRuntimeExports.jsxs(_components.p, {
      children: ["Running without a subcommand is equivalent to ", jsxRuntimeExports.jsx(_components.code, {
        children: "termbridge start"
      }), "."]
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
          children: jsxRuntimeExports.jsx(_components.span, {
            className: "line",
            children: jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "termbridge"
            })
          })
        })
      })
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "termbridge-start",
      children: jsxRuntimeExports.jsx(_components.code, {
        children: "termbridge start"
      })
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "Starts the local server, creates a tmux session, and launches the Cloudflare tunnel."
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
              children: " --port"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " 8080"
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
              children: " dev"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --kill-on-exit"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --no-qr"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --tunnel"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " cloudflare"
            })]
          })
        })
      })
    }), "\n", jsxRuntimeExports.jsx(_components.h3, {
      id: "flags",
      children: "Flags"
    }), "\n", jsxRuntimeExports.jsxs(_components.table, {
      children: [jsxRuntimeExports.jsx(_components.thead, {
        children: jsxRuntimeExports.jsxs(_components.tr, {
          children: [jsxRuntimeExports.jsx(_components.th, {
            children: "Flag"
          }), jsxRuntimeExports.jsx(_components.th, {
            children: "Description"
          }), jsxRuntimeExports.jsx(_components.th, {
            children: "Default"
          })]
        })
      }), jsxRuntimeExports.jsxs(_components.tbody, {
        children: [jsxRuntimeExports.jsxs(_components.tr, {
          children: [jsxRuntimeExports.jsx(_components.td, {
            children: jsxRuntimeExports.jsx(_components.code, {
              children: "--port <port>"
            })
          }), jsxRuntimeExports.jsx(_components.td, {
            children: "Bind the local server to a fixed port"
          }), jsxRuntimeExports.jsx(_components.td, {
            children: "random free port"
          })]
        }), jsxRuntimeExports.jsxs(_components.tr, {
          children: [jsxRuntimeExports.jsx(_components.td, {
            children: jsxRuntimeExports.jsx(_components.code, {
              children: "--session <name>"
            })
          }), jsxRuntimeExports.jsx(_components.td, {
            children: "tmux session name override"
          }), jsxRuntimeExports.jsx(_components.td, {
            children: "auto-generated"
          })]
        }), jsxRuntimeExports.jsxs(_components.tr, {
          children: [jsxRuntimeExports.jsx(_components.td, {
            children: jsxRuntimeExports.jsx(_components.code, {
              children: "--kill-on-exit"
            })
          }), jsxRuntimeExports.jsx(_components.td, {
            children: "kill tmux sessions on exit"
          }), jsxRuntimeExports.jsx(_components.td, {
            children: jsxRuntimeExports.jsx(_components.code, {
              children: "false"
            })
          })]
        }), jsxRuntimeExports.jsxs(_components.tr, {
          children: [jsxRuntimeExports.jsx(_components.td, {
            children: jsxRuntimeExports.jsx(_components.code, {
              children: "--no-qr"
            })
          }), jsxRuntimeExports.jsx(_components.td, {
            children: "disable QR code output"
          }), jsxRuntimeExports.jsx(_components.td, {
            children: jsxRuntimeExports.jsx(_components.code, {
              children: "false"
            })
          })]
        }), jsxRuntimeExports.jsxs(_components.tr, {
          children: [jsxRuntimeExports.jsx(_components.td, {
            children: jsxRuntimeExports.jsx(_components.code, {
              children: "--tunnel cloudflare"
            })
          }), jsxRuntimeExports.jsx(_components.td, {
            children: "tunnel provider"
          }), jsxRuntimeExports.jsx(_components.td, {
            children: jsxRuntimeExports.jsx(_components.code, {
              children: "cloudflare"
            })
          })]
        })]
      })]
    }), "\n", jsxRuntimeExports.jsx(_components.h3, {
      id: "examples",
      children: "Examples"
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "Default:"
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
      children: "Fixed port and custom session:"
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
              children: " --port"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " 8080"
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
          })
        })
      })
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "Exit cleanup:"
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
              children: " --kill-on-exit"
            })]
          })
        })
      })
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "No QR (for scripts):"
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
              children: " --no-qr"
            })]
          })
        })
      })
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "environment-variables",
      children: "Environment variables"
    }), "\n", jsxRuntimeExports.jsxs(_components.table, {
      children: [jsxRuntimeExports.jsx(_components.thead, {
        children: jsxRuntimeExports.jsxs(_components.tr, {
          children: [jsxRuntimeExports.jsx(_components.th, {
            children: "Variable"
          }), jsxRuntimeExports.jsx(_components.th, {
            children: "Description"
          })]
        })
      }), jsxRuntimeExports.jsxs(_components.tbody, {
        children: [jsxRuntimeExports.jsxs(_components.tr, {
          children: [jsxRuntimeExports.jsx(_components.td, {
            children: jsxRuntimeExports.jsx(_components.code, {
              children: "TERMBRIDGE_SESSIONS=2"
            })
          }), jsxRuntimeExports.jsx(_components.td, {
            children: "Create multiple tmux sessions at startup (dev/testing)."
          })]
        }), jsxRuntimeExports.jsxs(_components.tr, {
          children: [jsxRuntimeExports.jsx(_components.td, {
            children: jsxRuntimeExports.jsx(_components.code, {
              children: "TERMBRIDGE_INSECURE_COOKIE=1"
            })
          }), jsxRuntimeExports.jsx(_components.td, {
            children: "Allow HTTP cookies for local development."
          })]
        }), jsxRuntimeExports.jsxs(_components.tr, {
          children: [jsxRuntimeExports.jsx(_components.td, {
            children: jsxRuntimeExports.jsx(_components.code, {
              children: "TERMBRIDGE_DEV_UI=http://127.0.0.1:5173"
            })
          }), jsxRuntimeExports.jsxs(_components.td, {
            children: ["Override Vite dev UI URL when running ", jsxRuntimeExports.jsx(_components.code, {
              children: "dev:beam"
            }), "."]
          })]
        })]
      })]
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "exit-behavior",
      children: "Exit behavior"
    }), "\n", jsxRuntimeExports.jsxs(_components.ul, {
      children: ["\n", jsxRuntimeExports.jsx(_components.li, {
        children: "The CLI must keep running for the tunnel to stay active."
      }), "\n", jsxRuntimeExports.jsxs(_components.li, {
        children: [jsxRuntimeExports.jsx(_components.code, {
          children: "Ctrl+C"
        }), " shuts down the tunnel and the local server."]
      }), "\n", jsxRuntimeExports.jsxs(_components.li, {
        children: ["With ", jsxRuntimeExports.jsx(_components.code, {
          children: "--kill-on-exit"
        }), ", Termbridge closes the tmux sessions it created."]
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
