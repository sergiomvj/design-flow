export type RequestStatus = 'RECEIVED' | 'CREATING' | 'REVIEW' | 'APPROVAL' | 'PRODUCTION' | 'COMPLETED';

export interface DesignRequest {
  id: string;
  status: RequestStatus;
  requester: {
    fullName: string;
    company: string;
    email: string;
    department: string;
    contactMethod: 'Secure Email' | 'Internal Messaging' | 'Direct Dial';
  };
  scope: {
    type: 'Brand Identity' | 'Digital UI' | 'Print Media' | 'Motion Assets';
    objectives: string[];
  };
  narrative: {
    brief: string;
    headlines: string;
    message: string;
  };
  technical: {
    dimensions: string;
    unit: 'Pixels (px)' | 'Millimeters (mm)' | 'Inches (in)';
    quantity: number;
    format: 'High-Resolution PDF' | 'Vector (SVG/EPS)' | 'Web-Optimized JPG';
    finishing: string;
  };
  timeline: {
    deliveryDate: string;
    urgency: 'Standard Flow' | 'Urgent' | 'Critical';
    eventDate: string;
  };
}

export type UserRole = 'designer' | 'admin' | 'solicitante';

export interface Comment {
  id: string;
  requestId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  content: string;
  timestamp: string;
}

export interface Metric {
  label: string;
  value: number | string;
  highlight?: boolean;
}

export interface HistoryItem {
  id: string;
  title: string;
  dueDate: string;
  status: string;
  statusColor: string;
}
