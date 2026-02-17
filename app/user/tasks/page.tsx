import { Metadata } from "next";
import UserTasksClient from "./UserTasksClient";

export const metadata: Metadata = {
  title: "Available Tasks | VBond",
  description: "Browse and pick tasks to earn rewards.",
};

export default function UserTasksPage() {
  return <UserTasksClient />;
}