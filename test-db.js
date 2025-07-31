import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://nhuxwgmafdjchljvqlna.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5odXh3Z21hZmRqY2hsanZxbG5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MDI5MDMsImV4cCI6MjA2ODk3ODkwM30.snzV6ynuEOY2HETjoxzKyfMzSl_pE9UW6jIDydsoSe4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testDatabaseSetup() {
    console.log('🔍 Testing Database Setup...\n');

    // Test 1: Check if profiles table exists
    console.log('1. Testing profiles table...');
    try {
        const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('*')
            .limit(1);
        
        if (profilesError) {
            console.log('❌ Profiles table error:', profilesError.message);
        } else {
            console.log('✅ Profiles table exists and is accessible');
        }
    } catch (error) {
        console.log('❌ Profiles table test failed:', error.message);
    }

    // Test 2: Check if user_settings table exists
    console.log('\n2. Testing user_settings table...');
    try {
        const { data: settingsData, error: settingsError } = await supabase
            .from('user_settings')
            .select('*')
            .limit(1);
        
        if (settingsError) {
            console.log('❌ User settings table error:', settingsError.message);
        } else {
            console.log('✅ User settings table exists and is accessible');
        }
    } catch (error) {
        console.log('❌ User settings table test failed:', error.message);
    }

    // Test 3: Check if external_courses table exists
    console.log('\n3. Testing external_courses table...');
    try {
        const { data: coursesData, error: coursesError } = await supabase
            .from('external_courses')
            .select('*')
            .limit(1);
        
        if (coursesError) {
            console.log('❌ External courses table error:', coursesError.message);
        } else {
            console.log('✅ External courses table exists and is accessible');
            if (coursesData && coursesData.length > 0) {
                console.log('   📚 Found sample courses:', coursesData.length);
            }
        }
    } catch (error) {
        console.log('❌ External courses table test failed:', error.message);
    }

    // Test 4: Check if enrolled_courses table exists
    console.log('\n4. Testing enrolled_courses table...');
    try {
        const { data: enrollmentsData, error: enrollmentsError } = await supabase
            .from('enrolled_courses')
            .select('*')
            .limit(1);
        
        if (enrollmentsError) {
            console.log('❌ Enrolled courses table error:', enrollmentsError.message);
        } else {
            console.log('✅ Enrolled courses table exists and is accessible');
        }
    } catch (error) {
        console.log('❌ Enrolled courses table test failed:', error.message);
    }

    // Test 5: Test sign-up process
    console.log('\n5. Testing sign-up process...');
    try {
        const testEmail = 'test-' + Date.now() + '@example.com';
        const testPassword = 'testpassword123';
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
            options: {
                data: {
                    full_name: 'Test User',
                    role: 'student',
                },
            },
        });
        
        if (signUpError) {
            console.log('❌ Sign-up failed:', signUpError.message);
        } else {
            console.log('✅ Sign-up successful!');
            console.log('   📧 Check email for confirmation');
            console.log('   👤 User ID:', signUpData.user?.id);
        }
    } catch (error) {
        console.log('❌ Sign-up test failed:', error.message);
    }

    // Test 6: Test profile creation manually
    console.log('\n6. Testing manual profile creation...');
    try {
        const testUserId = '00000000-0000-0000-0000-000000000000';
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: testUserId,
                full_name: 'Test Profile',
                role: 'student'
            })
            .select();
        
        if (profileError) {
            console.log('❌ Manual profile creation failed:', profileError.message);
        } else {
            console.log('✅ Manual profile creation successful!');
        }
    } catch (error) {
        console.log('❌ Manual profile creation test failed:', error.message);
    }

    console.log('\n🏁 Database setup test completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Check the test results above');
    console.log('2. If any tests failed, run the fix_database_setup.sql script in Supabase');
    console.log('3. Try the sign-up process in your application');
}

// Run the test
testDatabaseSetup().catch(console.error); 