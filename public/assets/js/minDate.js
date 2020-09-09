// Min Date 
var date = new Date();
date.setDate(date.getDate()+1);
const dateString = date.toISOString().split('T')[0];
document.getElementById('appointmentDate').min = dateString;

