import { ArrowRightRegular } from "@mingcute/react/core-regular";
import { useState } from "react";
import { SkillButton } from "./SkillButton";
import { Modal } from "../../../components/ui/Modal";
import type { SkillCheckCareerSummary } from "../skillCheck.types";
import { CareerPicker } from "./CareerPicker";

export function CareerPickerDialog({
  open,
  careers,
  initialCareerId,
  onClose,
  onConfirm,
}: {
  open: boolean;
  careers: SkillCheckCareerSummary[];
  initialCareerId: string | null;
  onClose: () => void;
  onConfirm: (careerId: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(initialCareerId);

  return (
    <Modal open={open} onClose={onClose} title="Choose a career to check" className="max-w-140">
      <CareerPicker
        careers={careers}
        value={selected}
        onChange={setSelected}
        name="career-to-check"
        groupHeadings
      />
      <p className="text-sm leading-5 text-grey-600">
        Checking another career makes it your active pathway. Your progress on the others
        stays saved.
      </p>
      <div className="flex gap-3">
        <SkillButton isPrimary={false} className="flex-1" onClick={onClose}>
          Cancel
        </SkillButton>
        <SkillButton
          className="flex-1"
          disabled={!selected}
          onClick={() => selected && onConfirm(selected)}
        >
          Check this career
          <ArrowRightRegular aria-hidden className="size-5" />
        </SkillButton>
      </div>
    </Modal>
  );
}
