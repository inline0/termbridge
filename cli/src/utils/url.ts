export const normalizePublicUrl = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error("missing public url");
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error("invalid public url");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("invalid public url");
  }

  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
};

export const buildShareUrl = (publicUrl: string, token: string): string => {
  let parsed: URL;

  try {
    parsed = new URL(publicUrl);
  } catch {
    throw new Error("invalid public url");
  }

  const basePath = parsed.pathname.endsWith("/") ? parsed.pathname : `${parsed.pathname}/`;
  parsed.pathname = `${basePath}__tb/s/${token}`;
  parsed.hash = "";
  return parsed.toString();
};

export const deriveRepoPath = (repoUrl: string): string => {
  const trimmed = repoUrl.replace(/\/$/, "");
  const last = trimmed.split("/").pop();
  if (!last) {
    return "repo";
  }
  return last.endsWith(".git") ? last.slice(0, -4) : last;
};
