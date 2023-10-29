import { extendType, idArg, nonNull, objectType, stringArg } from 'nexus';
import { Stage } from './Stage';

export const Project = objectType({
  name: 'Project',
  definition(t) {
    t.id('id');
    t.string('title');
    t.list.field('stages', { type: Stage });
  },
});

export const GetAllProjectsQuery = extendType({
  type: 'Query',
  definition(t) {
    t.list.field('getProjects', {
      type: Project,
      resolve(_root, _args, ctx) {
        return ctx.db.projects;
      },
    });
  },
});

export const GetProjectQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('getProjectById', {
      type: Project,
      args: {
        projectId: nonNull(idArg()),
      },
      resolve(_root, args, ctx) {
        const project = ctx.db.projects.find((p) => p.id === args.projectId);
        if (!project) {
          throw new Error('Project not found');
        }
        return project;
      },
    });
  },
});

export const CreateProjectMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('createProject', {
      type: Project,
      args: {
        // TODO: allow to add stages and tasks here as well
        title: nonNull(stringArg()),
      },
      resolve(_root, args, ctx) {
        const projects = ctx.db.projects;

        const newProject = {
          id: crypto.randomUUID(),
          title: args.title,
          stages: [],
        };
        projects.push(newProject);
        // TODO: check if project is properly stored after introducing real db
        return projects.find((p) => p.id === newProject.id);
      },
    });
  },
});

export const DeleteProjectMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('deleteProject', {
      type: 'String',
      args: {
        projectId: nonNull(idArg()),
      },
      resolve(_root, args, ctx) {
        const projects = ctx.db.projects;
        const project = projects.find((p) => p.id === args.projectId);
        if (!project) {
          throw new Error('Project not found');
        }
        projects.splice(projects.indexOf(project), 1);
        return project.id;
      },
    });
  },
});
