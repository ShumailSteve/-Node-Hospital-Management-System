function getSchedule() {
        var id = document.getElementById("doctor").value;
        var date = document.getElementById("day");
        var time = document.getElementById("time");

        // Fetch Schedule of Doctors
        fetch('/doctors/schedule?id='+id).then ( (doc) => {
                doc.json().then( (arr) => {
                        date.innerHTML = "";
                        date.innerHTML = "Date [Available on: " + arr.Days+ "]";
                        date.style.color = "red";
                        time.innerHTML = "Time: " + arr.availableFrom + " -  " + arr.availableTill;
                        time.style.color = "red";
                })
        })        
}
