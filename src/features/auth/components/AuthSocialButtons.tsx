import { Apple } from "lucide-react";
import { Button } from "../../../components/ui/Button";

export default function AuthSocialButtons() {
  return (
    <>
      <div className="my-5 flex items-center gap-3 text-xs text-grey-500">
        <span className="h-px flex-1 bg-grey-200" />
        OR
        <span className="h-px flex-1 bg-grey-200" />
      </div>
      <div className="grid gap-3">
        <Button isPrimary={false} className="w-full gap-2">
          <span className="font-bold text-[#4285f4]">G</span>
          Continue with Google
        </Button>
        <Button isPrimary={false} className="w-full gap-2">
          <Apple className="size-4 fill-current" aria-hidden />
          Continue with Apple
        </Button>
      </div>
    </>
  );
}
