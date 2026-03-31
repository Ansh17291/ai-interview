import { redirect } from "next/navigation";
import PricingPage from "@/components/PricingPage";
import { getCurrentUser } from "@/lib/actions/auth.action";

const Page = async () => {
  const user = await getCurrentUser();

  if (!user || !user.id) {
    redirect("/sign-in");
  }

  return (
    <PricingPage
      userId={user.id}
      userEmail={user.email}
      userName={user.name || "User"}
    />
  );
};

export default Page;
