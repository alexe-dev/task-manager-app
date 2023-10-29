import { extendType, idArg, nonNull, objectType, stringArg } from 'nexus';

export const Task = objectType({
  name: 'Task',
  definition(t) {
    t.id('id');
    t.string('title');
    t.int('order');
    t.boolean('isCompleted');
  },
});

export const CreateTaskMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('createTask', {
      type: Task,
      args: {
        projectId: nonNull(idArg()),
        // TODO: stageId should be sufficient to find by after proper db structure is introduced
        stageId: nonNull(idArg()),
        title: nonNull(stringArg()),
      },
      resolve(_root, args, ctx) {
        const project = ctx.db.projects.find((p) => p.id === args.projectId);
        if (!project) {
          throw new Error('Project not found');
        }
        const stage = project.stages.find((s) => s.id === args.stageId);
        if (!stage) {
          throw new Error('Project not found');
        }
        const existingTasks = stage.tasks;
        const newTask = {
          id: crypto.randomUUID(),
          title: args.title,
          tasks: [],
          order: existingTasks.length !== 0 ? existingTasks[existingTasks.length - 1]?.order + 1 : 1,
          isCompleted: false,
        };
        stage.tasks.push(newTask);
        // TODO: check if task is properly stored after introducing real db
        return stage.tasks.find((s) => s.id === newTask.id);
      },
    });
  },
});

export const ToggleTaskMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('toggleTask', {
      type: Task,
      args: {
        // TODO: use just taskId after introducing proper db
        projectId: nonNull(idArg()),
        stageId: nonNull(idArg()),
        taskId: nonNull(idArg()),
      },
      resolve(_root, args, ctx) {
        const project = ctx.db.projects.find((p) => p.id === args.projectId);
        if (!project) {
          throw new Error('Project not found');
        }
        const stage = project?.stages.find((s) => s.id === args.stageId);
        if (!stage) {
          throw new Error('Project stage not found');
        }
        const stageOrder = stage.order;
        const previousStages = project.stages.filter((s) => s.order < stageOrder);
        // Tasks from previous stages should be completed first before allowing to interact with the next one
        if (previousStages.length !== 0) {
          const previousStagesTasks = previousStages.reduce((acc, stage) => [...acc, ...stage.tasks], []);
          const hasIncompletedTasksInPrevStages = previousStagesTasks.some((t) => !t.isCompleted);
          if (hasIncompletedTasksInPrevStages) {
            throw new Error('Previous stages tasks should be completed first');
          }
        }
        // The logic above allows to reopen tasks in previously completed stages
        // (with a condition that all preceding stages are completed)
        // which is compliant with requirements

        const taskToToggle = stage?.tasks.find((t) => t.id === args.taskId);
        if (!taskToToggle) {
          throw new Error('Task not found');
        }
        taskToToggle.isCompleted = !taskToToggle.isCompleted;
        return taskToToggle;
      },
    });
  },
});

export const DeleteTaskMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('deleteTask', {
      type: 'String',
      args: {
        projectId: nonNull(idArg()),
        stageId: nonNull(idArg()),
        taskId: nonNull(idArg()),
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
        const task = stage.tasks.find((t) => t.id === args.taskId);
        if (!task) {
          throw new Error('Task not found');
        }
        stage.tasks.splice(stage.tasks.indexOf(task), 1);
        return task.id;
      },
    });
  },
});
