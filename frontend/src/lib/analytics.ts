export type MemoryAnalyticsEvent="memory_view"|"memory_create"|"memory_update"|"memory_delete"|"memory_search"|"memory_auth";
export function trackMemoryEvent(event:MemoryAnalyticsEvent,payload:Record<string,unknown>={}){if(typeof window==="undefined")return;window.dispatchEvent(new CustomEvent("shivanya:analytics",{detail:{event,payload,app:"memory",timestamp:Date.now()}}));}
