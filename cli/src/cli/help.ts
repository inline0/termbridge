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
  --tunnel <provider> Tunnel provider (cloudflare)
  -h, --help          Show this help message
`;
