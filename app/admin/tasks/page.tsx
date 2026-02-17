import { Metadata } from "next";
import TasksClient from "./TasksClient";

export const metadata: Metadata = {
  title: "Task Management | Admin",
  description: "Manage system tasks and assignments",
};

export default function TasksPage() {
  return <TasksClient />;
}