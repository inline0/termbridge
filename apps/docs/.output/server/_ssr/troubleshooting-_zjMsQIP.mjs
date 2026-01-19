import { j as jsxRuntimeExports } from "../_libs/react.mjs";
let _markdown = "\n\nTroubleshooting [#troubleshooting]\n\ntmux not found [#tmux-not-found]\n\nInstall tmux and ensure it is on your PATH.\n\n```bash\nbrew install tmux\n```\n\ncloudflared not found [#cloudflared-not-found]\n\nInstall Cloudflare's tunnel client.\n\n```bash\nbrew install cloudflared\n```\n\nTunnel failed to start [#tunnel-failed-to-start]\n\n* Verify `cloudflared` runs on its own (`cloudflared --version`).\n* Ensure you can reach `https://trycloudflare.com` from your network.\n* Termbridge will still print the local URL if the tunnel fails.\n\nBlank UI or \"Unable to load terminals\" [#blank-ui-or-unable-to-load-terminals]\n\n* Confirm the local server is running.\n* Check the browser console for 401 or 403 responses.\n* Restart the CLI to get a fresh redemption token.\n\nNo terminal output [#no-terminal-output]\n\n* Make sure the tmux session is running: `tmux ls`.\n* If you are already inside tmux, the session should still appear.\n* Check that your shell supports `TERM=xterm-256color`.\n\nQR code opens but shows a blank page on mobile [#qr-code-opens-but-shows-a-blank-page-on-mobile]\n\n* The QR URL is single-use. Run `npx termbridge` again to regenerate.\n* Verify your phone can access the tunnel URL.\n\nnode-pty spawn-helper errors [#node-pty-spawn-helper-errors]\n\nTermbridge attempts to mark `node-pty`'s spawn-helper as executable. If it fails:\n\n```bash\nchmod +x node_modules/node-pty/prebuilds/**/spawn-helper\n```\n";
let frontmatter = {
  "title": "Troubleshooting",
  "description": "Fix common setup and runtime issues."
};
let structuredData = {
  "contents": [{
    "heading": "tmux-not-found",
    "content": "Install tmux and ensure it is on your PATH."
  }, {
    "heading": "cloudflared-not-found",
    "content": "Install Cloudflare's tunnel client."
  }, {
    "heading": "tunnel-failed-to-start",
    "content": "Verify cloudflared runs on its own (cloudflared --version)."
  }, {
    "heading": "tunnel-failed-to-start",
    "content": "Ensure you can reach https://trycloudflare.com from your network."
  }, {
    "heading": "tunnel-failed-to-start",
    "content": "Termbridge will still print the local URL if the tunnel fails."
  }, {
    "heading": "blank-ui-or-unable-to-load-terminals",
    "content": "Confirm the local server is running."
  }, {
    "heading": "blank-ui-or-unable-to-load-terminals",
    "content": "Check the browser console for 401 or 403 responses."
  }, {
    "heading": "blank-ui-or-unable-to-load-terminals",
    "content": "Restart the CLI to get a fresh redemption token."
  }, {
    "heading": "no-terminal-output",
    "content": "Make sure the tmux session is running: tmux ls."
  }, {
    "heading": "no-terminal-output",
    "content": "If you are already inside tmux, the session should still appear."
  }, {
    "heading": "no-terminal-output",
    "content": "Check that your shell supports TERM=xterm-256color."
  }, {
    "heading": "qr-code-opens-but-shows-a-blank-page-on-mobile",
    "content": "The QR URL is single-use. Run npx termbridge again to regenerate."
  }, {
    "heading": "qr-code-opens-but-shows-a-blank-page-on-mobile",
    "content": "Verify your phone can access the tunnel URL."
  }, {
    "heading": "node-pty-spawn-helper-errors",
    "content": "Termbridge attempts to mark node-pty's spawn-helper as executable. If it fails:"
  }],
  "headings": [{
    "id": "troubleshooting",
    "content": "Troubleshooting"
  }, {
    "id": "tmux-not-found",
    "content": "tmux not found"
  }, {
    "id": "cloudflared-not-found",
    "content": "cloudflared not found"
  }, {
    "id": "tunnel-failed-to-start",
    "content": "Tunnel failed to start"
  }, {
    "id": "blank-ui-or-unable-to-load-terminals",
    "content": 'Blank UI or "Unable to load terminals"'
  }, {
    "id": "no-terminal-output",
    "content": "No terminal output"
  }, {
    "id": "qr-code-opens-but-shows-a-blank-page-on-mobile",
    "content": "QR code opens but shows a blank page on mobile"
  }, {
    "id": "node-pty-spawn-helper-errors",
    "content": "node-pty spawn-helper errors"
  }]
};
const toc = [{
  depth: 1,
  url: "#troubleshooting",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Troubleshooting"
  })
}, {
  depth: 2,
  url: "#tmux-not-found",
  title: jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, {
    children: [jsxRuntimeExports.jsx("code", {
      children: "tmux"
    }), " not found"]
  })
}, {
  depth: 2,
  url: "#cloudflared-not-found",
  title: jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, {
    children: [jsxRuntimeExports.jsx("code", {
      children: "cloudflared"
    }), " not found"]
  })
}, {
  depth: 2,
  url: "#tunnel-failed-to-start",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Tunnel failed to start"
  })
}, {
  depth: 2,
  url: "#blank-ui-or-unable-to-load-terminals",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: 'Blank UI or "Unable to load terminals"'
  })
}, {
  depth: 2,
  url: "#no-terminal-output",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "No terminal output"
  })
}, {
  depth: 2,
  url: "#qr-code-opens-but-shows-a-blank-page-on-mobile",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "QR code opens but shows a blank page on mobile"
  })
}, {
  depth: 2,
  url: "#node-pty-spawn-helper-errors",
  title: jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, {
    children: [jsxRuntimeExports.jsx("code", {
      children: "node-pty"
    }), " spawn-helper errors"]
  })
}];
function _createMdxContent(props) {
  const _components = {
    code: "code",
    h1: "h1",
    h2: "h2",
    li: "li",
    p: "p",
    pre: "pre",
    span: "span",
    ul: "ul",
    ...props.components
  };
  return jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, {
    children: [jsxRuntimeExports.jsx(_components.h1, {
      id: "troubleshooting",
      children: "Troubleshooting"
    }), "\n", jsxRuntimeExports.jsxs(_components.h2, {
      id: "tmux-not-found",
      children: [jsxRuntimeExports.jsx(_components.code, {
        children: "tmux"
      }), " not found"]
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "Install tmux and ensure it is on your PATH."
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
              children: " tmux"
            })]
          })
        })
      })
    }), "\n", jsxRuntimeExports.jsxs(_components.h2, {
      id: "cloudflared-not-found",
      children: [jsxRuntimeExports.jsx(_components.code, {
        children: "cloudflared"
      }), " not found"]
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "Install Cloudflare's tunnel client."
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
              children: " cloudflared"
            })]
          })
        })
      })
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "tunnel-failed-to-start",
      children: "Tunnel failed to start"
    }), "\n", jsxRuntimeExports.jsxs(_components.ul, {
      children: ["\n", jsxRuntimeExports.jsxs(_components.li, {
        children: ["Verify ", jsxRuntimeExports.jsx(_components.code, {
          children: "cloudflared"
        }), " runs on its own (", jsxRuntimeExports.jsx(_components.code, {
          children: "cloudflared --version"
        }), ")."]
      }), "\n", jsxRuntimeExports.jsxs(_components.li, {
        children: ["Ensure you can reach ", jsxRuntimeExports.jsx(_components.code, {
          children: "https://trycloudflare.com"
        }), " from your network."]
      }), "\n", jsxRuntimeExports.jsx(_components.li, {
        children: "Termbridge will still print the local URL if the tunnel fails."
      }), "\n"]
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "blank-ui-or-unable-to-load-terminals",
      children: 'Blank UI or "Unable to load terminals"'
    }), "\n", jsxRuntimeExports.jsxs(_components.ul, {
      children: ["\n", jsxRuntimeExports.jsx(_components.li, {
        children: "Confirm the local server is running."
      }), "\n", jsxRuntimeExports.jsx(_components.li, {
        children: "Check the browser console for 401 or 403 responses."
      }), "\n", jsxRuntimeExports.jsx(_components.li, {
        children: "Restart the CLI to get a fresh redemption token."
      }), "\n"]
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "no-terminal-output",
      children: "No terminal output"
    }), "\n", jsxRuntimeExports.jsxs(_components.ul, {
      children: ["\n", jsxRuntimeExports.jsxs(_components.li, {
        children: ["Make sure the tmux session is running: ", jsxRuntimeExports.jsx(_components.code, {
          children: "tmux ls"
        }), "."]
      }), "\n", jsxRuntimeExports.jsx(_components.li, {
        children: "If you are already inside tmux, the session should still appear."
      }), "\n", jsxRuntimeExports.jsxs(_components.li, {
        children: ["Check that your shell supports ", jsxRuntimeExports.jsx(_components.code, {
          children: "TERM=xterm-256color"
        }), "."]
      }), "\n"]
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "qr-code-opens-but-shows-a-blank-page-on-mobile",
      children: "QR code opens but shows a blank page on mobile"
    }), "\n", jsxRuntimeExports.jsxs(_components.ul, {
      children: ["\n", jsxRuntimeExports.jsxs(_components.li, {
        children: ["The QR URL is single-use. Run ", jsxRuntimeExports.jsx(_components.code, {
          children: "npx termbridge"
        }), " again to regenerate."]
      }), "\n", jsxRuntimeExports.jsx(_components.li, {
        children: "Verify your phone can access the tunnel URL."
      }), "\n"]
    }), "\n", jsxRuntimeExports.jsxs(_components.h2, {
      id: "node-pty-spawn-helper-errors",
      children: [jsxRuntimeExports.jsx(_components.code, {
        children: "node-pty"
      }), " spawn-helper errors"]
    }), "\n", jsxRuntimeExports.jsxs(_components.p, {
      children: ["Termbridge attempts to mark ", jsxRuntimeExports.jsx(_components.code, {
        children: "node-pty"
      }), "'s spawn-helper as executable. If it fails:"]
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
              children: "chmod"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " +x"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " node_modules/node-pty/prebuilds/"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: "**"
            }), jsxRuntimeExports.jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: "/spawn-helper"
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
