import { Box, Text, render } from "ink";
import qrcode from "qrcode-terminal";
import type { Logger } from "../server/server";
import type { StartOptions, StartResult, StartDeps } from "./start";
import { startCommand } from "./start";

type InkCliViewProps = {
  state: "starting" | "running";
  options: StartOptions;
  localUrl?: string;
  publicUrl?: string;
  redeemUrl?: string;
  sessionName?: string;
  qr?: string | null;
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <Box>
    <Text color="gray" bold>
      {label.padEnd(8)}
    </Text>
    <Text>{value}</Text>
  </Box>
);

export const InkCliView = ({
  state,
  options,
  localUrl,
  publicUrl,
  redeemUrl,
  sessionName,
  qr
}: InkCliViewProps) => {
  const statusText = state === "starting" ? "Starting…" : "Running";
  const statusColor = state === "starting" ? "yellow" : "green";

  return (
    <Box flexDirection="column" padding={1}>
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor="cyan"
        paddingX={2}
        paddingY={1}
      >
        <Text color="cyanBright" bold>
          Termbridge
        </Text>
        <Text color={statusColor}>{statusText}</Text>

        {state === "running" ? (
          <Box flexDirection="column" marginTop={1} gap={1}>
            {localUrl ? InfoRow({ label: "Local:", value: localUrl }) : null}
            {publicUrl ? InfoRow({ label: "Public:", value: publicUrl }) : null}
            {redeemUrl ? InfoRow({ label: "Share:", value: redeemUrl }) : null}
            {sessionName ? InfoRow({ label: "Session:", value: sessionName }) : null}
            {InfoRow({ label: "Tunnel:", value: options.tunnel })}
          </Box>
        ) : null}
      </Box>

      {state === "running" ? (
        <Box flexDirection="column" marginTop={1}>
          {options.noQr ? (
            <Text color="gray">QR disabled (--no-qr)</Text>
          ) : qr ? (
            <Text>{qr.trimEnd()}</Text>
          ) : (
            <Text color="gray">Generating QR…</Text>
          )}
        </Box>
      ) : null}

      <Box marginTop={1}>
        <Text color="gray">Press Ctrl+C to stop.</Text>
      </Box>
    </Box>
  );
};

export type InkCliDeps = StartDeps & {
  process?: NodeJS.Process;
  render?: typeof render;
  startCommand?: typeof startCommand;
};

const createSilentLogger = (externalLogger?: Logger): Logger => ({
  info: (message) => externalLogger?.info(message),
  warn: (message) => externalLogger?.warn(message),
  error: (message) => externalLogger?.error(message)
});

const buildSessionName = (options: StartOptions, localUrl: string) => {
  if (options.session) {
    return options.session;
  }

  try {
    const url = new URL(localUrl);
    return `termbridge-${url.port}`;
  } catch {
    return "termbridge";
  }
};

const buildRedeemUrl = (result: StartResult) => `${result.publicUrl}/__tb/s/${result.token}`;

const generateQr = async (text: string) =>
  new Promise<string>((resolve) => {
    qrcode.generate(text, { small: true }, (output) => resolve(output));
  });

export const runInkCli = async (options: StartOptions, deps: InkCliDeps = {}) => {
  const processRef = deps.process ?? process;
  const stderr = processRef.stderr;
  const renderImpl = deps.render ?? render;
  const start = deps.startCommand ?? startCommand;
  const logger = createSilentLogger(deps.logger);
  const instance = renderImpl(<InkCliView state="starting" options={options} />);

  try {
    const result = await start(options, {
      ...deps,
      process: processRef,
      logger,
      qr: { generate: () => undefined }
    });
    const redeemUrl = buildRedeemUrl(result);
    const sessionName = buildSessionName(options, result.localUrl);
    const qr = options.noQr ? null : await generateQr(redeemUrl);

    instance.rerender(
      <InkCliView
        state="running"
        options={options}
        localUrl={result.localUrl}
        publicUrl={result.publicUrl}
        redeemUrl={redeemUrl}
        sessionName={sessionName}
        qr={qr}
      />
    );

    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    stderr.write(`${message}\n`);
    instance.unmount();
    return 1;
  }
};
