import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DashboardMetrics {
  totalDebt: number;
  totalOverdue: number;
  tasksToday: number;
  overdueTasks: number;
  pendingInvoicesCount: number;
}

interface Task {
  id: number;
  title: string;
  dueDate: string;
  status: string;
  customer?: { name: string };
}

interface Alert {
  id: string;
  type: string;
  message: string;
  date: string;
  customerId: number;
}

export default function Dashboard({ userId }: { userId: number }) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    api.get(`/dashboard/${userId}`).then(res => setMetrics(res.data)).catch(console.error);
    api.get(`/tasks/user/${userId}`).then(res => {
      const today = new Date().toISOString().split('T')[0];
      setTasks(res.data.filter((t: Task) => t.dueDate.startsWith(today) && t.status !== 'Completed'));
    }).catch(console.error);

    api.get(`/alerts/${userId}`).then(res => setAlerts(res.data)).catch(console.error);
  }, [userId]);

  const completeTask = async (id: number) => {
    try {
      await api.put(`/tasks/${id}/complete`);
      setTasks(tasks.filter(t => t.id !== id));
      // Refresh metrics
      api.get(`/dashboard/${userId}`).then(res => setMetrics(res.data)).catch(console.error);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>

      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Dívida Total</h3>
            <p className="text-2xl font-bold text-gray-900">€{metrics.totalDebt.toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Dívida Atrasada</h3>
            <p className="text-2xl font-bold text-red-600">€{metrics.totalOverdue.toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Tarefas Hoje</h3>
            <p className="text-2xl font-bold text-blue-600">{metrics.tasksToday}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Tarefas Atrasadas</h3>
            <p className="text-2xl font-bold text-orange-600">{metrics.overdueTasks}</p>
          </div>
        </div>
      )}

      {alerts.length > 0 && (
        <div className="bg-red-50 rounded-lg shadow-sm border border-red-200 p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Alertas Automáticos
          </h3>
          <ul className="space-y-3">
            {alerts.map(alert => (
              <li key={alert.id} className="flex bg-white p-3 rounded shadow-sm border border-red-100">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-1">Data de Referência: {format(new Date(alert.date), 'dd/MM/yyyy')}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-gray-500" />
          Tarefas para Hoje
        </h3>
        {tasks.length === 0 ? (
          <p className="text-gray-500">Não tem tarefas pendentes para hoje.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {tasks.map(task => (
              <li key={task.id} className="py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{task.title}</p>
                  {task.customer && (
                    <p className="text-sm text-gray-500">Cliente: {task.customer.name}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    {format(new Date(task.dueDate), "HH:mm", { locale: ptBR })}
                  </p>
                </div>
                <button
                  onClick={() => completeTask(task.id)}
                  className="flex items-center text-sm text-green-600 hover:text-green-800"
                >
                  <CheckCircle className="w-5 h-5 mr-1" />
                  Concluir
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
