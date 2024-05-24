import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  DialogTrigger,
} from "@repo/ui/dialog";

export default function Page(): JSX.Element {
  return (
    <main>
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogPortal>
          <DialogOverlay></DialogOverlay>
        </DialogPortal>
      </Dialog>
    </main>
  );
}
