import { j as jsxRuntimeExports } from "../_libs/react.mjs";
let _markdown = "\n\nFAQ [#faq]\n\nDoes Termbridge run any backend server? [#does-termbridge-run-any-backend-server]\n\nNo. Everything runs locally on your machine. The only public surface is the Cloudflare tunnel.\n\nCan I run multiple terminals? [#can-i-run-multiple-terminals]\n\nYes. One server can host multiple tmux sessions. Use the terminal switcher in the UI to select a session.\n\nIs the tunnel URL secure? [#is-the-tunnel-url-secure]\n\nTermbridge issues a one-time token and redeems it for a cookie session. The token URL should only be shared with devices you trust.\n\nCan I use it without Cloudflare? [#can-i-use-it-without-cloudflare]\n\nNot yet. The tunnel provider is currently Cloudflare only.\n\nDoes it support Windows? [#does-it-support-windows]\n\nNot officially. macOS and Linux are the target platforms for the MVP.\n\nCan I beam other tools (Codex, OpenCode, Claude Code)? [#can-i-beam-other-tools-codex-opencode-claude-code]\n\nYes. If those tools run inside a tmux session on your machine, Termbridge will stream them just like any other terminal.\n";
let frontmatter = {
  "title": "FAQ",
  "description": "Quick answers to common questions."
};
let structuredData = {
  "contents": [{
    "heading": "does-termbridge-run-any-backend-server",
    "content": "No. Everything runs locally on your machine. The only public surface is the Cloudflare tunnel."
  }, {
    "heading": "can-i-run-multiple-terminals",
    "content": "Yes. One server can host multiple tmux sessions. Use the terminal switcher in the UI to select a session."
  }, {
    "heading": "is-the-tunnel-url-secure",
    "content": "Termbridge issues a one-time token and redeems it for a cookie session. The token URL should only be shared with devices you trust."
  }, {
    "heading": "can-i-use-it-without-cloudflare",
    "content": "Not yet. The tunnel provider is currently Cloudflare only."
  }, {
    "heading": "does-it-support-windows",
    "content": "Not officially. macOS and Linux are the target platforms for the MVP."
  }, {
    "heading": "can-i-beam-other-tools-codex-opencode-claude-code",
    "content": "Yes. If those tools run inside a tmux session on your machine, Termbridge will stream them just like any other terminal."
  }],
  "headings": [{
    "id": "faq",
    "content": "FAQ"
  }, {
    "id": "does-termbridge-run-any-backend-server",
    "content": "Does Termbridge run any backend server?"
  }, {
    "id": "can-i-run-multiple-terminals",
    "content": "Can I run multiple terminals?"
  }, {
    "id": "is-the-tunnel-url-secure",
    "content": "Is the tunnel URL secure?"
  }, {
    "id": "can-i-use-it-without-cloudflare",
    "content": "Can I use it without Cloudflare?"
  }, {
    "id": "does-it-support-windows",
    "content": "Does it support Windows?"
  }, {
    "id": "can-i-beam-other-tools-codex-opencode-claude-code",
    "content": "Can I beam other tools (Codex, OpenCode, Claude Code)?"
  }]
};
const toc = [{
  depth: 1,
  url: "#faq",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "FAQ"
  })
}, {
  depth: 2,
  url: "#does-termbridge-run-any-backend-server",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Does Termbridge run any backend server?"
  })
}, {
  depth: 2,
  url: "#can-i-run-multiple-terminals",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Can I run multiple terminals?"
  })
}, {
  depth: 2,
  url: "#is-the-tunnel-url-secure",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Is the tunnel URL secure?"
  })
}, {
  depth: 2,
  url: "#can-i-use-it-without-cloudflare",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Can I use it without Cloudflare?"
  })
}, {
  depth: 2,
  url: "#does-it-support-windows",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Does it support Windows?"
  })
}, {
  depth: 2,
  url: "#can-i-beam-other-tools-codex-opencode-claude-code",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Can I beam other tools (Codex, OpenCode, Claude Code)?"
  })
}];
function _createMdxContent(props) {
  const _components = {
    h1: "h1",
    h2: "h2",
    p: "p",
    ...props.components
  };
  return jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, {
    children: [jsxRuntimeExports.jsx(_components.h1, {
      id: "faq",
      children: "FAQ"
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "does-termbridge-run-any-backend-server",
      children: "Does Termbridge run any backend server?"
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "No. Everything runs locally on your machine. The only public surface is the Cloudflare tunnel."
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "can-i-run-multiple-terminals",
      children: "Can I run multiple terminals?"
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "Yes. One server can host multiple tmux sessions. Use the terminal switcher in the UI to select a session."
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "is-the-tunnel-url-secure",
      children: "Is the tunnel URL secure?"
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "Termbridge issues a one-time token and redeems it for a cookie session. The token URL should only be shared with devices you trust."
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "can-i-use-it-without-cloudflare",
      children: "Can I use it without Cloudflare?"
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "Not yet. The tunnel provider is currently Cloudflare only."
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "does-it-support-windows",
      children: "Does it support Windows?"
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "Not officially. macOS and Linux are the target platforms for the MVP."
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "can-i-beam-other-tools-codex-opencode-claude-code",
      children: "Can I beam other tools (Codex, OpenCode, Claude Code)?"
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "Yes. If those tools run inside a tmux session on your machine, Termbridge will stream them just like any other terminal."
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
