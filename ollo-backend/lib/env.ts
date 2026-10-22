import "server-only";
function required(name:string){const v=process.env[name];if(!v)throw new Error(`Missing environment variable: ${name}`);return v;}
export const env={supabaseUrl:required("NEXT_PUBLIC_SUPABASE_URL"),supabaseAnonKey:required("NEXT_PUBLIC_SUPABASE_ANON_KEY"),supabaseServiceKey:required("SUPABASE_SERVICE_ROLE_KEY"),juremaBaseUrl:required("JUREMA_API_BASE_URL").replace(/\/$/,""),juremaApiKey:required("JUREMA_API_KEY"),juremaModel:process.env.JUREMA_MODEL||"Jurema-br/Jurema-7B",appUrl:process.env.APP_URL||"http://localhost:3000"};
