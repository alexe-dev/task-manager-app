import { createTestContext } from './__helpers';
import crypto from 'crypto';

const ctx = createTestContext();

it('ensures that a project, stages and tasks can be created', async () => {
  // Create a new project
  const projectResult = await ctx.client.request<{ [key: string]: any }>(`
    mutation {
      createProject(title: "OAK's lab mega project", ) { 
        id
        title
        stages {
           id
        }
      }
    }
  `);
  const { id: projectId, ...project } = projectResult.createProject;

  expect(project).toMatchInlineSnapshot(`
{
  "stages": [],
  "title": "OAK's lab mega project",
}
`);
  // Add 2 stages to the project
  const addStages = await ctx.client.request<{ [key: string]: any }>(
    `
    mutation createStage($projectId: ID!) {
      stage1: createStage(projectId: $projectId, title: "Stage 1") {
        id
        title
      }
      stage2: createStage(projectId: $projectId, title: "Stage 2") {
        id
        title
      }
    }
  `,
    { projectId: projectResult?.createProject?.id }
  );
  const { id: stageId, ...stage } = addStages.stage1;

  expect(stage).toMatchInlineSnapshot(`
{
  "title": "Stage 1",
}
`);

  const updatedProjectResponse = await ctx.client.request<{ [key: string]: any }>(
    `
        query getProject($projectId: ID!) {
        getProjectById(projectId: $projectId) {
            id
            title
            stages {
            
            title
            }
        }
        }
    `,
    { projectId: projectResult?.createProject?.id }
  );
  const { id: updatedProjectId, ...updatedProject } = updatedProjectResponse.getProjectById;
  expect(updatedProject).toMatchInlineSnapshot(`
{
  "stages": [
    {
      "title": "Stage 1",
    },
    {
      "title": "Stage 2",
    },
  ],
  "title": "OAK's lab mega project",
}
`);

  // Add few tasks to both stages
  await ctx.client.request<{ [key: string]: any }>(
    `
    mutation createTasks($projectId: ID!, $stageId: ID!, $stageId2: ID!) {
      task1: createTask(projectId: $projectId, stageId: $stageId, title: "Task 1") {
        id
        title
      }
      task2: createTask(projectId: $projectId, stageId: $stageId, title: "Task 2") {
        id
        title
      }
      task3: createTask(projectId: $projectId, stageId: $stageId, title: "Task 3") {
        id
        title
      }
      task1stage2: createTask(projectId: $projectId, stageId: $stageId2, title: "Task 1") {
        id
        title
      }
      task2stage2: createTask(projectId: $projectId, stageId: $stageId2, title: "Task 2") {
        id
        title
      }
      

    }
  `,
    { projectId: projectResult?.createProject?.id, stageId: addStages?.stage1?.id, stageId2: addStages?.stage2?.id }
  );

  const updatedProjectResponse2 = await ctx.client.request<{ [key: string]: any }>(
    `
        query getProject($projectId: ID!) {
        getProjectById(projectId: $projectId) {
            id
            title
            stages {
            
                title
                order
                tasks {
                    id
                    title
                    order
                    isCompleted
                }
            }
        }
        }
    `,
    { projectId: projectResult?.createProject?.id }
  );
  const { id: updatedProjectId2, ...updatedProject2 } = updatedProjectResponse2.getProjectById;

  // Toggle one of tasks to completed
  await ctx.client.request<{ [key: string]: any }>(
    `
    mutation toggleTask($projectId: ID!, $stageId: ID!, $taskId: ID!) {
      toggleTask(projectId: $projectId, stageId: $stageId, taskId: $taskId) {
        id
      }
      
    }
  `,
    {
      projectId: projectResult?.createProject?.id,
      stageId: addStages?.stage1?.id,
      taskId: updatedProject2?.stages[0]?.tasks[1]?.id,
    }
  );

  const updatedProjectResponse3 = await ctx.client.request<{ [key: string]: any }>(
    `
        query getProject($projectId: ID!) {
        getProjectById(projectId: $projectId) {
            id
            title
            stages {
            
                title
                order
                tasks {
                    title
                    order
                    isCompleted
                }
            }
        }
        }
    `,
    { projectId: projectResult?.createProject?.id }
  );
  const { id: updatedProjectId3, ...updatedProject3 } = updatedProjectResponse3.getProjectById;
  expect(updatedProject3).toMatchInlineSnapshot(`
{
  "stages": [
    {
      "order": 1,
      "tasks": [
        {
          "isCompleted": false,
          "order": 1,
          "title": "Task 1",
        },
        {
          "isCompleted": true,
          "order": 2,
          "title": "Task 2",
        },
        {
          "isCompleted": false,
          "order": 3,
          "title": "Task 3",
        },
      ],
      "title": "Stage 1",
    },
    {
      "order": 2,
      "tasks": [
        {
          "isCompleted": false,
          "order": 1,
          "title": "Task 1",
        },
        {
          "isCompleted": false,
          "order": 2,
          "title": "Task 2",
        },
      ],
      "title": "Stage 2",
    },
  ],
  "title": "OAK's lab mega project",
}
`);
  try {
    // Try to toggle task in second stage before the first stage is completed
    await ctx.client.request<{ [key: string]: any }>(
      `
    mutation toggleTask($projectId: ID!, $stageId: ID!, $taskId: ID!) {
      toggleTask(projectId: $projectId, stageId: $stageId, taskId: $taskId) {
        id
      }

    }
  `,
      {
        projectId: projectResult?.createProject?.id,
        stageId: addStages?.stage2?.id,
        taskId: updatedProject2?.stages[1]?.tasks[1]?.id,
      }
    );
  } catch (e) {
    expect(e.message).toMatch(/Previous stages tasks should be completed first/);
  }
});
