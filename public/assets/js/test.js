function setDate() {


$(function() {
        var holidays = [
          '20.9.2020',
          '25.9.2020'

        ];
        function noSundaysOrHolidays(date) {
          var day = date.getDay();
          if (day != 0) {
            var d = date.getDate();
            var m = date.getMonth();
            var y = date.getFullYear();
            for (i = 0; i < holidays.length; i++) {
              if($.inArray((d) + '.' + (m+1) + '.' + y, holidays) != -1) {
                return [false];
              }
            }
            return [true];
          } else {
            return [day != 0, ''];
          }
        }
      
        $('#date').datepicker({
          onClose: function(dateText, inst) { 
              $(this).attr("disabled", false);
          },
          beforeShow: function(input, inst) {
            $(this).attr("disabled", true);
          },
          beforeShowDay: noSundaysOrHolidays,
          minDate: 0,
          dateFormat: 'dd.mm.yy',
        });
      });
}