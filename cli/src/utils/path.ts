import { resolve } from "node:path";
import { statSync } from "node:fs";

export const expandHome = (value: string, home: string): string => {
  if (value === "~") {
    return home;
  }
  if (value.startsWith("~/")) {
    return `${home}/${value.slice(2)}`;
  }
  return value;
};

export const resolvePath = (value: string, home: string): string =>
  resolve(expandHome(value, home));

export const safeStat = (path: string): ReturnType<typeof statSync> | null => {
  try {
    return statSync(path);
  } catch {
    return null;
  }
};
