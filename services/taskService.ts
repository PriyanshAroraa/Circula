import { supabase, isSupabaseConfigured } from './supabase';
import { Task } from '../types';
import { RealtimeChannel } from '@supabase/supabase-js';

// Fallback to localStorage if Supabase not configured
import { storage } from '../utils/storage';

export interface TaskSubscription {
  channel: RealtimeChannel | null;
  unsubscribe: () => void;
}

export const taskService = {
  // Get all tasks for current user
  async getTasks(): Promise<Task[]> {
    if (!isSupabaseConfigured()) {
      // Fallback to localStorage
      return storage.getTasks();
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return storage.getTasks(); // Fallback if not authenticated
    }

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Failed to fetch tasks from Supabase:', error);
      return storage.getTasks(); // Fallback
    }

    // Transform database format (snake_case) to Task format (camelCase)
    return (data || []).map((task: any) => ({
      id: task.id,
      title: task.title,
      category: task.category,
      startTime: task.start_time,
      endTime: task.end_time,
      notes: task.notes,
      completed: task.completed,
      energyLevel: task.energy_level
    }));
  },

  // Save a single task
  async saveTask(task: Task): Promise<Task> {
    if (!isSupabaseConfigured()) {
      // Fallback to localStorage
      const tasks = storage.getTasks();
      const updatedTasks = tasks.some(t => t.id === task.id)
        ? tasks.map(t => t.id === task.id ? task : t)
        : [...tasks, task];
      storage.saveTasks(updatedTasks);
      return task;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Fallback if not authenticated
      const tasks = storage.getTasks();
      const updatedTasks = tasks.some(t => t.id === task.id)
        ? tasks.map(t => t.id === task.id ? task : t)
        : [...tasks, task];
      storage.saveTasks(updatedTasks);
      return task;
    }

    // Transform Task format (camelCase) to database format (snake_case)
    const taskData = {
      id: task.id,
      user_id: user.id,
      title: task.title,
      category: task.category,
      start_time: task.startTime,
      end_time: task.endTime,
      notes: task.notes,
      completed: task.completed,
      energy_level: task.energyLevel
    };

    const { data, error } = await supabase
      .from('tasks')
      .upsert(taskData, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('Failed to save task to Supabase:', error);
      // Fallback to localStorage
      const tasks = storage.getTasks();
      const updatedTasks = tasks.some(t => t.id === task.id)
        ? tasks.map(t => t.id === task.id ? task : t)
        : [...tasks, task];
      storage.saveTasks(updatedTasks);
      return task;
    }

    // Transform database format (snake_case) to Task format (camelCase)
    return {
      id: data.id,
      title: data.title,
      category: data.category,
      startTime: data.start_time,
      endTime: data.end_time,
      notes: data.notes,
      completed: data.completed,
      energyLevel: data.energy_level
    };
  },

  // Save multiple tasks (batch operation)
  async saveTasks(tasks: Task[]): Promise<Task[]> {
    if (!isSupabaseConfigured()) {
      storage.saveTasks(tasks);
      return tasks;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      storage.saveTasks(tasks);
      return tasks;
    }

    // Transform Task format (camelCase) to database format (snake_case)
    const tasksData = tasks.map(task => ({
      id: task.id,
      user_id: user.id,
      title: task.title,
      category: task.category,
      start_time: task.startTime,
      end_time: task.endTime,
      notes: task.notes,
      completed: task.completed,
      energy_level: task.energyLevel
    }));

    const { data, error } = await supabase
      .from('tasks')
      .upsert(tasksData, { onConflict: 'id' })
      .select();

    if (error) {
      console.error('Failed to save tasks to Supabase:', error);
      storage.saveTasks(tasks);
      return tasks;
    }

    // Transform database format (snake_case) to Task format (camelCase)
    return (data || []).map((task: any) => ({
      id: task.id,
      title: task.title,
      category: task.category,
      startTime: task.start_time,
      endTime: task.end_time,
      notes: task.notes,
      completed: task.completed,
      energyLevel: task.energy_level
    }));
  },

  // Delete a task
  async deleteTask(taskId: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      const tasks = storage.getTasks().filter(t => t.id !== taskId);
      storage.saveTasks(tasks);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const tasks = storage.getTasks().filter(t => t.id !== taskId);
      storage.saveTasks(tasks);
      return;
    }

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Failed to delete task from Supabase:', error);
      // Fallback to localStorage
      const tasks = storage.getTasks().filter(t => t.id !== taskId);
      storage.saveTasks(tasks);
    }
  },

  // Subscribe to real-time task changes
  subscribeToTasks(
    userId: string,
    onInsert: (task: Task) => void,
    onUpdate: (task: Task) => void,
    onDelete: (taskId: string) => void
  ): TaskSubscription {
    if (!isSupabaseConfigured()) {
      return { channel: null, unsubscribe: () => {} };
    }

    const channel = supabase
      .channel(`tasks:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const task = payload.new as any;
            // Transform database format (snake_case) to Task format (camelCase)
            onInsert({
              id: task.id,
              title: task.title,
              category: task.category,
              startTime: task.start_time,
              endTime: task.end_time,
              notes: task.notes,
              completed: task.completed,
              energyLevel: task.energy_level
            });
          } else if (payload.eventType === 'UPDATE') {
            const task = payload.new as any;
            // Transform database format (snake_case) to Task format (camelCase)
            onUpdate({
              id: task.id,
              title: task.title,
              category: task.category,
              startTime: task.start_time,
              endTime: task.end_time,
              notes: task.notes,
              completed: task.completed,
              energyLevel: task.energy_level
            });
          } else if (payload.eventType === 'DELETE') {
            onDelete(payload.old.id);
          }
        }
      )
      .subscribe();

    return {
      channel,
      unsubscribe: () => {
        if (channel) {
          supabase.removeChannel(channel);
        }
      }
    };
  }
};

