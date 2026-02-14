import app from "../server/src/app";

export default function handler(req: any, res: any) {
  if (req.url) {
    req.url = req.url.replace(/^\/api/, "") || "/";
  }
  return (app as any)(req, res);
}
