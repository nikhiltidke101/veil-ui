"use client";

import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { RemoveScroll } from "react-remove-scroll";
import { useId, useControlledState, useComposeRefs } from "@repo/core/hooks";

import {
  Scope,
  composeEventHandlers,
  createContextScope,
} from "@repo/core/primitives";
import { Portal as PortalPrimitive } from "@repo/core/components";

import { DialogContextValue, DialogProps } from "./dialog.types";

const DIALOG_NAME = "Dialog";
const DIALOG_ROOT_NAME = "DialogRoot";
function getState(open: boolean) {
  return open ? "open" : "closed";
}

const [createDialogContext, createDialogScope] =
  createContextScope(DIALOG_NAME);

const [DialogProvider, useDialogContext] =
  createDialogContext<DialogContextValue>(DIALOG_ROOT_NAME);

type ScopedProps<P> = P & { __scopeDialog?: Scope };

export const Dialog: React.FC<DialogProps> = (
  props: ScopedProps<DialogProps>
) => {
  const {
    __scopeDialog,
    children,
    open: openProp,
    defaultOpen,
    onOpenChange,
    modal = true,
  } = props;
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  // update
  const contentRef = React.useRef<any>(null);
  const [open = false, setOpen] = useControlledState({
    prop: openProp,
    defaultProp: defaultOpen,
    onChange: onOpenChange,
  });

  return (
    <DialogProvider
      scope={__scopeDialog}
      triggerRef={triggerRef}
      contentRef={contentRef}
      contentId={useId()}
      titleId={useId()}
      descriptionId={useId()}
      open={open}
      onOpenChange={setOpen}
      onOpenToggle={React.useCallback(
        () => setOpen((prevOpen) => !prevOpen),
        [setOpen]
      )}
      modal={modal}
    >
      {children}
    </DialogProvider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * DialogTrigger
 * -----------------------------------------------------------------------------------------------*/

const TRIGGER_NAME = "DialogTrigger";

type DialogTriggerElement = React.ElementRef<"button">;
type PrimitiveButtonProps = React.ComponentProps<"button">;
interface DialogTriggerProps extends PrimitiveButtonProps {}

export const DialogTrigger = React.forwardRef<
  DialogTriggerElement,
  DialogTriggerProps
>((props: ScopedProps<DialogTriggerProps>, forwardedRef) => {
  const { __scopeDialog, ...triggerProps } = props;

  const context = useDialogContext(TRIGGER_NAME, __scopeDialog);
  const composedTriggerRef = useComposeRefs(forwardedRef, context.triggerRef);

  return (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-expanded={context.open}
      aria-controls={context.contentId}
      data-state={getState(context.open)}
      {...triggerProps}
      ref={composedTriggerRef}
      onClick={composeEventHandlers(props.onClick, context.onOpenToggle)}
    />
  );
});

DialogTrigger.displayName = TRIGGER_NAME;

/* -------------------------------------------------------------------------------------------------
 * DialogPortal
 * -----------------------------------------------------------------------------------------------*/

const PORTAL_NAME = "DialogPortal";

type PortalContextValue = { forceMount?: true };
const [PortalProvider, usePortalContext] =
  createDialogContext<PortalContextValue>(PORTAL_NAME, {
    forceMount: undefined,
  });

type PortalProps = React.ComponentPropsWithoutRef<typeof PortalPrimitive>;
interface DialogPortalProps {
  children?: React.ReactNode;
  /**
   * Specify a container element to portal the content into.
   */
  container?: PortalProps["container"];
  /**
   * Used to force mounting when more control is needed. Useful when
   * controlling animation with React animation libraries.
   */
  forceMount?: true;
}

export const DialogPortal: React.FC<DialogPortalProps> = (
  props: ScopedProps<DialogPortalProps>
) => {
  const { __scopeDialog, forceMount, children, container } = props;
  const context = useDialogContext(PORTAL_NAME, __scopeDialog);
  return (
    <PortalProvider scope={__scopeDialog} forceMount={forceMount}>
      {React.Children.map(children, (child) => (
        <PortalPrimitive asChild container={container}>
          {child}
        </PortalPrimitive>
      ))}
    </PortalProvider>
  );
};

DialogPortal.displayName = PORTAL_NAME;

/* -------------------------------------------------------------------------------------------------
 * DialogOverlay
 * -----------------------------------------------------------------------------------------------*/

const OVERLAY_NAME = "DialogOverlay";

type DialogOverlayElement = DialogOverlayImplElement;
interface DialogOverlayProps extends DialogOverlayImplProps {
  /**
   * Used to force mounting when more control is needed. Useful when
   * controlling animation with React animation libraries.
   */
  forceMount?: true;
}

export const DialogOverlay = React.forwardRef<
  DialogOverlayElement,
  DialogOverlayProps
>((props: ScopedProps<DialogOverlayProps>, forwardedRef) => {
  const portalContext = usePortalContext(OVERLAY_NAME, props.__scopeDialog);
  const { forceMount = portalContext.forceMount, ...overlayProps } = props;
  const context = useDialogContext(OVERLAY_NAME, props.__scopeDialog);

  return context.modal ? (
    // <Presence present={forceMount || context.open}>
    <DialogOverlayImpl {...overlayProps} ref={forwardedRef} />
  ) : // </Presence>
  null;
});

DialogOverlay.displayName = OVERLAY_NAME;

type DialogOverlayImplElement = React.ElementRef<"div">;
type PrimitiveDivProps = React.ComponentPropsWithoutRef<"div">;
interface DialogOverlayImplProps extends PrimitiveDivProps {}

const DialogOverlayImpl = React.forwardRef<
  DialogOverlayImplElement,
  DialogOverlayImplProps
>((props: ScopedProps<DialogOverlayImplProps>, forwardedRef) => {
  const { __scopeDialog, ...overlayProps } = props;
  const context = useDialogContext(OVERLAY_NAME, __scopeDialog);
  return (
    // Make sure `Content` is scrollable even when it doesn't live inside `RemoveScroll`
    // ie. when `Overlay` and `Content` are siblings
    <RemoveScroll as={Slot} allowPinchZoom shards={[context.contentRef]}>
      <div
        data-state={getState(context.open)}
        {...overlayProps}
        ref={forwardedRef}
        // We re-enable pointer-events prevented by `Dialog.Content` to allow scrolling the overlay.
        style={{ pointerEvents: "auto", ...overlayProps.style }}
      />
    </RemoveScroll>
  );
});
