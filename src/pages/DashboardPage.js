import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  BarChart3, 
  ExternalLink, 
  Copy, 
  Eye, 
  LogOut, 
  FileText, 
  Users,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function DashboardPage() {
  const [publicForms, setPublicForms] = useState([]);
  const [myForms, setMyForms] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [publishingId, setPublishingId] = useState(null);
  const navigate = useNavigate();
  const URL = process.env.REACT_APP_URL || "http://localhost:5000";

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`${URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data))
      .catch(() => setUser(null));

    axios
      .get(`${URL}/api/forms/public`)
      .then((res) => setPublicForms(res.data))
      .catch(() => setPublicForms([]));

    if (token) {
      axios
        .get(`${URL}/api/forms`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setMyForms(res.data))
        .catch(() => setMyForms([]));
    }
  }, [loading]);

  const handlePublish = async (formId) => {
    const token = localStorage.getItem("token");
    try {
      setPublishingId(formId);
      await axios.put(
        `${URL}/api/forms/${formId}`,
        { status: "published" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLoading(!loading); // Trigger re-fetch
    } catch (err) {
      window.alert(
        err.response?.data?.message ||
          "Failed to publish the form. Try again."
      );
    } finally {
      setPublishingId(null);
    }
  };

  const handleCopy = (formId) => {
    const publicUrl = `${window.location.origin}/form/${formId}`;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'published':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'draft':
        return <Clock className="w-4 h-4 text-amber-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'draft':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">FormBuilder</h1>
                <p className="text-sm text-gray-500">
                  {user ? `Welcome back, ${user.name}` : "Browse available forms"}
                </p>
              </div>
            </div>
            
            {user && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate("/generate")}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Form
                </button>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">My Forms</h2>
                <p className="text-gray-600 mt-1">Manage and track your created forms</p>
              </div>
              <div className="text-sm text-gray-500">
                {myForms.length} {myForms.length === 1 ? 'form' : 'forms'}
              </div>
            </div>

            {myForms.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No forms yet</h3>
                <p className="text-gray-500 mb-6">Get started by creating your first form</p>
                <button
                  onClick={() => navigate("/generate")}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Form
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {myForms.map((form) => (
                  <div
                    key={form._id}
                    className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {form.title}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(form.status)}`}>
                            {getStatusIcon(form.status)}
                            <span className="ml-1 capitalize">{form.status}</span>
                          </span>
                        </div>
                        {form.description && (
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {form.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          Responses
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => navigate(`/form/${form._id}/responses`)}
                          className="inline-flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors duration-200"
                        >
                          <BarChart3 className="w-4 h-4 mr-1" />
                          Analytics
                        </button>
                        
                        <button
                          onClick={() => navigate(`/form/${form._id}`)}
                          className="inline-flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Preview
                        </button>

                        {form.status === "draft" && (
                          <button
                            onClick={() => handlePublish(form._id)}
                            disabled={publishingId === form._id}
                            className="inline-flex items-center px-3 py-1.5 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors duration-200 disabled:opacity-50"
                          >
                            {publishingId === form._id ? (
                              <>
                                <div className="w-4 h-4 mr-1 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                                Publishing...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Publish
                              </>
                            )}
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleCopy(form._id)}
                          className="inline-flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200"
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          Share
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Public Forms</h2>
              <p className="text-gray-600 mt-1">Discover and fill out available forms</p>
            </div>
            <div className="text-sm text-gray-500">
              {publicForms.length} available
            </div>
          </div>

          {publicForms.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No public forms</h3>
              <p className="text-gray-500">Check back later for new forms to fill out</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {publicForms.map((form) => (
                <div
                  key={form._id}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all duration-200 group cursor-pointer"
                  onClick={() => navigate(`/form/${form._id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {form.title}
                      </h3>
                      {form.description && (
                        <p className="text-gray-600 text-sm line-clamp-3">
                          {form.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-500">Click to fill out</span>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Toast notification */}
      {copied && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-in slide-in-from-bottom-2 duration-300">
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium">Link copied to clipboard!</span>
        </div>
      )}
    </div>
  );
}