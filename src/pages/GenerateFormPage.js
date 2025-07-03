import React, { useState } from "react";
import axios from "axios";
import FormPreview from "../components/FormPreview";

export default function GenerateFormPage() {
  const [prompt, setPrompt] = useState("");
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError("");
    setForm(null);
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${URL}/api/forms/generate`,
        { prompt },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setForm(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate form");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-lg mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          Generate Form with AI
        </h2>
        <form onSubmit={handleGenerate}>
          <label className="block mb-2 text-gray-700">
            Describe your form:
          </label>
          <textarea
            className="w-full border rounded px-3 py-2 mb-4"
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Create a contact form with name, email, and message fields"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Form"}
          </button>
        </form>
        {error && (
          <div className="mt-4 text-red-600 text-sm text-center">{error}</div>
        )}
      </div>
      {form && (
        <div className="bg-white p-6 rounded shadow-md w-full max-w-lg">
          <h3 className="text-xl font-semibold mb-4">Form Preview</h3>
          <FormPreview form={form} />
        </div>
      )}
    </div>
  );
}
