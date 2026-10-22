import "server-only";import {createClient} from "@supabase/supabase-js";import {env} from "@/lib/env";
export const supabaseAdmin=createClient(env.supabaseUrl,env.supabaseServiceKey,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
