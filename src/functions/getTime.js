const getTime = function (time) {
        const parsedtime = JSON.parse(time);
        // TEMP
        const date = new Date(parsedtime);
        const hrs = date.getUTCHours();
        var mins = date.getMinutes();
        // console.log(mins/10);
        // mins < 10 add 0 infront of mins
        if(mins/10 < 1)
        {
                mins = "0" + mins;
        }
        const newTime = hrs + ":" + mins;
        return newTime;

};

// const test = "\"2019-02-08T23:28:56.782Z\"";

// console.log(getTime(test));

module.exports = getTime;