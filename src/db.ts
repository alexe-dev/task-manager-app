export interface Project {
  id: number;
  title: string;
  stages: Stage[];
}
export interface Stage {
  id: number;
  title: string;
  tasks: Task[];
}
export interface Task {
  id: number;
  title: string;
  isCompleted: boolean;
}
export interface Db {
  projects: Project[];
}
export const db: Db = {
  projects: [
    {
      id: 1,
      title: 'Mega Project',
      stages: [
        {
          id: 1,
          title: 'Stage 1',
          tasks: [
            { id: 1, title: 'Task 1', isCompleted: true },
            { id: 2, title: 'Task 2', isCompleted: false },
          ],
        },
        { id: 1, title: 'Stage 2', tasks: [{ id: 1, title: 'Task 1', isCompleted: false }] },
      ],
    },
  ],
};
