import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function FillFormPage() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [values, setValues] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const URL = process.env.REACT_APP_URL || "http://localhost:5000";

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${URL}/api/forms/${id}`)
      .then((res) => setForm(res.data))
      .catch(() => setError("Form not found or not accessible"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e, el) => {
    const value =
      el.type === "checkbox"
        ? e.target.checked
        : el.type === "file"
        ? e.target.files[0]
        : e.target.value;

    setValues((prev) => ({ ...prev, [el.id]: value }));
  };

  const validateField = (el, value) => {
    const { required, minLength, maxLength, pattern } = el.validation || {};

    if (required) {
      if (el.type === "file" && !value) return "File is required.";
      if (el.type === "checkbox" && !value) return "This checkbox is required.";
      if (!value || value.toString().trim() === "") return "This field is required.";
    }

    if (minLength && value?.length < minLength)
      return `Minimum ${minLength} characters required.`;

    if (maxLength && value?.length > maxLength)
      return `Maximum ${maxLength} characters allowed.`;

    if (pattern && value && !new RegExp(pattern).test(value))
      return "Invalid format.";

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    const newErrors = {};

    for (const el of form.elements) {
      const val = values[el.id] || "";
      const validationError = validateField(el, val);
      if (validationError) {
        newErrors[el.id] = validationError;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    setFieldErrors({});

    try {
      const formData = new FormData();
      formData.append("formId", form._id);

      for (const el of form.elements) {
        const val = values[el.id];
        if (el.type === "file" && val) {
          formData.append(`files[${el.id}]`, val);
        } else {
          formData.append(`fields[${el.id}]`, val ?? "");
        }
      }

      await axios.post(`${URL}/api/responses`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage(form.settings?.successMessage || "Form submitted successfully!");
      setValues({});
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed");
    }
  };

  const renderInput = (el) => {
    const commonProps = {
      id: el.id,
      name: el.id,
      value: el.type !== "file" ? values[el.id] || "" : undefined,
      onChange: (e) => handleChange(e, el),
      placeholder: el.placeholder,
      required: el.validation?.required,
      className:
        "w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500",
    };

    switch (el.type) {
      case "textarea":
        return <textarea rows={4} {...commonProps} />;
      case "select":
        return (
          <select {...commonProps}>
            <option value="">-- Select an option --</option>
            {el.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={values[el.id] || false}
              onChange={(e) => handleChange(e, el)}
              id={el.id}
            />
            <label htmlFor={el.id}>{el.label}</label>
          </div>
        );
      case "file":
        return <input type="file" onChange={(e) => handleChange(e, el)} />;
      case "date":
        return <input type="date" {...commonProps} />;
      case "rating":
        return (
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() =>
                  setValues((prev) => ({ ...prev, [el.id]: num }))
                }
                className={`text-xl ${
                  values[el.id] >= num ? "text-yellow-500" : "text-gray-300"
                }`}
              >
                ★
              </button>
            ))}
          </div>
        );
      default:
        return <input type={el.type || "text"} {...commonProps} />;
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading form...</div>;
  }

  if (error && !form) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-xl space-y-6"
      >
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-1">
            {form.title}
          </h2>
          <p className="text-gray-600">{form.description}</p>
        </div>

        {form.elements.map((el) => (
          <div key={el.id} className="mb-4">
            {el.type !== "checkbox" && (
              <label
                htmlFor={el.id}
                className="block text-gray-700 mb-1 font-medium"
              >
                {el.label}
                {el.validation?.required && (
                  <span className="text-red-500">*</span>
                )}
              </label>
            )}
            {renderInput(el)}
            {fieldErrors[el.id] && (
              <p className="text-red-500 text-sm mt-1">
                {fieldErrors[el.id]}
              </p>
            )}
          </div>
        ))}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {form.settings?.submitButtonText || "Submit"}
        </button>

        {message && <div className="text-green-600 text-center">{message}</div>}
        {error && <div className="text-red-600 text-center">{error}</div>}
      </form>
    </div>
  );
}
