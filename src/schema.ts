import { makeSchema } from 'nexus';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import * as types from './graphql';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const schema = makeSchema({
  types,
  outputs: {
    typegen: join(__dirname, '..', 'nexus-typegen.ts'),
    schema: join(__dirname, '..', 'schema.graphql'),
  },
  contextType: {
    // 1
    module: join(__dirname, './context.ts'),
    export: 'Context',
  },
});
