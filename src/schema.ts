import { makeSchema } from 'nexus';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import * as types from './graphql';

const filename = fileURLToPath(import.meta.url);
const _dirname = dirname(filename);

export const schema = makeSchema({
  types,
  outputs: {
    typegen: join(_dirname, '..', 'nexus-typegen.ts'),
    schema: join(_dirname, '..', 'schema.graphql'),
  },
  contextType: {
    module: join(_dirname, './context.ts'),
    export: 'Context',
  },
});
