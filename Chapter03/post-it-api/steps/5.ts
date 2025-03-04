import { serve } from "https://deno.land/std@0.83.0/http/server.ts";

const PORT = 8080;
const HOST = "localhost";
const PROTOCOL = "http";
const server = serve({ port: PORT, hostname: HOST });

/**
 * Will work as an in-memory DB to save our postIts
 */
const postIts: Record<PostIt["id"], PostIt> = {
  "3209ebc7-b3b4-4555-88b1-b64b33d507ab": {
    title: "Read more",
    body: "PacktPub books",
    id: "3209ebc7-b3b4-4555-88b1-b64b33d507ab",
    createdAt: new Date(),
  },
  "a1afee4a-b078-4eff-8ca6-06b3722eee2c": {
    title: "Finish book",
    body: "Deno Web Development",
    id: "a1afee4a-b078-4eff-8ca6-06b3722eee2c",
    createdAt: new Date(),
  },
};
/**
 * Describes the PostIt entity stored in the in-memory database
 */
interface PostIt {
  title: string;
  id: string;
  body: string;
  createdAt: Date;
}

console.log(`Server running at ${HOST}:${PORT}`);
for await (const req of server) {
  const url = new URL(`${PROTOCOL}://${HOST}${req.url}`);
  const headers = new Headers();
  headers.set("content-type", "application/json");

  const pathWithMethod = `${req.method} ${url.pathname}`;
  switch (pathWithMethod) {
    case "GET /api/post-its": {
      const allPostIts = Object.keys(postIts).reduce(
        (allPostIts: PostIt[], postItId) => {
          return allPostIts.concat(postIts[postItId]);
        },
        [],
      );

      req.respond({ body: JSON.stringify({ postIts: allPostIts}), headers });
      continue;
    }
    case "POST /api/post-its": {
      const body = await Deno.readAll(req.body);
      const decoded = JSON.parse(new TextDecoder().decode(body));
      console.log(decoded);
      req.respond({ status: 201 });
      continue;
    }
    default:
      req.respond({ status: 404 });
  }
}
