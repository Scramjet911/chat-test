var messages = document.getElementById("messages");
let conbtn = document.getElementById("connbtn");
let chatwindow = document.getElementById('chatWindow');

// notadmin eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjNiN2EyZTE3NWEzYjI4ZWMyYjk1MWQiLCJpYXQiOjE1OTg3NTc2NDF9.Urthrb_RoG5iLrX54rCcuG-9KikIE2TxwapPeYTEKH0
// ajay eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjNhMDZkZDJlNGJlYzM5NDg2ZWJiYjgiLCJpYXQiOjE1OTc3NjAxMTF9.iD0oZCMwRLkLYg8uWIHfpQqW_Nc8FQoOgq2fm3lDFRo

var socket, reciever;

function getUserChat(chatroomId){
    let d = new Date();
    if(messages.getElementsByTagName('li').length == 0){
        fetch("http://localhost:8000/api/chat/" + $('#sender').val() + '/' + chatroomId, {method:"GET", headers : {'Authorization':'Bearer ' +$('#token').text()}})
        .then(data => data.json())
        .then(chats=>{
            if(chats!={}){
                messages.innerHTML = "";
                chats.messages.forEach(msg=>{
                    let li = document.createElement("li"), span = document.createElement('span');
                    messages.appendChild(li).append(msg.message);
                    messages.appendChild(span).append("by " + msg.sender);
                });
            }
        })
        .catch(err=>{
            console.log(err);
        });
    }
}

document.getElementById('closeBtn').addEventListener('click',()=>{
    document.getElementById('chatWindow').style.display = 'none';
})

conbtn.addEventListener('click',()=>{
    let t = document.getElementById('token');
    socket = io('ws://localhost:8000',{
        query : {token: t.innerText},
        reconnect : true
    });
    socket.on('connect',()=>{
        console.log('Connected',socket);
        socket.emit('joinUser',$("#sender").val());
    });
    fetch("http://localhost:8000/api/chat/"+$("#sender").val(),{method:'GET',headers:{'Authorization':'Bearer '+$('#token').text()}})
    .then(data => data.json())
    .then(chatlist =>{
        console.log(chatlist);
        if(Array.isArray(chatlist)){
            let userlist = document.getElementById("userList");
            userlist.innerHTML = "";
            chatlist.forEach(chats => {
                let div = document.createElement("div");
                div.setAttribute("class","user_list_elem");
                div.addEventListener('click',()=>{
                    try{
                        getUserChat(chats.id);
                        reciever = (chats.user1==$("#sender").val()) ? chats.user2 : chats.user1;
                        document.getElementById('chatTitle').innerHTML=reciever;
                        chatwindow.style.display = 'block';
                    }
                    catch(err){
                        console.log(err);
                    }
                })
                div.innerText = (chats.user1==$("#sender").val()) ? chats.user2 : chats.user1;
                userlist.appendChild(div);
            });
        }
    })
    .catch(err=>{
        console.log(err);
        alert("You Are Not Authorized To Access these chats...");
    });
    socket.on("newMessage", data => {
        let li = document.createElement("li");
        let span = document.createElement("span");
        messages.appendChild(li).append(data.message);
        messages.appendChild(span).append("by " + data.sender + ": " + "just now");
        console.log("Hello bingo!");
    });
});

(function() {
    $("form").submit(function(e) {
        let li = document.createElement("li");
        e.preventDefault(); // prevents page reloading
        socket.emit("privateMessage",$("#sender").val(),reciever,$("#message").val());
        console.log("Message sent ",$("#message").val(),socket);
        messages.appendChild(li).append($("#message").val());
        let span = document.createElement("span");
        messages.appendChild(span).append("by " + $("#sender").val() + ": " + "just now");

        $("#message").val("");

        return false;
    });
})();

