import { Task } from '../types';

export interface ValidationError {
  field: string;
  message: string;
  type: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export const validateTask = (task: Partial<Task>, existingTasks: Task[], excludeTaskId?: string): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Required field validation
  if (!task.title?.trim()) {
    errors.push({
      field: 'title',
      message: 'Task title is required',
      type: 'error'
    });
  } else if (task.title.length > 100) {
    errors.push({
      field: 'title',
      message: 'Task title must be less than 100 characters',
      type: 'error'
    });
  }

  if (task.startTime === undefined || task.startTime === null) {
    errors.push({
      field: 'startTime',
      message: 'Start time is required',
      type: 'error'
    });
  }

  if (task.endTime === undefined || task.endTime === null) {
    errors.push({
      field: 'endTime',
      message: 'End time is required',
      type: 'error'
    });
  }

  // Time validation
  if (task.startTime !== undefined && task.endTime !== undefined) {
    const startTime = task.startTime;
    const endTime = task.endTime;

    // Handle overnight tasks (end time wraps to next day)
    const adjustedEndTime = endTime < startTime ? endTime + 24 : endTime;
    const duration = adjustedEndTime - startTime;

    if (duration <= 0) {
      errors.push({
        field: 'endTime',
        message: 'End time must be after start time',
        type: 'error'
      });
    } else if (duration > 12) {
      warnings.push({
        field: 'duration',
        message: 'Tasks longer than 12 hours may be too ambitious',
        type: 'warning'
      });
    } else if (duration < 0.25) { // 15 minutes
      warnings.push({
        field: 'duration',
        message: 'Very short tasks (under 15 minutes) may be hard to complete',
        type: 'warning'
      });
    }

    // Check for overlaps with existing tasks
    const overlappingTasks = existingTasks
      .filter(t => t.id !== excludeTaskId) // Exclude current task if editing
      .filter(existingTask => {
        const existingStart = existingTask.startTime;
        const existingEnd = existingTask.endTime < existingStart ? existingTask.endTime + 24 : existingTask.endTime;

        // Check if time ranges overlap
        return (startTime < existingEnd && adjustedEndTime > existingStart);
      });

    if (overlappingTasks.length > 0) {
      warnings.push({
        field: 'time',
        message: `This task overlaps with ${overlappingTasks.length} other task${overlappingTasks.length > 1 ? 's' : ''}`,
        type: 'warning'
      });
    }

    // Check for tasks too close together (less than 15 minutes gap)
    const nearbyTasks = existingTasks
      .filter(t => t.id !== excludeTaskId)
      .filter(existingTask => {
        const existingStart = existingTask.startTime;
        const existingEnd = existingTask.endTime < existingStart ? existingTask.endTime + 24 : existingTask.endTime;

        // Check if tasks are within 15 minutes of each other
        const gapBefore = Math.abs(startTime - existingEnd);
        const gapAfter = Math.abs(adjustedEndTime - existingStart);

        return gapBefore < 0.25 || gapAfter < 0.25;
      });

    if (nearbyTasks.length > 0 && overlappingTasks.length === 0) {
      warnings.push({
        field: 'time',
        message: 'This task is very close to other tasks - consider adding buffer time',
        type: 'warning'
      });
    }
  }

  // Notes validation
  if (task.notes && task.notes.length > 500) {
    errors.push({
      field: 'notes',
      message: 'Notes must be less than 500 characters',
      type: 'error'
    });
  }

  // Energy level validation
  if (task.energyLevel !== undefined && (task.energyLevel < 1 || task.energyLevel > 3)) {
    errors.push({
      field: 'energyLevel',
      message: 'Energy level must be between 1 and 3',
      type: 'error'
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const validateTaskSchedule = (tasks: Task[]): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Check for excessive tasks in a day
  if (tasks.length > 20) {
    warnings.push({
      field: 'schedule',
      message: 'You have many tasks scheduled - consider prioritizing',
      type: 'warning'
    });
  }

  // Check total scheduled time
  const totalHours = tasks.reduce((acc, task) => {
    const duration = task.endTime - task.startTime;
    return acc + (duration < 0 ? duration + 24 : duration);
  }, 0);

  if (totalHours > 16) {
    warnings.push({
      field: 'schedule',
      message: 'You have over 16 hours scheduled - this may be unsustainable',
      type: 'warning'
    });
  }

  // Check for tasks without breaks
  const sortedTasks = tasks.sort((a, b) => a.startTime - b.startTime);
  for (let i = 1; i < sortedTasks.length; i++) {
    const prevTask = sortedTasks[i - 1];
    const currentTask = sortedTasks[i];

    const prevEnd = prevTask.endTime < prevTask.startTime ? prevTask.endTime + 24 : prevTask.endTime;
    const gap = currentTask.startTime - prevEnd;

    if (gap < 0.25 && gap > 0) { // Less than 15 minutes gap
      warnings.push({
        field: 'breaks',
        message: 'Consider adding breaks between consecutive tasks',
        type: 'warning'
      });
      break; // Only show once
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};
