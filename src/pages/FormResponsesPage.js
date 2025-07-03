import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function FormResponsesPage() {
  const { id } = useParams();
  const [responses, setResponses] = useState([]);
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const URL = process.env.REACT_APP_URL || "http://localhost:5000";

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`${URL}/api/forms/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setForm(res.data))
      .catch(() => setError("Form not found or not authorized"));

    axios
      .get(`${URL}/api/responses/form/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setResponses(res.data.responses))
      .catch(() => setError("Not authorized or no responses"));
  }, [id]);

  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h2 className="text-2xl font-semibold mb-4">
        Responses for: {form?.title}
      </h2>
      {responses.length === 0 ? (
        <div>No responses yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Respondent</th>
                {form?.elements.map((el) => (
                  <th key={el.id} className="px-4 py-2 border">
                    {el.label}
                  </th>
                ))}
                <th className="px-4 py-2 border">Submitted At</th>
              </tr>
            </thead>
            <tbody>
              {responses.map((resp) => (
                <tr key={resp._id}>
                  <td className="border px-4 py-2">
                    {resp.respondent
                      ? `${resp.respondent.name} (${resp.respondent.email})`
                      : "Anonymous"}
                  </td>
                  {form?.elements.map((el) => {
                    const answer = resp.responses.find(
                      (r) => r.elementId === el.id
                    );
                    return (
                      <td key={el.id} className="border px-4 py-2">
                        {answer ? answer.value : ""}
                      </td>
                    );
                  })}
                  <td className="border px-4 py-2">
                    {new Date(resp.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
