import { startStandaloneServer } from '@apollo/server/standalone';

import { server } from './server';
import { context } from './context';

const { url } = await startStandaloneServer(server, {
  context: async ({ req }) => ({ token: req.headers.token, ...context }),
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at ${url}`);
