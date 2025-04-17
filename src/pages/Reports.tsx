import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { format, startOfWeek, addDays } from 'date-fns';
import { Download, CheckCircle2, Circle } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import type { Database } from '../types/database';

type Task = Database['public']['Tables']['tasks']['Row'];
type TaskCompletion = Database['public']['Tables']['task_completions']['Row'];

export default function Reports() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completions, setCompletions] = useState<TaskCompletion[]>([]);
  const startDate = startOfWeek(new Date(), { weekStartsOn: 0 });
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!session?.user.id) return;

    const [tasksResponse, completionsResponse] = await Promise.all([
      supabase
        .from('tasks')
        .select('*')
        .eq('user_id', session.user.id),
      supabase
        .from('task_completions')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('completed_at', startDate.toISOString())
        .lte('completed_at', addDays(startDate, 6).toISOString()),
    ]);

    if (tasksResponse.data) setTasks(tasksResponse.data);
    if (completionsResponse.data) setCompletions(completionsResponse.data);
  };

  const isTaskCompletedOnDate = (taskId: string, date: Date) => {
    return completions.some(completion => 
      completion.task_id === taskId && 
      format(new Date(completion.completed_at), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const handleExportPDF = async () => {
    setLoading(true);
    try {
      const element = document.getElementById('report-content');
      if (!element) return;

      // Calculate device pixel ratio
      const dpr = window.devicePixelRatio || 1;
      const { width, height } = element.getBoundingClientRect();

      // Create canvas with higher resolution
      const canvas = await html2canvas(element, {
        scale: dpr * 2, // Increase scale for higher quality
        useCORS: true, // Enable CORS for external images
        logging: false, // Disable logging
        backgroundColor: document.documentElement.classList.contains('dark') ? '#1a1b1e' : '#ffffff',
        windowWidth: width,
        windowHeight: height,
        onclone: (clonedDoc) => {
          // Ensure proper styling in the cloned document
          const clonedElement = clonedDoc.getElementById('report-content');
          if (clonedElement) {
            clonedElement.style.padding = '24px';
            clonedElement.style.width = `${width}px`;
            clonedElement.style.height = `${height}px`;
          }
        }
      });

      // Calculate PDF dimensions (in mm, assuming 300 DPI)
      const pdfWidth = canvas.width * 25.4 / 300; // Convert pixels to mm
      const pdfHeight = canvas.height * 25.4 / 300;

      // Create PDF with proper dimensions
      const pdf = new jsPDF({
        orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
      });

      // Add image to PDF with high quality
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

      // Save the PDF
      pdf.save(`taskmaster-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Weekly Report</h1>
        <button
          onClick={handleExportPDF}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {loading ? 'Generating...' : 'Export PDF'}
        </button>
      </div>

      <div className="bg-card text-card-foreground rounded-lg shadow-lg border border-border">
        <div id="report-content" className="p-6">
          {/* Week Header */}
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold">
              Week of {format(startDate, 'MMMM d, yyyy')}
            </h2>
          </div>

          {/* Tasks Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider sticky left-0 bg-card border-b border-border">
                    Task Name
                  </th>
                  {weekDates.map((date) => (
                    <th
                      key={date.toISOString()}
                      className="px-6 py-3 text-center border-b border-border"
                    >
                      <div className="text-sm font-medium text-muted-foreground">
                        {format(date, 'EEE')}
                      </div>
                      <div className="text-base font-bold text-primary">
                        {format(date, 'd')}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tasks.map((task) => (
                  <tr key={task.id} className="group">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium sticky left-0 bg-card border-r border-border">
                      {task.name}
                    </td>
                    {weekDates.map((date) => {
                      const isScheduled = task.repeat_days.includes(format(date, 'EEEE'));
                      const isCompleted = isTaskCompletedOnDate(task.id, date);
                      return (
                        <td
                          key={date.toISOString()}
                          className="px-6 py-4 text-center relative group"
                        >
                          {isScheduled ? (
                            isCompleted ? (
                              <div className="flex items-center justify-center">
                                <CheckCircle2 className="h-6 w-6 text-green-500 dark:text-green-400" />
                              </div>
                            ) : (
                              <div className="flex items-center justify-center">
                                <Circle className="h-6 w-6 text-gray-300 dark:text-gray-600" />
                              </div>
                            )
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {tasks.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-8 text-center text-muted-foreground"
                    >
                      No tasks found. Add tasks to see your weekly report.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 pt-6 mt-6 border-t border-border">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400" />
              <span className="text-sm text-muted-foreground">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="h-5 w-5 text-gray-300 dark:text-gray-600" />
              <span className="text-sm text-muted-foreground">Not Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">-</span>
              <span className="text-sm text-muted-foreground">Not Scheduled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}