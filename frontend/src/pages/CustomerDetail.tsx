import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { format } from 'date-fns';
import { Phone, Mail, FileText, Calendar, Plus, CreditCard } from 'lucide-react';

interface Invoice {
  id: number;
  invoiceNumber: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  status: string;
}

interface Interaction {
  id: number;
  date: string;
  type: string;
  notes: string;
}

interface PromiseToPay {
  id: number;
  amount: number;
  promiseDate: string;
  status: string;
}

interface CustomerDetailData {
  id: number;
  name: string;
  nif: string;
  email: string;
  phone: string;
  invoices: Invoice[];
  interactions: Interaction[];
  promisesToPay: PromiseToPay[];
}

export default function CustomerDetail({ userId }: { userId: number }) {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<CustomerDetailData | null>(null);
  const [newInteraction, setNewInteraction] = useState({ type: 'Call', notes: '' });
  const [newPromise, setNewPromise] = useState({ amount: '', promiseDate: '' });

  useEffect(() => {
    loadCustomer();
  }, [id]);

  const loadCustomer = () => {
    api.get(`/customers/${id}`).then(res => setCustomer(res.data)).catch(console.error);
  };

  const handleAddInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/interactions', {
        ...newInteraction,
        customerId: Number(id),
        userId: userId
      });
      setNewInteraction({ type: 'Call', notes: '' });
      loadCustomer();
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddPromise = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/promisesToPay', {
        amount: parseFloat(newPromise.amount),
        promiseDate: newPromise.promiseDate,
        customerId: Number(id),
        status: 'Active'
      });
      setNewPromise({ amount: '', promiseDate: '' });
      loadCustomer();
    } catch (error) {
      console.error(error);
    }
  };

  if (!customer) return <div>A carregar...</div>;

  const totalDebt = customer.invoices.reduce((acc, inv) => acc + (inv.amount - inv.paidAmount), 0);

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{customer.name}</h2>
            <p className="text-gray-500 mt-1">NIF: {customer.nif}</p>
            <div className="flex space-x-4 mt-4">
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-2" /> {customer.phone || 'N/A'}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-2" /> {customer.email || 'N/A'}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Dívida Total em Aberto</p>
            <p className="text-3xl font-bold text-red-600">€{totalDebt.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Faturas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Faturas
          </h3>
          <div className="space-y-3">
            {customer.invoices.map(invoice => (
              <div key={invoice.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">#{invoice.invoiceNumber}</p>
                  <p className="text-xs text-gray-500">Vence: {format(new Date(invoice.dueDate), 'dd/MM/yyyy')}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">€{(invoice.amount - invoice.paidAmount).toFixed(2)}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    invoice.status === 'Overdue' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {invoice.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Promessas de Pagamento */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Promessas de Pagamento
          </h3>

          <form onSubmit={handleAddPromise} className="mb-6 bg-green-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor (€)</label>
                <input
                  type="number" step="0.01" required
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 p-2 border"
                  value={newPromise.amount}
                  onChange={e => setNewPromise({...newPromise, amount: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Prometida</label>
                <input
                  type="date" required
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 p-2 border"
                  value={newPromise.promiseDate}
                  onChange={e => setNewPromise({...newPromise, promiseDate: e.target.value})}
                />
              </div>
            </div>
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm font-medium flex items-center">
              <Plus className="w-4 h-4 mr-1" /> Registar Promessa
            </button>
          </form>

          <div className="space-y-3">
            {customer.promisesToPay?.map(promise => (
              <div key={promise.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">€{promise.amount.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">Para: {format(new Date(promise.promiseDate), 'dd/MM/yyyy')}</p>
                </div>
                <div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    promise.status === 'Active' && new Date(promise.promiseDate) < new Date() ? 'bg-red-100 text-red-800' :
                    promise.status === 'Active' ? 'bg-yellow-100 text-yellow-800' :
                    promise.status === 'Fulfilled' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {promise.status === 'Active' && new Date(promise.promiseDate) < new Date() ? 'Atrasada' : promise.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interações e Timeline */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Timeline & Interações
          </h3>

          {/* Form Nova Interação */}
          <form onSubmit={handleAddInteraction} className="mb-6 bg-blue-50 p-4 rounded-lg">
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
                value={newInteraction.type}
                onChange={e => setNewInteraction({...newInteraction, type: e.target.value})}
              >
                <option value="Call">Chamada Telefónica</option>
                <option value="Email">Email</option>
                <option value="SMS">SMS</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notas (ex: Prometeu pagar dia 15)</label>
              <textarea
                required
                rows={2}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
                value={newInteraction.notes}
                onChange={e => setNewInteraction({...newInteraction, notes: e.target.value})}
              ></textarea>
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium flex items-center">
              <Plus className="w-4 h-4 mr-1" /> Registar Interação
            </button>
          </form>

          {/* Timeline */}
          <div className="space-y-4">
            {customer.interactions.map(interaction => (
              <div key={interaction.id} className="border-l-2 border-blue-200 pl-4 py-1">
                <p className="text-xs text-gray-500">{format(new Date(interaction.date), "dd/MM/yyyy 'às' HH:mm")}</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{interaction.type}</p>
                <p className="text-sm text-gray-700 mt-1">{interaction.notes}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
