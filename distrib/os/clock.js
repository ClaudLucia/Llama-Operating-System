function startTime() {
    var today = new Date();
    var hrs = today.getHours();
    var min = today.getMinutes();
    var sec = today.getSeconds();
    if (hrs > 12){
        hrs = hrs-12
    }
    if (hrs == 0){
        hrs = 12
    }

    document.getElementById('clock').innerHTML = hrs + ":" + min + ":" + sec;
    var t = setTimeout(startTime, 500);
}