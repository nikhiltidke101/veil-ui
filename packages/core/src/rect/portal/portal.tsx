import * as React from "react";
import ReactDOM from "react-dom";
import { Slot } from "@radix-ui/react-slot";

/* -------------------------------------------------------------------------------------------------
 * Portal
 * -----------------------------------------------------------------------------------------------*/

const PORTAL_NAME = "Portal";

type PortalElement = React.ElementRef<"div">;
type PrimitiveDivProps = React.ComponentPropsWithoutRef<"div">;
interface PortalProps extends PrimitiveDivProps {
  /**
   * An optional container where the portaled content should be appended.
   */
  container?: HTMLElement | null;
  asChild?: boolean;
}

const Portal = React.forwardRef<PortalElement, PortalProps>(
  (props, forwardedRef) => {
    const {
      container = globalThis?.document?.body,
      asChild,
      ...portalProps
    } = props;
    const Comp = asChild ? Slot : "div";

    return container
      ? ReactDOM.createPortal(
          <Comp {...portalProps} ref={forwardedRef} />,
          container
        )
      : null;
  }
);

Portal.displayName = PORTAL_NAME;

/* -----------------------------------------------------------------------------------------------*/

const Root = Portal;

export { Portal, Root };
export type { PortalProps };
