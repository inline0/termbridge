export const helpText = `termbridge

Usage:
  termbridge [start]

Options:
  --port <port>       Bind the local server to a fixed port
  --proxy <port>      Proxy a local dev server (e.g., Vite) through termbridge
  --tunnel-token <t>  Use a named Cloudflare Tunnel token (requires --port)
  --tunnel-url <url>  Public URL for a named tunnel (required with --tunnel-token)
  --session <name>    Use a specific tmux session name
  --kill-on-exit      Kill the tmux session when the CLI exits
  --no-qr             Disable QR code output
  --backend <name>    Terminal backend (tmux | daytona)
  --daytona-repo <u>  Git repo to clone into Daytona
  --daytona-branch <b> Git branch to checkout in Daytona
  --daytona-path <p>  Repo directory inside the sandbox
  --daytona-name <n>  Daytona sandbox name
  --daytona-preview-port <p> Preview port to expose from Daytona
  --daytona-public    Make the Daytona sandbox preview public
  --tunnel <provider> Tunnel provider (cloudflare)
  -h, --help          Show this help message
`;
