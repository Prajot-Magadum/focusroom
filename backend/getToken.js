import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const { data, error } = await supabase.auth.signInWithPassword({
  email: "kddd@gmail.com",
  password: "123456789",
});

if (error) {
  console.error(error);
} else {
  console.log("Access Token:\n");
  console.log(data.session.access_token);
}