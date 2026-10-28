import { useState } from "react";
import { Button } from "../../../components/ui/Button";
import { AddCareerDialog } from "./AddCareerDialog";

/** "Add career" button that opens the create-draft dialog. */
export function AddCareerButton({ label = "Add career" }: { label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>{label}</Button>
      <AddCareerDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
