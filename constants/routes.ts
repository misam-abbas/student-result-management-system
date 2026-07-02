export const APP_NAME = "Student Result Management System";
export const INSTITUTE_NAME = "Institute of Technology & Sciences";

export const ROUTES = {
  home: "/",
  student: "/student",
  adminLogin: "/admin/login",
  adminDashboard: "/admin/dashboard",
  adminStudents: "/admin/students",
  adminStudentNew: "/admin/students/new",
  hodLogin: "/hod/login",
  hodDashboard: "/hod/dashboard",
} as const;

/** Route prefixes requiring an ADMIN session (checked in middleware). */
export const ADMIN_PROTECTED_PREFIX = "/admin";
export const ADMIN_LOGIN_PATH = "/admin/login";

/** Route prefixes requiring an HOD session (checked in middleware). */
export const HOD_PROTECTED_PREFIX = "/hod";
export const HOD_LOGIN_PATH = "/hod/login";

export const HOD_PASSING_THRESHOLD = 60;

export const DEFAULT_PAGE_SIZE = 10;

export const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", href: ROUTES.adminDashboard, icon: "LayoutDashboard" },
  { label: "Students", href: ROUTES.adminStudents, icon: "Users" },
] as const;
