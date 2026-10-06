import {render,screen} from "@testing-library/react";
import {AuthGuard} from "@/lib/auth";
import {vi} from "vitest";
const mock=vi.hoisted(()=>({auth:{loading:false,isAuthenticated:false}}));
vi.mock("shivanya-auth",()=>({AuthProvider:({children}:any)=>children,useAuth:()=>mock.auth,AuthModal:({open}:any)=>open?<div role="dialog">Login</div>:null}));
test("shows login modal instead of redirecting",()=>{render(<AuthGuard><div>Private</div></AuthGuard>);expect(screen.getByRole("dialog")).toHaveTextContent("Login");expect(screen.queryByText("Private")).not.toBeInTheDocument();});