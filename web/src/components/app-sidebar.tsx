import * as React from 'react';

import { useActiveAlarmsCount } from '@/app/alarms/hooks/use-active-alarms-count';
import { AppBrand } from '@/components/app-brand';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
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
} from 'lucide-react';

const data = {
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
  const activeAlarms = useActiveAlarmsCount();
  const navItems = data.navMain.map((item) =>
    item.url === '/alarms' ? { ...item, badge: activeAlarms } : item,
  );

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AppBrand />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
