import { CalendarDays, CalendarSearch, House, Users, FileCheck, FlaskConical } from "@lucide/svelte/icons";

export const ROUTES = [
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

  {
    name: "Application",
    routes: [
      {
        title: "Wellness Leave",
        url: "/leave",
        icon: FileCheck,
      }
    ]
  },
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