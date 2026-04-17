import { CenteredLayout } from './CenteredLayout';
import { SidebarLayout } from './SidebarLayout';
import { TopStepperLayout } from './TopStepperLayout';
import type { LayoutProps } from './types';

export function LayoutShell(props: LayoutProps): React.ReactNode {
  switch (props.schema.layout.template) {
    case 'top-stepper':
      return <TopStepperLayout {...props} />;
    case 'sidebar-left':
      return <SidebarLayout {...props} />;
    case 'centered':
      return <CenteredLayout {...props} />;
    default:
      return <CenteredLayout {...props} />;
  }
}
