import { redirect } from "next/navigation";

import InterviewOptions from "@/components/interview/InterviewOptions";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getUserSubscription } from "@/lib/actions/payment.action";

const Page = async () => {
  const user = await getCurrentUser();

  // Ensure user is logged in and has an ID before proceeding
  if (!user || !user.id) {
    redirect("/sign-in");
  }

  // Check if user has premium access
  const subscriptionStatus = await getUserSubscription(user.id);
  
  if (!subscriptionStatus.success || !subscriptionStatus.isPremium) {
    redirect("/pricing?feature=interview");
  }

  return (
    <div className="container mx-auto py-10">
      <InterviewOptions 
        userId={user.id}
        userName={user.name ?? "Anonymous"}
      />
    </div>
  );
};

export default Page;
