export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/projects/:path*",
    "/tasks/:path*",
    "/timesheet/:path*",
    "/team/:path*",
    "/analytics/:path*",
    "/settings/:path*",
  ],
};