import getPort, { makeRange } from 'get-port';
import { GraphQLClient } from 'graphql-request';
import { startStandaloneServer } from '@apollo/server/standalone';
import { server } from '../server';
import { context } from '../context';

type TestContext = {
  client: GraphQLClient;
};

export function createTestContext(): TestContext {
  let ctx = {} as TestContext;
  const graphqlCtx = graphqlTestContext();
  beforeEach(async () => {
    const client = await graphqlCtx.before();
    Object.assign(ctx, {
      client,
    });
  });
  afterEach(async () => {
    await graphqlCtx.after();
  });
  return ctx;
}
function graphqlTestContext() {
  return {
    async before() {
      const port = await getPort({ port: makeRange(4000, 6000) });
      const { url } = await startStandaloneServer(server, {
        context: async () => ({ ...context }),
        listen: { port },
      });
      return new GraphQLClient(url);
    },
    async after() {
      server.stop();
    },
  };
}
