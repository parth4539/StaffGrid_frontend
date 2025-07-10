import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import './css/viewannouncement.css';
import { Link ,useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ViewAnnouncement() {
  const [announcements, setAnnouncements] = useState([]);
  const [announcementByMe, setAnnouncementByMe] = useState([]);
  const [activeTab, setActiveTab] = useState("Sent by Me");
  const navigate = useNavigate();
  const token = Cookies.get("jwt11");
  const empid = Cookies.get('employeeID');
  const role = Cookies.get('employeeRole'); 
  // console.log("ROLE:",role)
  

  const getAllMessages = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_BASEURL}/api/login/viewannouncement`, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setAnnouncements(response.data.announcements);
    } catch (error) {
      console.log(error);
      if(error.response.data.error=="jwt malformed"){
        setTimeout(() => {
          navigate("/api/login");
        }, 2000);
      }
    }
  };

  const getMessagesSentByMe = async () => {
    if (role !== "Employee") {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_BASEURL}/api/login/viewannouncementsendbyme`, {
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setAnnouncementByMe(response.data.announcements);
      } catch (error) {
        console.log(error);
        if(error.response.data.error=="jwt malformed"){
        toast.error("Session expired. Redirecting to login...");
          setTimeout(() => {
            navigate("/api/login");
          }, 2000);
        }
      }
    }
  };

  useEffect(() => {
    getAllMessages();
    if (role !== "employee") {
      getMessagesSentByMe();
    }
    if(role=="employee"){
      setActiveTab("All")
    }
    if(role=="admin"){
      setActiveTab("Sent by Me")
    }
  }, []);

  const renderAnnouncements = (announcementsList) => {
    return announcementsList.length > 0 ? (
      announcementsList.map((announcement) => (
        <div key={announcement._id} className="announcement-card">
          <p className="announcement-text"><strong>Message:</strong> {announcement.message}</p>
          <p className="announcement-text"><strong>Role:</strong> {announcement.senderRole}</p>
          <p className="announcement-text"><strong>Sender ID:</strong> {announcement.senderID}</p>
          <p className="announcement-text"><strong>Created At:</strong> {new Date(announcement.createdAt).toLocaleString()}</p>
        </div>
      ))
    ) : (
      <p className="no-announcements">No announcements found.</p>
    );
  };

  return (
    <div className="view-announcement-container">
      <h2 className="header">Announcements {empid}</h2>
      <div className="tab-container">
        {role !== 'admin' && <div
          className={`tab ${activeTab === "All" ? "active" : ""}`}
          onClick={() => setActiveTab("All")}
        >
          All
        </div>}
        {role !== "employee" && <div
            className={`tab ${activeTab === "Sent by Me" ? "active" : ""}`}
            onClick={() => setActiveTab("Sent by Me")}
          >
            Sent by Me
          </div>}
        
      </div>
      <div className="announcements-list">
        {activeTab === "All" ? renderAnnouncements(announcements) : renderAnnouncements(announcementByMe)}
      </div>
    </div>
  );
}

export default ViewAnnouncement;
