import * as React from 'react';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { TeamSwitcher } from '@/components/team-switcher';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import {
  BellRingIcon,
  BoxesIcon,
  CpuIcon,
  LayoutDashboardIcon,
  WarehouseIcon,
} from 'lucide-react';

const data = {
  user: {
    name: 'Esteban Ledezma',
    email: 'estebanlt@email.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Monitoreo de racks',
      logo: <WarehouseIcon />,
      plan: 'Enterprise',
    },
  ],
  navMain: [
    {
      title: 'Dashboard',
      url: '/',
      icon: <LayoutDashboardIcon />,
    },
    {
      title: 'Racks',
      url: '/racks',
      icon: <BoxesIcon />,
    },
    {
      title: 'Dispositivos',
      url: '/devices',
      icon: <CpuIcon />,
    },
    {
      title: 'Alarmas',
      url: '/alarms',
      icon: <BellRingIcon />,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
