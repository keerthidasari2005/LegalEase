"""
LegalEase: AI-Powered Legal Documentation Generator
Flask Backend with Gemini API Integration
"""

import os
import re
import io
import base64
from datetime import datetime
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai
from docx import Document
from docx.shared import Pt, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

# Load environment variables from backend/.env explicitly.
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(dotenv_path=os.path.join(BASE_DIR, '.env'))

app = Flask(__name__)
CORS(app)

# Configure Gemini API
GEMINI_API_KEY = (os.getenv('GEMINI_API_KEY') or '').strip()
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in backend/.env")
if GEMINI_API_KEY == 'your_gemini_api_key_here':
    raise ValueError("GEMINI_API_KEY is still the placeholder value in backend/.env")

# Predefined Service Provider Configuration
SERVICE_PROVIDER = {
    'name': 'Bharti Airtel Limited',
    'address': 'Bharti Crescent, 1 Nelson Mandela Road, Vasant Kunj, New Delhi - 110070, India',
    'phone': '+91-11-4004-0000',
    'email': 'support@airtel.com',
    'website': 'www.airtel.in',
    'authorized_signatory': 'Rajesh Kumar Singh',
    'designation': 'Service Manager',
    'registration': 'Registered under Indian Telegraph Act, 1885'
}

genai.configure(api_key=GEMINI_API_KEY)

# Initialize Gemini model with error handling and fallback
def initialize_model():
    """Initialize Gemini model with fallback support"""
    models_to_try = [
        'gemini-2.5-flash',      # Primary: Latest high-performing model
        'gemini-2.5-pro',        # Fallback 1: Latest pro model
        'gemini-2.0-flash',      # Fallback 2: Stable flash model
        'gemini-flash-latest'    # Fallback 3: Latest flash alias
    ]
    
    for model_name in models_to_try:
        try:
            model = genai.GenerativeModel(model_name)
            print(f"✓ Successfully initialized Gemini model: {model_name}")
            return model
        except Exception as e:
            print(f"⚠ Could not initialize {model_name}: {e}")
            continue
    
    # If all fail, raise an error
    raise RuntimeError(f"Failed to initialize any Gemini model. Tried: {models_to_try}")

model = initialize_model()

# Document types configuration
DOCUMENT_TYPES = {
    'employment_contract': {
        'name': 'Employment Contract',
        'fields': ['employer_name', 'employee_name', 'position', 'start_date', 'salary', 'work_location', 'employment_type', 'authorized_signatory_name', 'authorized_signatory_designation']
    },
    'lease_agreement': {
        'name': 'Lease Agreement',
        'fields': ['landlord_name', 'tenant_name', 'property_address', 'lease_start', 'lease_end', 'monthly_rent', 'security_deposit']
    },
    'nda': {
        'name': 'Non-Disclosure Agreement',
        'fields': ['disclosing_party', 'receiving_party', 'effective_date', 'jurisdiction', 'term_years']
    },
    'partnership_agreement': {
        'name': 'Partnership Agreement',
        'fields': ['partner_one', 'partner_two', 'business_name', 'business_address', 'start_date', 'profit_sharing', 'duration']
    },
    'service_agreement': {
        'name': 'Service Agreement',
        'fields': ['client_name', 'client_address', 'client_email', 'client_phone', 'service_location', 'plan_name', 'service_speed', 'data_limit', 'installation_date', 'total_amount', 'advance_payment', 'remaining_due_date', 'payment_method', 'agreement_start_date', 'agreement_end_date', 'jurisdiction']
    },
    'settlement_agreement': {
        'name': 'Settlement Agreement',
        'fields': ['party_one', 'party_two', 'settlement_amount', 'settlement_date', 'dispute_description', 'confidentiality_required']
    },
    'freelance_contract': {
        'name': 'Freelance Contract',
        'fields': ['freelancer_name', 'client_name', 'project_description', 'start_date', 'deadline', 'total_payment', 'milestone_payment']
    },
    'terms_of_service': {
        'name': 'Terms of Service',
        'fields': ['company_name', 'website_url', 'effective_date', 'governing_law', 'minimum_age']
    },
    'domicile_agreement': {
        'name': 'Domicile Agreement',
        'fields': ['resident_name', 'property_owner', 'property_address', 'start_date', 'monthly_fee', 'services_included']
    }
}

def generate_legal_prompt(doc_type, details):
    """Generate a structured prompt for the legal document with STRICT no-placeholder rules"""
    
    prompts = {
        'employment_contract': f"""STRICT REQUIREMENT: Generate a COMPLETE professional Employment Contract with NO placeholders, NO brackets, ALL fields filled.

PARTIES - USE EXACT NAMES PROVIDED:
- Employer/Company: {details.get('employer_name')}
- Employee: {details.get('employee_name')}
- Position: {details.get('position')}
- Work Location: {details.get('work_location')}
- Employment Type: {details.get('employment_type')}
- Start Date: {details.get('start_date')}
- Salary: {details.get('salary')}
- Authorized Signatory: {details.get('authorized_signatory_name')}
- Signatory Designation: {details.get('authorized_signatory_designation')}

DOCUMENT REQUIREMENTS:
✓ Complete professional employment contract
✓ Parties section with ACTUAL names above (no placeholders like [Name])
✓ All duties, compensation, benefits, confidentiality clauses
✓ Complete signature section with:
  - "FOR COMPANY: {details.get('authorized_signatory_name')} ({details.get('authorized_signatory_designation')})"
  - "FOR EMPLOYEE: {details.get('employee_name')}"
  - Date: 20th February 2026
✓ Professional formatting, jurisdiction: India
✓ ZERO brackets, ZERO placeholders, ZERO blanks, 100% READY TO PRINT
✓ NO witnesses section

OUTPUT: Start with title, include all sections, end with filled signature section (company signatory and employee only, no witnesses).""",

        'lease_agreement': f"""STRICT REQUIREMENT: Generate a COMPLETE professional Lease Agreement with NO placeholders, NO brackets, ALL fields filled.

PARTIES - USE EXACT NAMES PROVIDED:
- Landlord: {details.get('landlord_name')}
- Tenant: {details.get('tenant_name')}
- Property Address: {details.get('property_address')}
- Lease Start Date: {details.get('lease_start')}
- Lease End Date: {details.get('lease_end')}
- Monthly Rent: {details.get('monthly_rent')}
- Security Deposit: {details.get('security_deposit')}

DOCUMENT REQUIREMENTS:
✓ Complete professional lease agreement
✓ Parties section with ACTUAL names and address above (no placeholders like [Name])
✓ All terms, conditions, rent payment, maintenance clauses
✓ Complete signature section with:
  - "LANDLORD: {details.get('landlord_name')}"
  - "TENANT: {details.get('tenant_name')}"
  - Date: 20th February 2026
✓ Professional formatting, jurisdiction: India
✓ ZERO brackets, ZERO placeholders, ZERO blanks, 100% READY TO PRINT
✓ NO witnesses section

OUTPUT: Start with title, include all sections, end with filled signature section (landlord and tenant only, no witnesses).""",

        'nda': f"""STRICT REQUIREMENT: Generate a COMPLETE professional Non-Disclosure Agreement (NDA) with NO placeholders, NO brackets, ALL fields filled.

PARTIES - USE EXACT NAMES PROVIDED:
- Disclosing Party: {details.get('disclosing_party')}
- Receiving Party: {details.get('receiving_party')}
- Effective Date: {details.get('effective_date')}
- Jurisdiction: {details.get('jurisdiction')}
- Term: {details.get('term_years')} years

DOCUMENT REQUIREMENTS:
✓ Complete professional NDA
✓ Parties section with ACTUAL names above (no placeholders like [Name])
✓ Definitions of confidential information, obligations, exclusions, return of information clauses
✓ Complete signature section with:
  - "DISCLOSING PARTY: {details.get('disclosing_party')}"
  - "RECEIVING PARTY: {details.get('receiving_party')}"
  - Date: 20th February 2026
✓ Professional formatting, jurisdiction: {details.get('jurisdiction')}
✓ ZERO brackets, ZERO placeholders, ZERO blanks, 100% READY TO PRINT
✓ Breach remedies and governing law included

OUTPUT: Start with title, include all sections, end with filled signature section (both parties only).""",

        'partnership_agreement': f"""STRICT REQUIREMENT: Generate a COMPLETE professional Partnership Agreement with NO placeholders, NO brackets, ALL fields filled.

PARTIES - USE EXACT NAMES PROVIDED:
- Partner One: {details.get('partner_one')}
- Partner Two: {details.get('partner_two')}
- Business Name: {details.get('business_name')}
- Business Address: {details.get('business_address')}
- Start Date: {details.get('start_date')}
- Profit Sharing: {details.get('profit_sharing')}
- Duration: {details.get('duration')}

DOCUMENT REQUIREMENTS:
✓ Complete professional partnership agreement
✓ Parties section with ACTUAL names and business details above (no placeholders like [Name])
✓ Capital contributions, profit/loss distribution, decision-making clauses
✓ Complete signature section with:
  - "PARTNER ONE: {details.get('partner_one')}"
  - "PARTNER TWO: {details.get('partner_two')}"
  - Date: 20th February 2026
✓ Professional formatting, jurisdiction: India
✓ ZERO brackets, ZERO placeholders, ZERO blanks, 100% READY TO PRINT
✓ NO witnesses section

OUTPUT: Start with title, include all sections, end with filled signature section (partners only, no witnesses).""",

        'service_agreement': f"""STRICT REQUIREMENT: Generate a COMPLETE professional Internet Service Agreement with ZERO placeholders, ZERO brackets, ALL fields 100% filled.

SERVICE PROVIDER (PREDEFINED - USE EXACTLY):
- Name: {SERVICE_PROVIDER['name']}
- Address: {SERVICE_PROVIDER['address']}
- Phone: {SERVICE_PROVIDER['phone']}
- Email: {SERVICE_PROVIDER['email']}
- Website: {SERVICE_PROVIDER['website']}
- Authorized Signatory: {SERVICE_PROVIDER['authorized_signatory']}
- Designation: {SERVICE_PROVIDER['designation']}

CLIENT DETAILS (USE USER-PROVIDED VALUES):
- Name: {details.get('client_name')}
- Full Address: {details.get('client_address')}
- Email: {details.get('client_email')}
- Phone: {details.get('client_phone')}

SERVICE SPECIFICATIONS (USE EXACT VALUES):
- Service Location: {details.get('service_location')}
- Plan Name: {details.get('plan_name')}
- Internet Speed: {details.get('service_speed')}
- Monthly Data Limit: {details.get('data_limit')}
- Installation Date: {details.get('installation_date')}

PAYMENT TERMS (FULLY FILLED):
- Monthly Service Fee: ₹{details.get('total_amount')}
- Advance Payment Required: ₹{details.get('advance_payment')}
- Payment Due Date: {details.get('remaining_due_date')}
- Payment Method: {details.get('payment_method')}

AGREEMENT DATES:
- Start Date: {details.get('agreement_start_date')}
- End Date: {details.get('agreement_end_date')}
- Jurisdiction: {details.get('jurisdiction')}

DOCUMENT REQUIREMENTS - STRICT RULES:
✓ Professional Service Agreement for internet connectivity
✓ Complete parties section with ACTUAL names (NO placeholders like [Name])
✓ Service specifications section with actual plan details
✓ Scope of services covering:
  - Service description and specifications
  - Internet speed guarantee
  - Data limit terms
  - Installation and activation process
✓ Payment Terms section including:
  - Monthly fee: ₹{details.get('total_amount')}
  - Advance: ₹{details.get('advance_payment')}
  - Payment method: {details.get('payment_method')}
  - Due dates and payment cycles
✓ Client Responsibilities:
  - Proper use of connection
  - Device maintenance
  - Password security
  - Compliance with laws
✓ Service Provider Responsibilities:
  - Service availability
  - Support and maintenance
  - Issue resolution timeline
✓ Confidentiality clause
✓ Disconnection and Termination terms
✓ Service SLA and specifications
✓ Dispute Resolution (Jurisdiction: {details.get('jurisdiction')})
✓ Governing Law: Indian Contract Act and Telecom Regulations
✓ Schedule A - Service Details (FULLY FILLED, NO BLANKS)
✓ Complete SIGNATURE SECTION with:
  - SERVICE PROVIDER: {SERVICE_PROVIDER['authorized_signatory']} ({SERVICE_PROVIDER['designation']})
  - CLIENT: {details.get('client_name')}
  - DATE: 20th February 2026
✗ NO WITNESSES SECTION - omit witness fields completely

OUTPUT RULES - CRITICAL:
✗ NO brackets anywhere []
✗ NO placeholders like [Your Name] or [fill in]
✗ NO blank lines or "enter here"
✗ NO missing information
✗ NO witnesses section at all
✓ 100% FULLY FILLED
✓ Professional tone
✓ Ready to download and print immediately
✓ No editing needed in MS Word

Generate the complete document starting from title, including all sections with actual data, ending with service provider and client signature section (WITHOUT any witnesses).""",

        'settlement_agreement': f"""STRICT REQUIREMENT: Generate a COMPLETE professional Settlement Agreement with NO placeholders, NO brackets, ALL fields filled.

PARTIES - USE EXACT NAMES PROVIDED:
- Party One: {details.get('party_one')}
- Party Two: {details.get('party_two')}
- Dispute Description: {details.get('dispute_description')}
- Settlement Amount: {details.get('settlement_amount')}
- Settlement Date: {details.get('settlement_date')}
- Confidentiality Required: {details.get('confidentiality_required')}

DOCUMENT REQUIREMENTS:
✓ Complete professional settlement agreement
✓ Parties section with ACTUAL names above (no placeholders like [Name])
✓ Release of claims, payment terms, confidentiality provisions clauses
✓ Complete signature section with:
  - "PARTY ONE: {details.get('party_one')}"
  - "PARTY TWO: {details.get('party_two')}"
  - Date: 20th February 2026
✓ Professional formatting, jurisdiction: India
✓ ZERO brackets, ZERO placeholders, ZERO blanks, 100% READY TO PRINT
✓ Non-disparagement and no admission of liability clauses included

OUTPUT: Start with title, include all sections, end with filled signature section (both parties only).""",

        'freelance_contract': f"""STRICT REQUIREMENT: Generate a COMPLETE professional Freelance Contract with NO placeholders, NO brackets, ALL fields filled.

PARTIES - USE EXACT NAMES PROVIDED:
- Freelancer: {details.get('freelancer_name')}
- Client: {details.get('client_name')}
- Project Description: {details.get('project_description')}
- Start Date: {details.get('start_date')}
- Deadline: {details.get('deadline')}
- Total Payment: {details.get('total_payment')}
- Milestone Payment: {details.get('milestone_payment')}

DOCUMENT REQUIREMENTS:
✓ Complete professional freelance contract
✓ Parties section with ACTUAL names and project details above (no placeholders like [Name])
✓ Scope of work, deliverables, revision terms, payment schedule clauses
✓ Complete signature section with:
  - "FREELANCER: {details.get('freelancer_name')}"
  - "CLIENT: {details.get('client_name')}"
  - Date: 20th February 2026
✓ Professional formatting, jurisdiction: India
✓ ZERO brackets, ZERO placeholders, ZERO blanks, 100% READY TO PRINT
✓ NO witnesses section

OUTPUT: Start with title, include all sections, end with filled signature section (freelancer and client only, no witnesses).""",

        'terms_of_service': f"""STRICT REQUIREMENT: Generate a COMPLETE professional Terms of Service with NO placeholders, NO brackets, ALL fields filled.

COMPANY DETAILS - USE EXACT VALUES PROVIDED:
- Company Name: {details.get('company_name')}
- Website/App URL: {details.get('website_url')}
- Effective Date: {details.get('effective_date')}
- Governing Law: {details.get('governing_law')}
- Minimum User Age: {details.get('minimum_age')} years

DOCUMENT REQUIREMENTS:
✓ Complete professional Terms of Service
✓ Company details section with ACTUAL names and URLs above (no placeholders like [Company Name])
✓ User obligations, prohibited activities, intellectual property rights clauses
✓ Disclaimer of warranties, limitation of liability, indemnification
✓ Account termination and user conduct policies
✓ Complete signature/acknowledgment section with:
  - Company: {details.get('company_name')}
  - Effective Date: {details.get('effective_date')}
  - Date: 20th February 2026
✓ Professional formatting, jurisdiction: {details.get('governing_law')}
✓ ZERO brackets, ZERO placeholders, ZERO blanks, 100% READY TO PRINT

OUTPUT: Start with title, include all sections with fully filled content, end with acknowledgment.""",

        'domicile_agreement': f"""STRICT REQUIREMENT: Generate a COMPLETE professional Domicile/Residency Agreement with NO placeholders, NO brackets, ALL fields filled.

PARTIES - USE EXACT NAMES PROVIDED:
- Resident: {details.get('resident_name')}
- Property Owner: {details.get('property_owner')}
- Property Address: {details.get('property_address')}
- Agreement Start Date: {details.get('start_date')}
- Monthly Fee: {details.get('monthly_fee')}
- Services Included: {details.get('services_included')}

DOCUMENT REQUIREMENTS:
✓ Complete professional domicile/residency agreement
✓ Parties section with ACTUAL names and property details above (no placeholders like [Name])
✓ Accommodation terms, services provided, house rules clauses
✓ Payment terms, duration, and termination conditions
✓ Responsibilities of both parties clearly defined
✓ Complete signature section with:
  - "RESIDENT: {details.get('resident_name')}"
  - "PROPERTY OWNER: {details.get('property_owner')}"
  - Date: 20th February 2026
✓ Professional formatting, jurisdiction: India
✓ ZERO brackets, ZERO placeholders, ZERO blanks, 100% READY TO PRINT
✓ NO witnesses section

OUTPUT: Start with title, include all sections, end with filled signature section (resident and owner only).""",
    }
    
    
    # Enforce global rule: absolutely forbid any witness-related language or common witness phrases
    no_witness_phrasing = "\n\nCRITICAL RULE: DO NOT INCLUDE ANY WITNESS-RELATED LANGUAGE. DO NOT USE THE WORDS 'WITNESS', 'WITNESSES', 'IN WITNESS WHEREOF', OR 'SIGNED IN THE PRESENCE OF'. THE DOCUMENT MUST NOT CONTAIN ANY REFERENCE TO WITNESSES."
    for k in list(prompts.keys()):
        prompts[k] = prompts[k] + no_witness_phrasing

    return prompts.get(doc_type, prompts['employment_contract'])

def clean_generated_text(text):
    """Clean and format the generated text"""
    # Remove markdown code blocks if present
    text = re.sub(r'^```\w*\n?', '', text)
    text = re.sub(r'\n?```$', '', text)
    
    # Clean up extra whitespace
    text = '\n'.join(line.strip() for line in text.split('\n'))
    
    return text.strip()

def create_docx_document(title, content, doc_type):
    """Create a formatted Word document"""
    doc = Document()
    
    # Set document margins
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)
    
    # Add header
    header = doc.add_paragraph()
    header_run = header.add_run("LEGAL DOCUMENT")
    header_run.bold = True
    header_run.font.size = Pt(8)
    header_run.font.color.rgb = RGBColor(128, 128, 128)
    header.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    # Add title
    title_para = doc.add_paragraph()
    title_run = title_para.add_run(title.upper())
    title_run.bold = True
    title_run.font.size = Pt(18)
    title_run.font.color.rgb = RGBColor(0, 51, 102)
    title_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title_para.space_after = Pt(12)
    
    # Add generated date
    date_para = doc.add_paragraph()
    date_run = date_para.add_run(f"Generated: {datetime.now().strftime('%B %d, %Y')}")
    date_run.font.size = Pt(9)
    date_run.font.color.rgb = RGBColor(128, 128, 128)
    date_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
    date_para.space_after = Pt(24)
    
    # Add horizontal line
    doc.add_paragraph("_" * 60)
    
    # Process content and add with formatting
    lines = content.split('\n')
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Check if line is a heading (contains keywords or ends with colon)
        is_heading = (
            line.isupper() or 
            line.endswith(':') or
            any(keyword in line.upper() for keyword in ['SECTION', 'ARTICLE', 'CLAUSE', 'PARTIES', 'TERMS', 'RECITALS', 'WHEREAS'])
        )
        
        if is_heading:
            # Add section heading
            para = doc.add_paragraph()
            run = para.add_run(line)
            run.bold = True
            run.font.size = Pt(12)
            run.font.color.rgb = RGBColor(0, 51, 102)
            para.space_before = Pt(12)
            para.space_after = Pt(6)
        else:
            # Add regular paragraph
            para = doc.add_paragraph(line)
            para.paragraph_format.line_spacing = 1.15
            para.paragraph_format.space_after = Pt(6)
            for run in para.runs:
                run.font.size = Pt(11)
    
    # Add signature section at the end
    doc.add_paragraph()
    sig_heading = doc.add_paragraph("SIGNATURES")
    sig_heading.runs[0].bold = True
    sig_heading.runs[0].font.size = Pt(12)
    sig_heading.runs[0].font.color.rgb = RGBColor(0, 51, 102)
    sig_heading.space_before = Pt(24)
    
    # Signature lines
    doc.add_paragraph()
    sig_table = doc.add_table(rows=2, cols=2)
    sig_table.style = 'Table Grid'
    
    # Party 1 signature
    sig_table.rows[0].cells[0].text = "_________________________\nSignature"
    sig_table.rows[1].cells[0].text = "_________________________\nPrinted Name & Date"
    
    # Party 2 signature  
    sig_table.rows[0].cells[1].text = "_________________________\nSignature"
    sig_table.rows[1].cells[1].text = "_________________________\nPrinted Name & Date"
    
    # Remove table borders for cleaner look
    for row in sig_table.rows:
        for cell in row.cells:
            cell.paragraphs[0].runs[0].font.size = Pt(10)
            tc = cell._tc
            tcPr = tc.get_or_add_tcPr()
            tcBorders = OxmlElement('w:tcBorders')
            for border_name in ['top', 'left', 'bottom', 'right']:
                border = OxmlElement(f'w:{border_name}')
                border.set(qn('w:val'), 'nil')
                tcBorders.append(border)
            tcPr.append(tcBorders)
    
    # Save to bytes
    doc_io = io.BytesIO()
    doc.save(doc_io)
    doc_io.seek(0)
    
    return doc_io

@app.route('/')
def home():
    """Home endpoint"""
    return jsonify({
        'message': 'LegalEase API - AI-Powered Legal Documentation Generator',
        'status': 'running',
        'version': '1.0.0',
        'endpoints': {
            'POST /generate': 'Generate legal document',
            'POST /download-doc': 'Download document as Word file',
            'GET /document-types': 'Get available document types'
        }
    })

@app.route('/document-types', methods=['GET'])
def get_document_types():
    """Get all available document types"""
    return jsonify({
        'success': True,
        'document_types': DOCUMENT_TYPES
    })

@app.route('/generate', methods=['POST'])
def generate_document():
    """Generate legal document using Gemini AI"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        doc_type = data.get('document_type')
        details = data.get('details', {})
        
        if not doc_type:
            return jsonify({
                'success': False,
                'error': 'Document type is required'
            }), 400
        
        if doc_type not in DOCUMENT_TYPES:
            return jsonify({
                'success': False,
                'error': f'Invalid document type. Available types: {list(DOCUMENT_TYPES.keys())}'
            }), 400
        
        # Validate required fields for the document type
        required_fields = DOCUMENT_TYPES[doc_type]['fields']
        missing_fields = [field for field in required_fields if not details.get(field)]
        
        if missing_fields:
            return jsonify({
                'success': False,
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400

        # Reject common placeholder/default values — enforce real user input
        placeholder_patterns = [r"\[.*\]", r"\benter\b", r"\byour\b", r"\bexample\b", r"\bname\b"]
        offending = []
        for field in required_fields:
            val = details.get(field)
            if isinstance(val, str):
                v = val.strip()
                # If value is empty (already handled) or clearly a placeholder, mark as offending
                if v == '' or any(re.search(pat, v, re.IGNORECASE) for pat in placeholder_patterns):
                    offending.append(field)

        if offending:
            return jsonify({
                'success': False,
                'error': 'Please provide actual values for required fields (do not use placeholders like [Name] or "enter here"): ' + ", ".join(offending)
            }), 400
        
        # Generate the prompt
        prompt = generate_legal_prompt(doc_type, details)
        
        # Call Gemini API with comprehensive error handling
        try:
            response = model.generate_content(prompt)
            
            if not response or not response.text:
                return jsonify({
                    'success': False,
                    'error': 'Failed to generate document content. The model returned an empty response.'
                }), 500
            
            # Clean and format the generated text
            document_text = clean_generated_text(response.text)
            # Post-generation sanitization: remove any bracketed placeholders and specific unwanted addresses
            # Especially ensure employment contracts do not contain user-supplied placeholder addresses
            if doc_type == 'employment_contract':
                # Remove any bracketed placeholders like [Fictional Parent Name]
                document_text = re.sub(r"\[.*?\]", "", document_text)
                # Remove specific known unwanted address pattern if present
                document_text = document_text.replace('No. 123, Gandhi Nagar, Ballari, Karnataka, India - 58310', '')
                document_text = document_text.replace('Gandhi Nagar, Ballari, Karnataka, India - 58310', '')
                # Clean up multiple spaces/newlines introduced by removals
                document_text = re.sub(r"\n{2,}", "\n\n", document_text)
                document_text = re.sub(r" {2,}", " ", document_text)
            
        except Exception as api_error:
            error_message = str(api_error)
            print(f"Gemini API Error: {error_message}")
            
            # Provide detailed error feedback based on error type
            if '404' in error_message:
                return jsonify({
                    'success': False,
                    'error': 'Model not found. The Gemini model is currently unavailable. Please check your API key and try again.'
                }), 503
            elif (
                'authentication' in error_message.lower() or
                'api_key' in error_message.lower() or
                'api key' in error_message.lower() or
                'api_key_invalid' in error_message.lower()
            ):
                return jsonify({
                    'success': False,
                    'error': 'Gemini API authentication failed. Please set a valid GEMINI_API_KEY in backend/.env and restart backend.'
                }), 401
            elif 'rate_limit' in error_message.lower() or '429' in error_message:
                return jsonify({
                    'success': False,
                    'error': 'Rate limit exceeded. Please wait a moment and try again.'
                }), 429
            else:
                return jsonify({
                    'success': False,
                    'error': f'Error generating document: {error_message}'
                }), 500
        
        # Create document metadata
        doc_title = DOCUMENT_TYPES[doc_type]['name']
        
        return jsonify({
            'success': True,
            'document_type': doc_type,
            'document_title': doc_title,
            'document_text': document_text,
            'generated_at': datetime.now().isoformat(),
            'message': 'Document generated successfully'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Error generating document: {str(e)}'
        }), 500

@app.route('/download-doc', methods=['POST'])
def download_document():
    """Generate and download document as Word file"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        doc_type = data.get('document_type')
        document_text = data.get('document_text')
        
        if not doc_type or not document_text:
            return jsonify({
                'success': False,
                'error': 'Document type and document text are required'
            }), 400
        
        if doc_type not in DOCUMENT_TYPES:
            return jsonify({
                'success': False,
                'error': 'Invalid document type'
            }), 400
        
        # Create Word document
        doc_title = DOCUMENT_TYPES[doc_type]['name']
        doc_io = create_docx_document(doc_title, document_text, doc_type)
        
        # Generate filename
        timestamp = datetime.now().strftime('%Y%m%d')
        filename = f"LegalEase_{doc_type.replace('_', '-').title()}_{timestamp}.docx"
        
        return send_file(
            doc_io,
            mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            as_attachment=True,
            download_name=filename
        )
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Error creating document: {str(e)}'
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
