export const parseShareUrl = (shareUrl: string) => {
  const parsed = new URL(shareUrl);
  const marker = "/__tb/s/";
  const index = parsed.pathname.indexOf(marker);
  if (index === -1) {
    throw new Error("invalid share url");
  }
  const token = parsed.pathname.slice(index + marker.length);
  if (!token) {
    throw new Error("invalid share url");
  }
  const basePath = parsed.pathname.slice(0, index);
  parsed.pathname = basePath || "/";
  parsed.hash = "";
  return { baseUrl: new URL(parsed.toString()), token };
};

export const buildUrl = (baseUrl: URL, path: string) => {
  const next = new URL(baseUrl.toString());
  const basePath = next.pathname.endsWith("/") ? next.pathname : `${next.pathname}/`;
  next.pathname = `${basePath}${path}`;
  return next.toString();
};
