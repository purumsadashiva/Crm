//imports
import { useState, useEffect } from "react";
import "../index.css";
import * as XLSX from "xlsx";//for downloading the data from the table in xl format
import * as FileSaver from "file-saver";// for saving the fle
import PopupMessage from "./PopupMessage";

function TablePage() {
    //initialData or default data that i have added to table
  const initialData = [
    {
      "Lead Name": "Lokesh",
      Email: "Lokesh@gmail.com",
      "Phone-No": 6302125940,
      Status: "New",
    },
    {
      "Lead Name": "sada shiva",
      Email: "sadashivapurum@gmail.com",
      "Phone-No": 9848044124,
      Status: "Contacted",
    },
    {
        "Lead Name": "Venkatesh",
        Email: "venkat@gmail.com",
        "Phone-No": 9397491320,
        Status: "Qualified",
      },
  ];
//saving the data inside local storage
  const saveDataToLocal = (data) => {
    localStorage.setItem("leads", JSON.stringify(data));
  };

  //getting the data from the localstorage
// Getting the data from local storage or returning initialData if no data found
const getDataFromLocal = () => {
  const localData = localStorage.getItem("leads");
  return localData ? JSON.parse(localData) : initialData; // Return initialData if localData is null
};


  //usestates
  const [data, setData] = useState(getDataFromLocal);
  const [isFormOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [formIndex, setFormIndex] = useState(null);
  const [formData, setFormData] = useState({
    "Lead Name": "",
    Email: "",
    "Phone-No": "",
    Status: "",
  });

  const [selectedRows, setSelectedRows] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [leadNameQuery, setLeadNameQuery] = useState("");
  const [emailQuery, setEmailQuery] = useState("");
  const [statusQuery, setStatusQuery] = useState("");

  //function that will open the form for adding new lead and updating existing lead
  const openForm = (mode, index) => {
    setFormOpen(true);
    setFormMode(mode);
    setFormIndex(index);
    setFormData(
      index !== null
        ? data[index]
        : {
            "Lead Name": "",
            Email: "",
            "Phone-No": "",
            Status: "New",
          }
    );
  };

  //function that will close the form by clicking on cancel button
  const closeForm = () => {
    setFormOpen(false);
    setFormMode("create");
    setFormIndex(null);
  };

//onchange functionality for user input
  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  //functionality for add lead and update button
  const handleAction = () => {
    // Checking if all required fields are filled
    if (
      formData["Lead Name"].trim() === "" ||
      formData.Email.trim() === "" ||
      formData["Phone-No"].toString().trim() === "" ||
      formData.Status.trim() === ""
    ) {
      //checking If any required field is empty, show an error message
      setSuccessMessage("Please fill in all fields.");
      return;
    }

    // Checking phone number length
    if (formData["Phone-No"].toString().trim().length !== 10) {
      setSuccessMessage("Please enter a valid 10-digit phone number.");
      return;
    }

    // Checking email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.Email.trim())) {
      setSuccessMessage("Please enter a valid email address.");
      return;
    }
    if (formMode === "create") {
      setData((prevData) => [...prevData, formData]);
      setSuccessMessage("Lead Added successfully");
    } else if (formMode === "update" && formIndex !== null) {
      setData((prevData) => {
        const newData = [...prevData];
        newData[formIndex] = formData;
        return newData;
      });
      setSuccessMessage("Lead Updated successfully");
    }
    closeForm();
  };

  //functionality for delete button in action header
  const handleDelete = (index) => {
    setData((prevData) => {
      const newData = [...prevData];
      newData.splice(index, 1);
      return newData;
    });
    setSuccessMessage(" Lead data Deleted successfully");
  };

  //funtion that will toggle all rows in select all header
  const handleToggleSelectAll = () => {
    if (selectedRows.length === data.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(data.map((_, index) => index));
    }
  };

  //funtion that will toggle only selected  rows in all rows
  const handleToggleSelectRow = (index) => {
    setSelectedRows((prevSelectedRows) => {
      if (prevSelectedRows.includes(index)) {
        return prevSelectedRows.filter((i) => i !== index);
      } else {
        return [...prevSelectedRows, index];
      }
    });
  };

  //funtion that will delete only selected rows
  const handleDeleteSelected = () => {
    if (selectedRows.length > 0) {
      setData((prevData) => {
        const newData = [...prevData];
        selectedRows.sort((a, b) => b - a);

        selectedRows.forEach((index) => {
          newData.splice(index, 1);
        });

        setSelectedRows([]);
        return newData;
      });
      setSuccessMessage("Selected Rows deleted successfully");
    }
  };

  //function for downloading table data in excel
  const downloadExcel = (Data, fileName) => {
    const fileType ="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";
    const ws = XLSX.utils.json_to_sheet(Data);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: fileType });

    FileSaver.saveAs(blob, fileName + fileExtension);
    setSuccessMessage("Downloaded successfully");
  };

  const handleDownload = () => {
    const fileName = "customerRelationshipManagement";
    downloadExcel(data, fileName);
  };

  //filter functionality that will search leadname,email,status and filter accordingly
  const filteredData = data.filter((row) => {
    if (!row) return false; // Adding null check

    const leadName = (row["Lead Name"] || "").toLowerCase();
    const email = (row.Email || "").toLowerCase();
    const status = (row.Status || "").toLowerCase();

    return (
      (leadNameQuery === "" ||
        leadName.startsWith(leadNameQuery.toLowerCase())) &&
      (emailQuery === "" || email.startsWith(emailQuery.toLowerCase())) &&
      (statusQuery === "" || status.startsWith(statusQuery.toLowerCase()))
    );
  });
//useeffect hook that will save data to local storage
  useEffect(() => {
    saveDataToLocal(data);
  }, [data]);
  return (
    <div className="main-div">
      <div>
        <h1 style={{color:"#00d7b9",fontFamily:"Ariel",fontWeight:"700"}}>Customer Relationship Management</h1>
      </div>
      <div className="search-filters">
        <input
          type="text"
          placeholder="Search Lead Name"
          value={leadNameQuery}
          onChange={(e) => setLeadNameQuery(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search Email"
          value={emailQuery}
          onChange={(e) => setEmailQuery(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search Status"
          value={statusQuery}
          onChange={(e) => setStatusQuery(e.target.value)}
        />
      </div>
      <div className="table-div">
        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={
                    selectedRows.length === data.length && data.length > 0
                  }
                  onChange={handleToggleSelectAll}
                />
                Select All
              </th>
              <th>
                Lead Name
              </th>
              <th>
                Email-Address
              </th>
              <th>
                Phone-No
              </th>
              <th>
                Status
              </th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(index)}
                    onChange={() => handleToggleSelectRow(index)}
                  />
                </td>
                <td>{row["Lead Name"]}</td>
                <td>{row.Email}</td>
                <td>{row["Phone-No"]}</td>
                <td>
                  {isFormOpen && formIndex === index ? (
                    <select
                      name="Status"
                      value={formData.Status}
                      onChange={handleFormChange}
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Qualified">Qualified</option>
                    </select>
                  ) : (
                    <span>{row.Status}</span>
                  )}
                </td>
                <td>
                  <button
                    className="update-button"
                    onClick={() => openForm("update", index)}
                  >
                    Update
                  </button>
                  <button
                    className="update-button"
                    onClick={() => handleDelete(index)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        className="create-button"
        onClick={() => openForm("create", null)}
      >
        Add Lead
      </button>
      <button className="create-button" onClick={handleDownload}>
        Download Excel
      </button>
      <button className="create-button" onClick={handleDeleteSelected}>
        Delete Selected
      </button>
      {isFormOpen && (
        <div className="form-popup">
          <h2>{formMode === "create" ? "Create Form" : "Update Form"}</h2>
          <div className="form-row">
            <label className="form-label">Lead Name:</label>
            <input
              type="text"
              name="Lead Name"
              value={formData["Lead Name"]}
              onChange={handleFormChange}
            />
          </div>
          <div className="form-row">
            <label className="form-label">Email-Address:</label>
            <input
              type="email"
              name="Email"
              value={formData.Email}
              onChange={handleFormChange}
            />
          </div>
          <div className="form-row">
            <label className="form-label">Phone-No:</label>
            <input
              type="number"
              name="Phone-No"
              value={formData["Phone-No"]}
              onChange={handleFormChange}
            />
          </div>
          <div className="form-row">
            <label className="form-label"> Lead Status:</label>
            <select
              name="Status"
              value={formData.Status}
              onChange={handleFormChange}
            >
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
            </select>
          </div>
          <div className="btns">
            <button className="create" onClick={handleAction}>
              {formMode === "create" ? "Create" : "Update"}
            </button>
            <button className="cancel" onClick={closeForm}>
              Cancel
            </button>
          </div>
        </div>
      )}
      {successMessage && (
        <PopupMessage
          message={successMessage}
          onClose={() => setSuccessMessage("")}
        />
      )}
    </div>
  );
}

export default TablePage;
