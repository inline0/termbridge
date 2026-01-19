import { j as jsxRuntimeExports } from "../_libs/react.mjs";
let _markdown = "\n\nDevelopment [#development]\n\nRequirements [#requirements]\n\n* **Bun** for workspace installs and scripts\n* **Node.js 18+**\n* **tmux** and **cloudflared** for end-to-end tests\n* **Playwright** for UI e2e tests\n\nInstall [#install]\n\n```bash\nbun install\n```\n\nRun the app [#run-the-app]\n\n```bash\nbun run dev:beam\n```\n\nThis builds the CLI, starts the local server on a fixed port, and launches the Vite dev UI with proxies for `/api`, `/ws`, and `/s`.\n\nMultiple sessions [#multiple-sessions]\n\n```bash\nTERMBRIDGE_SESSIONS=2 bun run dev:beam\n```\n\nOr use the shortcut:\n\n```bash\nbun run dev:beam:multi\n```\n\nLocal cookie mode [#local-cookie-mode]\n\nWhen developing without HTTPS:\n\n```bash\nTERMBRIDGE_INSECURE_COOKIE=1 bun run dev:beam\n```\n\nTests [#tests]\n\n```bash\nbun run test\n```\n\n* `test:mocked` runs unit/integration tests with 100% coverage.\n* `test:cli` runs real CLI + UI e2e tests (tmux + cloudflared + Playwright).\n\nDocs site [#docs-site]\n\nThe docs live in `apps/docs` and use Onedocs + Fumadocs.\n\n```bash\nbun run --cwd apps/docs dev\n```\n\nBuild:\n\n```bash\nbun run --cwd apps/docs build\n```\n";
let frontmatter = {
  "title": "Development",
  "description": "Local development, test suites, and docs."
};
let structuredData = {
  "contents": [{
    "heading": "requirements",
    "content": "Bun for workspace installs and scripts"
  }, {
    "heading": "requirements",
    "content": "Node.js 18+"
  }, {
    "heading": "requirements",
    "content": "tmux and cloudflared for end-to-end tests"
  }, {
    "heading": "requirements",
    "content": "Playwright for UI e2e tests"
  }, {
    "heading": "run-the-app",
    "content": "This builds the CLI, starts the local server on a fixed port, and launches the Vite dev UI with proxies for /api, /ws, and /s."
  }, {
    "heading": "multiple-sessions",
    "content": "Or use the shortcut:"
  }, {
    "heading": "local-cookie-mode",
    "content": "When developing without HTTPS:"
  }, {
    "heading": "tests",
    "content": "test:mocked runs unit/integration tests with 100% coverage."
  }, {
    "heading": "tests",
    "content": "test:cli runs real CLI + UI e2e tests (tmux + cloudflared + Playwright)."
  }, {
    "heading": "docs-site",
    "content": "The docs live in apps/docs and use Onedocs + Fumadocs."
  }, {
    "heading": "docs-site",
    "content": "Build:"
  }],
  "headings": [{
    "id": "development",
    "content": "Development"
  }, {
    "id": "requirements",
    "content": "Requirements"
  }, {
    "id": "install",
    "content": "Install"
  }, {
    "id": "run-the-app",
    "content": "Run the app"
  }, {
    "id": "multiple-sessions",
    "content": "Multiple sessions"
  }, {
    "id": "local-cookie-mode",
    "content": "Local cookie mode"
  }, {
    "id": "tests",
    "content": "Tests"
  }, {
    "id": "docs-site",
    "content": "Docs site"
  }]
};
const toc = [{
  depth: 1,
  url: "#development",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Development"
  })
}, {
  depth: 2,
  url: "#requirements",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Requirements"
  })
}, {
  depth: 2,
  url: "#install",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Install"
  })
}, {
  depth: 2,
  url: "#run-the-app",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Run the app"
  })
}, {
  depth: 3,
  url: "#multiple-sessions",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Multiple sessions"
  })
}, {
  depth: 3,
  url: "#local-cookie-mode",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Local cookie mode"
  })
}, {
  depth: 2,
  url: "#tests",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Tests"
  })
}, {
  depth: 2,
  url: "#docs-site",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Docs site"
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
      id: "development",
      children: "Development"
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "requirements",
      children: "Requirements"
    }), "\n", jsxRuntimeExports.jsxs(_components.ul, {
      children: ["\n", jsxRuntimeExports.jsxs(_components.li, {
        children: [jsxRuntimeExports.jsx(_components.strong, {
          children: "Bun"
        }), " for workspace installs and scripts"]
      }), "\n", jsxRuntimeExports.jsx(_components.li, {
        children: jsxRuntimeExports.jsx(_components.strong, {
          children: "Node.js 18+"
        })
      }), "\n", jsxRuntimeExports.jsxs(_components.li, {
        children: [jsxRuntimeExports.jsx(_components.strong, {
          children: "tmux"
        }), " and ", jsxRuntimeExports.jsx(_components.strong, {
          children: "cloudflared"
        }), " for end-to-end tests"]
      }), "\n", jsxRuntimeExports.jsxs(_components.li, {
        children: [jsxRuntimeExports.jsx(_components.strong, {
          children: "Playwright"
        }), " for UI e2e tests"]
      }), "\n"]
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "install",
      children: "Install"
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
              children: "bun"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " install"
            })]
          })
        })
      })
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "run-the-app",
      children: "Run the app"
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
              children: "bun"
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
      children: ["This builds the CLI, starts the local server on a fixed port, and launches the Vite dev UI with proxies for ", jsxRuntimeExports.jsx(_components.code, {
        children: "/api"
      }), ", ", jsxRuntimeExports.jsx(_components.code, {
        children: "/ws"
      }), ", and ", jsxRuntimeExports.jsx(_components.code, {
        children: "/s"
      }), "."]
    }), "\n", jsxRuntimeExports.jsx(_components.h3, {
      id: "multiple-sessions",
      children: "Multiple sessions"
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
              children: "2"
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
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "Or use the shortcut:"
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
              children: "bun"
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
              children: " dev:beam:multi"
            })]
          })
        })
      })
    }), "\n", jsxRuntimeExports.jsx(_components.h3, {
      id: "local-cookie-mode",
      children: "Local cookie mode"
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "When developing without HTTPS:"
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
              children: "TERMBRIDGE_INSECURE_COOKIE"
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
              children: "1"
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
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "tests",
      children: "Tests"
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
              children: "bun"
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
              children: " test"
            })]
          })
        })
      })
    }), "\n", jsxRuntimeExports.jsxs(_components.ul, {
      children: ["\n", jsxRuntimeExports.jsxs(_components.li, {
        children: [jsxRuntimeExports.jsx(_components.code, {
          children: "test:mocked"
        }), " runs unit/integration tests with 100% coverage."]
      }), "\n", jsxRuntimeExports.jsxs(_components.li, {
        children: [jsxRuntimeExports.jsx(_components.code, {
          children: "test:cli"
        }), " runs real CLI + UI e2e tests (tmux + cloudflared + Playwright)."]
      }), "\n"]
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "docs-site",
      children: "Docs site"
    }), "\n", jsxRuntimeExports.jsxs(_components.p, {
      children: ["The docs live in ", jsxRuntimeExports.jsx(_components.code, {
        children: "apps/docs"
      }), " and use Onedocs + Fumadocs."]
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
              children: "bun"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " run"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --cwd"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " apps/docs"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " dev"
            })]
          })
        })
      })
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "Build:"
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
              children: "bun"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " run"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --cwd"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " apps/docs"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " build"
            })]
          })
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
