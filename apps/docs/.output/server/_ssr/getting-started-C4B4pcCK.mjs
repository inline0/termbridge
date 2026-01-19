import { j as jsxRuntimeExports } from "../_libs/react.mjs";
let _markdown = "\n\nGetting Started [#getting-started]\n\nPrerequisites [#prerequisites]\n\nTermbridge depends on local tools that must be available in your PATH:\n\n* **Node.js 18+** (for `npx termbridge`)\n* **tmux** (terminal session manager)\n* **cloudflared** (Cloudflare Quick Tunnel)\n\nmacOS (Homebrew) [#macos-homebrew]\n\n```bash\nbrew install node tmux cloudflared\n```\n\nLinux [#linux]\n\nInstall Node and tmux through your package manager, then install cloudflared from Cloudflare:\n\n```bash\n# Example (Ubuntu)\nsudo apt-get update\nsudo apt-get install -y nodejs tmux\n```\n\nCloudflare installation guide: [https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/)\n\nRun Termbridge [#run-termbridge]\n\n```bash\nnpx termbridge\n```\n\nYou should see:\n\n* A local URL (ex: `http://127.0.0.1:51234`)\n* A public tunnel URL\n* An ASCII QR code\n\nOpen the public URL on your phone (or scan the QR code) to connect.\n\nWhat happens next [#what-happens-next]\n\n1. A local HTTP server starts on `127.0.0.1`.\n2. A tmux session is created (or reused if it already exists).\n3. A Cloudflare Quick Tunnel is launched.\n4. A one-time token URL is printed and encoded into the QR code.\n5. Your phone redeems the token and receives a session cookie.\n6. The UI connects to the terminal via WebSocket.\n\nFirst session behavior [#first-session-behavior]\n\n* Termbridge creates a tmux session (default name is derived from the port).\n* The first terminal in the list is loaded automatically.\n* You can create multiple sessions in dev by setting `TERMBRIDGE_SESSIONS`.\n\nUsing an existing tmux session [#using-an-existing-tmux-session]\n\nIf you pass `--session <name>` and that session already exists, Termbridge will attach to it instead of creating a new one.\n\nNext steps [#next-steps]\n\n* **CLI Reference** for flags and environment variables.\n* **Usage** for multi-session workflows and mobile controls.\n";
let frontmatter = {
  "title": "Getting Started",
  "description": "Install prerequisites and run Termbridge for the first time."
};
let structuredData = {
  "contents": [{
    "heading": "prerequisites",
    "content": "Termbridge depends on local tools that must be available in your PATH:"
  }, {
    "heading": "prerequisites",
    "content": "Node.js 18+ (for npx termbridge)"
  }, {
    "heading": "prerequisites",
    "content": "tmux (terminal session manager)"
  }, {
    "heading": "prerequisites",
    "content": "cloudflared (Cloudflare Quick Tunnel)"
  }, {
    "heading": "linux",
    "content": "Install Node and tmux through your package manager, then install cloudflared from Cloudflare:"
  }, {
    "heading": "linux",
    "content": "Cloudflare installation guide: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/"
  }, {
    "heading": "run-termbridge",
    "content": "You should see:"
  }, {
    "heading": "run-termbridge",
    "content": "A local URL (ex: http://127.0.0.1:51234)"
  }, {
    "heading": "run-termbridge",
    "content": "A public tunnel URL"
  }, {
    "heading": "run-termbridge",
    "content": "An ASCII QR code"
  }, {
    "heading": "run-termbridge",
    "content": "Open the public URL on your phone (or scan the QR code) to connect."
  }, {
    "heading": "what-happens-next",
    "content": "A local HTTP server starts on 127.0.0.1."
  }, {
    "heading": "what-happens-next",
    "content": "A tmux session is created (or reused if it already exists)."
  }, {
    "heading": "what-happens-next",
    "content": "A Cloudflare Quick Tunnel is launched."
  }, {
    "heading": "what-happens-next",
    "content": "A one-time token URL is printed and encoded into the QR code."
  }, {
    "heading": "what-happens-next",
    "content": "Your phone redeems the token and receives a session cookie."
  }, {
    "heading": "what-happens-next",
    "content": "The UI connects to the terminal via WebSocket."
  }, {
    "heading": "first-session-behavior",
    "content": "Termbridge creates a tmux session (default name is derived from the port)."
  }, {
    "heading": "first-session-behavior",
    "content": "The first terminal in the list is loaded automatically."
  }, {
    "heading": "first-session-behavior",
    "content": "You can create multiple sessions in dev by setting TERMBRIDGE_SESSIONS."
  }, {
    "heading": "using-an-existing-tmux-session",
    "content": "If you pass --session <name> and that session already exists, Termbridge will attach to it instead of creating a new one."
  }, {
    "heading": "next-steps",
    "content": "CLI Reference for flags and environment variables."
  }, {
    "heading": "next-steps",
    "content": "Usage for multi-session workflows and mobile controls."
  }],
  "headings": [{
    "id": "getting-started",
    "content": "Getting Started"
  }, {
    "id": "prerequisites",
    "content": "Prerequisites"
  }, {
    "id": "macos-homebrew",
    "content": "macOS (Homebrew)"
  }, {
    "id": "linux",
    "content": "Linux"
  }, {
    "id": "run-termbridge",
    "content": "Run Termbridge"
  }, {
    "id": "what-happens-next",
    "content": "What happens next"
  }, {
    "id": "first-session-behavior",
    "content": "First session behavior"
  }, {
    "id": "using-an-existing-tmux-session",
    "content": "Using an existing tmux session"
  }, {
    "id": "next-steps",
    "content": "Next steps"
  }]
};
const toc = [{
  depth: 1,
  url: "#getting-started",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Getting Started"
  })
}, {
  depth: 2,
  url: "#prerequisites",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Prerequisites"
  })
}, {
  depth: 3,
  url: "#macos-homebrew",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "macOS (Homebrew)"
  })
}, {
  depth: 3,
  url: "#linux",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Linux"
  })
}, {
  depth: 2,
  url: "#run-termbridge",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Run Termbridge"
  })
}, {
  depth: 2,
  url: "#what-happens-next",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "What happens next"
  })
}, {
  depth: 2,
  url: "#first-session-behavior",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "First session behavior"
  })
}, {
  depth: 2,
  url: "#using-an-existing-tmux-session",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Using an existing tmux session"
  })
}, {
  depth: 2,
  url: "#next-steps",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Next steps"
  })
}];
function _createMdxContent(props) {
  const _components = {
    a: "a",
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
      id: "getting-started",
      children: "Getting Started"
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "prerequisites",
      children: "Prerequisites"
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "Termbridge depends on local tools that must be available in your PATH:"
    }), "\n", jsxRuntimeExports.jsxs(_components.ul, {
      children: ["\n", jsxRuntimeExports.jsxs(_components.li, {
        children: [jsxRuntimeExports.jsx(_components.strong, {
          children: "Node.js 18+"
        }), " (for ", jsxRuntimeExports.jsx(_components.code, {
          children: "npx termbridge"
        }), ")"]
      }), "\n", jsxRuntimeExports.jsxs(_components.li, {
        children: [jsxRuntimeExports.jsx(_components.strong, {
          children: "tmux"
        }), " (terminal session manager)"]
      }), "\n", jsxRuntimeExports.jsxs(_components.li, {
        children: [jsxRuntimeExports.jsx(_components.strong, {
          children: "cloudflared"
        }), " (Cloudflare Quick Tunnel)"]
      }), "\n"]
    }), "\n", jsxRuntimeExports.jsx(_components.h3, {
      id: "macos-homebrew",
      children: "macOS (Homebrew)"
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
              children: "brew"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " install"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " node"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " tmux"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " cloudflared"
            })]
          })
        })
      })
    }), "\n", jsxRuntimeExports.jsx(_components.h3, {
      id: "linux",
      children: "Linux"
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "Install Node and tmux through your package manager, then install cloudflared from Cloudflare:"
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
          children: [jsxRuntimeExports.jsx(_components.span, {
            className: "line",
            children: jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#6A737D",
                "--shiki-dark": "#6A737D"
              },
              children: "# Example (Ubuntu)"
            })
          }), "\n", jsxRuntimeExports.jsxs(_components.span, {
            className: "line",
            children: [jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "sudo"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " apt-get"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " update"
            })]
          }), "\n", jsxRuntimeExports.jsxs(_components.span, {
            className: "line",
            children: [jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "sudo"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " apt-get"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " install"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " -y"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " nodejs"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " tmux"
            })]
          })]
        })
      })
    }), "\n", jsxRuntimeExports.jsxs(_components.p, {
      children: ["Cloudflare installation guide: ", jsxRuntimeExports.jsx(_components.a, {
        href: "https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/",
        children: "https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/"
      })]
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "run-termbridge",
      children: "Run Termbridge"
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
      children: "You should see:"
    }), "\n", jsxRuntimeExports.jsxs(_components.ul, {
      children: ["\n", jsxRuntimeExports.jsxs(_components.li, {
        children: ["A local URL (ex: ", jsxRuntimeExports.jsx(_components.code, {
          children: "http://127.0.0.1:51234"
        }), ")"]
      }), "\n", jsxRuntimeExports.jsx(_components.li, {
        children: "A public tunnel URL"
      }), "\n", jsxRuntimeExports.jsx(_components.li, {
        children: "An ASCII QR code"
      }), "\n"]
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "Open the public URL on your phone (or scan the QR code) to connect."
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "what-happens-next",
      children: "What happens next"
    }), "\n", jsxRuntimeExports.jsxs(_components.ol, {
      children: ["\n", jsxRuntimeExports.jsxs(_components.li, {
        children: ["A local HTTP server starts on ", jsxRuntimeExports.jsx(_components.code, {
          children: "127.0.0.1"
        }), "."]
      }), "\n", jsxRuntimeExports.jsx(_components.li, {
        children: "A tmux session is created (or reused if it already exists)."
      }), "\n", jsxRuntimeExports.jsx(_components.li, {
        children: "A Cloudflare Quick Tunnel is launched."
      }), "\n", jsxRuntimeExports.jsx(_components.li, {
        children: "A one-time token URL is printed and encoded into the QR code."
      }), "\n", jsxRuntimeExports.jsx(_components.li, {
        children: "Your phone redeems the token and receives a session cookie."
      }), "\n", jsxRuntimeExports.jsx(_components.li, {
        children: "The UI connects to the terminal via WebSocket."
      }), "\n"]
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "first-session-behavior",
      children: "First session behavior"
    }), "\n", jsxRuntimeExports.jsxs(_components.ul, {
      children: ["\n", jsxRuntimeExports.jsx(_components.li, {
        children: "Termbridge creates a tmux session (default name is derived from the port)."
      }), "\n", jsxRuntimeExports.jsx(_components.li, {
        children: "The first terminal in the list is loaded automatically."
      }), "\n", jsxRuntimeExports.jsxs(_components.li, {
        children: ["You can create multiple sessions in dev by setting ", jsxRuntimeExports.jsx(_components.code, {
          children: "TERMBRIDGE_SESSIONS"
        }), "."]
      }), "\n"]
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "using-an-existing-tmux-session",
      children: "Using an existing tmux session"
    }), "\n", jsxRuntimeExports.jsxs(_components.p, {
      children: ["If you pass ", jsxRuntimeExports.jsx(_components.code, {
        children: "--session <name>"
      }), " and that session already exists, Termbridge will attach to it instead of creating a new one."]
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "next-steps",
      children: "Next steps"
    }), "\n", jsxRuntimeExports.jsxs(_components.ul, {
      children: ["\n", jsxRuntimeExports.jsxs(_components.li, {
        children: [jsxRuntimeExports.jsx(_components.strong, {
          children: "CLI Reference"
        }), " for flags and environment variables."]
      }), "\n", jsxRuntimeExports.jsxs(_components.li, {
        children: [jsxRuntimeExports.jsx(_components.strong, {
          children: "Usage"
        }), " for multi-session workflows and mobile controls."]
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
