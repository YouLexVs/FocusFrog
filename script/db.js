import { openDB } from 'idb';

const DB_NAME = 'FocusFrogDB';
const DB_VERSION = 1;

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('tasks')) {
        db.createObjectStore('tasks');
      }
      if (!db.objectStoreNames.contains('meta')) {
        db.createObjectStore('meta');
      }
    }
  });
};

export const saveTasksToDB = async (dateKey, tasks) => {
  const db = await initDB();
  await db.put('tasks', { tasks }, dateKey);
};

export const getTasksForToday = async () => {
  const db = await initDB();
  const today = new Date().toISOString().split('T')[0];
  return await db.get('tasks', today);
};

export const getHistory = async () => {
  const db = await initDB();
  const allKeys = await db.getAllKeys('tasks');
  const today = new Date().toISOString().split('T')[0];
  const pastKeys = allKeys.filter(k => k !== today);
  const history = await Promise.all(pastKeys.map(k => db.get('tasks', k)));
  return history;
};

export const markTaskDone = async (dateKey, taskId, priority, difficulty) => {
  const db = await initDB();
  const dayData = await db.get('tasks', dateKey);

  const updatedTasks = dayData.tasks.map(task => {
    if (task.id === taskId) {
      task.done = true;
    }
    return task;
  });

  await db.put('tasks', { tasks: updatedTasks }, dateKey);

  const currentPoints = (await db.get('meta', 'points')) || 0;
  const newPoints = currentPoints + priority * difficulty;
  await db.put('meta', newPoints, 'points');
};

export const spendPoints = async (cost) => {
  const db = await initDB();
  const currentPoints = (await db.get('meta', 'points')) || 0;
  if (currentPoints >= cost) {
    await db.put('meta', currentPoints - cost, 'points');
    return true;
  }
  return false;
};

export const getPoints = async () => {
  const db = await initDB();
  return (await db.get('meta', 'points')) || 0;
};