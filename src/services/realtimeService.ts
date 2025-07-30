import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for real-time features
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export interface RealtimeMessage {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  conversation_id: string;
  created_at: string;
}

export interface UserPresence {
  user_id: string;
  user_name: string;
  status: 'online' | 'offline' | 'busy';
  last_seen: string;
  avatar_url?: string;
}

export interface StudyGroupUpdate {
  id: string;
  name: string;
  members_count: number;
  last_activity: string;
  is_active: boolean;
}

export interface HelpRequestUpdate {
  id: string;
  title: string;
  status: 'open' | 'in-progress' | 'resolved';
  responses_count: number;
  updated_at: string;
}

class RealtimeService {
  private static instance: RealtimeService;
  private subscriptions: Map<string, any> = new Map();

  private constructor() {}

  public static getInstance(): RealtimeService {
    if (!RealtimeService.instance) {
      RealtimeService.instance = new RealtimeService();
    }
    return RealtimeService.instance;
  }

  // Real-time messaging
  public subscribeToMessages(conversationId: string, callback: (message: RealtimeMessage) => void) {
    const subscription = supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        }, 
        (payload) => {
          callback(payload.new as RealtimeMessage);
        }
      )
      .subscribe();

    this.subscriptions.set(`messages:${conversationId}`, subscription);
    return subscription;
  }

  // User presence
  public subscribeToPresence(callback: (presence: UserPresence) => void) {
    const subscription = supabase
      .channel('user_presence')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'user_presence'
        }, 
        (payload) => {
          callback(payload.new as UserPresence);
        }
      )
      .subscribe();

    this.subscriptions.set('user_presence', subscription);
    return subscription;
  }

  // Study groups updates
  public subscribeToStudyGroups(callback: (update: StudyGroupUpdate) => void) {
    const subscription = supabase
      .channel('study_groups')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'study_groups'
        }, 
        (payload) => {
          callback(payload.new as StudyGroupUpdate);
        }
      )
      .subscribe();

    this.subscriptions.set('study_groups', subscription);
    return subscription;
  }

  // Help requests updates
  public subscribeToHelpRequests(callback: (update: HelpRequestUpdate) => void) {
    const subscription = supabase
      .channel('help_requests')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'help_requests'
        }, 
        (payload) => {
          callback(payload.new as HelpRequestUpdate);
        }
      )
      .subscribe();

    this.subscriptions.set('help_requests', subscription);
    return subscription;
  }

  // Send message
  public async sendMessage(message: Omit<RealtimeMessage, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([message])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Update user presence
  public async updatePresence(presence: Partial<UserPresence> & { user_id: string }) {
    try {
      const { data, error } = await supabase
        .from('user_presence')
        .upsert([presence])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating presence:', error);
      throw error;
    }
  }

  // Create help request
  public async createHelpRequest(request: {
    title: string;
    description: string;
    subject: string;
    urgency: 'low' | 'medium' | 'high';
    created_by: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('help_requests')
        .insert([request])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating help request:', error);
      throw error;
    }
  }

  // Join study group
  public async joinStudyGroup(groupId: string, userId: string) {
    try {
      const { data, error } = await supabase
        .from('study_group_members')
        .insert([{ group_id: groupId, user_id: userId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error joining study group:', error);
      throw error;
    }
  }

  // Unsubscribe from all channels
  public unsubscribeAll() {
    this.subscriptions.forEach((subscription, key) => {
      subscription.unsubscribe();
      console.log(`Unsubscribed from ${key}`);
    });
    this.subscriptions.clear();
  }

  // Unsubscribe from specific channel
  public unsubscribe(channelName: string) {
    const subscription = this.subscriptions.get(channelName);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(channelName);
      console.log(`Unsubscribed from ${channelName}`);
    }
  }
}

export const realtimeService = RealtimeService.getInstance(); 