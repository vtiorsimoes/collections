import React, { useState } from 'react';
import { api } from '../services/api';
import { UploadCloud, CheckCircle } from 'lucide-react';

export default function ImportData() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setMessage('');

    try {
      const response = await api.post('/invoices/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessage(response.data.message || 'Ficheiro importado com sucesso!');
      setFile(null);
      // Reset the file input visually
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error: any) {
      setMessage('Erro ao importar ficheiro. Verifique o formato.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Importar Faturas</h2>
        <p className="text-gray-500 mt-2">Faça o upload do ficheiro Excel (.xlsx) contendo as faturas do sistema externo.</p>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:bg-gray-50 transition-colors">
          <UploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <label htmlFor="file-upload" className="cursor-pointer relative">
            <span className="text-blue-600 font-medium hover:text-blue-500">
              Selecione um ficheiro
            </span>
            <span className="text-gray-500"> ou arraste e largue aqui</span>
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              className="sr-only"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
            />
          </label>
          <p className="text-xs text-gray-500 mt-2">Apenas ficheiros Excel (.xlsx)</p>
        </div>

        {file && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg flex items-center justify-between">
            <div className="flex items-center text-sm text-blue-700">
              <CheckCircle className="w-5 h-5 mr-2" />
              {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </div>
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className={`w-full py-3 px-4 rounded-lg text-white font-medium flex justify-center items-center ${
              !file || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'A Importar...' : 'Iniciar Importação'}
          </button>
        </div>

        {message && (
          <div className={`mt-4 p-4 rounded-lg text-sm ${message.includes('Erro') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}
      </div>

      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h4 className="font-semibold text-gray-700 mb-2">Estrutura esperada do Excel (Colunas em ordem):</h4>
        <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
          <li>Número da Fatura (Ex: FT 2023/1)</li>
          <li>NIF do Cliente (Ex: 123456789)</li>
          <li>Nome do Cliente (Ex: Empresa XYZ)</li>
          <li>Valor Total (Ex: 1500.50)</li>
          <li>Data de Vencimento (Ex: 2023-12-31)</li>
        </ol>
      </div>
    </div>
  );
}
