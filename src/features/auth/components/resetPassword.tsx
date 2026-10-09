import SendEmailComponent from "./sendEmail";
import EmailSentComponent from "./emailSent";
import { useState } from "react";

export default function ResetPasswordComponent() {
  const [isEmailSent, setIsEmailSent] = useState(false);

  return (
    <div className="flex w-full h-full items-center justify-center">
      {isEmailSent ? (
        <EmailSentComponent setIsEmailSent={setIsEmailSent} />
      ) : (
        <SendEmailComponent setisEmailSent={setIsEmailSent} />
      )}
    </div>
  );
}
