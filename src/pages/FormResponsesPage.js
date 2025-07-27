import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function FormResponsesPage() {
  const { id } = useParams();
  const [responses, setResponses] = useState([]);
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const URL = process.env.REACT_APP_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      try {
        const [formRes, responsesRes] = await Promise.all([
          axios.get(`${URL}/api/forms/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${URL}/api/responses/form/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setForm(formRes.data);
        setResponses(responsesRes.data.responses);
        
      } catch (err) {
        setError("Unable to load form data. Please check your permissions.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, URL]);

  const filteredResponses = responses.filter((resp) => {
    const searchLower = searchTerm.toLowerCase();
    const respondentName = resp.respondent?.name?.toLowerCase() || "";
    const respondentEmail = resp.respondent?.email?.toLowerCase() || "";
    console.log("Selected response:", resp.responses.respondent?.email?.toLowerCase() || "NA");
    return (
      respondentName.includes(searchLower) ||
      respondentEmail.includes(searchLower) ||
      "anonymous".includes(searchLower)
    );
  });

  const handleResponseClick = (response) => {
    
    setSelectedResponse(response);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedResponse(null);
  };

  const getInitials = (name) => {
    if (!name) return "A";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getResponseValue = (elementId) => {
    if (!selectedResponse) return "";
    const answer = selectedResponse.responses.find(r => r.elementId === elementId);
    return answer?.value || "No response";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">Loading responses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl border border-red-100 p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Error Loading Data</h3>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 mb-1">
                {form?.title || "Form Responses"}
              </h1>
              <p className="text-slate-500">
                {responses.length} {responses.length === 1 ? "response" : "responses"} collected
              </p>
            </div>
            
            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Responses List */}
        {filteredResponses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              {searchTerm ? "No matching responses" : "No responses yet"}
            </h3>
            <p className="text-slate-500">
              {searchTerm ? "Try adjusting your search terms" : "Responses will appear here once submitted"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredResponses.map((resp, index) => (
              <div
                key={resp._id}
                onClick={() => handleResponseClick(resp)}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 group-hover:from-blue-500 group-hover:to-blue-700 transition-all duration-200">
                      <span className="text-white text-sm font-semibold">
                        {getInitials(resp.responses.find(r => r.elementId === "email")?.value )}
                      </span>
                    </div>
                    
                    {/* User Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-slate-800 truncate">
                          { resp.respondent?.email ||
                            resp.responses.find(r => r.elementId === "email")?.value ||
                            "anonymous@example.com"}
                        </h3>
                        {resp.respondent?.name && (
                          <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                            {resp.respondent.name}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 mt-1">
                        Submitted on {new Date(resp.createdAt).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  {/* Arrow */}
                  <div className="flex items-center space-x-3">
                    <div className="text-sm text-slate-400">
                      {resp.responses.length} {resp.responses.length === 1 ? "answer" : "answers"}
                    </div>
                    <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Response Details Modal */}
        {showModal && selectedResponse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {getInitials(selectedResponse.respondent?.name)}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">
                        {selectedResponse.respondent?.email || "anonymous@example.com"}
                      </h2>
                      {selectedResponse.respondent?.name && (
                        <p className="text-blue-100">
                          {selectedResponse.respondent.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="space-y-6">
                  {/* Submission Info */}
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-slate-600 mb-2">SUBMISSION DETAILS</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">Submitted on:</span>
                        <p className="font-medium text-slate-800">
                          {new Date(selectedResponse.createdAt).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500">Time:</span>
                        <p className="font-medium text-slate-800">
                          {new Date(selectedResponse.createdAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Form Responses */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Form Responses</h3>
                    <div className="space-y-4">
                      {form?.elements.map((element) => (
                        <div key={element.id} className="border border-slate-200 rounded-xl p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-slate-800 flex-1">
                              {element.label}
                            </h4>
                            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full ml-2">
                              {element.type}
                            </span>
                          </div>
                          <div className="bg-slate-50 rounded-lg p-3 min-h-[60px] flex items-start">
                            <p className="text-slate-700 whitespace-pre-wrap break-words">
                              {getResponseValue(element.id)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-slate-50 px-6 py-4 flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors duration-200 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}