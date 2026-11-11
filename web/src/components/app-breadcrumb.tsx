import { Fragment, type ComponentType } from 'react';
import { Link, useMatches } from 'react-router';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export interface RouteHandle {
  crumb?: string | ComponentType;
}

export function AppBreadcrumb() {
  const crumbs = useMatches().flatMap(({ id, pathname, handle }) => {
    const crumb = (handle as RouteHandle | undefined)?.crumb;
    return crumb ? { id, pathname, crumb } : [];
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map(({ id, pathname, crumb: Crumb }, index) => {
          const label = typeof Crumb === 'string' ? Crumb : <Crumb />;

          return (
            <Fragment key={id}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {index === crumbs.length - 1 ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link to={pathname} />}>{label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
