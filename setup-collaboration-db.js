// Setup Collaboration Database Tables
// Run this script to create all necessary collaboration tables in Supabase

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = "https://nhuxwgmafdjchljvqlna.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5odXh3Z21hZmRqY2hsanZxbG5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MDI5MDMsImV4cCI6MjA2ODk3ODkwM30.snzV6ynuEOY2HETjoxzKyfMzSl_pE9UW6jIDydsoSe4";

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔗 Setting up collaboration database tables...');

async function setupCollaborationTables() {
  try {
    console.log('📊 Checking existing tables...');
    
    // Test connection
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Database connection failed:', testError.message);
      return;
    }
    
    console.log('✅ Database connection successful!');
    
    // Create collaboration tables using SQL
    const tables = [
      {
        name: 'messages',
        sql: `
          CREATE TABLE IF NOT EXISTS public.messages (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            content TEXT NOT NULL,
            sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            sender_name TEXT NOT NULL,
            conversation_id TEXT NOT NULL,
            message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image', 'voice')),
            file_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: 'user_presence',
        sql: `
          CREATE TABLE IF NOT EXISTS public.user_presence (
            user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            user_name TEXT NOT NULL,
            status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'busy')),
            last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            avatar_url TEXT,
            subjects TEXT[],
            is_instructor BOOLEAN DEFAULT FALSE,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: 'study_groups',
        sql: `
          CREATE TABLE IF NOT EXISTS public.study_groups (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            description TEXT,
            subject TEXT NOT NULL,
            max_members INTEGER DEFAULT 10,
            meeting_time TEXT,
            is_active BOOLEAN DEFAULT TRUE,
            created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: 'study_group_members',
        sql: `
          CREATE TABLE IF NOT EXISTS public.study_group_members (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            group_id UUID REFERENCES public.study_groups(id) ON DELETE CASCADE,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            role TEXT DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
            UNIQUE(group_id, user_id)
          );
        `
      },
      {
        name: 'help_requests',
        sql: `
          CREATE TABLE IF NOT EXISTS public.help_requests (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            subject TEXT NOT NULL,
            urgency TEXT DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high')),
            status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'resolved')),
            created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            assigned_to UUID REFERENCES auth.users(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: 'help_request_responses',
        sql: `
          CREATE TABLE IF NOT EXISTS public.help_request_responses (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            request_id UUID REFERENCES public.help_requests(id) ON DELETE CASCADE,
            responder_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            content TEXT NOT NULL,
            is_solution BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: 'video_calls',
        sql: `
          CREATE TABLE IF NOT EXISTS public.video_calls (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            room_id TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            participants JSONB DEFAULT '[]',
            is_active BOOLEAN DEFAULT TRUE,
            started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            ended_at TIMESTAMP WITH TIME ZONE
          );
        `
      },
      {
        name: 'voice_calls',
        sql: `
          CREATE TABLE IF NOT EXISTS public.voice_calls (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            caller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            status TEXT DEFAULT 'ringing' CHECK (status IN ('ringing', 'answered', 'ended', 'missed')),
            started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            ended_at TIMESTAMP WITH TIME ZONE,
            duration_seconds INTEGER DEFAULT 0
          );
        `
      },
      {
        name: 'shared_resources',
        sql: `
          CREATE TABLE IF NOT EXISTS public.shared_resources (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title TEXT NOT NULL,
            description TEXT,
            file_url TEXT,
            file_type TEXT,
            file_size INTEGER,
            shared_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            group_id UUID REFERENCES public.study_groups(id) ON DELETE CASCADE,
            is_public BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      }
    ];

    console.log('🔨 Creating collaboration tables...');
    
    for (const table of tables) {
      try {
        console.log(`📋 Creating table: ${table.name}`);
        
        // Try to create the table using RPC
        const { error } = await supabase.rpc('exec_sql', { sql: table.sql });
        
        if (error) {
          console.log(`⚠️  Table ${table.name} might already exist or creation failed:`, error.message);
        } else {
          console.log(`✅ Table ${table.name} created successfully`);
        }
        
        // Test if table exists by trying to select from it
        const { error: testError } = await supabase
          .from(table.name)
          .select('count')
          .limit(1);
        
        if (testError) {
          console.log(`❌ Table ${table.name} is not accessible:`, testError.message);
        } else {
          console.log(`✅ Table ${table.name} is accessible`);
        }
        
      } catch (error) {
        console.log(`❌ Error with table ${table.name}:`, error.message);
      }
    }
    
    console.log('🎉 Collaboration database setup completed!');
    console.log('📝 Note: Some tables might need to be created manually in the Supabase dashboard');
    console.log('🔗 Visit: https://supabase.com/dashboard/project/nhuxwgmafdjchljvqlna/editor');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

// Run the setup
setupCollaborationTables(); 