import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckCircle2, ListTodo, BarChart3, Circle } from 'lucide-react';
import { Database } from '../types/database';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import confetti from 'canvas-confetti';

type Task = Database['public']['Tables']['tasks']['Row'];
type TaskCompletion = Database['public']['Tables']['task_completions']['Row'];

export default function Dashboard() {
  const { session } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completions, setCompletions] = useState<TaskCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const today = new Date();
  const currentDayName = format(today, 'EEEE');
  const currentDate = format(today, 'd');
  const currentMonth = format(today, 'MMMM');

  useEffect(() => {
    if (session?.user.id) {
      const fetchData = async () => {
        const [tasksResponse, completionsResponse] = await Promise.all([
          supabase
            .from('tasks')
            .select('*')
            .eq('user_id', session.user.id),
          supabase
            .from('task_completions')
            .select('*')
            .eq('user_id', session.user.id)
            .gte('completed_at', startOfWeek(new Date()).toISOString())
            .lte('completed_at', endOfWeek(new Date()).toISOString()),
        ]);

        if (tasksResponse.data) setTasks(tasksResponse.data);
        if (completionsResponse.data) setCompletions(completionsResponse.data);
        setLoading(false);
      };

      fetchData();
    }
  }, [session]);

  const todaysTasks = tasks.filter(task => 
    task.repeat_days.includes(currentDayName)
  );

  const isTaskCompleted = (taskId: string) => {
    return completions.some(completion => 
      completion.task_id === taskId && 
      format(new Date(completion.completed_at), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
    );
  };

  const triggerCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF69B4']
      });
    }, 200);
  };

  const handleTaskCompletion = async (taskId: string) => {
    if (!session?.user.id) return;

    const isCompleted = isTaskCompleted(taskId);
    
    if (isCompleted) {
      const completionToRemove = completions.find(
        c => c.task_id === taskId && 
        format(new Date(c.completed_at), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
      );

      if (completionToRemove) {
        const { error } = await supabase
          .from('task_completions')
          .delete()
          .eq('id', completionToRemove.id);

        if (!error) {
          setCompletions(prev => prev.filter(c => c.id !== completionToRemove.id));
        }
      }
    } else {
      const { data, error } = await supabase
        .from('task_completions')
        .insert({
          task_id: taskId,
          user_id: session.user.id,
        })
        .select()
        .single();

      if (!error && data) {
        setCompletions(prev => [...prev, data]);
        triggerCelebration();
      }
    }
  };

  const totalTasks = tasks.length;
  const completedToday = completions.filter(
    (c) => format(new Date(c.completed_at), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  ).length;
  const completionRate = totalTasks ? (completedToday / totalTasks) * 100 : 0;

  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayCompletions = completions.filter(
      (c) => format(new Date(c.completed_at), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    ).length;
    return {
      date: format(date, 'EEE'),
      completions: dayCompletions,
    };
  }).reverse();

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{currentDayName}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{currentDate}</span>
              <span className="text-gray-500 dark:text-gray-400">{currentMonth}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Tasks */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Today's Tasks</h2>
        {todaysTasks.length > 0 ? (
          <div className="space-y-3">
            {todaysTasks.map((task) => {
              const completed = isTaskCompleted(task.id);
              return (
                <div
                  key={task.id}
                  className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 ${
                    completed 
                      ? 'bg-green-50 dark:bg-green-900/20' 
                      : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleTaskCompletion(task.id)}
                      className="focus:outline-none transform transition-transform active:scale-150"
                    >
                      {completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary" />
                      )}
                    </button>
                    <span className={`transition-all duration-300 ${
                      completed 
                        ? 'text-gray-500 dark:text-gray-400 line-through' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {task.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">No tasks scheduled for today</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <ListTodo className="h-8 w-8 text-primary" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tasks</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{totalTasks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed Today</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{completedToday}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completion Rate</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {completionRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weekly Activity</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--foreground))"
              />
              <YAxis 
                stroke="hsl(var(--foreground))"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                  color: 'hsl(var(--foreground))'
                }}
              />
              <Bar dataKey="completions" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}