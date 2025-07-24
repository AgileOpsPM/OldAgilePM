'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Phase, Task } from '@prisma/client';
import { FaTrash, FaSave, FaEdit, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import AddTaskForm from './AddTaskForm';
import TaskItem from './TaskItem';

type PhaseWithTasks = Phase & { tasks: Task[] };
type SerializablePhase = Omit<PhaseWithTasks, 'allocatedHours'> & {
  allocatedHours: number;
};

interface PhaseEditorProps {
  phase: SerializablePhase;
  totalBilledHours: number;
  totalAllocatedHours: number;
}

export default function PhaseEditor({ phase, totalBilledHours, totalAllocatedHours }: PhaseEditorProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(phase.title);
  const [allocatedHours, setAllocatedHours] = useState(phase.allocatedHours);
  const [isCompleted, setIsCompleted] = useState(phase.isCompleted);
  const [tasksVisible, setTasksVisible] = useState(true);

  // Handlers for update, delete, toggle complete remain the same
  const handleUpdate = async () => { setIsLoading(true); setError(null); try { const response = await fetch(`/api/phases/${phase.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, allocatedHours }), }); if (!response.ok) { const err = await response.json(); throw new Error(err.error || 'Failed to update phase.'); } setIsEditing(false); router.refresh(); } catch (err: any) { setError(err.message); } finally { setIsLoading(false); } };
  const handleDelete = async () => { if (!confirm('Are you sure you want to delete this phase?')) return; setIsLoading(true); setError(null); try { await fetch(`/api/phases/${phase.id}`, { method: 'DELETE' }); router.refresh(); } catch (err) { setError('Failed to delete phase.'); } finally { setIsLoading(false); } };
  const handleToggleComplete = async () => { setIsLoading(true); setError(null); const previousState = isCompleted; setIsCompleted(!previousState); try { const response = await fetch(`/api/phases/${phase.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isCompleted: !previousState }), }); if (!response.ok) { const err = await response.json(); throw new Error(err.error || 'Failed to toggle phase completion.'); } router.refresh(); } catch (err: any) { setError(err.message); setIsCompleted(previousState); } finally { setIsLoading(false); } };

  // --- GROUPING LOGIC ---
  const incompleteTasks = phase.tasks.filter(t => !t.isCompleted);
  const completedTasks = phase.tasks.filter(t => t.isCompleted);
  const totalTasks = phase.tasks.length;
  
  const hasIncompleteTasks = incompleteTasks.length > 0;
  const progressPercentage = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;
  const canCheckComplete = !hasIncompleteTasks;
  const isCheckboxDisabled = isLoading || isEditing || (hasIncompleteTasks && !isCompleted);

  return (
    <div className={`bg-white rounded-lg shadow-md border transition-all ${isCompleted ? 'bg-green-50 border-green-200' : 'border-gray-200'}`}>
      {/* Header section remains the same */}
      <div className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4 flex-grow" title={!canCheckComplete ? "Complete all tasks before marking the phase as complete" : "Mark phase as complete"}>
            <input type="checkbox" checked={isCompleted} onChange={handleToggleComplete} disabled={isCheckboxDisabled} className="h-6 w-6 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"/>
            {isEditing ? ( <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="text-lg font-semibold text-gray-800 border-b-2 border-blue-500 focus:outline-none flex-grow"/> ) : ( <span className={`text-lg font-semibold ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-800'}`}>{title}</span> )}
          </div>
          <div className="flex items-center gap-4">
            {isEditing ? ( <div className="flex items-center gap-2"> <input type="number" value={allocatedHours} onChange={(e) => setAllocatedHours(parseFloat(e.target.value) || 0)} className="w-24 text-right border-b-2 border-blue-500 focus:outline-none" step="0.5" min="0"/> <button onClick={handleUpdate} disabled={isLoading} className="p-2 text-green-600 hover:text-green-800 disabled:opacity-50"><FaSave /></button> </div> ) : ( <span className={`font-medium ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-600'}`}>{allocatedHours} hours</span> )}
            <div className="flex items-center gap-2 ml-4">
              {!isCompleted && <button onClick={() => setIsEditing(!isEditing)} disabled={isLoading} className="p-2 text-gray-500 hover:text-blue-700 disabled:opacity-50">{isEditing ? 'Cancel' : <FaEdit />}</button>}
              <button onClick={handleDelete} disabled={isLoading || isEditing} className="p-2 text-gray-500 hover:text-red-700 disabled:opacity-50"><FaTrash /></button>
            </div>
          </div>
        </div>
        {error && <p className="text-red-500 text-xs mt-2 text-center">{error}</p>}
      </div>

      {/* Task Section with "To Do" and "Done" groups */}
      <div className="border-t border-gray-200 px-4 py-3 bg-gray-50/50">
        <div className="flex justify-between items-center">
          {/* Progress Bar */}
          <div className="text-sm text-gray-600 w-full">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold">Task Progress</span>
              <span className="font-bold text-gray-800">{completedTasks.length} / {totalTasks}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div></div>
          </div>
          {/* Toggle Button */}
          <button onClick={() => setTasksVisible(!tasksVisible)} className="ml-4 p-2 text-gray-500 hover:text-blue-700 flex items-center gap-1 text-sm font-medium flex-shrink-0">
            {tasksVisible ? 'Hide' : 'Show'}
            {tasksVisible ? <FaChevronUp className="h-3 w-3" /> : <FaChevronDown className="h-3 w-3" />}
          </button>
        </div>

        {tasksVisible && (
          <div className="mt-4 space-y-6">
            {/* --- INCOMPLETE TASKS --- */}
            <div>
              <div className="space-y-3">
                {incompleteTasks.map(task => (<TaskItem key={task.id} task={task} />))}
                {totalTasks === 0 && <p className="text-sm text-center text-gray-500 py-3">No tasks yet. Add one below!</p>}
              </div>
              {!phase.isCompleted && (
                <div className="mt-4">
                  <AddTaskForm phaseId={phase.id} />
                </div>
              )}
            </div>

            {/* --- COMPLETED TASKS --- */}
            {completedTasks.length > 0 && (
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-md font-semibold text-gray-600 mb-3">Done</h4>
                <div className="space-y-3">
                  {completedTasks.map(task => (<TaskItem key={task.id} task={task} />))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}