const moment = require("moment");

function formatChat(chats) {
    let year,month,day,nDate;

    for (let item of chats) {
        // nDate = new Date(item.createdAt);
        // console.log(nDate);
        // year = nDate.getFullYear();
        // month = nDate.getMonth()+1;
        // day = nDate.getDate();
        
        // item.createdAt = `${year}-${month}-${day}`;
        var date = moment(item.createdAt);
        item.createdAt = date.format('h:mm a');
        if(item.user_type == 0){
            item.userName = "Admin";
        }
        else if(item.lastName && item.firstName){
            item.userName = item.lastName + ' ' + item.firstName;
        }

        if (item.user_type === 1) {
            item.by = "student-reply";
        } else {
            item.by = "admin-reply";
        }
    }

    return chats;
}

function formatDate(date){
    return moment(date).format('LLL');
}

module.exports = { formatChat, formatDate };