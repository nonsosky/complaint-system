$(document).ready(function () {
    var socket = io();

    scrollToBottom();

    var location = window.location.pathname.split('/');
    var cid = location[3];
    var uid = $("#uid").val();
    var uType = $("#uType").val();
    var messages = $("#messages");


    var send = $('#send');
    var message = $('#reply');

    //console.log(complaintId);
    socket.emit("chat", { id: cid });

    //-- reply btn clicked
    send.on('click', function (e) {
        e.preventDefault();
        var text = {
            reply: message.val(),
            student_id: uid,
            user_type: uType,
            complaint_id: cid
        };
        socket.emit("newMessage", text);
    });

    //-- message display it
    socket.on('message', function (text) {
        var template = $("#message-tmpl").html();
        console.log(template);
        var html = Mustache.to_html(template, text);
        messages.append(html);
        message.val('');
        scrollToBottom();
    });

    function scrollToBottom() {
        // Selectors
        var messages = jQuery('#messages');
        console.log(messages)
        var newMessage = messages.children('li:last-child')
        // Heights
        var clientHeight = messages.prop('clientHeight');
        var scrollTop = messages.prop('scrollTop');
        var scrollHeight = messages.prop('scrollHeight');
        var newMessageHeight = newMessage.innerHeight();
        var lastMessageHeight = newMessage.prev().innerHeight();

        if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
            messages.scrollTop(scrollHeight);
        }
    }
});