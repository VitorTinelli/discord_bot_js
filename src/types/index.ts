// Database types for Supabase
export interface Story {
  id: string;
  user_id: string;
  username: string;
  titulo: string;
  conteudo: string;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      stories: {
        Row: Story;
        Insert: Omit<Story, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Story, 'id' | 'user_id'>>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export interface CommandHandler {
  name: string;
  description: string;
  execute: (interaction: any) => Promise<void>;
}
