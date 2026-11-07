import { createFileRoute } from "@tanstack/react-router";
import { AuthGateError, requireSignedIn } from "@/components/auth/AuthGate";

// ทุกหน้าที่อยู่ใต้ src/routes/_authed/ ต้องเข้าสู่ระบบก่อน (URL ไม่มี "_authed")
export const Route = createFileRoute("/_authed")({
  ssr: false,
  beforeLoad: requireSignedIn,
  errorComponent: AuthGateError,
});