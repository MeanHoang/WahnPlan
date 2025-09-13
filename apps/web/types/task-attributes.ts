export interface TaskStatus {
  id: string;
  title: string;
  color: string;
  position: number;
  _count: { tasks: number };
}

export interface TaskPriority {
  id: string;
  name: string;
  color: string;
  position: number;
  _count: { tasks: number };
}

export interface TaskInitiative {
  id: string;
  name: string;
  color: string;
  position: number;
  _count: { tasks: number };
}

export type TaskAttribute = TaskStatus | TaskPriority | TaskInitiative;
export type TaskAttributeType = "status" | "priority" | "initiative";
