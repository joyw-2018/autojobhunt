export interface FactVariants {
  standard: string;
  metric_focused?: string | null;
  architecture_focused?: string | null;
  leadership_focused?: string | null;
}

export interface FactBlock {
  id: string;
  company: string;
  role: string;
  date_range: string;
  project_context: string;
  category: string;
  sub_category: string;
  refined_text: string;
  variants: FactVariants;
  tech_stack: string[];
  metrics: string[];
  is_locked: boolean;
  is_verified: boolean;
  personal_notes?: string | null;
  source_resume_ids: string[];
  raw_source_snippets: string[];
  created_at: string;
  updated_at: string;
}

export interface ResumeMetadata {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
  status: 'UPLOADED' | 'PARSED' | 'EXTRACTED' | 'ERROR';
  character_count: number;
  extracted_fact_count: number;
  error_message?: string | null;
}

export interface FactCreatePayload {
  company: string;
  role: string;
  date_range: string;
  project_context?: string;
  category: string;
  sub_category: string;
  refined_text: string;
  tech_stack: string[];
  metrics: string[];
  personal_notes?: string;
}

export interface FactUpdatePayload {
  company?: string;
  role?: string;
  date_range?: string;
  project_context?: string;
  category?: string;
  sub_category?: string;
  refined_text?: string;
  tech_stack?: string[];
  metrics?: string[];
  is_locked?: boolean;
  personal_notes?: string;
}

export interface AppStats {
  total_resumes: number;
  total_facts: number;
  locked_facts: number;
  unique_companies: number;
  unique_tech_count: number;
  categories_breakdown: Record<string, number>;
}
