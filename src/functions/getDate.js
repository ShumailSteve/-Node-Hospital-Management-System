const getDate = function (date) {
    console.log("Called");
    const d1 = date;
    const day = d1.getUTCDate();
    const mon = d1.getUTCMonth() + 1; // Since getMonth() returns month from 0-11 not 1-12 
    const year = d1.getUTCFullYear();
    const newDate = day + "/" + mon + "/" + year;
    return newDate;
};

// const test = "\"2019-02-08T23:28:56.782Z\"";

// console.log(getDate(test));

module.exports = getDate;
