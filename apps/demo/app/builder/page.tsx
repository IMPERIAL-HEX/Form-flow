import { BuilderClient } from './BuilderClient';

export const metadata = {
  title: 'FormFlow — Visual Builder',
  description: 'Drag-and-drop builder that emits FormFlow schema JSON.',
};

export default function BuilderPage(): React.ReactNode {
  return <BuilderClient />;
}
