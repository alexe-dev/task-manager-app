import { extendType, idArg, nonNull, objectType, stringArg } from 'nexus';
import { Task } from './Task';

export const Stage = objectType({
  name: 'Stage',
  definition(t) {
    t.id('id');
    t.string('title');
    t.int('order');
    t.list.field('tasks', { type: Task });
  },
});

export const CreateStageMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('createStage', {
      type: Stage,
      args: {
        // TODO: allow to add tasks to new stage here as well
        projectId: nonNull(idArg()),
        title: nonNull(stringArg()),
      },
      resolve(_root, args, ctx) {
        const project = ctx.db.projects.find((p) => p.id === args.projectId);
        if (!project) {
          throw new Error('Project not found');
        }
        const existingStages = project.stages;
        const newStage = {
          id: crypto.randomUUID(),
          title: args.title,
          tasks: [],
          order: existingStages.length !== 0 ? existingStages[existingStages.length - 1]?.order + 1 : 1,
        };
        project.stages.push(newStage);
        // TODO: check if stage is properly stored after introducing real db
        return project.stages.find((s) => s.id === newStage.id);
      },
    });
  },
});

export const DeleteStageMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('deleteStage', {
      type: 'String',
      args: {
        projectId: nonNull(idArg()),
        stageId: nonNull(idArg()),
      },
      resolve(_root, args, ctx) {
        const project = ctx.db.projects.find((p) => p.id === args.projectId);
        if (!project) {
          throw new Error('Project not found');
        }
        const stage = project.stages.find((s) => s.id === args.stageId);
        if (!stage) {
          throw new Error('Stage not found');
        }
        project.stages.splice(project.stages.indexOf(stage), 1);
        return stage.id;
      },
    });
  },
});
