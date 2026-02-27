export interface FormField {
  name: string;
  label: string;
  type: "text" | "textarea" | "date" | "number" | "select";
  placeholder: string;
  required: boolean;
  options?: string[];
}

export interface DocumentType {
  id: string;
  name: string;
  description: string;
  icon: string;
  fields: FormField[];
}

export const documentTypes: DocumentType[] = [
  {
    id: "employment-contract",
    name: "Employment Contract",
    description: "Standard employment agreement between employer and employee",
    icon: "Briefcase",
    fields: [
      { name: "employer_name", label: "Employer Name (Company)", type: "text", placeholder: "Acme Technologies Pvt. Ltd.", required: true },
      { name: "employer_address", label: "Employer Address", type: "textarea", placeholder: "123 Business Park, Mumbai, Maharashtra 400001", required: true },
      { name: "employee_name", label: "Employee Full Name", type: "text", placeholder: "Rajesh Kumar Sharma", required: true },
      { name: "employee_address", label: "Employee Address", type: "textarea", placeholder: "45 Residential Colony, Pune, Maharashtra 411001", required: true },
      { name: "designation", label: "Designation / Job Title", type: "text", placeholder: "Senior Software Engineer", required: true },
      { name: "department", label: "Department", type: "text", placeholder: "Engineering", required: true },
      { name: "start_date", label: "Employment Start Date", type: "date", placeholder: "", required: true },
      { name: "salary", label: "Monthly Salary (INR)", type: "number", placeholder: "75000", required: true },
      { name: "probation_period", label: "Probation Period (months)", type: "number", placeholder: "3", required: true },
      { name: "notice_period", label: "Notice Period (days)", type: "number", placeholder: "30", required: true },
      { name: "working_hours", label: "Working Hours Per Week", type: "number", placeholder: "40", required: true },
    ],
  },
  {
    id: "lease-agreement",
    name: "Lease Agreement",
    description: "Rental/lease agreement between landlord and tenant",
    icon: "Home",
    fields: [
      { name: "landlord_name", label: "Landlord Full Name", type: "text", placeholder: "Suresh Patel", required: true },
      { name: "landlord_address", label: "Landlord Address", type: "textarea", placeholder: "12 Garden View, Ahmedabad, Gujarat 380001", required: true },
      { name: "tenant_name", label: "Tenant Full Name", type: "text", placeholder: "Amit Singh", required: true },
      { name: "tenant_address", label: "Tenant Current Address", type: "textarea", placeholder: "78 Old City Road, Jaipur, Rajasthan 302001", required: true },
      { name: "property_address", label: "Rental Property Address", type: "textarea", placeholder: "Flat 301, Sunshine Apartments, MG Road, Bangalore 560001", required: true },
      { name: "rent_amount", label: "Monthly Rent (INR)", type: "number", placeholder: "25000", required: true },
      { name: "security_deposit", label: "Security Deposit (INR)", type: "number", placeholder: "75000", required: true },
      { name: "lease_start", label: "Lease Start Date", type: "date", placeholder: "", required: true },
      { name: "lease_duration", label: "Lease Duration (months)", type: "number", placeholder: "12", required: true },
      { name: "maintenance_charges", label: "Monthly Maintenance (INR)", type: "number", placeholder: "3000", required: true },
    ],
  },
  {
    id: "nda",
    name: "Non-Disclosure Agreement",
    description: "Confidentiality agreement between parties",
    icon: "Shield",
    fields: [
      { name: "disclosing_party", label: "Disclosing Party Name", type: "text", placeholder: "TechVision Solutions Pvt. Ltd.", required: true },
      { name: "disclosing_address", label: "Disclosing Party Address", type: "textarea", placeholder: "Tower A, IT Park, Hyderabad 500081", required: true },
      { name: "receiving_party", label: "Receiving Party Name", type: "text", placeholder: "DataSecure Consulting", required: true },
      { name: "receiving_address", label: "Receiving Party Address", type: "textarea", placeholder: "52 Tech Hub, Chennai 600042", required: true },
      { name: "purpose", label: "Purpose of Disclosure", type: "textarea", placeholder: "Evaluation of potential business partnership for cloud services", required: true },
      { name: "confidential_info", label: "Type of Confidential Information", type: "textarea", placeholder: "Trade secrets, proprietary algorithms, client databases, financial records", required: true },
      { name: "duration", label: "NDA Duration (years)", type: "number", placeholder: "2", required: true },
      { name: "effective_date", label: "Effective Date", type: "date", placeholder: "", required: true },
    ],
  },
  {
    id: "service-agreement",
    name: "Service Agreement",
    description: "Agreement for provision of services",
    icon: "FileText",
    fields: [
      { name: "service_provider", label: "Service Provider Name", type: "text", placeholder: "CloudNet Services Pvt. Ltd.", required: true },
      { name: "provider_address", label: "Service Provider Address", type: "textarea", placeholder: "84 Industrial Area, Noida, UP 201301", required: true },
      { name: "client_name", label: "Client Name", type: "text", placeholder: "Global Retail India Ltd.", required: true },
      { name: "client_address", label: "Client Address", type: "textarea", placeholder: "22 Commerce Street, Delhi 110001", required: true },
      { name: "service_description", label: "Description of Services", type: "textarea", placeholder: "Cloud hosting, server maintenance, 24/7 technical support", required: true },
      { name: "service_fee", label: "Service Fee (INR per month)", type: "number", placeholder: "50000", required: true },
      { name: "payment_terms", label: "Payment Terms", type: "select", placeholder: "", required: true, options: ["Net 15", "Net 30", "Net 45", "Net 60", "Upon completion"] },
      { name: "start_date", label: "Service Start Date", type: "date", placeholder: "", required: true },
      { name: "contract_duration", label: "Contract Duration (months)", type: "number", placeholder: "12", required: true },
    ],
  },
  {
    id: "partnership-agreement",
    name: "Partnership Agreement",
    description: "Agreement between business partners",
    icon: "Users",
    fields: [
      { name: "partner1_name", label: "First Partner Name", type: "text", placeholder: "Vikram Mehta", required: true },
      { name: "partner1_address", label: "First Partner Address", type: "textarea", placeholder: "15 Lake View, Kolkata 700001", required: true },
      { name: "partner2_name", label: "Second Partner Name", type: "text", placeholder: "Priya Nair", required: true },
      { name: "partner2_address", label: "Second Partner Address", type: "textarea", placeholder: "88 Green Park, Kochi 682001", required: true },
      { name: "business_name", label: "Partnership Business Name", type: "text", placeholder: "MehtaNair Enterprises", required: true },
      { name: "business_type", label: "Nature of Business", type: "text", placeholder: "E-commerce and Digital Marketing", required: true },
      { name: "capital_contribution", label: "Total Capital Contribution (INR)", type: "number", placeholder: "1000000", required: true },
      { name: "profit_sharing", label: "Profit Sharing Ratio", type: "text", placeholder: "50:50", required: true },
      { name: "start_date", label: "Partnership Start Date", type: "date", placeholder: "", required: true },
    ],
  },
  {
    id: "freelance-contract",
    name: "Freelance Contract",
    description: "Agreement for freelance/independent contractor work",
    icon: "Laptop",
    fields: [
      { name: "client_name", label: "Client Name (Company)", type: "text", placeholder: "Digital Waves Media Pvt. Ltd.", required: true },
      { name: "client_address", label: "Client Address", type: "textarea", placeholder: "12 Creative Hub, Mumbai 400053", required: true },
      { name: "freelancer_name", label: "Freelancer Full Name", type: "text", placeholder: "Anita Desai", required: true },
      { name: "freelancer_address", label: "Freelancer Address", type: "textarea", placeholder: "34 Artist Lane, Pune 411004", required: true },
      { name: "project_description", label: "Project Description", type: "textarea", placeholder: "Design and develop a responsive e-commerce website with payment integration", required: true },
      { name: "deliverables", label: "Key Deliverables", type: "textarea", placeholder: "Homepage design, product pages, checkout flow, admin panel", required: true },
      { name: "project_fee", label: "Total Project Fee (INR)", type: "number", placeholder: "150000", required: true },
      { name: "payment_schedule", label: "Payment Schedule", type: "select", placeholder: "", required: true, options: ["50% advance, 50% on delivery", "Monthly milestones", "Upon completion", "Weekly payments"] },
      { name: "deadline", label: "Project Deadline", type: "date", placeholder: "", required: true },
      { name: "start_date", label: "Start Date", type: "date", placeholder: "", required: true },
    ],
  },
  {
    id: "settlement-agreement",
    name: "Settlement Agreement",
    description: "Agreement to settle a dispute between parties",
    icon: "Scale",
    fields: [
      { name: "party1_name", label: "First Party Name", type: "text", placeholder: "Rajan Industries Pvt. Ltd.", required: true },
      { name: "party1_address", label: "First Party Address", type: "textarea", placeholder: "90 Industrial Estate, Surat 395001", required: true },
      { name: "party2_name", label: "Second Party Name", type: "text", placeholder: "Mohan Trading Co.", required: true },
      { name: "party2_address", label: "Second Party Address", type: "textarea", placeholder: "55 Market Road, Indore 452001", required: true },
      { name: "dispute_description", label: "Description of Dispute", type: "textarea", placeholder: "Payment dispute arising from supply of goods under Invoice #INV-2024-0456 dated 15th March 2024", required: true },
      { name: "settlement_amount", label: "Settlement Amount (INR)", type: "number", placeholder: "500000", required: true },
      { name: "payment_deadline", label: "Payment Deadline", type: "date", placeholder: "", required: true },
      { name: "effective_date", label: "Settlement Date", type: "date", placeholder: "", required: true },
    ],
  },
  {
    id: "terms-of-service",
    name: "Terms of Service",
    description: "Terms and conditions for a platform or service",
    icon: "ScrollText",
    fields: [
      { name: "company_name", label: "Company/Platform Name", type: "text", placeholder: "PayQuick Technologies Pvt. Ltd.", required: true },
      { name: "company_address", label: "Company Registered Address", type: "textarea", placeholder: "201 Tech Tower, Bangalore 560001", required: true },
      { name: "platform_name", label: "Platform/App Name", type: "text", placeholder: "PayQuick", required: true },
      { name: "service_description", label: "Description of Service", type: "textarea", placeholder: "Digital payment processing and financial management platform", required: true },
      { name: "user_eligibility", label: "User Eligibility (Min Age)", type: "number", placeholder: "18", required: true },
      { name: "effective_date", label: "Effective Date", type: "date", placeholder: "", required: true },
      { name: "governing_state", label: "Governing State", type: "text", placeholder: "Karnataka", required: true },
    ],
  },
  {
    id: "domicile-agreement",
    name: "Domicile Agreement",
    description: "Agreement establishing domicile/residence",
    icon: "MapPin",
    fields: [
      { name: "applicant_name", label: "Applicant Full Name", type: "text", placeholder: "Deepak Verma", required: true },
      { name: "father_name", label: "Father's/Guardian's Name", type: "text", placeholder: "Ramesh Verma", required: true },
      { name: "current_address", label: "Current Residential Address", type: "textarea", placeholder: "56 Civil Lines, Lucknow, UP 226001", required: true },
      { name: "permanent_address", label: "Permanent Address", type: "textarea", placeholder: "12 Village Road, Kanpur, UP 208001", required: true },
      { name: "state", label: "State of Domicile", type: "text", placeholder: "Uttar Pradesh", required: true },
      { name: "duration_of_residence", label: "Duration of Residence (years)", type: "number", placeholder: "15", required: true },
      { name: "purpose", label: "Purpose of Domicile Certificate", type: "text", placeholder: "Education admission", required: true },
      { name: "date_of_birth", label: "Date of Birth", type: "date", placeholder: "", required: true },
    ],
  },
];

// Placeholder patterns to reject
const placeholderPatterns = [
  /\[.*\]/,
  /\{.*\}/,
  /enter\s*here/i,
  /your\s*(name|address|company)/i,
  /example/i,
  /placeholder/i,
  /xxx/i,
  /tbd/i,
  /n\/a/i,
  /lorem/i,
];

export function validateInput(value: string): string | null {
  if (!value || value.trim().length === 0) {
    return "This field is required";
  }
  for (const pattern of placeholderPatterns) {
    if (pattern.test(value)) {
      return "Please enter real data. Placeholders like [name], 'enter here', or 'example' are not allowed.";
    }
  }
  return null;
}
