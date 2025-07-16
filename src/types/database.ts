export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_url: string | null;
          role: 'admin' | 'developer' | 'viewer';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          avatar_url?: string | null;
          role?: 'admin' | 'developer' | 'viewer';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          avatar_url?: string | null;
          role?: 'admin' | 'developer' | 'viewer';
          created_at?: string;
          updated_at?: string;
        };
      };
      teams: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          color: string;
          status: 'active' | 'maintenance' | 'archived';
          created_by: string;
          team_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          color?: string;
          status?: 'active' | 'maintenance' | 'archived';
          created_by: string;
          team_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          color?: string;
          status?: 'active' | 'maintenance' | 'archived';
          created_by?: string;
          team_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      integrations: {
        Row: {
          id: string;
          project_id: string;
          type: string;
          name: string;
          config: any;
          status: 'connected' | 'disconnected' | 'error';
          last_sync: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          type: string;
          name: string;
          config?: any;
          status?: 'connected' | 'disconnected' | 'error';
          last_sync?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          type?: string;
          name?: string;
          config?: any;
          status?: 'connected' | 'disconnected' | 'error';
          last_sync?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          project_id: string;
          integration_id: string;
          type: 'critical' | 'warning' | 'info' | 'success';
          category: 'infrastructure' | 'ci_cd' | 'security' | 'database' | 'application';
          service: string;
          title: string;
          description: string;
          severity: number;
          metadata: any;
          tags: string[];
          is_read: boolean;
          resolved: boolean;
          resolved_at: string | null;
          resolved_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          integration_id: string;
          type: 'critical' | 'warning' | 'info' | 'success';
          category: 'infrastructure' | 'ci_cd' | 'security' | 'database' | 'application';
          service: string;
          title: string;
          description: string;
          severity?: number;
          metadata?: any;
          tags?: string[];
          is_read?: boolean;
          resolved?: boolean;
          resolved_at?: string | null;
          resolved_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          integration_id?: string;
          type?: 'critical' | 'warning' | 'info' | 'success';
          category?: 'infrastructure' | 'ci_cd' | 'security' | 'database' | 'application';
          service?: string;
          title?: string;
          description?: string;
          severity?: number;
          metadata?: any;
          tags?: string[];
          is_read?: boolean;
          resolved?: boolean;
          resolved_at?: string | null;
          resolved_by?: string | null;
          created_at?: string;
        };
      };
    };
  };
}