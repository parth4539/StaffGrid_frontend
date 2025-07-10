import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import Cookies from 'js-cookie';
import './css/sendannouncement.css';
import { Link ,useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function SendAnnouncement() {
  const { register, handleSubmit, reset } = useForm(); 
  const [responseMessage, setResponseMessage] = useState("");
  const [rangeOption, setRangeOption] = useState("Specific");
  const [emprole, setemprole] = useState("");
  const navigate = useNavigate();

  useEffect(() => { 
    const role = Cookies.get('employeeRole');
    setemprole(role);
  }, []);

  const submitHandler = async (data) => { 
    const token = Cookies.get("jwt11");
    const empid = Cookies.get('employeeID');
    let flag = 0;
    let empIDS = [];

    if(emprole === 'manager'){ 
      if(data.rangeOption !== "Range"){ 
        empIDS = data.specificEmployeeId.split(',').map(id => id.trim());
        empIDS.forEach(ids => {
          if(ids.substr(5,1) !== '3' || ids.length !== 10){
            flag=1;
          }
        });
      } else { 
        const start = data.rangeStart;
        const end = data.rangeEnd;
        
        if(start.substr(5,1) !== '3' || start.length !== 10 || end.substr(5,1) !== '3' || end.length !== 10 || end < start){
          flag=1;
          return;
        } else {
          for (let i = start; i <= end; i++) {
            const empId = `${i}`;  
            empIDS.push(empId);
          }
          // alert("Valid IDs in range:", empIDS);
        }      
      }
    } else if(emprole === 'admin'){ 
      if(data.rangeOption === "Specific"){ 
        empIDS = data.specificEmployeeId.split(',').map(id => id.trim());
        empIDS.forEach(ids => {
          if(ids.substr(5,1) === '0' || ids.length !== 10 || ids.substr(5,1) > '3'){
            flag=1; 
          }
        });
      } else if(data.rangeOption === 'All'){ 
        const mstart = "2024020001";
        const hstart = "2024010001";
        const estart = "2024030001";
        
        try {
          const response = await axios.get(`${process.env.REACT_APP_BACKEND_BASEURL}/api/login/alllastcnt`, 
          {
            withCredentials: true,
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          const { employee, manager, hr } = response.data.lastIds;
          
          if(employee > estart){
            for (let i = estart; i <= employee; i++) {
              const empId = `${i}`;  
              empIDS.push(empId);
            }
          }
          if(manager > mstart){
            for (let i = mstart; i <= manager; i++) {
              const empId = `${i}`;  
              empIDS.push(empId);
            }
          }
          if(hr > hstart){
            for (let i = hstart; i <= hr; i++) {
              const empId = `${i}`;  
              empIDS.push(empId);
            }
          }
        } catch(error){
          console.log(error);
          if(error.response.data.error=="jwt malformed"){
        toast.error("Session expired. Redirecting to login...");
            setTimeout(() => {
              navigate("/api/login");
            }, 2000);
          }
        }
      } else { 
        const start = data.rangeStart;
        const end = data.rangeEnd;

        if((start.substr(5,1) !== end.substr(5,1)) || start.substr(5,1) < '1' || start.length !== 10 || end.substr(5,1) !== '3' || end.length !== 10 || end < start || start.substr(5,1) > '3' || end.substr(5,1) < '1' || start.substr(5,1) > '3'){
          flag=1;
        } else {
          for (let i = start; i <= end; i++) {
            const empId = `${i}`;  
            empIDS.push(empId);
          }
          // console.log("Valid IDs in range: ADMIN", empIDS);
        }      
      }
    } else if(emprole === 'hr'){ 
      if(data.rangeOption !== "Range"){ 
        empIDS = data.specificEmployeeId.split(',').map(id => id.trim());
        empIDS.forEach(ids => {
          if(ids.substr(5,1) <= '1' || ids.length !== 10 || ids.substr(5,1) > '3'){
            flag=1;
          }
        });
      } else { 
        const start = data.rangeStart; 
        const end = data.rangeEnd;

        if(( start.substr(5,1) !== end.substr(5,1)) || start.length !== 10 || end.length !== 10 || end < start || start.substr(5,1) <= '1' || start.substr(5,1) > '3' || end.substr(5,1) <= '1' || end.substr(5,1) > '3'){
          flag=1;
        } else {
          for (let i = start; i <= end; i++) {
            const empId = `${i}`;  
            empIDS.push(empId);
          }
          // console.log("Valid IDs in range:", empIDS);
        }      
      }
    }

    try {

      if(flag === 1) {
        toast.error("Error: Invalid Employee IDs");
        setResponseMessage("Invalid Employee IDs.");
        return; 
      }

      const response = await axios.post(`${process.env.REACT_APP_BACKEND_BASEURL}/api/login/announcement`, {
        senderID: empid,
        senderRole: emprole,
        receiverIDs: empIDS,
        message: data.message,
      }, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      reset();
      setResponseMessage("Announcement sent successfully!");
      toast.success("Successfully send Announcement");
      console.log("PROBLEM: ", response)
    } catch (error) {
      // console.error("Error sending announcement", error);
      toast.error("Error: Invalid Employee IDs8");
      setResponseMessage("Failed to send announcement.");
      if(error.response.data.error=="jwt malformed"){
        toast.error("Session expired. Redirecting to login...");
        setTimeout(() => {
          navigate("/api/login");
        }, 2000);
      }
    }
  };

  return (
    <div className="send-announcement-container">
      <h2 className="title">Send Announcement</h2>
      <form onSubmit={handleSubmit(submitHandler)}>
        <label className="announcement-formlabel">Message:</label>
        <input
          className="announcement-forminput"
          type="text"
          placeholder="Enter your message here"
          {...register('message', { required: true })}
        />

        <label className="radio-label">
          <input
            type="radio"
            {...register("rangeOption")}
            value="Specific"
            checked={rangeOption === "Specific"}
            onChange={() => setRangeOption("Specific")}
          />
          Specific Employee ID
        </label>
        {rangeOption === "Specific" && (
          <input
            className="announcement-forminput"
            type="text"
            placeholder="Enter Employee ID"
            {...register('specificEmployeeId', { required: rangeOption === "Specific" })}
          />
        )}

        <label className="radio-label">
          <input
            type="radio"
            {...register("rangeOption")}
            value="Range"
            checked={rangeOption === "Range"}
            onChange={() => setRangeOption("Range")}
          />
          Range (Start and End)
        </label>
        {rangeOption === "Range" && (
          <>
            <input
              className="announcement-forminput"
              type="text"
              placeholder="Enter Start ID"
              {...register('rangeStart', { required: rangeOption === "Range" })}
            />
            <input
              className="announcement-forminput"
              type="text"
              placeholder="Enter End ID"
              {...register('rangeEnd', { required: rangeOption === "Range" })}
            />
          </>
        )}

        {emprole === "admin" && (
          <label className="radio-label">
            <input
              type="radio"
              {...register("rangeOption")}
              value="All"
              checked={rangeOption === "All"}
              onChange={() => setRangeOption("All")}
            />
            All Employees
          </label>
        )}

        <button type="submit" className="announcement-submitbuttonn">
          Send
        </button>
      </form>
      {responseMessage && <p className="response-message">{responseMessage}</p>}


      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

    </div>
  );
}

export default SendAnnouncement;
