import {z} from "zod";
export const emailSchema=z.string().trim().email().max(254).transform(v=>v.toLowerCase());
export const passwordSchema=z.string().min(10).max(128);
export const registerSchema=z.object({email:emailSchema,password:passwordSchema,name:z.string().trim().min(2).max(100).optional()});
export const loginSchema=z.object({email:emailSchema,password:z.string().min(1).max(128)});
export const messageSchema=z.object({message:z.string().trim().min(1).max(8000),conversationId:z.string().uuid().optional()});
