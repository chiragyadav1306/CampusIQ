import { useEffect, useState } from "react";
import "./App.css";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8003"
).replace(/\/+$/, "");

function App() {

  const [myClaims, setMyClaims] = useState([]);
const [showMyClaims, setShowMyClaims] = useState(false);

  // ==============================
  // LOGIN
  // ==============================

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  // ==============================
  // USER
  // ==============================

  const [user, setUser] = useState(null);

  // ==============================
  // EVENTS
  // ==============================

  const [events, setEvents] = useState([]);
  const [showEvents, setShowEvents] = useState(false);
  const [registeredEvents, setRegisteredEvents] = useState([]);

  // ==============================
  // STUDENT COMPLAINTS
  // ==============================

  const [complaints, setComplaints] = useState([]);
  const [showComplaints, setShowComplaints] =
    useState(false);

  const [showComplaintForm, setShowComplaintForm] =
    useState(false);

  const [complaintForm, setComplaintForm] = useState({
    title: "",
    description: "",
    category: "other",
    priority: "medium",
    location: "",
  });

  const [aiComplaintLoading, setAiComplaintLoading] =
  useState(false);

const [aiComplaintReason, setAiComplaintReason] =
  useState("");

  // ==============================
  // EMERGENCY REPORTS
  // ==============================

  const [emergencyReports, setEmergencyReports] =
    useState([]);

  const [showEmergency, setShowEmergency] =
    useState(false);

  const [emergencyForm, setEmergencyForm] = useState({
    emergency_type: "medical",
    title: "",
    description: "",
    location: "",
  });

  // ==============================
  // ADMIN
  // ==============================

  const [adminComplaints, setAdminComplaints] =
    useState([]);


  // ==============================
  // LOST & FOUND
  // ==============================

  const [lostFoundItems, setLostFoundItems] = useState([]);
  const [showLostFound, setShowLostFound] = useState(false);
  const [showLostFoundForm, setShowLostFoundForm] = useState(false);
  const [lostFoundSearch, setLostFoundSearch] = useState("");
  const [lostFoundType, setLostFoundType] = useState("all");
  const [lostFoundCategory, setLostFoundCategory] = useState("all");

  const [lostFoundForm, setLostFoundForm] = useState({
    title: "",
    report_type: "lost",
    category: "other",
    description: "",
    location: "",
    date_lost_found: "",
    photo: null,
  });



  const [showAdminComplaints, setShowAdminComplaints] =
    useState(false);

// ==============================
// FACULTY - ASSIGNMENT
// ==============================

const [facultyMembers, setFacultyMembers] =
  useState([]);



 // ==============================
// ANALYTICS
// ==============================

const [analytics, setAnalytics] = useState(null);

const [showAnalytics, setShowAnalytics] =
  useState(false);


  const [aiMessage, setAiMessage] = useState("");
const [aiReply, setAiReply] = useState("");
const [aiLoading, setAiLoading] = useState(false);
const [showAIAssistant, setShowAIAssistant] = useState(false);

const [aiMessages, setAiMessages] = useState([]);





const askAIAssistant = async () => {

  if (!aiMessage.trim()) {
    return;
  }

  const token =
    localStorage.getItem("access_token");

  if (!token) {
    alert("Please login first.");
    return;
  }

  const userMessage =
    aiMessage.trim();

  setAiLoading(true);
  setAiMessage("");

  try {

    const response = await fetch(
      `${API_BASE_URL}/api/ai/`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          message: userMessage,

          history: aiMessages.map(
            (message) => ({
              role: message.role,
              content: message.content,
            })
          ),
        }),
      }
    );

    const data =
      await response.json();

    if (!response.ok) {

      console.error(data);

      setAiMessages(
        (previousMessages) => [
          ...previousMessages,

          {
            role: "user",
            content: userMessage,
          },

          {
            role: "assistant",
            content:
              data.detail ||
              data.error ||
              "Unable to get AI response.",
          },
        ]
      );

      return;
    }

    setAiMessages(
      (previousMessages) => [
        ...previousMessages,

        {
          role: "user",
          content: userMessage,
        },

        {
          role: "assistant",
          content: data.reply,
        },
      ]
    );

  } catch (error) {

    console.error(
      "AI Assistant error:",
      error
    );

    setAiMessages(
      (previousMessages) => [
        ...previousMessages,

        {
          role: "user",
          content: userMessage,
        },

        {
          role: "assistant",
          content:
            "Unable to connect to CampusIQ AI Assistant.",
        },
      ]
    );

  } finally {

    setAiLoading(false);

  }
};

  // ==============================
  // ADMIN EMERGENCY
  // ==============================

  const [adminEmergencyReports, setAdminEmergencyReports] =
    useState([]);

  const [showAdminEmergency, setShowAdminEmergency] =
    useState(false);

  // ==============================
  // FACULTY
  // ==============================

  const [facultyComplaints, setFacultyComplaints] =
    useState([]);

  const [showFacultyComplaints, setShowFacultyComplaints] =
    useState(false);

  // ==============================
  // LOADING
  // ==============================

  const [loading, setLoading] = useState(true);

  // ==============================
  // NOTIFICATIONS
  // ==============================

  const [notifications, setNotifications] =
    useState([]);

  const unreadNotificationCount =
  notifications.filter(
    (notification) => !notification.is_read
  ).length;

  const [showNotifications, setShowNotifications] =
    useState(false);

  // =====================================================
  // LOAD EVENTS
  // =====================================================

  const loadEvents = async () => {

    try {

      const response = await fetch(
        `${API_BASE_URL}/api/events/`
      );

      if (!response.ok) {
        throw new Error("Unable to load events");
      }

      const data = await response.json();

      setEvents(data);

      setShowEvents(true);
      setShowComplaints(false);
      setShowComplaintForm(false);
      setShowAdminComplaints(false);
      setShowFacultyComplaints(false);

    } catch (error) {

      console.error(
        "Error loading events:",
        error
      );

      alert("Unable to load events.");
    }
  };

  // =====================================================
  // REGISTER FOR EVENT
  // =====================================================

  const registerForEvent = async (eventId) => {

    const token =
      localStorage.getItem("access_token");

    if (!token) {
      alert("Please login first.");
      return;
    }

    try {

      const response = await fetch(
        `${API_BASE_URL}/api/events/register/`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            event: eventId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {

        alert(
          data.error ||
          data.detail ||
          "Registration failed."
        );

        return;
      }

      setRegisteredEvents((prev) => {

        if (prev.includes(eventId)) {
          return prev;
        }

        return [...prev, eventId];
      });

      alert(
        data.message ||
        "Successfully registered for the event!"
      );

    } catch (error) {

      console.error(
        "Registration error:",
        error
      );

      alert(
        "Unable to connect to CampusIQ server."
      );
    }
  };

  // =====================================================
  // STUDENT - LOAD MY COMPLAINTS
  // =====================================================

  const loadComplaints = async () => {

    const token =
      localStorage.getItem("access_token");

    if (!token) {
      alert("Please login first.");
      return;
    }

    try {

      const response = await fetch(
        `${API_BASE_URL}/api/complaints/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {

        console.error(data);

        alert(
          data.detail ||
          "Unable to load complaints."
        );

        return;
      }

      setComplaints(data);

      setShowComplaints(true);
      setShowEvents(false);
      setShowComplaintForm(false);
      setShowAdminComplaints(false);
      setShowFacultyComplaints(false);

    } catch (error) {

      console.error(
        "Error loading complaints:",
        error
      );

      alert(
        "Unable to connect to CampusIQ server."
      );
    }
  };



const loadLostFound = async () => {
  // Open the section immediately so the button responds even if the API fails.
  setShowLostFound(true);
  setShowLostFoundForm(false);
  setShowMyClaims(false);
  setShowEvents(false);
  setShowComplaints(false);
  setShowComplaintForm(false);
  setShowAdminComplaints(false);
  setShowFacultyComplaints(false);
  setShowEmergency(false);
  setShowAdminEmergency(false);
  setShowAnalytics(false);
  setShowAIAssistant(false);
  setShowNotifications(false);
  setMessage("");

  const token = localStorage.getItem("access_token");
  if (!token) {
    setMessage("Please login again to load Lost & Found reports.");
    return;
  }

  try {
    const params = new URLSearchParams();
    if (lostFoundType !== "all") params.append("type", lostFoundType);
    if (lostFoundCategory !== "all") params.append("category", lostFoundCategory);
    if (lostFoundSearch.trim()) params.append("search", lostFoundSearch.trim());

    const query = params.toString();
    const url = `${API_BASE_URL}/api/lost-found/${query ? `?${query}` : ""}`;
    console.log("Lost & Found request:", url);

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const detail = data.detail || data.error || "Failed to load Lost & Found reports.";
      throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
    }

    setLostFoundItems(Array.isArray(data) ? data : (data.results || []));
  } catch (error) {
    console.error("Lost & Found error:", error);
    setMessage(`Lost & Found could not load: ${error.message}`);
  }
};


const loadMyClaims = async () => {
  const token = localStorage.getItem("access_token");

  if (!token) {
    setMessage("Please login again.");
    return;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/lost-found/my-claims/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail || "Failed to load your claims."
      );
    }

    setMyClaims(data);
    setShowMyClaims(true);
    setShowLostFound(false);
    setShowLostFoundForm(false);
    setShowEvents(false);
    setShowComplaints(false);
    setShowComplaintForm(false);
    setShowEmergency(false);
    setShowAdminComplaints(false);
    setShowFacultyComplaints(false);
    setShowAnalytics(false);
    setShowAIAssistant(false);
  } catch (error) {
    console.error("My Claims error:", error);
    setMessage(error.message);
  }
};



const handleLostFoundChange = (e) => {
  const { name, value, files } = e.target;

  setLostFoundForm((prev) => ({
    ...prev,
    [name]: name === "photo" ? files?.[0] || null : value,
  }));
};

const submitLostFound = async (e) => {
  e.preventDefault();

  // Validate here so the user always gets a visible message instead of
  // the browser silently blocking submission on a required field.
  const requiredFields = [
    ["title", "Please enter the item title."],
    ["report_type", "Please select whether the item was lost or found."],
    ["category", "Please select a category."],
    ["description", "Please describe the item."],
    ["location", "Please enter the location."],
    ["date_lost_found", "Please select the date."],
  ];
  const missingField = requiredFields.find(([key]) => !String(lostFoundForm[key] || "").trim());
  if (missingField) {
    alert(missingField[1]);
    return;
  }

  const token = localStorage.getItem("access_token");

  if (!token) {
    alert("Please login again before submitting a report.");
    setMessage("Please login again.");
    return;
  }

  console.log("Submitting Lost & Found report", {
    title: lostFoundForm.title,
    report_type: lostFoundForm.report_type,
    category: lostFoundForm.category,
  });

  try {
    const formData = new FormData();

    Object.entries(lostFoundForm).forEach(([key, value]) => {
      if (value !== null && value !== "") {
        formData.append(key, value);
      }
    });

    const response = await fetch(
      `${API_BASE_URL}/api/lost-found/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage =
        typeof data === "object"
          ? Object.entries(data)
              .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : typeof value === "object" ? JSON.stringify(value) : value}`)
              .join("\n")
          : "Failed to submit report.";

      throw new Error(errorMessage || "Failed to submit report.");
    }

    alert("Lost & Found report submitted successfully!");
    setMessage("Lost & Found report submitted successfully!");

    setLostFoundForm({
      title: "",
      report_type: "lost",
      category: "other",
      description: "",
      location: "",
      date_lost_found: "",
      photo: null,
    });

    setShowLostFoundForm(false);
    await loadLostFound();
  } catch (error) {
    console.error("Submit Lost & Found error:", error);
    setMessage(error.message || "Failed to submit Lost & Found report.");
    alert(`Report was not submitted: ${error.message || "Please check the server and try again."}`);
  }
};


const claimLostFoundItem = async (itemId) => {
  const token = localStorage.getItem("access_token");

  if (!token) {
    setMessage("Please login again.");
    return;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/lost-found/${itemId}/claim/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Unable to claim this item."
      );
    }

    setMessage(data.message || "Item claimed successfully.");
    await loadLostFound();
  } catch (error) {
    console.error("Claim item error:", error);
    setMessage(error.message);
  }
};




  // =====================================================
  // COMPLAINT FORM CHANGE
  // =====================================================

  const handleComplaintChange = (e) => {

    const { name, value } = e.target;

    setComplaintForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


 // =====================================================
// AI - ANALYZE COMPLAINT
// =====================================================

const analyzeComplaintWithAI = async () => {

  if (
    !complaintForm.title.trim() ||
    !complaintForm.description.trim()
  ) {
    alert(
      "Please enter complaint title and description first."
    );
    return;
  }

  const token =
    localStorage.getItem("access_token");

  if (!token) {
    alert("Please login first.");
    return;
  }

  setAiComplaintLoading(true);
  setAiComplaintReason("");

  try {

    const response = await fetch(
      `${API_BASE_URL}/api/complaints/ai-analyze/`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          title: complaintForm.title,
          description: complaintForm.description,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {

      console.error(data);

      alert(
        data.error ||
        data.detail ||
        "Unable to analyze complaint."
      );

      return;
    }

    setComplaintForm((previous) => ({
      ...previous,
      category: data.category || "other",
      priority: data.priority || "medium",
    }));

    setAiComplaintReason(
      data.reason ||
      "AI classification completed."
    );

  } catch (error) {

    console.error(
      "AI complaint analysis error:",
      error
    );

    alert(
      "Unable to connect to CampusIQ AI."
    );

  } finally {

    setAiComplaintLoading(false);

  }
};

  // =====================================================
  // STUDENT - SUBMIT COMPLAINT
  // =====================================================

  const submitComplaint = async (e) => {

    e.preventDefault();

    const token =
      localStorage.getItem("access_token");

    if (!token) {
      alert("Please login first.");
      return;
    }

    try {

      const response = await fetch(
        `${API_BASE_URL}/api/complaints/`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify(
            complaintForm
          ),
        }
      );

      const data = await response.json();

      if (!response.ok) {

        console.error(data);

        alert(
          data.detail ||
          "Unable to submit complaint."
        );

        return;
      }

      alert(
        "Complaint submitted successfully! 🎉"
      );

      setComplaintForm({
        title: "",
        description: "",
        category: "other",
        priority: "medium",
        location: "",
      });

      setShowComplaintForm(false);

      loadComplaints();

    } catch (error) {

      console.error(
        "Complaint submission error:",
        error
      );

      alert(
        "Unable to connect to CampusIQ server."
      );
    }
  };

  // =====================================================
  // EMERGENCY - LOAD MY REPORTS
  // =====================================================

  const loadEmergencyReports = async () => {

    const token =
      localStorage.getItem("access_token");

    if (!token) {
      alert("Please login first.");
      return;
    }

    try {

      const response = await fetch(
        `${API_BASE_URL}/api/emergency/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {

        console.error(data);

        alert(
          data.detail ||
          data.error ||
          "Unable to load emergency reports."
        );

        return;
      }

      setEmergencyReports(data);

      setShowEmergency(true);
      setShowEvents(false);
      setShowComplaints(false);
      setShowComplaintForm(false);
      setShowAdminComplaints(false);
      setShowFacultyComplaints(false);

    } catch (error) {

      console.error(
        "Emergency loading error:",
        error
      );

      alert(
        "Unable to connect to CampusIQ server."
      );
    }
  };

  // =====================================================
  // EMERGENCY - FORM CHANGE
  // =====================================================

  const handleEmergencyChange = (e) => {

    const { name, value } = e.target;

    setEmergencyForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // EMERGENCY - SUBMIT
  // =====================================================

  const submitEmergency = async (e) => {

    e.preventDefault();

    const token =
      localStorage.getItem("access_token");

    if (!token) {
      alert("Please login first.");
      return;
    }

    try {

      const response = await fetch(
        `${API_BASE_URL}/api/emergency/`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify(
            emergencyForm
          ),
        }
      );

      const data = await response.json();

      if (!response.ok) {

        console.error(data);

        alert(
          data.detail ||
          data.error ||
          "Unable to submit emergency report."
        );

        return;
      }

      alert(
        "Emergency report submitted successfully! 🚨"
      );

      setEmergencyForm({
        emergency_type: "medical",
        title: "",
        description: "",
        location: "",
      });

      await loadEmergencyReports();

    } catch (error) {

      console.error(
        "Emergency submission error:",
        error
      );

      alert(
        "Unable to connect to CampusIQ server."
      );
    }
  };

  // =====================================================
  // ADMIN - LOAD ALL EMERGENCY REPORTS
  // =====================================================

  const loadAdminEmergency = async () => {

    const token =
      localStorage.getItem("access_token");

    if (!token) {
      alert("Please login first.");
      return;
    }

    try {

      const response = await fetch(
        `${API_BASE_URL}/api/emergency/admin/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {

        console.error(data);

        alert(
          data.detail ||
          data.error ||
          "Unable to load emergency reports."
        );

        return;
      }

      setAdminEmergencyReports(data);
      setShowAdminEmergency(true);
      setShowAdminComplaints(false);
      setShowFacultyComplaints(false);
      setShowEvents(false);
      setShowComplaints(false);
      setShowComplaintForm(false);

    } catch (error) {

      console.error(
        "Admin emergency error:",
        error
      );

      alert(
        "Unable to connect to CampusIQ server."
      );
    }
  };


  // =====================================================
  // ADMIN - UPDATE EMERGENCY STATUS
  // =====================================================

  const updateEmergencyStatus = async (
    reportId,
    newStatus
  ) => {

    const token =
      localStorage.getItem("access_token");

    if (!token) {
      alert("Please login first.");
      return;
    }

    try {

      const response = await fetch(
        `${API_BASE_URL}/api/emergency/admin/${reportId}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {

        alert(
          data.detail ||
          data.error ||
          "Unable to update emergency status."
        );

        return;
      }

      setAdminEmergencyReports(
        (previous) =>
          previous.map((report) =>
            report.id === reportId
              ? {
                  ...report,
                  status: data.status,
                }
              : report
          )
      );

    } catch (error) {

      console.error(
        "Emergency status error:",
        error
      );

      alert(
        "Unable to connect to CampusIQ server."
      );
    }
  };



  // =====================================================
// LOAD FACULTY MEMBERS
// =====================================================

const loadFacultyMembers = async () => {

  const token =
    localStorage.getItem("access_token");

  if (!token) {
    alert("Please login first.");
    return;
  }

  try {

    const response = await fetch(
      `${API_BASE_URL}/api/users/faculty/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {

      console.error(data);

      alert(
        data.detail ||
        data.error ||
        "Unable to load faculty members."
      );

      return;
    }

    setFacultyMembers(data);

  } catch (error) {

    console.error(
      "Faculty loading error:",
      error
    );

    alert(
      "Unable to connect to CampusIQ server."
    );
  }
};


  // =====================================================
  // ADMIN - LOAD ALL COMPLAINTS
  // =====================================================

  const loadAdminComplaints = async () => {

    const token =
      localStorage.getItem("access_token");

    if (!token) {
      alert("Please login first.");
      return;
    }

    try {

      const response = await fetch(
        `${API_BASE_URL}/api/complaints/admin/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      const data = await response.json();

      if (!response.ok) {

        console.error(data);

        alert(
          data.detail ||
          data.error ||
          "Unable to load admin complaints."
        );

        return;
      }

      setAdminComplaints(data);

      await loadFacultyMembers();

      setShowAdminComplaints(true);
      setShowFacultyComplaints(false);
      setShowEvents(false);
      setShowComplaints(false);
      setShowComplaintForm(false);

    } catch (error) {

      console.error(
        "Admin complaint error:",
        error
      );

      alert(
        "Unable to connect to CampusIQ server."
      );
    }
  };


  // =====================================================
// ADMIN - LOAD ANALYTICS
// =====================================================

const loadAnalytics = async () => {

  const token =
    localStorage.getItem("access_token");

  if (!token) {

    alert("Please login first.");
    return;
  }

  try {

    const response = await fetch(
      `${API_BASE_URL}/api/analytics/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {

      console.error(data);

      alert(
        data.detail ||
        data.error ||
        "Unable to load analytics."
      );

      return;
    }

    setAnalytics(data);

    setShowAnalytics(true);

    setShowAdminComplaints(false);
    setShowEvents(false);
    setShowComplaints(false);
    setShowComplaintForm(false);
    setShowFacultyComplaints(false);

  } catch (error) {

    console.error(
      "Analytics error:",
      error
    );

    alert(
      "Unable to connect to CampusIQ server."
    );
  }
};

// =====================================================
// ADMIN - ASSIGN COMPLAINT TO FACULTY
// =====================================================

const assignComplaintToFaculty = async (
  complaintId,
  facultyId
) => {

  const token =
    localStorage.getItem("access_token");

  if (!token) {
    alert("Please login first.");
    return;
  }

  try {

    const response = await fetch(
      `${API_BASE_URL}/api/complaints/admin/${complaintId}/`,
      {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          assigned_to: facultyId,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {

      console.error(data);

      alert(
        data.detail ||
        data.error ||
        "Unable to assign complaint."
      );

      return;
    }

    setAdminComplaints((previous) =>
      previous.map((complaint) =>
        complaint.id === complaintId
          ? {
              ...complaint,
              assigned_to: data.assigned_to,
              status: data.status,
            }
          : complaint
      )
    );

    alert(
      "Complaint assigned successfully! ✅"
    );

  } catch (error) {

    console.error(
      "Complaint assignment error:",
      error
    );

    alert(
      "Unable to connect to CampusIQ server."
    );
  }
};

  // =====================================================
  // ADMIN - UPDATE COMPLAINT STATUS
  // =====================================================

  const updateComplaintStatus = async (
    complaintId,
    newStatus
  ) => {

    const token =
      localStorage.getItem("access_token");

    if (!token) {
      alert("Please login first.");
      return;
    }

    try {

      const response = await fetch(
        `${API_BASE_URL}/api/complaints/admin/${complaintId}/`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {

        alert(
          data.detail ||
          data.error ||
          "Unable to update complaint."
        );

        return;
      }

      setAdminComplaints((prev) =>
        prev.map((complaint) =>
          complaint.id === complaintId
            ? {
                ...complaint,
                status: data.status,
              }
            : complaint
        )
      );

    } catch (error) {

      console.error(
        "Update complaint error:",
        error
      );

      alert(
        "Unable to connect to CampusIQ server."
      );
    }
  };

  const updateFacultyComplaintStatus = async (
  complaintId,
  newStatus
) => {
  const token =
    localStorage.getItem("access_token");

  if (!token) {
    alert("Please login first.");
    return;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/complaints/faculty/${complaintId}/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data);

      alert(
        data.detail ||
        data.error ||
        "Unable to update complaint status."
      );

      return;
    }

    setFacultyComplaints((previous) =>
      previous.map((complaint) =>
        complaint.id === complaintId
          ? {
              ...complaint,
              status: data.status,
            }
          : complaint
      )
    );

    alert("Complaint status updated! ✅");

  } catch (error) {
    console.error(
      "Faculty status update error:",
      error
    );

    alert(
      "Unable to connect to CampusIQ server."
    );
  }
};

  // =====================================================
  // FACULTY - LOAD ALL COMPLAINTS
  // =====================================================

  const loadFacultyComplaints = async () => {

    const token =
      localStorage.getItem("access_token");

    if (!token) {
      alert("Please login first.");
      return;
    }

    try {

      const response = await fetch(
        `${API_BASE_URL}/api/complaints/faculty/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {

        console.error(data);

        alert(
          data.detail ||
          data.error ||
          "Unable to load faculty complaints."
        );

        return;
      }

      setFacultyComplaints(data);

      setShowFacultyComplaints(true);
      setShowAdminComplaints(false);
      setShowComplaints(false);
      setShowEvents(false);
      setShowComplaintForm(false);

    } catch (error) {

      console.error(
        "Faculty complaint error:",
        error
      );

      alert(
        "Unable to connect to CampusIQ server."
      );
    }
  };

  // =====================================================
  // CHECK LOGIN SESSION
  // =====================================================

  // =====================================================
  // NOTIFICATIONS - LOAD
  // =====================================================

  const loadNotifications = async () => {

    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Please login first.");
      return;
    }

    try {

      const response = await fetch(
        `${API_BASE_URL}/api/notifications/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(data);
        alert(
          data.detail ||
          data.error ||
          "Unable to load notifications."
        );
        return;
      }

      setNotifications(data);
      setShowNotifications(true);

      setShowEvents(false);
      setShowComplaints(false);
      setShowComplaintForm(false);
      setShowAdminComplaints(false);
      setShowAdminEmergency(false);
      setShowFacultyComplaints(false);
      setShowEmergency(false);

    } catch (error) {
      console.error("Notification loading error:", error);
      alert("Unable to connect to CampusIQ server.");
    }
  };

  // =====================================================
  // NOTIFICATIONS - MARK AS READ
  // =====================================================

  const markNotificationRead = async (notificationId) => {

    const token = localStorage.getItem("access_token");

    try {

      const response = await fetch(
        `${API_BASE_URL}/api/notifications/${notificationId}/read/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(data);
        return;
      }

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );

    } catch (error) {
      console.error("Notification read error:", error);
    }
  };

  const markAllNotificationsRead = async () => {
  const unreadNotifications = notifications.filter(
    (notification) => !notification.is_read
  );

  await Promise.all(
    unreadNotifications.map((notification) =>
      markNotificationRead(notification.id)
    )
  );
};

  // =====================================================
  // NOTIFICATION PANEL
  // =====================================================

  const NotificationsPanel = () => (

    <section className="complaint-section">

      <div className="section-header">

        <h2>🔔 Notifications</h2>


{unreadNotificationCount > 0 && (
  <button
    onClick={markAllNotificationsRead}
    style={{ marginRight: "10px" }}
  >
    Mark All as Read
  </button>
)}


        <button
          className="close-events"
          onClick={() => setShowNotifications(false)}
        >
          Close
        </button>

      </div>

      {notifications.length === 0 ? (
        <p>No notifications yet.</p>
      ) : (
        <div>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="panel"
              style={{
                marginBottom: "15px",
                borderLeft: notification.is_read
                  ? "4px solid #cbd5e1"
                  : "4px solid #2563eb",
              }}
            >

              <h3>{notification.title}</h3>

              <p>{notification.message}</p>

              <small>
                {new Date(notification.created_at).toLocaleString()}
              </small>

              {!notification.is_read && (
                <div style={{ marginTop: "10px" }}>
                  <button
                    onClick={() =>
                      markNotificationRead(notification.id)
                    }
                  >
                    Mark as read
                  </button>
                </div>
              )}

            </div>
          ))}
        </div>
      )}

    </section>
  );

  useEffect(() => {

    const token =
      localStorage.getItem("access_token");

    if (!token) {

      setLoading(false);
      return;
    }

    fetch(
      `${API_BASE_URL}/api/users/me/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((response) => {

        if (!response.ok) {
          throw new Error(
            "Session expired"
          );
        }

        return response.json();
      })
      .then((data) => {

        setUser(data);
        setLoading(false);

      })
      .catch(() => {

        localStorage.removeItem(
          "access_token"
        );

        localStorage.removeItem(
          "refresh_token"
        );

        setLoading(false);
      });

  }, []);


useEffect(() => {
  if (!user || user.role !== "student") {
    return;
  }

  const token = localStorage.getItem("access_token");

  if (!token) {
    return;
  }

  const fetchStudentNotifications = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notifications/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        console.error("Unable to load notifications");
        return;
      }

      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error("Notification loading error:", error);
    }
  };

  fetchStudentNotifications();

  const intervalId = setInterval(() => {
    fetchStudentNotifications();
  }, 30000);

  return () => clearInterval(intervalId);
}, [user]);


  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = async (e) => {

    e.preventDefault();

    setMessage("Logging in...");

    try {

      const response = await fetch(
        `${API_BASE_URL}/api/token/`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {

        setMessage(
          data.detail ||
          "Invalid username or password"
        );

        return;
      }

      localStorage.setItem(
        "access_token",
        data.access
      );

      localStorage.setItem(
        "refresh_token",
        data.refresh
      );

      const userResponse = await fetch(
        `${API_BASE_URL}/api/users/me/`,
        {
          headers: {
            Authorization: `Bearer ${data.access}`,
          },
        }
      );

      if (!userResponse.ok) {

        throw new Error(
          "Unable to load user information"
        );
      }

      const userData =
        await userResponse.json();

      setUser(userData);
      setMessage("");

    } catch (error) {

      console.error(error);

      setMessage(
        "Unable to connect to CampusIQ server."
      );
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {


localStorage.removeItem("campusiq_ai_messages");

setAiMessages([]);
setAiMessage("");
setAiReply("");
setShowAIAssistant(false);


    localStorage.removeItem(
      "access_token"
    );


localStorage.removeItem("refresh_token");

setUser(null);


    setUsername("");
    setPassword("");

    setEvents([]);
    setComplaints([]);
    setAdminComplaints([]);
    setFacultyComplaints([]);
    setRegisteredEvents([]);
    setEmergencyReports([]);
    setAdminEmergencyReports([]);

    setShowEvents(false);
    setShowComplaints(false);
    setShowAdminComplaints(false);
    setShowFacultyComplaints(false);
    setShowComplaintForm(false);
    setShowEmergency(false);
    setShowAdminEmergency(false);

    setEmergencyForm({
      emergency_type: "medical",
      title: "",
      description: "",
      location: "",
    });
  };

  // =====================================================
  // LOADING SCREEN
  // =====================================================

  if (loading) {

    return (
      <div className="loading">
        Loading CampusIQ...
      </div>
    );
  }

  // =====================================================
  // ADMIN DASHBOARD
  // =====================================================

  if (
    user &&
    user.role === "admin"
  ) {

    return (

      <div className="dashboard">

        {/* SIDEBAR */}

        <aside className="sidebar">

          <div className="brand">
            🎓 CampusIQ
          </div>

          <div className="menu">

            <button className="active">
              Dashboard
            </button>

            <button
              onClick={loadAdminComplaints}
            >
              📋 Complaints
            </button>

            <button>
              📅 Events
            </button>

            <button
              onClick={loadNotifications}
            >
              🔔 Notifications
            </button>

            <button
              onClick={loadAdminEmergency}
            >
              🚨 Emergency
            </button>

            <button>
              👥 Users
            </button>

           <button
             onClick={loadAnalytics}
          >
             📊 Analytics
           </button>

           <button
  onClick={() => {
    setShowAIAssistant(true);

    setShowAnalytics(false);
    setShowAdminComplaints(false);
    setShowEvents(false);
    setShowComplaints(false);
    setShowComplaintForm(false);
    setShowFacultyComplaints(false);
  }}
>
  🤖 AI Assistant
</button>

          </div>

          <button
            className="logout"
            onClick={handleLogout}
          >
            Logout
          </button>

        </aside>


        {/* MAIN */}

        <main className="main-content">

          <header className="topbar">

            <div>

              <h1>
                Admin Dashboard
              </h1>

              <p>
                CampusIQ Management Panel
              </p>

            </div>

            <div className="profile">
              👤 {user.username}
            </div>

          </header>


          {/* WELCOME */}

          <section className="welcome-card">

            <div>

              <h2>
                Welcome,{" "}
                {user.first_name ||
                  user.username}{" "}
                👋
              </h2>

              <p>
                Manage campus activities,
                complaints and users from
                this dashboard.
              </p>

            </div>

          </section>


          {showNotifications && <NotificationsPanel />}


          {/* ADMIN STATS */}

          <section className="stats">

            <div className="stat-card">

              <span>📋</span>

              <h3>
                Complaints
              </h3>

              <strong>
                {adminComplaints.length}
              </strong>

              <p>
                Total complaints
              </p>

            </div>


            <div className="stat-card">

              <span>📅</span>

              <h3>
                Events
              </h3>

              <strong>
                {events.length}
              </strong>

              <p>
                Campus events
              </p>

            </div>


            <div className="stat-card">

              <span>🔔</span>

              <h3>
                Notifications
              </h3>

            <strong>
  {unreadNotificationCount}
</strong>

              <p>
  Unread notifications
</p>

            </div>


            <div className="stat-card">

              <span>🚨</span>

              <h3>
                Emergencies
              </h3>

              <strong>
                {adminEmergencyReports.length}
              </strong>

              <p>
                Emergency reports
              </p>

            </div>


            <div className="stat-card">

              <span>👥</span>

              <h3>
                Users
              </h3>

              <strong>
                —
              </strong>

              <p>
                Coming soon
              </p>

            </div>

          </section>


          {showAIAssistant && (
  <div className="ai-assistant-section">

 <div className="ai-assistant-header">

  <div>
    <h2>🤖 CampusIQ AI Assistant</h2>

    <p>
      Ask anything related to your campus.
    </p>
  </div>

  <div className="ai-header-actions">

    <button
      className="new-ai-chat"
      onClick={() => {
        setAiMessages([]);
        setAiMessage("");
        setShowAIAssistant(true);
      }}
    >
      ➕ New Chat
    </button>

    <button
      className="clear-ai-chat"
      onClick={() => {
        setAiMessages([]);
        setAiMessage("");
      }}
    >
      🗑️ Clear Chat
    </button>

    <button
      className="close-events"
      onClick={() =>
        setShowAIAssistant(false)
      }
    >
      Close
    </button>

  </div>

</div>


    <div className="ai-chat-box">

      <div className="ai-welcome">
        <h3>👋 Hello!</h3>

        <p>
          I am your CampusIQ AI Assistant.
          How can I help you?
        </p>
      </div>

      <div className="ai-quick-questions">

  <h4>Quick Questions</h4>

  <div className="quick-question-buttons">

    <button
      onClick={() =>
        setAiMessage(
          "What events are available?"
        )
      }
    >
      📅 Campus Events
    </button>

    <button
      onClick={() =>
        setAiMessage(
          "What is the status of my complaints?"
        )
      }
    >
      📝 My Complaints
    </button>

    <button
      onClick={() =>
        setAiMessage(
          "Do I have any unread notifications?"
        )
      }
    >
      🔔 Notifications
    </button>

    <button
      onClick={() =>
        setAiMessage(
          "Do I have any emergency reports?"
        )
      }
    >
      🚨 Emergency
    </button>

    <button
      onClick={() =>
        setAiMessage(
          "Who are the faculty members?"
        )
      }
    >
      👨‍🏫 Faculty
    </button>

    <button
      onClick={() =>
        setAiMessage(
          "What can students do in CampusIQ?"
        )
      }
    >
      🎓 Student Services
    </button>

  </div>

</div>


      {aiMessages.map((message, index) => (
  <div
    key={index}
    className={
      message.role === "user"
        ? "ai-user-message"
        : "ai-response"
    }
  >
    <strong>
      {message.role === "user"
        ? "👤 You"
        : "🤖 AI Assistant"}
    </strong>

    <p>
      {message.content}
    </p>
  </div>
))}


{aiLoading && (
  <div className="ai-thinking">
    <span>🤖 AI Assistant is thinking</span>

    <div className="ai-dots">
      <span></span>
      <span></span>
      <span></span>
    </div>
  </div>
)}


      <div className="ai-input-area">

        <textarea
  value={aiMessage}
  onChange={(e) =>
    setAiMessage(e.target.value)
  }
  onKeyDown={(e) => {

    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {

      e.preventDefault();

      askAIAssistant();
    }

  }}
  placeholder="Ask CampusIQ anything..."
  rows="3"
/>

        <button
          onClick={askAIAssistant}
          disabled={aiLoading}
        >
          {aiLoading
            ? "Thinking..."
            : "Send 🚀"}
        </button>

      </div>

    </div>

  </div>
)}



          {/* ==============================
    ANALYTICS DASHBOARD
============================== */}

{showAnalytics && analytics && (

  <section className="analytics-section">

    <div className="section-header">

      <div>
        <h2>
          📊 Campus Analytics
        </h2>

        <p>
          Real-time overview of campus activities
        </p>
      </div>

      <button
        className="close-events"
        onClick={() =>
          setShowAnalytics(false)
        }
      >
        Close
      </button>

    </div>


    {/* COMPLAINT ANALYTICS */}

    <h3 className="analytics-heading">
      📋 Complaint Overview
    </h3>

    <div className="analytics-grid">

      <div className="analytics-card">
        <span>📋</span>
        <h4>Total Complaints</h4>
        <strong>
          {analytics.complaints.total}
        </strong>
      </div>


      <div className="analytics-card">
        <span>⏳</span>
        <h4>Pending</h4>
        <strong>
          {analytics.complaints.pending}
        </strong>
      </div>


      <div className="analytics-card">
        <span>👨‍🏫</span>
        <h4>Assigned</h4>
        <strong>
          {analytics.complaints.assigned}
        </strong>
      </div>


      <div className="analytics-card">
        <span>🔄</span>
        <h4>In Progress</h4>
        <strong>
          {analytics.complaints.in_progress}
        </strong>
      </div>


      <div className="analytics-card">
        <span>✅</span>
        <h4>Resolved</h4>
        <strong>
          {analytics.complaints.resolved}
        </strong>
      </div>


      <div className="analytics-card">
        <span>❌</span>
        <h4>Rejected</h4>
        <strong>
          {analytics.complaints.rejected}
        </strong>
      </div>

    </div>

    {/* =====================================================
    COMPLAINT STATUS CHART
===================================================== */}

<div className="analytics-chart">

  <h3>
    📊 Complaint Status Distribution
  </h3>

  <div className="bar-row">

    <span>Pending</span>

    <div className="bar-background">

      <div
        className="bar pending-bar"
        style={{
          width: `${
            analytics.complaints.total
              ? (
                  analytics.complaints.pending /
                  analytics.complaints.total
                ) * 100
              : 0
          }%`
        }}
      />

    </div>

    <strong>
      {analytics.complaints.pending}
    </strong>

  </div>


  <div className="bar-row">

    <span>Assigned</span>

    <div className="bar-background">

      <div
        className="bar assigned-bar"
        style={{
          width: `${
            analytics.complaints.total
              ? (
                  analytics.complaints.assigned /
                  analytics.complaints.total
                ) * 100
              : 0
          }%`
        }}
      />

    </div>

    <strong>
      {analytics.complaints.assigned}
    </strong>

  </div>


  <div className="bar-row">

    <span>In Progress</span>

    <div className="bar-background">

      <div
        className="bar progress-bar"
        style={{
          width: `${
            analytics.complaints.total
              ? (
                  analytics.complaints.in_progress /
                  analytics.complaints.total
                ) * 100
              : 0
          }%`
        }}
      />

    </div>

    <strong>
      {analytics.complaints.in_progress}
    </strong>

  </div>


  <div className="bar-row">

    <span>Resolved</span>

    <div className="bar-background">

      <div
        className="bar resolved-bar"
        style={{
          width: `${
            analytics.complaints.total
              ? (
                  analytics.complaints.resolved /
                  analytics.complaints.total
                ) * 100
              : 0
          }%`
        }}
      />

    </div>

    <strong>
      {analytics.complaints.resolved}
    </strong>

  </div>


  <div className="bar-row">

    <span>Rejected</span>

    <div className="bar-background">

      <div
        className="bar rejected-bar"
        style={{
          width: `${
            analytics.complaints.total
              ? (
                  analytics.complaints.rejected /
                  analytics.complaints.total
                ) * 100
              : 0
          }%`
        }}
      />

    </div>

    <strong>
      {analytics.complaints.rejected}
    </strong>

  </div>

</div>


{/* =====================================================
    RESOLUTION RATE
===================================================== */}

<div className="resolution-card">

  <div>

    <span className="resolution-icon">
      ✅
    </span>

    <h3>
      Complaint Resolution Rate
    </h3>

    <p>
      Percentage of complaints successfully resolved
    </p>

  </div>

  <strong>

    {
      analytics.complaints.total
        ? (
            (
              analytics.complaints.resolved /
              analytics.complaints.total
            ) * 100
          ).toFixed(1)
        : 0
    }%

  </strong>

</div>


    {/* EMERGENCY ANALYTICS */}

    <h3 className="analytics-heading">
      🚨 Emergency Overview
    </h3>

    <div className="analytics-grid">

      <div className="analytics-card">
        <span>🚨</span>
        <h4>Total Emergencies</h4>
        <strong>
          {analytics.emergencies.total}
        </strong>
      </div>


      <div className="analytics-card">
        <span>🔴</span>
        <h4>Reported</h4>
        <strong>
          {analytics.emergencies.reported}
        </strong>
      </div>


      <div className="analytics-card">
        <span>🟠</span>
        <h4>Acknowledged</h4>
        <strong>
          {analytics.emergencies.acknowledged}
        </strong>
      </div>


      <div className="analytics-card">
        <span>✅</span>
        <h4>Resolved</h4>
        <strong>
          {analytics.emergencies.resolved}
        </strong>
      </div>

    </div>


    {/* EVENTS */}

    <h3 className="analytics-heading">
      📅 Event Overview
    </h3>

    <div className="analytics-grid">

      <div className="analytics-card">

        <span>📅</span>

        <h4>Total Events</h4>

        <strong>
          {analytics.events.total}
        </strong>

      </div>

    </div>

  </section>

)}


          {/* ADMIN COMPLAINTS */}

          {showAdminComplaints && (

            <section className="complaint-section">

              <div className="section-header">

                <h2>
                  All Campus Complaints
                </h2>

                <button
                  className="close-events"
                  onClick={() =>
                    setShowAdminComplaints(false)
                  }
                >
                  Close
                </button>

              </div>


              {adminComplaints.length === 0 ? (

                <p>
                  No complaints found.
                </p>

              ) : (

                <div className="complaints-list">

                  {adminComplaints.map(
                    (complaint) => (

                      <div
                        className="complaint-card"
                        key={complaint.id}
                      >

                        <div className="complaint-card-header">

                          <h3>
                            {complaint.title}
                          </h3>

                          <select
                            value={complaint.status}
                            onChange={(e) =>
                              updateComplaintStatus(
                                complaint.id,
                                e.target.value
                              )
                            }
                          >

                            <option value="pending">
                              Pending
                            </option>

                            <option value="assigned">
                              Assigned
                            </option>

                            <option value="in_progress">
                              In Progress
                            </option>

                            <option value="resolved">
                              Resolved
                            </option>

                            <option value="rejected">
                              Rejected
                            </option>

                          </select>

                        </div>


                        <p>
                          {complaint.description}
                        </p>


                        <div className="complaint-details">

                          <span>
                            👤 Student ID:{" "}
                            {complaint.student}
                          </span>

                          <span>
                            📂 Category:{" "}
                            {complaint.category}
                          </span>

                          <span>
                            ⚡ Priority:{" "}
                            {complaint.priority}
                          </span>

                          <span className="ai-complaint-badge">
  🤖 AI Classified
</span>


<div className="complaint-assignment">

  <label>
    👨‍🏫 Assign Faculty
  </label>

  <select
    value={complaint.assigned_to || ""}
    onChange={(e) =>
      assignComplaintToFaculty(
        complaint.id,
        e.target.value
      )
    }
  >

    <option value="">
      Select Faculty
    </option>

    {facultyMembers.map((faculty) => {

      const facultyName =
        `${faculty.first_name || ""} ${
          faculty.last_name || ""
        }`.trim();

      return (
        <option
          key={faculty.id}
          value={faculty.id}
        >
          {facultyName ||
            faculty.username}
          {faculty.department
            ? ` - ${faculty.department}`
            : ""}
        </option>
      );

    })}

  </select>

</div>

                          <span>
                            📍 Location:{" "}
                            {complaint.location ||
                              "Not provided"}
                          </span>

                        </div>


                        <small>
                          Submitted:{" "}
                          {new Date(
                            complaint.created_at
                          ).toLocaleString()}
                        </small>

                      </div>

                    )
                  )}

                </div>

              )}

            </section>

          )}


          {/* =====================================================
              ADMIN EMERGENCY REPORTS
          ===================================================== */}

          {showAdminEmergency && (

            <section className="complaint-section">

              <div className="section-header">

                <h2>
                  🚨 Emergency Reports
                </h2>

                <button
                  className="close-events"
                  onClick={() =>
                    setShowAdminEmergency(false)
                  }
                >
                  Close
                </button>

              </div>


              {adminEmergencyReports.length === 0 ? (

                <p>
                  No emergency reports found.
                </p>

              ) : (

                <div className="complaints-list">

                  {adminEmergencyReports.map((report) => (

                    <div
                      className="complaint-card"
                      key={report.id}
                    >

                      <div className="complaint-card-header">

                        <h3>
                          🚨 {report.title}
                        </h3>

                        <select
                          value={report.status}
                          onChange={(e) =>
                            updateEmergencyStatus(
                              report.id,
                              e.target.value
                            )
                          }
                        >

                          <option value="reported">
                            Reported
                          </option>

                          <option value="acknowledged">
                            Acknowledged
                          </option>

                          <option value="resolved">
                            Resolved
                          </option>

                        </select>

                      </div>

                      <p>
                        {report.description}
                      </p>

                      <div className="complaint-details">

                        <span>
                          🚨 Type: {report.emergency_type}
                        </span>

                        <span>
                          👤 Student ID: {report.student}
                        </span>

                        <span>
                          📍 Location: {report.location}
                        </span>

                        <span>
                          📌 Status: {report.status}
                        </span>

                      </div>

                      <small>
                        Reported: {new Date(
                          report.created_at
                        ).toLocaleString()}
                      </small>

                    </div>

                  ))}

                </div>

              )}

            </section>

          )}


          {/* ADMIN QUICK ACTIONS */}

          <section className="content-grid">

            <div className="panel">

              <h2>
                Admin Quick Actions
              </h2>

              <div className="quick-actions">

                <button
                  onClick={
                    loadAdminComplaints
                  }
                >
                  📋 Manage Complaints
                </button>

                <button>
                  📅 Manage Events
                </button>

                <button
                  onClick={loadAdminEmergency}
                >
                  🚨 Manage Emergencies
                </button>

                <button>
                  👥 Manage Users
                </button>

                <button>
                  📊 View Analytics
                </button>

              </div>

            </div>


            <div className="panel">

              <h2>
                Admin Information
              </h2>

              <div className="info-row">

                <span>
                  Username
                </span>

                <strong>
                  {user.username}
                </strong>

              </div>

              <div className="info-row">

                <span>
                  Email
                </span>

                <strong>
                  {user.email ||
                    "Not added"}
                </strong>

              </div>

              <div className="info-row">

                <span>
                  Role
                </span>

                <strong>
                  {user.role}
                </strong>

              </div>

            </div>

          </section>

        </main>

      </div>
    );
  }

  // =====================================================
  // FACULTY DASHBOARD
  // =====================================================

  if (
    user &&
    user.role === "faculty"
  ) {

    return (

      <div className="dashboard">

        {/* SIDEBAR */}

        <aside className="sidebar">

          <div className="brand">
            🎓 CampusIQ
          </div>

          <div className="menu">

            <button className="active">
              Dashboard
            </button>

            <button
              onClick={loadFacultyComplaints}
            >
              📋 Complaints
            </button>

            <button>
              📅 Events
            </button>

            <button
  onClick={() => {
    setShowAIAssistant(true);

    setShowAnalytics(false);
    setShowAdminComplaints(false);
    setShowEvents(false);
    setShowComplaints(false);
    setShowComplaintForm(false);
    setShowFacultyComplaints(false);
    setShowEmergency(false);
    setShowNotifications(false);
  }}
>
  🤖 AI Assistant
</button>

            <button
              onClick={loadNotifications}
            >
              🔔 Notifications
            </button>

            <button>
              👤 Profile
            </button>

          </div>

          <button
            className="logout"
            onClick={handleLogout}
          >
            Logout
          </button>

        </aside>


        {/* MAIN */}

        <main className="main-content">

          <header className="topbar">

            <div>

              <h1>
                Faculty Dashboard
              </h1>

              <p>
                CampusIQ Faculty Management Panel
              </p>

            </div>

            <div className="profile">
              👤 {user.username}
            </div>

          </header>


          {/* WELCOME */}

          <section className="welcome-card">
        {showAIAssistant && (
  <div className="ai-assistant-section">

    <div className="ai-assistant-header">

      <div>
        <h2>🤖 CampusIQ AI Assistant</h2>

        <p>
          Ask anything related to your campus.
        </p>
      </div>

      <div className="ai-header-actions">

        <button
          className="new-ai-chat"
          onClick={() => {
            setAiMessages([]);
            setAiMessage("");
            setShowAIAssistant(true);
          }}
        >
          ➕ New Chat
        </button>

        <button
          className="clear-ai-chat"
          onClick={() => {
            setAiMessages([]);
            setAiMessage("");
          }}
        >
          🗑️ Clear Chat
        </button>

        <button
          className="close-events"
          onClick={() =>
            setShowAIAssistant(false)
          }
        >
          Close
        </button>

      </div>

    </div>

    <div className="ai-chat-box">

      <div className="ai-welcome">
        <h3>👋 Hello!</h3>

        <p>
          I am your CampusIQ AI Assistant.
          How can I help you?
        </p>
      </div>

      <div className="ai-quick-questions">

        <h4>Quick Questions</h4>

        <div className="quick-question-buttons">

          <button
            onClick={() =>
              setAiMessage(
                "What events are available?"
              )
            }
          >
            📅 Campus Events
          </button>

          <button
            onClick={() =>
              setAiMessage(
                "What is the status of my complaints?"
              )
            }
          >
            📝 My Complaints
          </button>

          <button
            onClick={() =>
              setAiMessage(
                "Do I have any unread notifications?"
              )
            }
          >
            🔔 Notifications
          </button>

          <button
            onClick={() =>
              setAiMessage(
                "Do I have any emergency reports?"
              )
            }
          >
            🚨 Emergency
          </button>

          <button
            onClick={() =>
              setAiMessage(
                "Who are the faculty members?"
              )
            }
          >
            👨‍🏫 Faculty
          </button>

          <button
            onClick={() =>
              setAiMessage(
                "What can students do in CampusIQ?"
              )
            }
          >
            🎓 Student Services
          </button>

        </div>

      </div>

      {aiMessages.map((message, index) => (
        <div
          key={index}
          className={
            message.role === "user"
              ? "ai-user-message"
              : "ai-response"
          }
        >
          <strong>
            {message.role === "user"
              ? "👤 You"
              : "🤖 AI Assistant"}
          </strong>

          <p>
            {message.content}
          </p>
        </div>
      ))}

      {aiLoading && (
        <div className="ai-thinking">

          <span>
            🤖 AI Assistant is thinking
          </span>

          <div className="ai-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>

        </div>
      )}

      <div className="ai-input-area">

        <textarea
          value={aiMessage}
          onChange={(e) =>
            setAiMessage(e.target.value)
          }
          onKeyDown={(e) => {

            if (
              e.key === "Enter" &&
              !e.shiftKey
            ) {
              e.preventDefault();
              askAIAssistant();
            }

          }}
          placeholder="Ask CampusIQ anything..."
          rows="3"
        />

        <button
          onClick={askAIAssistant}
          disabled={aiLoading}
        >
          {aiLoading
            ? "Thinking..."
            : "Send 🚀"}
        </button>

      </div>

    </div>

  </div>
)}

            <div>

              <h2>
                Welcome,{" "}
                {user.first_name ||
                  user.username}{" "}
                👋
              </h2>

              <p>
                Manage and monitor campus
                complaints.
              </p>

            </div>

          </section>


          {showNotifications && <NotificationsPanel />}


          {/* FACULTY STATS */}

          <section className="stats">

            <div className="stat-card">

              <span>📋</span>

              <h3>
                Complaints
              </h3>

              <strong>
                {facultyComplaints.length}
              </strong>

              <p>
                Campus complaints
              </p>

            </div>


            <div className="stat-card">

              <span>⏳</span>

              <h3>
                Pending
              </h3>

              <strong>
                {
                  facultyComplaints.filter(
                    (complaint) =>
                      complaint.status ===
                      "pending"
                  ).length
                }
              </strong>

              <p>
                Pending complaints
              </p>

            </div>


            <div className="stat-card">

              <span>🔄</span>

              <h3>
                In Progress
              </h3>

              <strong>
                {
                  facultyComplaints.filter(
                    (complaint) =>
                      complaint.status ===
                      "in_progress"
                  ).length
                }
              </strong>

              <p>
                Being handled
              </p>

            </div>


            <div className="stat-card">

              <span>✅</span>

              <h3>
                Resolved
              </h3>

              <strong>
                {
                  facultyComplaints.filter(
                    (complaint) =>
                      complaint.status ===
                      "resolved"
                  ).length
                }
              </strong>

              <p>
                Resolved complaints
              </p>

            </div>

          </section>


          {/* FACULTY COMPLAINTS */}

          {showFacultyComplaints && (

            <section className="complaint-section">

              <div className="section-header">

                <h2>
                  Campus Complaints
                </h2>

                <button
                  className="close-events"
                  onClick={() =>
                    setShowFacultyComplaints(false)
                  }
                >
                  Close
                </button>

              </div>


              {facultyComplaints.length === 0 ? (

                <p>
                  No complaints found.
                </p>

              ) : (

                <div className="complaints-list">

                  {facultyComplaints.map(
                    (complaint) => (

                      <div
                        className="complaint-card"
                        key={complaint.id}
                      >

                        <div className="complaint-card-header">

                          <h3>
                            {complaint.title}
                          </h3>

<select
  value={complaint.status}
  onChange={(e) =>
    updateFacultyComplaintStatus(
      complaint.id,
      e.target.value
    )
  }
>
  <option value="assigned">
    Assigned
  </option>

  <option value="in_progress">
    In Progress
  </option>

  <option value="resolved">
    Resolved
  </option>
</select>

                        </div>


                        <p>
                          {complaint.description}
                        </p>


                        <div className="complaint-details">

                          <span>
                            👤 Student:{" "}
                            {complaint.student}
                          </span>

                          <span>
                            📂 Category:{" "}
                            {complaint.category}
                          </span>

                          <span>
                            ⚡ Priority:{" "}
                            {complaint.priority}
                          </span>

                          <span>
                            📍 Location:{" "}
                            {complaint.location ||
                              "Not provided"}
                          </span>

                        </div>


                        <small>
                          Submitted:{" "}
                          {new Date(
                            complaint.created_at
                          ).toLocaleString()}
                        </small>

                      </div>

                    )
                  )}

                </div>

              )}

            </section>

          )}


          {/* FACULTY QUICK ACTIONS */}

          <section className="content-grid">

            <div className="panel">

              <h2>
                Faculty Quick Actions
              </h2>

              <div className="quick-actions">

                <button
                  onClick={
                    loadFacultyComplaints
                  }
                >
                  📋 View Complaints
                </button>

                <button
                  onClick={loadNotifications}
                >
                  🔔 Notifications
                </button>

                <button>
                  📅 View Events
                </button>

              </div>

            </div>


            <div className="panel">

              <h2>
                Faculty Information
              </h2>

              <div className="info-row">

                <span>
                  Username
                </span>

                <strong>
                  {user.username}
                </strong>

              </div>


              <div className="info-row">

                <span>
                  Email
                </span>

                <strong>
                  {user.email ||
                    "Not added"}
                </strong>

              </div>


              <div className="info-row">

                <span>
                  Role
                </span>

                <strong>
                  {user.role}
                </strong>

              </div>


              <div className="info-row">

                <span>
                  Department
                </span>

                <strong>
                  {user.department ||
                    "Not added"}
                </strong>

              </div>

            </div>

          </section>

        </main>

      </div>
    );
  }

  // =====================================================
  // STUDENT DASHBOARD
  // =====================================================

  if (user) {

    return (

      <div className="dashboard">

        {/* SIDEBAR */}

        <aside className="sidebar">

          <div className="brand">
            🎓 CampusIQ
          </div>

          <div className="menu">

            <button className="active">
              Dashboard
            </button>

            <button
              onClick={loadEvents}
            >
              Events
            </button>

            <button
              onClick={loadNotifications}
            >
              Notifications
            </button>

            <button
              onClick={loadComplaints}
            >
              Complaints
            </button>


<button
  onClick={loadLostFound}
  className="sidebar-btn"
>
  Lost & Found
</button>

<button
  onClick={loadMyClaims}
  className="sidebar-btn"
>
  My Claims
</button>

            <button
              onClick={loadEmergencyReports}
            >
              🚨 Emergency
            </button>

            <button
  onClick={() => {
    setShowAIAssistant(true);

    setShowAnalytics(false);
    setShowAdminComplaints(false);
    setShowEvents(false);
    setShowComplaints(false);
    setShowComplaintForm(false);
    setShowFacultyComplaints(false);
    setShowEmergency(false);
    setShowNotifications(false);
  }}
>
  🤖 AI Assistant
</button>

            <button>
              Profile
            </button>

          </div>

          <button
            className="logout"
            onClick={handleLogout}
          >
            Logout
          </button>

        </aside>


        {/* MAIN */}

        <main className="main-content">

          <header className="topbar">

            <div>

              <h1>
                Student Dashboard
              </h1>

              <p>
                Welcome back to CampusIQ
              </p>

            </div>

            <div className="profile">
              👤 {user.username}
            </div>

          </header>


          {/* WELCOME */}

          <section className="welcome-card">

            <div>

              <h2>
                Hello,{" "}
                {user.first_name ||
                  user.username}{" "}
                ! 👋
              </h2>

              <p>
                Here is your campus activity
                overview.
              </p>

            </div>

          </section>

          {showAIAssistant && (
  <section className="ai-assistant-section">

    <div className="ai-assistant-header">

      <div>
        <h2>🤖 CampusIQ AI Assistant</h2>

        <p>
          Ask anything related to your campus.
        </p>
      </div>

      <div className="ai-header-actions">

        <button
          className="new-ai-chat"
          onClick={() => {
            setAiMessages([]);
            setAiMessage("");
            setShowAIAssistant(true);
          }}
        >
          ➕ New Chat
        </button>

        <button
          className="clear-ai-chat"
          onClick={() => {
            setAiMessages([]);
            setAiMessage("");
          }}
        >
          🗑️ Clear Chat
        </button>

        <button
          className="close-events"
          onClick={() =>
            setShowAIAssistant(false)
          }
        >
          Close
        </button>

      </div>

    </div>


    <div className="ai-chat-box">

      {aiMessages.length === 0 && (
        <div className="ai-welcome">

          <h3>👋 Welcome to CampusIQ AI</h3>

          <p>
            I can help you with campus events,
            complaints, notifications, faculty
            information and student services.
          </p>

        </div>
      )}


      {aiMessages.map((message, index) => (

        message.role === "user" ? (

          <div
            className="ai-user-message"
            key={index}
          >

            <strong>You</strong>

            <p>
              {message.content}
            </p>

          </div>

        ) : (

          <div
            className="ai-response"
            key={index}
          >

            <strong>🤖 CampusIQ AI</strong>

            <p>
              {message.content}
            </p>

          </div>

        )

      ))}


      {aiLoading && (

        <div className="ai-thinking">

          <span>
            🤖 AI Assistant is thinking
          </span>

          <div className="ai-dots">

            <span></span>
            <span></span>
            <span></span>

          </div>

        </div>

      )}


      {aiMessages.length === 0 && (

        <div className="ai-quick-questions">

          <h4>Quick Questions</h4>

          <div className="quick-question-buttons">

            <button
              onClick={() =>
                setAiMessage(
                  "What events are available?"
                )
              }
            >
              📅 Campus Events
            </button>

            <button
              onClick={() =>
                setAiMessage(
                  "What is the status of my complaints?"
                )
              }
            >
              📝 My Complaints
            </button>

            <button
              onClick={() =>
                setAiMessage(
                  "Do I have any unread notifications?"
                )
              }
            >
              🔔 Notifications
            </button>

            <button
              onClick={() =>
                setAiMessage(
                  "Do I have any emergency reports?"
                )
              }
            >
              🚨 Emergency
            </button>

            <button
              onClick={() =>
                setAiMessage(
                  "Who are the faculty members?"
                )
              }
            >
              👨‍🏫 Faculty
            </button>

            <button
              onClick={() =>
                setAiMessage(
                  "What can students do in CampusIQ?"
                )
              }
            >
              🎓 Student Services
            </button>

          </div>

        </div>

      )}

    </div>


    <div className="ai-input-area">

      <textarea
        value={aiMessage}
        onChange={(e) =>
          setAiMessage(e.target.value)
        }
        onKeyDown={(e) => {

          if (
            e.key === "Enter" &&
            !e.shiftKey
          ) {

            e.preventDefault();

            askAIAssistant();

          }

        }}
        placeholder="Ask CampusIQ anything..."
        rows="3"
      />

      <button
        onClick={askAIAssistant}
        disabled={
          aiLoading ||
          !aiMessage.trim()
        }
      >
        {aiLoading
          ? "Thinking..."
          : "Send"}
      </button>

    </div>

  </section>
)}


          {showNotifications && <NotificationsPanel />}


          {/* COMPLAINT FORM */}

          {showComplaintForm && (

            <section className="complaint-section">

              <div className="section-header">

                <h2>
                  Submit a Complaint
                </h2>

                <button
                  className="close-events"
                  onClick={() =>
                    setShowComplaintForm(false)
                  }
                >
                  Close
                </button>

              </div>


              <form
                className="complaint-form"
                onSubmit={submitComplaint}
              >

                <label>
                  Complaint Title
                </label>

                <input
                  type="text"
                  name="title"
                  placeholder="Example: AC not working"
                  value={complaintForm.title}
                  onChange={
                    handleComplaintChange
                  }
                  required
                />


                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  placeholder="Describe your complaint..."
                  value={
                    complaintForm.description
                  }
                  onChange={
                    handleComplaintChange
                  }
                  rows="5"
                  required
                />


                <label>
                  Category
                </label>

                <select
                  name="category"
                  value={
                    complaintForm.category
                  }
                  onChange={
                    handleComplaintChange
                  }
                >

                  <option value="academic">
                    Academic
                  </option>

                  <option value="infrastructure">
                    Infrastructure
                  </option>

                  <option value="hostel">
                    Hostel
                  </option>

                  <option value="electricity">
                    Electricity
                  </option>

                  <option value="water">
                    Water
                  </option>

                  <option value="cleanliness">
                    Cleanliness
                  </option>

                  <option value="internet">
                    Internet
                  </option>

                  <option value="other">
                    Other
                  </option>

                </select>


                <label>
                  Priority
                </label>

                <select
                  name="priority"
                  value={
                    complaintForm.priority
                  }
                  onChange={
                    handleComplaintChange
                  }
                >

                <button
  type="button"
  className="ai-analyze-button"
  onClick={analyzeComplaintWithAI}
  disabled={aiComplaintLoading}
>
  {aiComplaintLoading
    ? "🤖 Analyzing..."
    : "🤖 Analyze with AI"}
</button>


{aiComplaintReason && (
  <div className="ai-complaint-result">
    <strong>🤖 AI Analysis:</strong>
    <p>{aiComplaintReason}</p>
  </div>
)}

                  <option value="low">
                    Low
                  </option>

                  <option value="medium">
                    Medium
                  </option>

                  <option value="high">
                    High
                  </option>

                  <option value="urgent">
                    Urgent
                  </option>

                </select>


                                <button
                  type="button"
                  className="ai-analyze-button"
                  onClick={analyzeComplaintWithAI}
                  disabled={aiComplaintLoading}
                >
                  {aiComplaintLoading
                    ? "🤖 Analyzing..."
                    : "🤖 Analyze with AI"}
                </button>


                {aiComplaintReason && (
                  <div className="ai-complaint-result">
                    <strong>🤖 AI Analysis:</strong>
                    <p>{aiComplaintReason}</p>
                  </div>
                )}


                <label>
                  Location
                </label>

                <input
                  type="text"
                  name="location"
                  placeholder="Example: MCA Lab 204"
                  value={
                    complaintForm.location
                  }
                  onChange={
                    handleComplaintChange
                  }
                />


                <button
                  type="submit"
                  className="submit-complaint"
                >
                  Submit Complaint
                </button>

              </form>

            </section>

          )}



{/* EVENTS TABLE */}
{showEvents && (
  <section className="events-section data-section">
    <div className="section-header table-section-header">
      <div>
        <span className="table-eyebrow">CAMPUS ACTIVITIES</span>
        <h2>Upcoming Events</h2>
        <p>Explore and register for campus events.</p>
      </div>

      <button
        type="button"
        className="close-events"
        onClick={() => setShowEvents(false)}
      >
        Close
      </button>
    </div>

    <div className="table-summary">
      <div>
        <span className="summary-label">Total Events</span>
        <strong>{events.length}</strong>
      </div>
      <div>
        <span className="summary-label">Registered</span>
        <strong>{registeredEvents.length}</strong>
      </div>
    </div>

    {events.length === 0 ? (
      <div className="table-empty">
        <span>📅</span>
        <h3>No events available</h3>
        <p>New campus events will appear here.</p>
      </div>
    ) : (
      <div className="table-scroll">
        <table className="campus-data-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Date</th>
              <th>Time</th>
              <th>Venue</th>
              <th>Organizer</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {events.map((event) => {
              const isRegistered = registeredEvents.includes(event.id);

              return (
                <tr key={event.id}>
                  <td>
                    <div className="table-primary">
                      <span className="table-avatar event-avatar">
                        📅
                      </span>
                      <div>
                        <strong>{event.title || "Untitled event"}</strong>
                        <small>{event.description || "No description"}</small>
                      </div>
                    </div>
                  </td>

                  <td>{event.date || "—"}</td>
                  <td>{event.time || "—"}</td>
                  <td>{event.venue || "—"}</td>
                  <td>{event.organizer || "—"}</td>

                  <td>
                    <button
                      type="button"
                      className={`table-action ${
                        isRegistered ? "action-done" : ""
                      }`}
                      disabled={isRegistered}
                      onClick={() => registerForEvent(event.id)}
                    >
                      {isRegistered ? "Registered ✓" : "Register"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )}
  </section>
)}




{/* MY COMPLAINTS TABLE */}
{showComplaints && (
  <section className="complaint-section data-section">
    <div className="section-header table-section-header">
      <div>
        <span className="table-eyebrow">STUDENT SUPPORT</span>
        <h2>My Complaints</h2>
        <p>Track your submitted complaints and their status.</p>
      </div>

      <button
        type="button"
        className="close-events"
        onClick={() => setShowComplaints(false)}
      >
        Close
      </button>
    </div>

    <div className="table-summary">
      <div>
        <span className="summary-label">Total Complaints</span>
        <strong>{complaints.length}</strong>
      </div>
      <div>
        <span className="summary-label">Open</span>
        <strong>
          {complaints.filter(
            (item) => String(item.status).toLowerCase() === "open"
          ).length}
        </strong>
      </div>
    </div>

    {complaints.length === 0 ? (
      <div className="table-empty">
        <span>📋</span>
        <h3>No complaints yet</h3>
        <p>Your submitted complaints will appear here.</p>
      </div>
    ) : (
      <div className="table-scroll">
        <table className="campus-data-table">
          <thead>
            <tr>
              <th>Complaint</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Location</th>
              <th>Submitted</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {complaints.map((complaint) => (
              <tr key={complaint.id}>
                <td>
                  <div className="table-primary">
                    <span className="table-avatar complaint-avatar">
                      📋
                    </span>
                    <div>
                      <strong>
                        {complaint.title || "Untitled complaint"}
                      </strong>
                      <small>
                        {complaint.description || "No description"}
                      </small>
                    </div>
                  </div>
                </td>

                <td>{complaint.category || "—"}</td>

                <td>
                  <span
                    className={`table-badge priority-${String(
                      complaint.priority || "normal"
                    ).toLowerCase()}`}
                  >
                    {complaint.priority || "Normal"}
                  </span>
                </td>

                <td>{complaint.location || "Not provided"}</td>

                <td>
                  {complaint.created_at
                    ? new Date(complaint.created_at).toLocaleDateString()
                    : "—"}
                </td>

                <td>
                  <span
                    className={`table-badge status-${String(
                      complaint.status || "pending"
                    ).toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {complaint.status || "Pending"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </section>
)}


{/* LOST & FOUND REPORTS TABLE */}


{showLostFound && (
  <section className="dashboard-section">
    <div className="section-header table-section-header">
      <div>
        <span className="table-eyebrow">CAMPUS COMMUNITY</span>
        <h2>Lost & Found</h2>
        <p>Report a lost item or help someone find their belongings.</p>
      </div>

      <button
        type="button"
        className="table-action"
        onClick={() => setShowLostFoundForm(!showLostFoundForm)}
      >
        {showLostFoundForm ? "Cancel" : "+ Add Item"}
      </button>
    </div>

    {showLostFoundForm && (
      <form
        className="complaint-form"
        onSubmit={(e) => {
          e.preventDefault();
          submitLostFound();
        }}
      >
        <label>
          Item Name *
          <input
            name="title"
            value={lostFoundForm.title}
            onChange={handleLostFoundChange}
            required
            placeholder="e.g. Black wallet"
          />
        </label>

        <label>
          Report Type *
          <select
            name="report_type"
            value={lostFoundForm.report_type}
            onChange={handleLostFoundChange}
            required
          >
            <option value="lost">I lost an item</option>
            <option value="found">I found an item</option>
          </select>
        </label>

        <label>
          Category *
          <input
            name="category"
            value={lostFoundForm.category}
            onChange={handleLostFoundChange}
            required
            placeholder="e.g. electronics"
          />
        </label>

        <label>
          Description *
          <textarea
            name="description"
            value={lostFoundForm.description}
            onChange={handleLostFoundChange}
            required
            placeholder="Describe the item"
          />
        </label>

        <label>
          Location *
          <input
            name="location"
            value={lostFoundForm.location}
            onChange={handleLostFoundChange}
            required
            placeholder="Where was it lost or found?"
          />
        </label>

        <label>
          Date *
          <input
            type="date"
            name="date_lost_found"
            value={lostFoundForm.date_lost_found}
            onChange={handleLostFoundChange}
            required
          />
        </label>

        <label>
          Photo (optional)
          <input
            type="file"
            name="photo"
            accept="image/*"
            onChange={handleLostFoundChange}
          />
        </label>

        <button type="submit" className="table-action">
          Submit Report
        </button>
      </form>
    )}
  </section>
)}

{lostFoundItems.length === 0 ? (
  <div className="table-empty">
    <span>🔎</span>
    <h3>No reports found</h3>
    <p>Try changing your search or filters.</p>
  </div>
) : (
  <div className="table-scroll">
    <table className="campus-data-table">
      <thead>
        <tr>
          <th>Item</th>
          <th>Type</th>
          <th>Category</th>
          <th>Location</th>
          <th>Date</th>
          <th>Reported By</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        {lostFoundItems.map((item) => (
          <tr key={item.id}>
            <td>
              <div className="table-primary">
                <span className="table-avatar lost-avatar">
                  {item.report_type === "lost" ? "🔍" : "🎒"}
                </span>
                <div>
                  <strong>{item.title || "Untitled item"}</strong>
                  <small>{item.description || "No description"}</small>
                </div>
              </div>
            </td>

            <td>
              <span
                className={`table-badge ${
                  item.report_type === "lost"
                    ? "type-lost"
                    : "type-found"
                }`}
              >
                {item.report_type || "—"}
              </span>
            </td>

            <td>
              {(item.category || "other").replace(/_/g, " ")}
            </td>

            <td>{item.location || "Not provided"}</td>

            <td>{item.date_lost_found || "—"}</td>

            <td>{item.reporter_username || "—"}</td>

            <td>
              <span
                className={`table-badge status-${String(
                  item.status || "open"
                ).toLowerCase()}`}
              >
                {item.status || "Open"}
              </span>
            </td>

            <td>
              {item.report_type === "found" &&
              item.status === "open" &&
              item.reporter_username !== user?.username ? (
                <button
                  type="button"
                  className="table-action"
                  onClick={() => claimLostFoundItem(item.id)}
                >
                  Claim Item
                </button>
              ) : (
                <span className="table-no-action">—</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}



{/* MY CLAIMS — kept outside the Lost & Found conditional */}
{showMyClaims && (
  <div className="dashboard-section">
    <h2>My Claims</h2>
    <p>Items you have claimed from Lost & Found.</p>

    {myClaims.length === 0 ? (
      <p>You have not claimed any items yet.</p>
    ) : (
      <div className="lost-found-list">
        {myClaims.map((item) => (
          <div
            key={item.id}
            className="lost-found-card"
          >
            <h3>{item.title}</h3>

            <p>
              <strong>Category:</strong>{" "}
              {item.category}
            </p>

            <p>
              <strong>Description:</strong>{" "}
              {item.description}
            </p>

            <p>
              <strong>Location:</strong>{" "}
              {item.location}
            </p>

            <p>
              <strong>Reported by:</strong>{" "}
              {item.reporter_username}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {item.status}
            </p>

            <p>
              <strong>Claimed on:</strong>{" "}
              {item.claimed_at
                ? new Date(item.claimed_at).toLocaleString()
                : "Not available"}
            </p>
          </div>
        ))}
      </div>
    )}
  </div>
)}




          {/* =====================================================
              EMERGENCY REPORTING
          ====================================================== */}

          {showEmergency && (

            <section className="complaint-section">

              <div className="section-header">

                <h2>
                  🚨 Emergency Reporting
                </h2>

                <button
                  className="close-events"
                  onClick={() =>
                    setShowEmergency(false)
                  }
                >
                  Close
                </button>

              </div>

              <form
                className="complaint-form"
                onSubmit={submitEmergency}
              >

                <label>
                  Emergency Type
                </label>

                <select
                  name="emergency_type"
                  value={
                    emergencyForm.emergency_type
                  }
                  onChange={
                    handleEmergencyChange
                  }
                  required
                >

                  <option value="medical">
                    Medical Emergency
                  </option>

                  <option value="fire">
                    Fire
                  </option>

                  <option value="security">
                    Security
                  </option>

                  <option value="accident">
                    Accident
                  </option>

                  <option value="other">
                    Other
                  </option>

                </select>

                <label>
                  Emergency Title
                </label>

                <input
                  type="text"
                  name="title"
                  placeholder="Example: Medical emergency in hostel"
                  value={emergencyForm.title}
                  onChange={
                    handleEmergencyChange
                  }
                  required
                />

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  placeholder="Describe the emergency..."
                  value={
                    emergencyForm.description
                  }
                  onChange={
                    handleEmergencyChange
                  }
                  rows="5"
                  required
                />

                <label>
                  Location
                </label>

                <input
                  type="text"
                  name="location"
                  placeholder="Example: Block A, Room 204"
                  value={
                    emergencyForm.location
                  }
                  onChange={
                    handleEmergencyChange
                  }
                  required
                />

                <button
                  type="submit"
                  className="submit-complaint"
                >
                  🚨 Report Emergency
                </button>

              </form>

              <div
                style={{
                  marginTop: "30px"
                }}
              >

                <h3>
                  My Emergency Reports
                </h3>

                {emergencyReports.length === 0 ? (

                  <p>
                    No emergency reports yet.
                  </p>

                ) : (

                  <div>

                    {emergencyReports.map(
                      (report) => (

                        <div
                          key={report.id}
                          className="panel"
                          style={{
                            marginTop: "15px"
                          }}
                        >

                          <h3>
                            {report.title}
                          </h3>

                          <p>
                            {report.description}
                          </p>

                          <div className="complaint-details">

                            <span>
                              🚨 Type: {report.emergency_type}
                            </span>

                            <span>
                              📍 Location: {report.location}
                            </span>

                            <span>
                              📌 Status: {report.status}
                            </span>

                          </div>

                          <small>
                            Reported: {new Date(
                              report.created_at
                            ).toLocaleString()}
                          </small>

                        </div>

                      )
                    )}

                  </div>

                )}

              </div>

            </section>

          )}


          {/* STUDENT STATS */}

          <section className="stats">

            <div className="stat-card">

              <span>📅</span>

              <h3>
                Events
              </h3>

              <strong>
                {events.length}
              </strong>

              <p>
                Upcoming events
              </p>

            </div>


            <div className="stat-card">

              <span>🔔</span>

              <h3>
                Notifications
              </h3>

              <strong>
  {unreadNotificationCount}
</strong>

<p>
  Unread notifications
</p>

            </div>


            <div className="stat-card">

              <span>📝</span>

              <h3>
                Complaints
              </h3>

              <strong>
                {complaints.length}
              </strong>

              <p>
                Your complaints
              </p>

            </div>


            <div className="stat-card">

              <span>🚨</span>

              <h3>
                Emergency
              </h3>

              <strong>
                {emergencyReports.length}
              </strong>

              <p>
                Emergency reports
              </p>

            </div>

          </section>


          {/* STUDENT INFORMATION */}

          <section className="content-grid">

            <div className="panel">

              <h2>
                My Information
              </h2>

              <div className="info-row">

                <span>
                  Username
                </span>

                <strong>
                  {user.username}
                </strong>

              </div>


              <div className="info-row">

                <span>
                  Email
                </span>

                <strong>
                  {user.email ||
                    "Not added"}
                </strong>

              </div>


              <div className="info-row">

                <span>
                  Role
                </span>

                <strong>
                  {user.role ||
                    "Student"}
                </strong>

              </div>


              <div className="info-row">

                <span>
                  Student ID
                </span>

                <strong>
                  {user.student_id ||
                    "Not added"}
                </strong>

              </div>


              <div className="info-row">

                <span>
                  Department
                </span>

                <strong>
                  {user.department ||
                    "Not added"}
                </strong>

              </div>

            </div>


            {/* QUICK ACTIONS */}

            <div className="panel">

              <h2>
                Quick Actions
              </h2>

              <div className="quick-actions">

                <button
                  onClick={loadEvents}
                >
                  📅 View Events
                </button>

                <button
                  onClick={loadNotifications}
                >
                  🔔 Notifications
                </button>

                <button
                  onClick={() =>
                    setShowComplaintForm(true)
                  }
                >
                  📝 Submit Complaint
                </button>

                <button
                  onClick={loadComplaints}
                >
                  📋 My Complaints
                </button>

                <button
                  onClick={loadEmergencyReports}
                >
                  🚨 Emergency Help
                </button>

              </div>

            </div>

          </section>

        </main>

      </div>
    );
  }

  // =====================================================
  // LOGIN PAGE
  // =====================================================

  return (

    <div className="login-page">

      <div className="login-card">

        <div className="logo">
          🎓
        </div>

        <h1>
          CampusIQ
        </h1>

        <p className="subtitle">
          Smart Campus Management System
        </p>


        <form onSubmit={handleLogin}>

          <label>
            Username
          </label>

          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
            required
          />


          <label>
            Password
          </label>

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />


          <button type="submit">
            Login
          </button>

        </form>


        {message && (
          <p className="message">
            {message}
          </p>
        )}


        <div className="login-info">
          Student • Faculty • Admin
        </div>

      </div>

    </div>
  );
}

export default App;
