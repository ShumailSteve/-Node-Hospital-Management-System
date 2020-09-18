const { get } = require("mongoose");

// Min Date 
function minDate(element) {
    var date = new Date();
    date.setDate(date.getDate()+1);
    const dateString = date.toISOString().split('T')[0];
    element.min = dateString;
}


