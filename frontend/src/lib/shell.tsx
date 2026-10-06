"use client";
import Link from "next/link";
import {DashboardShell,ShellProvider} from "shivanya-shell";
import {usePathname} from "next/navigation";
import type {ReactNode} from "react";
const navigation=[["Dashboard","/dashboard"],["Notes","/notes"],["Tasks","/tasks"],["Lists","/lists"],["Goals","/goals"],["Routines","/routines"],["Reminders","/reminders"],["Tags","/tags"],["Favorites","/favorites"],["Archive","/archive"],["Trash","/trash"],["Settings","/settings"]];
export function MemoryShell({children}:{children:ReactNode}){const pathname=usePathname();return <ShellProvider><DashboardShell branding={{name:"Memory",subtitle:"ShivanyaMS",href:"/dashboard"}} pathname={pathname} linkComponent={Link} navigation={navigation.map(([label,href])=>({label,href}))}>{children}</DashboardShell></ShellProvider>;}
