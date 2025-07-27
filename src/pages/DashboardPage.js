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
  AlertCircle,
  Menu,
  X
} from "lucide-react";

export default function DashboardPage() {
  const [publicForms, setPublicForms] = useState([]);
  const [myForms, setMyForms] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [publishingId, setPublishingId] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const URL = process.env.REACT_APP_URL || "http://localhost:5000";

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
    setMobileMenuOpen(false);
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
        return <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />;
      case 'draft':
        return <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500" />;
      default:
        return <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />;
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
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">FormBuilder</h1>
                <p className="text-xs sm:text-sm text-gray-500 truncate">
                  {user ? `Welcome back, ${user.name}` : "Browse available forms"}
                </p>
              </div>
            </div>
            
            {user && (
              <>
                {/* Desktop Actions */}
                <div className="hidden sm:flex items-center space-x-3">
                  <button
                    onClick={() => navigate("/generate")}
                    className="inline-flex items-center px-3 py-2 lg:px-4 lg:py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm"
                  >
                    <Plus className="w-4 h-4 mr-1 lg:mr-2" />
                    <span className="hidden lg:inline">Create Form</span>
                    <span className="lg:hidden">Create</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="sm:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors duration-200"
                >
                  {mobileMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          {user && mobileMenuOpen && (
            <div className="sm:hidden border-t border-gray-200 py-3 space-y-2">
              <button
                onClick={() => {
                  navigate("/generate");
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center px-3 py-2 text-left text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-3" />
                Create Form
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 text-left text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {user && (
          <section className="mb-8 sm:mb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">My Forms</h2>
                <p className="text-sm sm:text-base text-gray-600 mt-1">Manage and track your created forms</p>
              </div>
              <div className="text-xs sm:text-sm text-gray-500">
                {myForms.length} {myForms.length === 1 ? 'form' : 'forms'}
              </div>
            </div>

            {myForms.length === 0 ? (
              <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-6 sm:p-12 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                </div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No forms yet</h3>
                <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">Get started by creating your first form</p>
                <button
                  onClick={() => navigate("/generate")}
                  className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Create Your First Form
                </button>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {myForms.map((form) => (
                  <div
                    key={form._id}
                    className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between mb-3 sm:mb-2">
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                            {form.title}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-1 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium border ${getStatusColor(form.status)} self-start sm:self-auto`}>
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

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 sm:pt-4 border-t border-gray-100 space-y-3 sm:space-y-0">
                      
                      
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => navigate(`/form/${form._id}/responses`)}
                          className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors duration-200"
                        >
                          <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          Responses
                        </button>
                        
                        <button
                          onClick={() => navigate(`/form/${form._id}`)}
                          className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200"
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          Preview
                        </button>

                        {form.status === "draft" && (
                          <button
                            onClick={() => handlePublish(form._id)}
                            disabled={publishingId === form._id}
                            className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors duration-200 disabled:opacity-50"
                          >
                            {publishingId === form._id ? (
                              <>
                                <div className="w-3 h-3 sm:w-4 sm:h-4 mr-1 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                                <span className="hidden sm:inline">Publishing...</span>
                                <span className="sm:hidden">...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                Publish
                              </>
                            )}
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleCopy(form._id)}
                          className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200"
                        >
                          <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Public Forms</h2>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Discover and fill out available forms</p>
            </div>
            <div className="text-xs sm:text-sm text-gray-500">
              {publicForms.length} available
            </div>
          </div>

          {publicForms.length === 0 ? (
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-6 sm:p-12 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No public forms</h3>
              <p className="text-sm sm:text-base text-gray-500">Check back later for new forms to fill out</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {publicForms.map((form) => (
                <div
                  key={form._id}
                  className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-all duration-200 group cursor-pointer"
                  onClick={() => navigate(`/form/${form._id}`)}
                >
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex-1 min-w-0 pr-2">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {form.title}
                      </h3>
                      {form.description && (
                        <p className="text-gray-600 text-sm line-clamp-3">
                          {form.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-100">
                    <span className="text-xs sm:text-sm text-gray-500">Click to fill out</span>
                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Toast notification */}
      {copied && (
        <div className="fixed bottom-4 left-4 right-4 sm:bottom-6 sm:right-6 sm:left-auto bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-in slide-in-from-bottom-2 duration-300 z-50">
          <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
          <span className="text-sm font-medium">Link copied to clipboard!</span>
        </div>
      )}

      {/* Mobile menu overlay */}
      {user && mobileMenuOpen && (
        <div 
          className="sm:hidden fixed inset-0 bg-black bg-opacity-25 z-10"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
} 