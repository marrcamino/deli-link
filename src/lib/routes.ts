import { CalendarDays, CalendarSearch, House, Users } from "@lucide/svelte/icons";

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
  }
]