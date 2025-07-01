import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const [publicForms, setPublicForms] = useState([]);
  const [myForms, setMyForms] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    // Get user profile
    axios
      .get("http://localhost:5000/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data))
      .catch(() => setUser(null));

    // Get public forms (for all users)
    axios
      .get("http://localhost:5000/api/forms/public")
      .then((res) => setPublicForms(res.data))
      .catch(() => setPublicForms([]));

    // Get my forms (for creators)
    if (token) {
      axios
        .get("http://localhost:5000/api/forms", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setMyForms(res.data))
        .catch(() => setMyForms([]));
    }
  }, [loading]);

  // Publish handler
  const handlePublish = async (formId) => {
    const token = localStorage.getItem("token");
    try {
      setLoading(true);
      await axios.put(
        `http://localhost:5000/api/forms/${formId}`,
        { status: "published" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLoading(false);
    } catch (err) {
      setLoading(false);
      alert(
        err.response?.data?.message ||
          "Failed to publish the form. Try again."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Welcome{user ? `, ${user.name}` : ""}!
        </h2>

        {/* For creators: My Forms */}
        {user && (
          <div className="mb-10">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-semibold">My Forms</h3>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => navigate("/generate")}
              >
                + Generate Form with AI
              </button>
            </div>
            {myForms.length === 0 ? (
              <div className="text-gray-500">You have not created any forms yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded shadow">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 border">Title</th>
                      <th className="px-4 py-2 border">Status</th>
                      <th className="px-4 py-2 border">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myForms.map((form) => (
                      <tr key={form._id}>
                        <td className="border px-4 py-2">{form.title}</td>
                        <td className="border px-4 py-2">{form.status}</td>
                        <td className="border px-4 py-2">
                          <button
                            className="text-blue-600 underline mr-4"
                            onClick={() => navigate(`/form/${form._id}/responses`)}
                          >
                            See Responses
                          </button>
                          <button
                            className="text-green-600 underline mr-4"
                            onClick={() => navigate(`/form/${form._id}`)}
                          >
                            Fill Form
                          </button>
                          {form.status === "draft" && (
                            <button
                              className="text-yellow-600 underline"
                              disabled={loading}
                              onClick={() => handlePublish(form._id)}
                            >
                              {loading ? "Publishing..." : "Publish"}
                            </button>
                          )}
                          <button
                            className="text-indigo-600 underline"
                            onClick={() => {
                              const publicUrl = `${window.location.origin}/form/${form._id}`;
                              navigator.clipboard.writeText(publicUrl);
                              alert("Public link copied to clipboard!");
                            }}
                          >
                            Copy Public Link
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* For all users: Public Forms */}
        <div>
          <h3 className="text-xl font-semibold mb-2">Available Forms</h3>
          {publicForms.length === 0 ? (
            <div className="text-gray-500">No public forms available.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded shadow">
                <thead>
                  <tr>
                    <th className="px-4 py-2 border">Title</th>
                    <th className="px-4 py-2 border">Description</th>
                    <th className="px-4 py-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {publicForms.map((form) => (
                    <tr key={form._id}>
                      <td className="border px-4 py-2">{form.title}</td>
                      <td className="border px-4 py-2">{form.description}</td>
                      <td className="border px-4 py-2">
                        <button
                          className="text-green-600 underline"
                          onClick={() => navigate(`/form/${form._id}`)}
                        >
                          Fill Form
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}