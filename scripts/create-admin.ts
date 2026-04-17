import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdmin() {
  const email = 'melissakrizoa@zino.ci';
  const password = 'ZFitSpa_Admin_7756';

  const { data, error } = await supabase.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
    user_metadata: { role: 'admin' }
  });

  if (error) {
    console.error('Error creating user:', error.message);
    process.exit(1);
  }

  console.log(`User created successfully: ${data.user.id}`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
}

createAdmin();
