"use client";
import { AuthProvider as SDKAuthProvider, useAuth as useSDKAuth } from "shivanya-auth";
import type { ReactNode } from "react";
const authUrl=process.env.NEXT_PUBLIC_AUTH_URL||"http://localhost:8001";
const apiPrefix=process.env.NEXT_PUBLIC_AUTH_API_PREFIX||"api/v1";
export function AuthProvider({children}:{children:ReactNode}){return <SDKAuthProvider config={{baseUrl:authUrl,apiPrefix,mode:"token",authUrl}}>{children}</SDKAuthProvider>;}
export const useAuth=useSDKAuth;
export function AuthGuard({children}:{children:ReactNode}){const {loading,isAuthenticated}=useSDKAuth();if(loading)return <div className="memory-loading">Loading Memory...</div>;if(!isAuthenticated){if(typeof window!=="undefined")window.location.assign(authUrl+"?next="+encodeURIComponent(window.location.href));return null;}return <>{children}</>;}
