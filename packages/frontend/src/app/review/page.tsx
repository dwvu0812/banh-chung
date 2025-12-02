import { Suspense } from "react";
import ReviewClient from "./ReviewClient";

function ReviewLoading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-2 border-current border-t-transparent" />
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<ReviewLoading />}>
      <ReviewClient />
    </Suspense>
  );
}
