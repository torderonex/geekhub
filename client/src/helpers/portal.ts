import { PropsWithChildren, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps extends PropsWithChildren {
  element?: HTMLElement | null;
}

export default function Portal({ children, element }: PortalProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setContainer(element || document.body);
  }, [element]);

  return container ? createPortal(children, container) : null;
}
