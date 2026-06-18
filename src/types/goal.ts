export interface Goal {
    id: number
    title: string
    description: string
    status?: string
    dueDate?: string
    completedAt?: string | null
  }