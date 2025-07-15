require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Thông tin user test
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const email = 'trietcrt.pnc@gmail.com';
const password = 'test123';

if (!supabaseUrl || !supabaseKey) {
  console.error('Vui lòng khai báo SUPABASE_URL, SUPABASE_ANON_KEY trong file .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.error('Login error:', error);
    return;
  }
  if (!data.session) {
    console.error('No session returned!');
    return;
  }
  console.log('Your JWT (access token):\n', data.session.access_token);
}

main(); 