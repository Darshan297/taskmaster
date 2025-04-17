import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Plus, X, Pencil, Trash, Calendar, AlertTriangle } from 'lucide-react';

interface Task {
  id: string;
  name: string;
  repeat_days: string[];
  created_at: string;
}

export default function Todo() {
  const { session } = useAuth();
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [taskToDelete, setTaskToDelete] = React.useState<Task | null>(null);
  const [taskName, setTaskName] = React.useState('');
  const [selectedDays, setSelectedDays] = React.useState<string[]>([]);
  const [step, setStep] = React.useState<'name' | 'days'>('name');
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  React.useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSaveTask = async () => {
    if (!taskName.trim() || selectedDays.length === 0) return;

    try {
      if (editingTask) {
        // Update existing task
        const { error } = await supabase
          .from('tasks')
          .update({
            name: taskName.trim(),
            repeat_days: selectedDays,
          })
          .eq('id', editingTask.id);

        if (error) throw error;
      } else {
        // Create new task
        const { error } = await supabase
          .from('tasks')
          .insert({
            name: taskName.trim(),
            repeat_days: selectedDays,
            user_id: session?.user.id,
          });

        if (error) throw error;
      }

      // Reset form and fetch updated tasks
      resetForm();
      await fetchTasks();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleEditTask = (task: Task, startWithDays = false) => {
    setEditingTask(task);
    setTaskName(task.name);
    setSelectedDays(task.repeat_days);
    setIsModalOpen(true);
    setStep(startWithDays ? 'days' : 'name');
  };

  const confirmDelete = (task: Task) => {
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskToDelete.id);

      if (error) throw error;
      await fetchTasks();
      setIsDeleteModalOpen(false);
      setTaskToDelete(null);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const resetForm = () => {
    setTaskName('');
    setSelectedDays([]);
    setIsModalOpen(false);
    setStep('name');
    setEditingTask(null);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Tasks</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Task
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow group hover:shadow-md transition-shadow"
          >
            <span className="text-gray-900 dark:text-white">{task.name}</span>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleEditTask(task, true)}
                className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
              >
                <div className="flex gap-1">
                  {task.repeat_days.map((day) => (
                    <span
                      key={day}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      {day.slice(0, 3)}
                    </span>
                  ))}
                </div>
                <Calendar className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditTask(task)}
                  className="p-1 text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary transition-colors"
                  title="Edit task name"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => confirmDelete(task)}
                  className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  title="Delete task"
                >
                  <Trash className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Task Modal (Add/Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingTask ? 'Edit Task' : 'Add New Task'}
                {step === 'days' && ' - Select Days'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4">
              {step === 'name' ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    placeholder="Task name"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    autoFocus
                  />
                  <button
                    onClick={() => setStep('days')}
                    disabled={!taskName.trim()}
                    className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {days.map((day) => (
                      <button
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`p-3 rounded-lg border transition-colors ${
                          selectedDays.includes(day)
                            ? 'bg-primary text-white border-primary'
                            : 'border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setStep('name')}
                      className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSaveTask}
                      disabled={selectedDays.length === 0}
                      className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {editingTask ? 'Save Changes' : 'Add Task'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && taskToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Task</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to delete "{taskToDelete.name}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setTaskToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteTask}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {tasks.length === 0 && !isModalOpen && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No tasks yet. Add your first task to get started!</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Your First Task
          </button>
        </div>
      )}
    </div>
  );
}