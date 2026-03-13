import { useState } from 'react';
import { 
  Scale, 
  FileText, 
  Download, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  ChevronRight,
  Shield,
  Sparkles,
  Briefcase,
  Home,
  Users,
  Handshake,
  Gavel,
  FileSignature,
  Globe,
  Building
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';

// Field type definitions
type FieldType = 'text' | 'textarea' | 'date' | 'number' | 'select';

interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  options?: string[];
}

interface DocumentTypeConfig {
  name: string;
  icon: React.ElementType;
  description: string;
  fields: FieldConfig[];
}

interface DocumentTypes {
  [key: string]: DocumentTypeConfig;
}

// Document types configuration
const DOCUMENT_TYPES: DocumentTypes = {
  employment_contract: {
    name: 'Employment Contract',
    icon: Briefcase,
    description: 'Create professional employment agreements with all standard clauses',
    fields: [
      { name: 'employer_name', label: 'Employer/Company Name', type: 'text', required: true },
      { name: 'employee_name', label: 'Employee Name', type: 'text', required: true },
      { name: 'position', label: 'Job Position/Title', type: 'text', required: true },
      { name: 'start_date', label: 'Start Date', type: 'date', required: true },
      { name: 'salary', label: 'Salary/Compensation', type: 'text', required: true, placeholder: 'e.g., ₹500,000 per year' },
      { name: 'work_location', label: 'Work Location', type: 'text', required: true },
      { name: 'employment_type', label: 'Employment Type', type: 'select', required: true, options: ['Full-Time', 'Part-Time', 'Contract', 'Temporary'] },
      { name: 'authorized_signatory_name', label: 'Authorized Signatory Name (Company)', type: 'text', required: true, placeholder: 'e.g., CEO / Director / HR Manager' },
      { name: 'authorized_signatory_designation', label: 'Authorized Signatory Designation', type: 'text', required: true, placeholder: 'e.g., HR Manager, Director, CEO' }
    ]
  },
  lease_agreement: {
    name: 'Lease Agreement',
    icon: Home,
    description: 'Generate comprehensive residential lease agreements',
    fields: [
      { name: 'landlord_name', label: 'Landlord Name', type: 'text', required: true },
      { name: 'tenant_name', label: 'Tenant Name', type: 'text', required: true },
      { name: 'property_address', label: 'Property Address', type: 'textarea', required: true },
      { name: 'lease_start', label: 'Lease Start Date', type: 'date', required: true },
      { name: 'lease_end', label: 'Lease End Date', type: 'date', required: true },
      { name: 'monthly_rent', label: 'Monthly Rent Amount', type: 'text', required: true },
      { name: 'security_deposit', label: 'Security Deposit', type: 'text', required: true }
    ]
  },
  nda: {
    name: 'Non-Disclosure Agreement',
    icon: Shield,
    description: 'Protect confidential information with professional NDAs',
    fields: [
      { name: 'disclosing_party', label: 'Disclosing Party', type: 'text', required: true },
      { name: 'receiving_party', label: 'Receiving Party', type: 'text', required: true },
      { name: 'effective_date', label: 'Effective Date', type: 'date', required: true },
      { name: 'jurisdiction', label: 'Jurisdiction', type: 'text', required: true, placeholder: 'e.g., California, USA' },
      { name: 'term_years', label: 'Agreement Term (Years)', type: 'number', required: true }
    ]
  },
  partnership_agreement: {
    name: 'Partnership Agreement',
    icon: Users,
    description: 'Establish business partnerships with clear terms',
    fields: [
      { name: 'partner_one', label: 'Partner One Name', type: 'text', required: true },
      { name: 'partner_two', label: 'Partner Two Name', type: 'text', required: true },
      { name: 'business_name', label: 'Business Name', type: 'text', required: true },
      { name: 'business_address', label: 'Business Address', type: 'textarea', required: true },
      { name: 'start_date', label: 'Partnership Start Date', type: 'date', required: true },
      { name: 'profit_sharing', label: 'Profit Sharing Ratio', type: 'text', required: true, placeholder: 'e.g., 50/50 or 60/40' },
      { name: 'duration', label: 'Partnership Duration', type: 'text', required: true, placeholder: 'e.g., 5 years or Indefinite' }
    ]
  },
  service_agreement: {
    name: 'Service Agreement',
    icon: Handshake,
    description: 'Define service terms between providers and clients',
    fields: [
      // Client Details
      { name: 'client_name', label: 'Client Full Name', type: 'text', required: true },
      { name: 'client_address', label: 'Client Full Address', type: 'textarea', required: true },
      { name: 'client_email', label: 'Client Email Address', type: 'text', required: true },
      { name: 'client_phone', label: 'Client Phone Number', type: 'text', required: true },
      
      // Service Details
      { name: 'service_location', label: 'Service Location Address', type: 'textarea', required: true },
      { name: 'plan_name', label: 'Service Plan Name', type: 'text', required: true, placeholder: 'e.g., Fiber Premium, Basic Internet' },
      { name: 'service_speed', label: 'Internet Speed (Mbps)', type: 'text', required: true, placeholder: 'e.g., 100 Mbps, 1 Gbps' },
      { name: 'data_limit', label: 'Monthly Data Limit (GB)', type: 'text', required: true, placeholder: 'e.g., Unlimited, 500 GB' },
      { name: 'installation_date', label: 'Installation Date', type: 'date', required: true },
      
      // Payment Details
      { name: 'total_amount', label: 'Total Monthly Amount (₹)', type: 'text', required: true, placeholder: 'e.g., ₹999' },
      { name: 'advance_payment', label: 'Advance Payment Required (₹)', type: 'text', required: true, placeholder: 'e.g., ₹2,000' },
      { name: 'remaining_due_date', label: 'Remaining Payment Due Date', type: 'date', required: true },
      { name: 'payment_method', label: 'Payment Method', type: 'select', required: true, options: ['Bank Transfer', 'UPI', 'Credit Card', 'Debit Card', 'Cheque', 'Cash'] },
      
      // Agreement Details
      { name: 'agreement_start_date', label: 'Agreement Start Date', type: 'date', required: true },
      { name: 'agreement_end_date', label: 'Agreement End Date (12 months later)', type: 'date', required: true },
      { name: 'jurisdiction', label: 'Jurisdiction (City/State)', type: 'text', required: true, placeholder: 'e.g., New Delhi, Delhi' }
    ]
  },
  settlement_agreement: {
    name: 'Settlement Agreement',
    icon: Gavel,
    description: 'Resolve disputes with formal settlement contracts',
    fields: [
      { name: 'party_one', label: 'Party One Name', type: 'text', required: true },
      { name: 'party_two', label: 'Party Two Name', type: 'text', required: true },
      { name: 'dispute_description', label: 'Description of Dispute', type: 'textarea', required: true },
      { name: 'settlement_amount', label: 'Settlement Amount', type: 'text', required: true },
      { name: 'settlement_date', label: 'Settlement Date', type: 'date', required: true },
      { name: 'confidentiality_required', label: 'Confidentiality Required?', type: 'select', required: true, options: ['Yes', 'No'] }
    ]
  },
  freelance_contract: {
    name: 'Freelance Contract',
    icon: FileSignature,
    description: 'Create contracts for freelance work and projects',
    fields: [
      { name: 'freelancer_name', label: 'Freelancer Name', type: 'text', required: true },
      { name: 'client_name', label: 'Client Name', type: 'text', required: true },
      { name: 'project_description', label: 'Project Description', type: 'textarea', required: true },
      { name: 'start_date', label: 'Project Start Date', type: 'date', required: true },
      { name: 'deadline', label: 'Project Deadline', type: 'date', required: true },
      { name: 'total_payment', label: 'Total Payment', type: 'text', required: true },
      { name: 'milestone_payment', label: 'Milestone Payment Details', type: 'text', required: false, placeholder: 'e.g., 25% per milestone' }
    ]
  },
  terms_of_service: {
    name: 'Terms of Service',
    icon: Globe,
    description: 'Generate website/app terms of service agreements',
    fields: [
      { name: 'company_name', label: 'Company Name', type: 'text', required: true },
      { name: 'website_url', label: 'Website/App URL', type: 'text', required: true },
      { name: 'effective_date', label: 'Effective Date', type: 'date', required: true },
      { name: 'governing_law', label: 'Governing Law', type: 'text', required: true, placeholder: 'e.g., State of California' },
      { name: 'minimum_age', label: 'Minimum User Age', type: 'number', required: true }
    ]
  },
  domicile_agreement: {
    name: 'Domicile Agreement',
    icon: Building,
    description: 'Create residency and accommodation agreements',
    fields: [
      { name: 'resident_name', label: 'Resident Name', type: 'text', required: true },
      { name: 'property_owner', label: 'Property Owner Name', type: 'text', required: true },
      { name: 'property_address', label: 'Property Address', type: 'textarea', required: true },
      { name: 'start_date', label: 'Agreement Start Date', type: 'date', required: true },
      { name: 'monthly_fee', label: 'Monthly Fee', type: 'text', required: true },
      { name: 'services_included', label: 'Services Included', type: 'textarea', required: true, placeholder: 'e.g., Utilities, WiFi, Cleaning' }
    ]
  }
};

// API Configuration
const API_BASE_URL = '/api';

function App() {
  const [selectedDocType, setSelectedDocType] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [generatedDoc, setGeneratedDoc] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const normalizeErrorMessage = (message: string) => {
    const raw = (message || '').toLowerCase();
    if (
      raw.includes('api_key_invalid') ||
      raw.includes('api key not found') ||
      raw.includes('gemini api authentication failed')
    ) {
      return 'Gemini API key is invalid or missing. Update GEMINI_API_KEY in backend/.env, restart backend, and try again.';
    }
    return message;
  };

  const handleDocTypeSelect = (docType: string) => {
    setSelectedDocType(docType);
    setFormData({});
    setGeneratedDoc(null);
    setError(null);
    setSuccess(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const validateForm = () => {
    if (!selectedDocType) return false;
    
    const docConfig = DOCUMENT_TYPES[selectedDocType];
    const requiredFields = docConfig.fields.filter((f: FieldConfig) => f.required);
    
    for (const field of requiredFields) {
      if (!formData[field.name] || formData[field.name].trim() === '') {
        return false;
      }
    }
    
    return true;
  };

  const isFormComplete = () => {
    return validateForm();
  };

  const handleGenerate = async () => {
    if (!selectedDocType) {
      setError('Please select a document type first');
      return;
    }

    const docConfig = DOCUMENT_TYPES[selectedDocType];
    const requiredFields = docConfig.fields.filter((f: FieldConfig) => f.required);
    
    const emptyFields = requiredFields.filter(field => !formData[field.name] || formData[field.name].trim() === '');
    
    if (emptyFields.length > 0) {
      setError(`Please fill in all required fields. Missing: ${emptyFields.map(f => f.label).join(', ')}`);
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document_type: selectedDocType,
          details: formData
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate document');
      }
      
      setGeneratedDoc(data);
      setSuccess('Document generated successfully!');
      
      setTimeout(() => {
        document.getElementById('generated-document')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
    } catch (err: any) {
      const message = err?.message || 'An error occurred while generating the document';
      setError(normalizeErrorMessage(message));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedDoc || !selectedDocType) return;
    
    setIsDownloading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/download-doc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document_type: selectedDocType,
          document_text: generatedDoc.document_text
        })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to download document');
      }
      
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : `LegalEase_${selectedDocType}.docx`;
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSuccess('Document downloaded successfully!');
      
    } catch (err: any) {
      const message = err?.message || 'An error occurred while downloading the document';
      setError(normalizeErrorMessage(message));
    } finally {
      setIsDownloading(false);
    }
  };

  const handleBackToTypes = () => {
    setShowForm(false);
    setSelectedDocType(null);
    setFormData({});
    setGeneratedDoc(null);
    setError(null);
    setSuccess(null);
  };

  const formatDocumentText = (text: string) => {
    return text.split('\n').map((line, index) => {
      const isHeading = (
        line.toUpperCase() === line && line.length > 3 && line.length < 100
      ) || line.endsWith(':') || 
        /^(SECTION|ARTICLE|CLAUSE|PARTIES|TERMS|RECITALS|WHEREAS)/i.test(line);
      
      if (!line.trim()) {
        return <div key={index} className="h-4" />;
      }
      
      return (
        <p 
          key={index} 
          className={`mb-3 ${isHeading ? 'font-bold text-indigo-900 text-lg mt-6' : 'text-gray-700 leading-relaxed'}`}
        >
          {line}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Scale className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-900 to-blue-700 bg-clip-text text-transparent">
                  LegalEase
                </h1>
                <p className="text-xs text-gray-500">AI-Powered Legal Documents</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Powered by Gemini AI
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        {!showForm && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Generate Professional Legal Documents in Seconds
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Legal Documents Made <span className="text-indigo-600">Simple</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Create legally structured documents with AI. Choose from 9 document types, 
              fill in the details, and download professionally formatted Word documents.
            </p>
          </motion.div>
        )}

        {/* Alert Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700">{error}</p>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <p className="text-green-700">{success}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Document Type Selection */}
        {!showForm ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Select a Document Type
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(DOCUMENT_TYPES).map(([key, doc], index) => {
                const IconComponent = doc.icon;
                return (
                  <motion.button
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleDocTypeSelect(key)}
                    className="group relative bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100 hover:border-indigo-200 hover:shadow-xl transition-all duration-300 text-left"
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-7 h-7 text-indigo-600" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-700 transition-colors">
                      {doc.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      {doc.description}
                    </p>
                    <div className="flex items-center text-indigo-600 text-sm font-medium">
                      Create Document
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          /* Document Form */
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="grid lg:grid-cols-2 gap-8"
          >
            {/* Form Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleBackToTypes}
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      ← Back
                    </button>
                    <h3 className="text-lg font-bold text-white">
                      {selectedDocType && DOCUMENT_TYPES[selectedDocType].name}
                    </h3>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-5">
                  {selectedDocType && DOCUMENT_TYPES[selectedDocType].fields.map((field: FieldConfig) => (
                    <div key={field.name}>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {field.type === 'textarea' ? (
                        <textarea
                          value={formData[field.name] || ''}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                          autoComplete="off"
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                        />
                      ) : field.type === 'select' ? (
                        <select
                          value={formData[field.name] || ''}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          autoComplete="off"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
                        >
                          <option value="">Select {field.label}</option>
                          {field.options?.map((opt: string) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          value={formData[field.name] || ''}
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                            autoComplete="off"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        />
                      )}
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !isFormComplete()}
                  className="w-full mt-8 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold py-4 rounded-xl hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating Document...
                    </>
                  ) : !isFormComplete() ? (
                    <>
                      <AlertCircle className="w-5 h-5" />
                      Fill all required fields
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Legal Document
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Preview Section */}
            <div id="generated-document">
              {generatedDoc ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-6 h-6 text-white" />
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          Generated Document
                        </h3>
                        <p className="text-white/80 text-sm">
                          {generatedDoc.document_title}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleDownload}
                      disabled={isDownloading}
                      className="bg-white text-green-700 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 disabled:opacity-50 transition-colors flex items-center gap-2"
                    >
                      {isDownloading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      {isDownloading ? 'Downloading...' : 'Download Word'}
                    </button>
                  </div>
                  
                  <div className="p-6 max-h-[600px] overflow-y-auto">
                    <div className="prose prose-indigo max-w-none">
                      {formatDocumentText(generatedDoc.document_text)}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Document Preview
                  </h3>
                  <p className="text-gray-500 max-w-sm">
                    Fill in the form details and click "Generate Legal Document" 
                    to see your document preview here.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-indigo-600" />
              <span className="font-semibold text-gray-900">LegalEase</span>
            </div>
            <p className="text-sm text-gray-500 text-center">
              AI-powered legal document generator. Documents should be reviewed by a legal professional before use.
            </p>
            <p className="text-sm text-gray-400">
              © 2025 LegalEase
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
