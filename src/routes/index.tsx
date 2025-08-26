import { createFileRoute } from "@tanstack/react-router";
import { AttendanceDashboard } from "../components/AttendanceDashboard";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  return (
    <div className="container mx-auto px-4 py-8">
      <AttendanceDashboard />
    </div>
  );
}
