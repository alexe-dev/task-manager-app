import { extendType, objectType } from 'nexus';
export const Project = objectType({
  name: 'Project',
  definition(t) {
    t.int('id');
    t.string('title');
    t.list.field('stages', { type: Stage });
  },
});

export const Stage = objectType({
  name: 'Stage',
  definition(t) {
    t.int('id');
    t.string('title');
    t.list.field('tasks', { type: Task });
  },
});

export const Task = objectType({
  name: 'Task',
  definition(t) {
    t.int('id');
    t.string('title');
    t.boolean('isCompleted');
  },
});

export const PostQuery = extendType({
  type: 'Query',
  definition(t) {
    t.list.field('projects', {
      type: Project,
      resolve(_root, _args, ctx) {
        return ctx.db.projects;
      },
    });
  },
});
