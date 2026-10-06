"use client";
import {AuthModal,AuthProvider as SDKAuthProvider,useAuth as useSDKAuth} from "shivanya-auth";
import {useState,type ReactNode} from "react";
const authUrl=process.env.NEXT_PUBLIC_AUTH_URL||"http://localhost:8001";
const apiPrefix=process.env.NEXT_PUBLIC_AUTH_API_PREFIX||"api/v1";
export function AuthProvider({children}:{children:ReactNode}){return <SDKAuthProvider config={{baseUrl:authUrl,apiPrefix,mode:"token",authUrl}}>{children}</SDKAuthProvider>;}
export const useAuth=useSDKAuth;
export function AuthGuard({children}:{children:ReactNode}){const {loading,isAuthenticated}=useSDKAuth();const [open,setOpen]=useState(true);if(loading)return <div className="memory-loading">Loading Memory...</div>;if(!isAuthenticated)return <AuthModal open={open} onClose={()=>setOpen(true)} initialView="login" onAuthenticated={()=>setOpen(false)} features={["login","register","register-email","forgot","account"]} />;return <>{children}</>;}
