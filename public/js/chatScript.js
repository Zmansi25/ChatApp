$(function () {

  var socket = io('/chat');

  var username = $('#user').val();
  var noChat = 0; //variable for chat history
  var msgCount = 0; 
  var oldInitDone = 0; 
  var roomId; //variable for setting room.
  var toUser;

  //passing data on connection.
  socket.on('connect', function () {
    socket.emit('set-user-data', username);
    socket.on('broadcast', function (data) {
      //notify users when the anyone joins or leaves
      $.notify(data.description, "success");


    });

  }); //end of connect event.


  //receiving list of users
  socket.on('onlineStack', function (stack) {
    $('#list').empty();
    $('#list').append($('<li>').append($('<button id="ubtn" class="btn btn-danger btn-block btn-lg"></button>').text("#CommonRoom").css({
      "font-size": "18px"
    })));
    var totalOnline = 0;
    var i = 0;
    for (var user in stack) {
      
      //current user
      var im = $('<img src="https://png.icons8.com/pennywise/color/35/000000">');
      var im1 = $('<img src="https://png.icons8.com/deathstroke/color/35/000000">');
      if (user == username) {
        var txt1 = $('<button class="boxF disabled"> </button>').text(user).css({
          "font-size": "18px",
          "background": "none"
        });
      } else {
        var txt1 = $('<button id="ubtn" class="btn btn-default  btn-md">').text(user).css({
          "font-size": "18px"
        });
      }
      //shows online status.
      if (stack[user] == "Online") {
        var txt2 = $('<span class="badge"><i class="fa fa-circle me" style="color:green"></i></span>').css({
          "float": "right",
          "font-size": "15px"
        });
        totalOnline++;

      } else {
        var txt2 = $('<span class="badge"><i class="fa fa-circle me" style="color:red"></i></span>').css({
          "float": "right",
          "font-size": "15px"
        });
      }
      //listing all users.
      if (i % 2 == 0) {
        $('#list').append($('<li>').append(im, txt1, txt2));
        $('#totalOnline').text(totalOnline);
        i = i + 1;
      } else {
        $('#list').append($('<li>').append(im1, txt1, txt2));
        $('#totalOnline').text(totalOnline);
        i = i + 1;
      }

    } //end of for.
    $('#scrl1').scrollTop($('#scrl1').prop("scrollHeight"));
  }); //end of receiving onlineStack event.


  //on button click function.
  $(document).on("click", "#ubtn", function () {

    //empty messages.
    $('#messages').empty();
    $('#typing').text("");
    msgCount = 0;
    noChat = 0;
    oldInitDone = 0;

    //assigning friends name to whom messages will be sent.
    toUser = $(this).text();

   
    $('#frndName').text(toUser); //showing user to which msg will be sent
    $('#initMsg').hide();
    $('#chatForm').show(); 
    $('#sendBtn').hide(); //hiding send button to prevent sending of empty messages.

    //assigning two names for room. which helps in one-to-one and also group chat.
    if (toUser == "#CommonRoom") {
      var currentRoom = "Group-Group";
      var reverseRoom = "Group-Group";
    } else {
      var currentRoom = username + "-" + toUser;
      var reverseRoom = toUser + "-" + username;
    }

    //event to set room and join.
    socket.emit('set-room', {
      name1: currentRoom,
      name2: reverseRoom
    });

  }); //end of on button click event.

  //event for setting roomId.
  socket.on('set-room', function (room) {
    $('#messages').empty();
    $('#typing').text("");
    msgCount = 0;
    noChat = 0;
    oldInitDone = 0;
    //assigning room id which helps in one-to-one and common room chat.
    roomId = room;
    console.log("roomId : " + roomId);
    //event to get chat history on button click or as room is set.
    socket.emit('old-chats-init', {
      room: roomId,
      username: username,
      msgCount: msgCount
    });

  }); //end of set-room event.

  //on scroll load more old-chats.
  $('#scrl2').scroll(function () {

    if ($('#scrl2').scrollTop() == 0 && noChat == 0 && oldInitDone == 1) {
      $('#loading').show();
      socket.emit('old-chats', {
        room: roomId,
        username: username,
        msgCount: msgCount
      });
    }

  }); // end of scroll event.

  //listening old-chats event.
  socket.on('old-chats', function (data) {

    if (data.room == roomId) {
      oldInitDone = 1; 
      if (data.result.length != 0) {
        $('#noChat').hide(); //hiding no more chats message.
        for (var i = 0; i < data.result.length; i++) {
          //styling of chat message.
          var chatDate = moment(data.result[i].createdOn).format("MMMM Do YYYY, hh:mm:ss a");
          var txt1 = $('<img src="https://png.icons8.com/fsociety-mask-filled/ios7/20/000000"><span></span>').text(data.result[i].msgFrom + " : ").css({
            "color": "#2C3E50"
          });
          var txt2 = $('<i></i>').text(chatDate).css({
            "float": "right",
            "color": "#a6a6a6",
            "font-size": "16px"
          });
          var txt3 = $('<p></p>').append(txt1, txt2);
          var txt4 = $('<p></p>').text(data.result[i].msg).css({
            "color": "#000000"
          });
          var txt5 = $('<hr/>');
          //showing chat in chat box.
          $('#messages').prepend($('<li class="speech">').append(txt3, txt4, txt5));
          msgCount++;

        } //end of for.
        console.log(msgCount);
      } else {
        $('#noChat').show(); 
        noChat = 1; //to prevent unnecessary scroll event.
      }
      //hiding loading bar.
      $('#loading').hide();

      //setting scrollbar position while first 5 chats loads.
      if (msgCount <= 5) {
        $('#scrl2').scrollTop($('#scrl2').prop("scrollHeight"));
      }
    } //end of outer if.

  }); // end of listening old-chats event.

  // keyup handler.
  $('#myMsg').keyup(function () {
    if ($('#myMsg').val()) {
      $('#sendBtn').show(); //showing send button.
      socket.emit('typing');
    } else {
      $('#sendBtn').hide(); //hiding send button to prevent sending empty messages.
    }
  }); //end of keyup handler.

  //event for receiving typing message.
  socket.on('typing', function (msg) {
    var setTime;
    clearTimeout(setTime);
    //displaying typing message.
    $('#typing').text(msg);
    //only for few seconds.
    setTime = setTimeout(function () {
      $('#typing').text("");
    }, 3500);
  }); //end of typing event.

  //sending message.
  $('form').submit(function () {
    socket.emit('chat-msg', {
      msg: $('#myMsg').val(),
      msgTo: toUser,
      date: Date.now()
    });
    $('#myMsg').val("");
    $('#sendBtn').hide();
    return false;
  }); //end of sending message.

  //receiving messages.
  socket.on('chat-msg', function (data) {
    //styling of chat message.
    var chatDate = moment(data.date).format("MMMM Do YYYY, hh:mm:ss a");
    var txt1 = $('<img src="https://png.icons8.com/fsociety-mask-filled/ios7/20/000000"><span></span>').text(data.msgFrom + " : ").css({
      "color": "#006080"
    });
    var txt2 = $('<i></i>').text(chatDate).css({
      "float": "right",
      "color": "#a6a6a6",
      "font-size": "16px"
    });
    var txt3 = $('<p></p>').append(txt1, txt2);
    var txt4 = $('<p></p>').text(data.msg).css({
      "color": "#000000"
    });
    var txt5 = $('<hr/>');

    //showing chat in chat box.
    $('#messages').append($('<li>').append(txt3, txt4, txt5));
    msgCount++;
    console.log(msgCount);
    $('#typing').text("");
    $('#scrl2').scrollTop($('#scrl2').prop("scrollHeight"));
  }); //end of receiving messages.

  //on disconnect event.
  socket.on('disconnect', function () {


    $('#list').empty();
    $('#messages').empty();
    $('#typing').text("");
    $('#frndName').text("Disconnected..");
    $('#loading').hide();
    $('#noChat').hide();
    $('#initMsg').show().text("...Please, Refresh Your Page...");
    $('#chatForm').hide();
    msgCount = 0;
    noChat = 0;
  }); //end of connect event.


}); //end of function.