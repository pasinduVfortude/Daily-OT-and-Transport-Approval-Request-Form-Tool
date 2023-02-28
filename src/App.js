import React, { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.css';

import "./App.css";
import * as XLSX from "xlsx";
import axios from "axios";

function App() {

  const [items, setItems] = useState([]); //excel sheet data
  const [team, setTeam] = useState(""); 
  const [date, setDate] = useState("");
  const [empList, setEmpList] = useState([]); //all selected employees
  const [isUploaded, setIsUploaded] = useState(false) //wheck wheather the file is uploaded or not
  const [sheets, setSheets] = useState([])
  const [jsonObj, setJsonObj] = useState([]) //json array of selected supervisors
  const [selectedTeam, setSelectedTeam] = useState() 
  const [formData, setFormData] = useState( //all data
    {
      date: "",
      team: "",
      jsonObj: [
      
      ]
    })

  useEffect(() => {
     
    setFormData(formData => ({ ...formData, date: date, team: team }))
   
  }, [date, team]);


  //select handler for groups
  const options = ['Team-01', 'Team-02', 'Team-03', 'Team-04', 'Team-05', 'General', 'Sample Cutting', 'Sample Warehouse', 'Quality Assurance', 'Mechanic'];
  // const options = sheets;

  const onOptionChangeHandler = (event) => {
    setTeam(event.target.value) //sets the team
    // setSelectedTeam(event.target.selectedIndex-1)
    setSelectedTeam(0)
  }

  //checks the checked check boxes and unchecked check boxes. If checked, the checked data row will be added to the array "empList" 
  const UpdateEmployees = (e) => {
    console.log(e.target.value)

    if (e.target.checked) {
      setEmpList((oldArray) => [...oldArray, e.target.value]);
    } else {
      removeEmployee(e); //calling remove employee function
      console.log(empList)
    }
  }

  //removes data from the emplist array when unchecked a checkbox
  const removeEmployee = (e) => {
    setEmpList([...empList.filter((d) => d !== e.target.value)])
  }

  //Read excel file content and convert it into a json object
  //After converting, it will assigned to "items"
  const readExcel = (file) => {
    const promise = new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);

      fileReader.onload = (e) => {

        setIsUploaded(true)
        const importRange = "A9:O40";
        const headers = ["Employee", "EPF", "Gender", "CallingName", "", "From", "To", "Transport", "", "", "", "", "", "", "Remarks"];
        const bufferArray = e.target.result;
        const wb = XLSX.read(bufferArray, { type: "buffer" });
        setSheets(wb.SheetNames)
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws, { range: importRange, header: headers });
        resolve(data);

      };

      fileReader.onerror = (error) => {
        reject(error);
      };
    });

    promise.then((d) => {
      setItems(d);
    });
  };

  const SubmitList = async (event) => {
    event.preventDefault();
    console.log("step1");
    for (let i = 0; i < empList.length; i++) {
      var myArray = empList[i].split(',');
      let obj = {
        "Employee": myArray[1],
        "EPF": myArray[3],
        "Gender": myArray[5],
        "CallingName": myArray[7],
        "From": myArray[9],
        "To": myArray[11],
        "Transport": myArray[13],
        "Remarks": myArray[15]
      }
      console.log(i, ":", empList.length);
      console.log("step2");
      //setJsonObj((oldArray) => [...oldArray, obj]);
      jsonObj[i] = obj;
      console.log(jsonObj);

      if (i == empList.length-1) {
        //setFormData(formData => ({ ...formData, date: date, team: team, jsonObj: jsonObj }));
        let objform = {
          "date": date, "team": team, "jsonObj": jsonObj
        }
        formData[0] = objform;
        console.log(formData);
        console.log("step3");

        const dataa = JSON.stringify(formData)
        if (dataa.jsonObj !== null) {
          console.log("step4");
          console.log(dataa);
          await axios.post("https://prod-45.southeastasia.logic.azure.com:443/workflows/543c2338f6bb45a88578d57562140705/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=5snvi_lEWw3EjVQ5gFqrOTnJGDip2lsubI7ehzvt8FE", dataa, {
            headers: {
              'Content-Type': 'application/json'
            }
          })
            .then((response) => {
              console.log("step5");
              alert("Successfully submitted!")
              console.log(response);
            });
        }
      }
    }


  };

  return (
    <div className="App">

      <div>
        {/* Following div will only visible to users after excel sheet selected, date selected, and group selected */}
        {/* console.log(formData) */}
        {isUploaded === true && date !== '' && team !== '' ? (
          <div>
            <form onSubmit={SubmitList}>
            <div style={{backgroundColor:"green", color:"white", height:"5rem", textAlign:"center", verticalAlign:"center"}}>
              <h1 style={{marginTop:"1rem",paddingTop:"1rem"}}>Daily OT & Transport Approval Request Form</h1>
            </div>
              <h4 style={{marginTop:"1rem"}}>Date: {date}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Team: {team}</h4>
              <h5 style={{marginTop:"2rem",border:"red 2px solid",paddingTop:"8px", paddingBottom:"8px"}} className="h4">පහත සඳහන් කාල සීමාව තුලදී අතිකාල සේවයේ යෙදීමට අපගේ කැමැත්ත ප්‍රකාශ කර සිටිමු. </h5>
              <table  style={{marginTop:"2rem"}} className="table">
                <thead>
                  <tr style={{fontFamily:"sans-serif",fontSize:"18px"}}>
                    <th scope="col">Employee#</th>
                    <th scope="col">EPF#</th>
                    <th scope="col">Gender</th>
                    <th scope="col">Calling Name</th>
                    <th scope="col">From</th>
                    <th scope="col">To</th>
                    <th scope="col">Transport</th>
                    <th scope="col">Remarks</th>
                    <th scope="col">Agree</th>
                  </tr>
                </thead>
                <tbody>
                {/* Maps employee data that comes from Items(Excelsheet data) */}
                {items.map((d) => {

                  return (
                    <tr key={d.Employee}>
                      <td>{d.Employee}</td>
                      <td>{d.EPF}</td>
                      <td>{d.Gender}</td>
                      <td>{d.CallingName}</td>
                      <td>{d.From}</td>
                      <td>{d.To}</td>
                      <td>{d.Transport}</td>
                      <td>{d.Remarks}</td>
                      <td><input type="checkbox"
                        className="form-check-input"
                        name="employees"
                        // value={{"Employee" : d.Employee, "EPF" : d.EPF}}
                        value={[...Object.entries(d)]}
                        onChange={(e) => { UpdateEmployees(e) }}
                      />
                      </td>
                    </tr>
                  )
                }
                )}
                
                </tbody>
              </table>
              <button id="SubmitBtn" type="submit" className="btn btn-success btn-lg" style={{width:"180px",height:"50px",marginBottom:"20px"}}>Submit</button>
            </form>
          </div>
        ) : (
          // Following part will visible to users initially
          <div>
            <div style={{backgroundColor:"green", color:"white", height:"5rem", textAlign:"center", verticalAlign:"center"}}>
              <h1 style={{marginTop:"3rem",paddingTop:"1rem"}}>Daily OT & Transport Approval Request Form</h1>
            </div>
            <div className="row justify-content-md-center" style={{marginLeft:"30%",marginTop:"5rem"}}>
              {/* upload file */}
              <div className="row mb-3">
                <label className="col-sm-2 col-form-label" style={{textAlign:"left"}}>Upload Excel File: </label>
                <div className="col-sm-10">
                  <input
                    className="form-control input-small"
                    style={{width:"300px"}} 
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      readExcel(file);
                    }}
                  />
                </div>
              </div>
              <div className="row mb-3">
              {/* select date */}
                <label className="col-sm-2 col-form-label" style={{textAlign:"left"}}>Enter Date: </label>
                <div className="col-sm-10">
                  <input
                    className="form-control input-small"
                    style={{width:"300px"}} 
                    type="date"
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>

              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

              {/* select group */}
              <div className="row mb-3">
                <label className="col-sm-2 col-form-label" style={{textAlign:"left"}}>Select Group : </label>
                <div className="col-sm-10">
                  <select className="form-control input-small" style={{width:"300px"}} id="specificSizeSelect" aria-label="Default select example" onChange={onOptionChangeHandler}>
                    <option>Please choose one option</option>
                    {options.map((option, index) => {
                      return <option key={index} >
                        {option}
                      </option>
                    })}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
