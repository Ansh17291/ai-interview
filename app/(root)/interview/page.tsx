import { redirect } from "next/navigation";

import Agent from "@/components/Agent";
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
    <>
      <h3>Interview generation</h3>

      <Agent
        userName={user.name ?? "Anonymous"}
        userId={user.id}
        type="generate"
        interviewId={""} />
    </>
  );
};

export default Page;
