import {render,screen} from "@testing-library/react";
import MemoryPage from "../MemoryPage";
import {vi} from "vitest";
vi.mock("@/lib/auth",()=>({useAuth:()=>({client:{getAccessToken:vi.fn().mockResolvedValue("token")}})}));
vi.mock("@/lib/api",()=>({memoryApi:vi.fn().mockResolvedValue([])}));
vi.mock("shivanya-ui",()=>({Button:({children,...p}:any)=><button {...p}>{children}</button>,Input:(p:any)=><input {...p}/>,Typography:({children}:any)=><span>{children}</span>}));
test("renders notes",()=>{render(<MemoryPage resource="notes"/>);expect(screen.getByText("Notes")).toBeInTheDocument();expect(screen.getByPlaceholderText("Search notes...")).toBeInTheDocument();});