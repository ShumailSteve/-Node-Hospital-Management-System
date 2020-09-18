function getSchedule() {
        var id = document.getElementById("doctor").value;
        var days = document.getElementById("day");
        var time = document.getElementById("time");
        var date = document.getElementById("appointmentDate");

        // Fetch Schedule of Doctors
        fetch('/doctors/schedule?id='+id).then ( (doc) => {
                doc.json().then( (arr) => {
                        // var string= "<option value=''>Select</option>";
                    
                        // for(i=0;i<arr.Days.length;i++)
                        // {
                        //     string=string+"<option value="+arr.Days[i]+">"+arr.Days[i]+"</option>";
                        // }
                        // string ='<select name="days">'+string+'</select>';
                        // days.innerHTML=string;
 
                        time.innerHTML = "Time: " + arr.availableFrom + " -  " + arr.availableTill;
                        time.style.color = "red"
                })
        })
        // $(function() {
        //         $( "#appointmentDate" ).datepicker(
        //         {
        //             beforeShowDay: function(d) {
        //                 var day = d.getDay();
        //                 return [(day != 0 && day != 3)];
        //             }
        //         });
        // })
        
}