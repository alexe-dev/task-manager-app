import crypto, { UUID } from 'crypto';

export interface Project {
  id: UUID;
  title: string;
  stages: Stage[];
}
export interface Stage {
  id: UUID;
  order: number;
  title: string;
  tasks: Task[];
}

export interface Task {
  id: UUID;
  order: number;
  title: string;
  isCompleted: boolean;
}

export interface Db {
  projects: Project[];
}

export const db: Db = {
  projects: [
    {
      id: crypto.randomUUID(),
      title: 'Mega Project',
      stages: [
        {
          id: crypto.randomUUID(),
          title: 'Stage 1',
          order: 1,
          tasks: [
            { id: crypto.randomUUID(), order: 1, title: 'Task 1', isCompleted: true },
            { id: crypto.randomUUID(), order: 2, title: 'Task 2', isCompleted: false },
          ],
        },
        {
          id: crypto.randomUUID(),
          title: 'Stage 2',
          order: 2,
          tasks: [{ id: crypto.randomUUID(), order: 1, title: 'Task 1', isCompleted: false }],
        },
      ],
    },
  ],
};
