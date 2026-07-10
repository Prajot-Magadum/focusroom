const supabase = require('../config/supabase');

async function verifyToken(token) {
  if (!token) return null;

  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return null;
    }

    return data.user;
  } catch {
    return null;
  }
}

module.exports = verifyToken;