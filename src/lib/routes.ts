import { CalendarDays, CalendarSearch, House, Users, FileCheck, FlaskConical, FileClock } from "@lucide/svelte/icons";

export const ROUTES = [
  // MAIN
  {
    name: "Main",
    routes: [
      {
        title: "Home",
        url: "/",
        icon: House,
      },
      {
        title: "User List",
        url: "/users",
        icon: Users,
      },
    ]
  },

  // APPLICATIONS
  {
    name: "Applications",
    routes: [
      {
        title: "Leave Application",
        url: "/leave",
        icon: FileCheck,
      },
      {
        title: "Pass Slip",
        url: "/pass-slip",
        icon: FileClock,
      }
    ]
  },

  // ATTENDANCE
  {
    name: "Attendance",
    routes: [
      {
        title: "Logs",
        url: "/logs",
        icon: CalendarSearch,
      },
      {
        title: "DTR",
        url: "/dtr",
        icon: CalendarDays,
      },
    ]
  },
  {
    routes: [
      {
        title: "Test",
        url: "/test",
        icon: FlaskConical,
      },

    ]
  }
]