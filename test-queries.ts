import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials in .env')
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function runTest() {
  console.log('Testing Ranking Query...')
  const { data: rankingData, error: rankingError } = await supabase
    .from('palpites')
    .select('user_id, pontos, profiles!inner(nome, avatar_url)')
  
  console.log('Ranking Error:', rankingError)
  console.log('Ranking Data:', rankingData)

  console.log('\nTesting Profile Fetch...')
  // We don't have the current user's session, so we can't test RLS from the perspective of an authenticated user easily without logging in.
  // But we can check if the profile table is accessible anonymously (which it is, for public ranking).
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .limit(1)
  
  console.log('Profile Error:', profileError)
  console.log('Profile Data:', profileData)
}

runTest()
