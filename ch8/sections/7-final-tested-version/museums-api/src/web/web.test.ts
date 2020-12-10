import { AuthRepository, t, Database, Collection } from "../deps.ts";
import {
  Controller as UserController,
  Repository as UserRepository,
  User,
} from "../users/index.ts";
import { Controller as MuseumController } from "../museums/index.ts";
import { createServer } from "./index.ts";

const mockMongoDatabase = {
  collection() {
    const storage = new Map();
    return {
      findOne: ({ username }: { username: string }) => {
        return storage.get(username);
      },
      count: async ({ username }: { username: string }) => {
        return storage.get(username) ? 1 : 0;
      },
      insertOne: async (user: User) => {
        storage.set(user.username, user);
        return user;
      },
    };
  },
} as unknown as Database;

Deno.test({
  name: "my-second-test",
  fn: () => {},
  only: false,
  sanitizeOps: true,
  sanitizeResources: true,
});

Deno.test("it responds to hello world", async () => {
  const server = await createServer({
    configuration: {
      allowedOrigins: [],
      authorization: {
        algorithm: "HS256",
        key: "abcd",
      },
      certFile: "abcd",
      keyFile: "abcd",
      port: 9001,
      secure: false,
    },
    museum: {} as MuseumController,
    user: {} as UserController,
  });

  const response = await fetch(
    "http://localhost:9001/",
    {
      method: "GET",
    },
  ).then((r) => r.text());

  t.assertEquals(
    response,
    "Hello World!",
    "responds with hello world",
  );

  server.controller.abort();
});

Deno.test("returns the user and a token on login", async () => {
  const server = await createServer({
    configuration: {
      allowedOrigins: [],
      authorization: {
        algorithm: "HS256",
        key: "abcd",
      },
      certFile: "abcd",
      keyFile: "abcd",
      port: 9001,
      secure: false,
    },
    museum: {} as MuseumController,
    user: new UserController({
      authRepository: new AuthRepository({
        configuration: {
          algorithm: "HS256",
          key: "key",
          tokenExpirationInSeconds: 120,
        },
      }),
      userRepository: new UserRepository({
        storage: mockMongoDatabase,
      }),
    }),
  });
});
