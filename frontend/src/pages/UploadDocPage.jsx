import { useState, useEffect } from "react";
import UploadDoc from "../components/UploadDoc";
import { useNavigate } from "react-router-dom"; // your existing component

const departmentsList = [
  "Engineering",
  "Procurement",
  "HR",
  "Finance",
  "Legal & Compliance",
];

function UploadDocPage() {
  const [priority, setPriority] = useState("medium");
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [userId, setUserId] = useState("");
  const navigate = useNavigate();

  // Example: fetch userId from localStorage/session/context
  useEffect(() => {
    const storedUser = localStorage.getItem("userId") || "guest-user";
    setUserId(storedUser);
  }, []);

  const handleDepartmentChange = (dept) => {
    setSelectedDepartments((prev) =>
      prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept]
    );
  };

  const handleSubmit = () => {
    console.log("Submitting metadata:", {
      userId,
      priority,
      departments: selectedDepartments,
    });

    navigate("/dashboard");
    // you can send this metadata along with the file in UploadDoc
  };

  return (
    <div className="max-w-3xl min-h-[115vh] mx-auto p-6">
      <h1 className="text-2xl font-bold text-primary mb-6">Upload Documents</h1>

      {/* User ID Display */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          User ID
        </label>
        <input
          type="text"
          value={userId}
          disabled
          className="w-full rounded-lg border border-neutral-300 p-2 bg-neutral-100 text-neutral-600"
        />
      </div>

      {/* Priority Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Priority
        </label>
        <div className="flex gap-3">
          {["low", "medium", "high"].map((p) => (
            <button
              key={p}
              onClick={() => setPriority(p)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                priority === p
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-neutral-700 border-neutral-300 hover:border-accent"
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Department Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Departments
        </label>
        <div className="grid grid-cols-2 gap-2">
          {departmentsList.map((dept) => (
            <label
              key={dept}
              className="flex items-center gap-2 p-2 rounded-lg border border-neutral-300 cursor-pointer hover:bg-accent/10"
            >
              <input
                type="checkbox"
                checked={selectedDepartments.includes(dept)}
                onChange={() => handleDepartmentChange(dept)}
                className="form-checkbox text-primary"
              />
              <span>{dept}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Upload Component */}
      <UploadDoc />

      {/* Submit Button */}
      <div className="mt-6 text-right">
        <button
          onClick={handleSubmit}
          className="px-6 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
        >
          Submit
        </button>
      </div>
    </div>
  );
}

export default UploadDocPage;
