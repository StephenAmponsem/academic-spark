import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for real-time features
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://nhuxwgmafdjchljvqlna.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5odXh3Z21hZmRqY2hsanZxbG5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MDI5MDMsImV4cCI6MjA2ODk3ODkwM30.snzV6ynuEOY2HETjoxzKyfMzSl_pE9UW6jIDydsoSe4";

const supabase = createClient(supabaseUrl, supabaseKey);

export interface RealtimeMessage {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  conversation_id: string;
  message_type?: 'text' | 'file' | 'image' | 'voice';
  file_url?: string;
  created_at: string;
}

export interface UserPresence {
  user_id: string;
  user_name: string;
  status: 'online' | 'offline' | 'busy';
  last_seen: string;
  avatar_url?: string;
  subjects?: string[];
  is_instructor?: boolean;
}

export interface StudyGroupUpdate {
  id: string;
  name: string;
  description: string;
  subject: string;
  members_count: number;
  max_members: number;
  meeting_time?: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
}

export interface HelpRequestUpdate {
  id: string;
  title: string;
  description: string;
  subject: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'open' | 'in-progress' | 'resolved';
  created_by: string;
  responses_count: number;
  created_at: string;
}

export interface VideoCall {
  id: string;
  room_id: string;
  title: string;
  host_id: string;
  participants: string[];
  is_active: boolean;
  started_at: string;
  ended_at?: string;
}

export interface VoiceCall {
  id: string;
  caller_id: string;
  receiver_id: string;
  status: 'ringing' | 'answered' | 'ended' | 'missed';
  started_at: string;
  ended_at?: string;
  duration_seconds: number;
}

class RealtimeService {
  private static instance: RealtimeService;
  private subscriptions: Map<string, ReturnType<typeof supabase.channel>['subscribe']> = new Map();

  private constructor() {}

  public static getInstance(): RealtimeService {
    if (!RealtimeService.instance) {
      RealtimeService.instance = new RealtimeService();
    }
    return RealtimeService.instance;
  }

  // Real-time messaging
  public subscribeToMessages(conversationId: string, callback: (message: RealtimeMessage) => void) {
    console.log(`🔗 Subscribing to messages for conversation: ${conversationId}`);
    
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
          console.log('📨 New message received:', payload.new);
          callback(payload.new as RealtimeMessage);
        }
      )
      .subscribe((status) => {
        console.log(`🔗 Messages subscription status: ${status}`);
      });

    this.subscriptions.set(`messages:${conversationId}`, subscription);
    return subscription;
  }

  // User presence
  public subscribeToPresence(callback: (presence: UserPresence) => void) {
    console.log('🔗 Subscribing to user presence updates');
    
    const subscription = supabase
      .channel('user_presence')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'user_presence'
        }, 
        (payload) => {
          console.log('👤 Presence update received:', payload.new);
          callback(payload.new as UserPresence);
        }
      )
      .subscribe((status) => {
        console.log(`🔗 Presence subscription status: ${status}`);
      });

    this.subscriptions.set('user_presence', subscription);
    return subscription;
  }

  // Study groups updates
  public subscribeToStudyGroups(callback: (update: StudyGroupUpdate) => void) {
    console.log('🔗 Subscribing to study groups updates');
    
    const subscription = supabase
      .channel('study_groups')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'study_groups'
        }, 
        (payload) => {
          console.log('👥 Study group update received:', payload.new);
          callback(payload.new as StudyGroupUpdate);
        }
      )
      .subscribe((status) => {
        console.log(`🔗 Study groups subscription status: ${status}`);
      });

    this.subscriptions.set('study_groups', subscription);
    return subscription;
  }

  // Help requests updates
  public subscribeToHelpRequests(callback: (update: HelpRequestUpdate) => void) {
    console.log('🔗 Subscribing to help requests updates');
    
    const subscription = supabase
      .channel('help_requests')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'help_requests'
        }, 
        (payload) => {
          console.log('🆘 Help request update received:', payload.new);
          callback(payload.new as HelpRequestUpdate);
        }
      )
      .subscribe((status) => {
        console.log(`🔗 Help requests subscription status: ${status}`);
      });

    this.subscriptions.set('help_requests', subscription);
    return subscription;
  }

  // Video calls updates
  public subscribeToVideoCalls(callback: (call: VideoCall) => void) {
    console.log('🔗 Subscribing to video calls updates');
    
    const subscription = supabase
      .channel('video_calls')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'video_calls'
        }, 
        (payload) => {
          console.log('📹 Video call update received:', payload.new);
          callback(payload.new as VideoCall);
        }
      )
      .subscribe((status) => {
        console.log(`🔗 Video calls subscription status: ${status}`);
      });

    this.subscriptions.set('video_calls', subscription);
    return subscription;
  }

  // Voice calls updates
  public subscribeToVoiceCalls(callback: (call: VoiceCall) => void) {
    console.log('🔗 Subscribing to voice calls updates');
    
    const subscription = supabase
      .channel('voice_calls')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'voice_calls'
        }, 
        (payload) => {
          console.log('📞 Voice call update received:', payload.new);
          callback(payload.new as VoiceCall);
        }
      )
      .subscribe((status) => {
        console.log(`🔗 Voice calls subscription status: ${status}`);
      });

    this.subscriptions.set('voice_calls', subscription);
    return subscription;
  }

  // Send message
  public async sendMessage(message: Omit<RealtimeMessage, 'id' | 'created_at'>) {
    try {
      console.log('📤 Sending message:', message);
      
      const { data, error } = await supabase
        .from('messages')
        .insert([message])
        .select()
        .single();

      if (error) {
        console.error('❌ Error sending message:', error);
        throw error;
      }
      
      console.log('✅ Message sent successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Error sending message:', error);
      throw error;
    }
  }

  // Update user presence
  public async updatePresence(presence: Partial<UserPresence> & { user_id: string }) {
    try {
      console.log('👤 Updating presence:', presence);
      
      const { data, error } = await supabase
        .from('user_presence')
        .upsert([presence])
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating presence:', error);
        throw error;
      }
      
      console.log('✅ Presence updated successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Error updating presence:', error);
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
      console.log('🆘 Creating help request:', request);
      
      const { data, error } = await supabase
        .from('help_requests')
        .insert([request])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating help request:', error);
        throw error;
      }
      
      console.log('✅ Help request created successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Error creating help request:', error);
      throw error;
    }
  }

  // Join study group
  public async joinStudyGroup(groupId: string, userId: string) {
    try {
      console.log(`👥 Joining study group: ${groupId} for user: ${userId}`);
      
      const { data, error } = await supabase
        .from('study_group_members')
        .insert([{ group_id: groupId, user_id: userId }])
        .select()
        .single();

      if (error) {
        console.error('❌ Error joining study group:', error);
        throw error;
      }
      
      console.log('✅ Successfully joined study group:', data);
      return data;
    } catch (error) {
      console.error('❌ Error joining study group:', error);
      throw error;
    }
  }

  // Leave study group
  public async leaveStudyGroup(groupId: string, userId: string) {
    try {
      console.log(`👥 Leaving study group: ${groupId} for user: ${userId}`);
      
      const { error } = await supabase
        .from('study_group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Error leaving study group:', error);
        throw error;
      }
      
      console.log('✅ Successfully left study group');
      return true;
    } catch (error) {
      console.error('❌ Error leaving study group:', error);
      throw error;
    }
  }

  // Create study group
  public async createStudyGroup(group: {
    name: string;
    description: string;
    subject: string;
    max_members?: number;
    meeting_time?: string;
    created_by: string;
  }) {
    try {
      console.log('👥 Creating study group:', group);
      
      const { data, error } = await supabase
        .from('study_groups')
        .insert([group])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating study group:', error);
        throw error;
      }
      
      console.log('✅ Study group created successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Error creating study group:', error);
      throw error;
    }
  }

  // Create video call
  public async createVideoCall(call: {
    room_id: string;
    title: string;
    host_id: string;
  }) {
    try {
      console.log('📹 Creating video call:', call);
      
      const { data, error } = await supabase
        .from('video_calls')
        .insert([call])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating video call:', error);
        throw error;
      }
      
      console.log('✅ Video call created successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Error creating video call:', error);
      throw error;
    }
  }

  // Create voice call
  public async createVoiceCall(call: {
    caller_id: string;
    receiver_id: string;
  }) {
    try {
      console.log('📞 Creating voice call:', call);
      
      const { data, error } = await supabase
        .from('voice_calls')
        .insert([call])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating voice call:', error);
        throw error;
      }
      
      console.log('✅ Voice call created successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Error creating voice call:', error);
      throw error;
    }
  }

  // Update voice call status
  public async updateVoiceCallStatus(callId: string, status: 'answered' | 'ended' | 'missed') {
    try {
      console.log(`📞 Updating voice call ${callId} status to: ${status}`);
      
      const { data, error } = await supabase
        .from('voice_calls')
        .update({ 
          status,
          ended_at: status === 'ended' || status === 'missed' ? new Date().toISOString() : null
        })
        .eq('id', callId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating voice call status:', error);
        throw error;
      }
      
      console.log('✅ Voice call status updated successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Error updating voice call status:', error);
      throw error;
    }
  }

  // Get online users
  public async getOnlineUsers() {
    try {
      console.log('👤 Fetching online users');
      
      const { data, error } = await supabase
        .from('user_presence')
        .select('*')
        .eq('status', 'online')
        .order('last_seen', { ascending: false });

      if (error) {
        console.error('❌ Error fetching online users:', error);
        throw error;
      }
      
      console.log('✅ Online users fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Error fetching online users:', error);
      throw error;
    }
  }

  // Get study groups
  public async getStudyGroups(subject?: string) {
    try {
      console.log('👥 Fetching study groups', subject ? `for subject: ${subject}` : '');
      
      let query = supabase
        .from('study_groups')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (subject) {
        query = query.eq('subject', subject);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching study groups:', error);
        throw error;
      }
      
      console.log('✅ Study groups fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Error fetching study groups:', error);
      throw error;
    }
  }

  // Get help requests
  public async getHelpRequests(status?: string) {
    try {
      console.log('🆘 Fetching help requests', status ? `with status: ${status}` : '');
      
      let query = supabase
        .from('help_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching help requests:', error);
        throw error;
      }
      
      console.log('✅ Help requests fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Error fetching help requests:', error);
      throw error;
    }
  }

  // Unsubscribe from all channels
  public unsubscribeAll() {
    console.log('🔗 Unsubscribing from all channels');
    this.subscriptions.forEach((subscription, key) => {
      subscription.unsubscribe();
      console.log(`🔗 Unsubscribed from ${key}`);
    });
    this.subscriptions.clear();
  }

  // Unsubscribe from specific channel
  public unsubscribe(channelName: string) {
    const subscription = this.subscriptions.get(channelName);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(channelName);
      console.log(`🔗 Unsubscribed from ${channelName}`);
    }
  }
}

export const realtimeService = RealtimeService.getInstance(); 