import React, { useState } from "react";
import "./App.css";
import * as XLSX from "xlsx";

function App() {

  const [items, setItems] = useState([]); //excel sheet data
  const [team, setTeam] = useState("");
  const [date, setDate] = useState(""); 
  const [empList, setEmpList] = useState([]); //all selected employees
  const [isUploaded, setIsUploaded] = useState(false) //wheck wheather the file is uploaded or not


  //select handler for groups
  const options = ['Team-01', 'Team-02', 'Team-03', 'Team-04', 'Team-05', 'General', 'Sample Cutting', 'Sample Warehouse', 'Quality Assurance', 'Mechanic'];
  
  const onOptionChangeHandler = (event) => {
    setTeam(event.target.value) //sets the team
    // console.log("User Selected Value - ", event.target.value)
  }

  //checks the checked check boxes and unchecked check boxes. If checked, the checked data row will be added to the array "empList" 
  const UpdateEmployees = (e) => {
      if (e.target.checked) {
        setEmpList((oldArray) => [...oldArray, e.target.value]);
        console.log(empList)
      }else{
        removeEmployee(e); //calling remove employee function
        console.log(empList)
      }
    }

  //removes data from the emplist array when unchecked a checkbox
  const removeEmployee = (e) =>{
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
        const importRange = "A9:O27";
        // ,F9:H30";
        const headers = ["Employee", "EPF", "Gender", "CallingName","", "From", "To", "Transport","","","","","","","Remarks"];
        const bufferArray = e.target.result;
        const wb = XLSX.read(bufferArray, { type: "buffer" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws, {range: importRange, header: headers});
        resolve(data)
        console.log(data);
      };

      fileReader.onerror = (error) => {
        reject(error);
      };
    });

    promise.then((d) => {
      setItems(d);
    });
  };

  //Submit data after filling the form and after filling the data, they will send to a MSFlow via http request
  const SubmitList = async (e) => {
    console.log(empList)
    // Trigger URL

  }


  return (
    <div className="App">
    
      <div>
        {/* Following div will only visible to users after excel sheet selected, date selected, and group selected */}
        {isUploaded == true && date !== '' && team !== '' ? (
          <div>
            <form onSubmit={SubmitList}>
            <h1>Daily OT & Transport Approval Request Form</h1>
            <h4>Date: 20/02/2023&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Team: </h4>
            <h3>පහත සඳහන් කාල සීමාව තුලදී අතිකාල සේවයේ යෙදීමට අපගේ කැමැත්ත ප්‍රකාශ කර සිටිමු. </h3>
            <table className="table">
              <thead>
              <tr>
                 <th>Employee#</th>
                 <th>EPF#</th>
                 <th>Gender</th>
                 <th>Calling Name</th>
                 <th>From</th>
                 <th>To</th>
                 <th>Transport</th>
                 <th>Remarks</th>
                 <th>Agree</th>
              </tr>
              </thead>
              {/* Maps employee data that comes from Items(Excelsheet data) */}
                {items.map((d) => {
                  var str = "…..........................................";
                  //have an issue with number of rows. Need to remove unwanter rows
                  if(true){
                    return(
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
                              name="employees"
                              value = {[d.Employee, d.EPF, d.Gender, d.CallingName, d.From, d.To, d.Transport, d.Remarks]}
                              onChange = {(e) => {UpdateEmployees(e)}}
                            />
                        </td>
                      </tr>
                    )
                      
                  }else{
                    return null;
                  }
                }

                )}
                  <tbody>
                </tbody>
              </table>
              <button type="submit">Submit</button>
            </form>
          </div>  
        ) : (
          // Following part will visible to users initially
          <div>
          <h1>Daily OT & Transport Approval Request Form</h1>
          <h3>Upload Excel File</h3>
          <div>
            {/* upload file */}
            <input
             className="inputFile"
              type="file"
              onChange={(e) => {
                const file = e.target.files[0];
                readExcel(file);
            }}
            />
  
            {/* select date */}
            <label>Enter Date: </label>
            <input 
             type="date"
             onChange={(e) => setDate(e.target.value)}
            />

            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            {/* select group */}
            <label>Select Group</label>
            <select onChange={onOptionChangeHandler}>
    
             <option>Please choose one option</option>
              {options.map((option, index) => {
              return <option key={index} >
              {option}
             </option>
              })}
            </select>
  
  
  
          </div>
  
        </div>
        )}
        
      </div>
    </div>
  );
}

export default App;
