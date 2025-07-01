import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function FillFormPage() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [values, setValues] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/forms/${id}`)
      .then((res) => setForm(res.data))
      .catch(() => setError("Form not found or not accessible"));
  }, [id]);

  const handleChange = (e, el) => {
    setValues({ ...values, [el.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const responses = form.elements.map((el) => ({
        elementId: el.id,
        value: values[el.id] || "",
      }));
      await axios.post("http://localhost:5000/api/responses", {
        formId: form._id,
        responses,
      });
      setMessage(form.settings?.successMessage || "Form submitted successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed");
    }
  };

  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!form) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-lg"
      >
        <h2 className="text-2xl font-semibold mb-4">{form.title}</h2>
        <p className="mb-6 text-gray-600">{form.description}</p>
        {form.elements.map((el) => (
          <div className="mb-4" key={el.id}>
            <label className="block mb-1 text-gray-700">{el.label}</label>
            <input
              type={el.type === "textarea" ? undefined : el.type}
              as={el.type === "textarea" ? "textarea" : "input"}
              className="w-full border rounded px-3 py-2"
              placeholder={el.placeholder}
              value={values[el.id] || ""}
              onChange={(e) => handleChange(e, el)}
              required={el.validation?.required}
            />
          </div>
        ))}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {form.settings?.submitButtonText || "Submit"}
        </button>
        {message && (
          <div className="mt-4 text-green-600 text-center">{message}</div>
        )}
        {error && (
          <div className="mt-4 text-red-600 text-center">{error}</div>
        )}
      </form>
    </div>
  );
}