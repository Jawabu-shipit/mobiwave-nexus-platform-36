
export interface MenuNode {
  id: string;
  text: string;
  options: string[];
  isEndNode: boolean;
}

export interface USSDApplication {
  id: string;
  service_code: string;
  menu_structure: MenuNode[];
  callback_url: string;
  status: string;
  subscription_id?: string;
  mspace_application_id?: string;
  setup_fee?: number;
  monthly_fee?: number;
  created_at?: string;
}

export interface USSDSession {
  id: string;
  session_id: string;
  application_id: string;
  phone_number: string;
  current_node_id: string;
  input_path: string[];
  navigation_path: string[];
  created_at: string;
  updated_at?: string;
  application?: {
    service_code: string;
    menu_structure: MenuNode[];
  };
}

export interface SessionStep {
  nodeId: string;
  input?: string;
  timestamp: number;
}

export interface NavigationResult {
  success: boolean;
  nextNodeId?: string;
  error?: string;
  sessionEnded?: boolean;
}

export interface AnalyticsData {
  totalSessions: number;
  uniqueUsers: number;
  avgSessionDuration: number;
  topMenuPaths: Array<{
    path: string;
    count: number;
  }>;
  completionRate: number;
  peakHours: Array<{
    hour: number;
    sessions: number;
  }>;
}
