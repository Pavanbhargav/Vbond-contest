import ReviewClient from "./ReviewClient";

export async function generateMetadata({ params }: { params: { taskId: string } }) {
  return {
    title: `Review Submissions | VBond Admin`,
  };
}

export default function ReviewPage() {
 
  return <ReviewClient  />;
}
