const API="http://localhost:3000"

function loadWorkers(){
    fetch(`${API}/workers`)
    .then(res => res.json())
    .then(data=>{
        const list=document.getElementById('workers');
        list.innerHTML="";
        data.forEach(w=>{
            const li=document.createElement("li");
            li.textContent=`${w.name} - Rs.${w.daily_wage}`;
            list.appendChild(li);
        });
    });
}

function loadAttendance(){
    fetch(`${API}/workers`)
    .then(res=>res.json())
    .then(data=>{
        const tbody=document.getElementById("attendanceTable");
        tbody.innerHTML="";
        data.forEach(w=>{
            tbody.innerHTML+=`
            <tr>
            <td>${w.name}</td>
            <td><input type="checkbox" data-id="${w.id}"></td>
            </tr>`
        });
    });
}

function saveAttendance(){
    const date=document.getElementById('attendanceDate').value;
    if(!date){
        alert("Please select a date");
        return;
    }
    const checkboxes=document.querySelectorAll('#attendanceTable input[type="checkbox"]' );
    checkboxes.forEach(cb=>{
        const worker_id=cb.getAttribute("data-id");
        const present = cb.checked;

        fetch(`${API}/attendance`,{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({
                worker_id,date,present
            })
        });
    });
    alert("Attendance saved");
}

    function addWorker(){
        const name = document.getElementById('name').value;
        const gender = document.getElementById('gender').value;
        const daily_wage = document.getElementById('wage').value;

        fetch(`${API}/workers`,{
            method: "POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({name, gender, daily_wage})
        })
        .then(res=>res.json())
        .then(()=>{
            alert("Worker added");
            loadWorkers();
        });
    }

    function loadReport(){
        const month = document.getElementById("month").value;
        fetch(`${API}/report/monthly?month=${month}`)
        .then(res=>res.json())
        .then(data=>{
            const tbody=document.getElementById("report");
            tbody.innerHTML="";
            data.forEach(r=>{
                tbody.innerHTML += `
                <tr>
                <td>${r.name}</td>
                <td>Rs.${r.daily_wage}</td>
                <td>${r.days_present}</td>
                <td>Rs.${r.total_salary}</td>
                </tr>
                `;
            });
        });
    }

    loadWorkers();
    loadAttendance();
