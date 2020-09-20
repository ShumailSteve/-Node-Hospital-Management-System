function getSchedule() {
        var id = document.getElementById("doctor").value;
        var date = document.getElementById("day");
        var time = document.getElementById("time");

        // Fetch Schedule of Doctors
        fetch('/doctors/schedule?id='+id).then ( (doc) => {
                doc.json().then( (arr) => {
                        date.innerHTML = "Date [Available on: " + arr.Days+ "]"
                        date.style.color = "red"
                        time.innerHTML = "Time: " + arr.availableFrom + " -  " + arr.availableTill;
                        time.style.color = "red"
                })
        })        
}

// function setDate() {
//         $(function() {
//                 var holidays = [
//                   '21.9.2020',
//                   '25.9.2020'
        
//                 ];
//                 function noSundaysOrHolidays(date) {
//                   var day = date.getDay();
//                   if (day != 0) {
//                     var d = date.getDate();
//                     var m = date.getMonth();
//                     var y = date.getFullYear();
//                     for (i = 0; i < holidays.length; i++) {
//                       if($.inArray((d) + '.' + (m+1) + '.' + y, holidays) != -1) {
//                         return [false];
//                       }
//                     }
//                     return [true];
//                   } else {
//                     return [day != 0, ''];
//                   }
//                 }
              
//                 $('#appointmentDate').datepicker({
//                   onClose: function(dateText, inst) { 
//                       $(this).attr("disabled", false);
//                   },
//                   beforeShow: function(input, inst) {
//                     $(this).attr("disabled", true);
//                   },
//                   beforeShowDay: noSundaysOrHolidays,
//                   minDate: 0,
//                   dateFormat: 'dd.mm.yy',
//                 });
//               });
//         }