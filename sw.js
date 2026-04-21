import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Trash2, Download, User, Package, 
  Loader2, PenTool, ToggleLeft, ToggleRight, CheckCircle2 
} from 'lucide-react';

const Input = ({ label, value, onChange, type = "text" }) => (
  <div className="w-full">
    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1 ml-1 tracking-wider">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-black outline-none transition-all"
    />
  </div>
);

const App = () => {
  const [isLibraryLoaded, setIsLibraryLoaded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showTax, setShowTax] = useState(true);

  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: '',
    orderNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
    currency: 'RD$',
    taxRate: 18, 
    conditions: '',
    dispatchedBy: '',
    receivedBy: '',
    client: { name: '', address: '' },
    items: [{ id: '1', description: '', quantity: '', price: '' }]
  });

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
    script.async = true;
    script.onload = () => setIsLibraryLoaded(true);
    document.body.appendChild(script);
  }, []);

  const handleInputChange = (field, value) => setInvoiceData(prev => ({ ...prev, [field]: value }));
  
  const handleNestedChange = (category, field, value) => {
    setInvoiceData(prev => ({
      ...prev,
      [category]: { ...prev[category], [field]: value }
    }));
  };

  const addItem = () => {
    const newItem = { id: Math.random().toString(36).substr(2, 9), description: '', quantity: '', price: '' };
    setInvoiceData(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const removeItem = (id) => {
    if (invoiceData.items.length > 1) {
      setInvoiceData(prev => ({ ...prev, items: prev.items.filter(item => item.id !== id) }));
    }
  };

  const updateItem = (id, field, value) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const totals = useMemo(() => {
    const subtotal = invoiceData.items.reduce((acc, item) => {
      const q = parseFloat(item.quantity) || 0;
      const p = parseFloat(item.price) || 0;
      return acc + (q * p);
    }, 0);
    const taxAmount = showTax ? (subtotal * (parseFloat(invoiceData.taxRate) || 0)) / 100 : 0;
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  }, [invoiceData, showTax]);

  const handleDownloadPDF = async () => {
    if (!isLibraryLoaded) return;
    setIsGenerating(true);
    const element = document.getElementById('printable-invoice');
    const opt = {
      margin: 0,
      filename: `Factura_${invoiceData.invoiceNumber || 'Recibo'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false, scrollY: 0 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    try {
      await window.html2pdf().set(opt).from(element).save();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 p-2 md:p-4 font-sans text-zinc-900">
      {/* El contenido del Generador de Facturas se renderiza aquí */}
      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          body { background: white !important; padding: 0; margin: 0; }
          .print\\:hidden { display: none !important; }
          #printable-invoice { 
            box-shadow: none !important; 
            border: none !important; 
            margin: 0 !important; 
            width: 210mm !important;
            height: 297mm !important;
          }
        }
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default App;
