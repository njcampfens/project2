document.addEventListener('DOMContentLoaded', () => {


    // Load audio in notification
    var audio = new Audio('/static/notification.mp3');

    // Display back button
    document.querySelector('#back').style.display = 'inline';



    scroll_bottom();
    document.querySelector('#text').focus();
    // add zero to hours format if it's below 10
    function add_zero(i){
      if (i < 10) {
        i = "0" + i;
      }
      return i;
    };
    function get_time(){
      var date = new Date();
      return add_zero(date.getHours()) + ':' + add_zero(date.getMinutes());
    };
    function scroll_bottom() {
      window.scrollTo(0,document.body.scrollHeight);

    };


    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    socket.emit('join', {'username':localStorage.getItem('USERNAME'), 'time':get_time(), 'room': document.title });

    // Funtion to send message
    function send_message(room, text, type){
      const username = localStorage.getItem('USERNAME')
      const time = get_time();
      document.querySelector('#text').value = '';
      // the title is the name of the room
      socket.emit('send message', {'username': username, 'time': time, 'text': text, 'room':room, 'type':type});
    };


    // Send messages:
    socket.on('connect', () => {

      // If clicked key is enter -> send message
      document.querySelector('#text').addEventListener('keyup', () => {
        if (event.keyCode === 13 && document.querySelector('#text').value != '') {
          event.preventDefault();
          // the title is the name of the room
          send_message(document.title, document.querySelector('#text').value, 'message');
        }
      });

      // If clicked button send -> send message
      document.querySelector('#send').onclick = () => {
        if (document.querySelector('#text').value != ''){
          // the title is the name of the room
          send_message(document.title, document.querySelector('#text').value, 'message');
        }
      };
    });


    // When a message is received, add to the unordered list with current local time
    socket.on('announce message', data => {

        const div_message = document.createElement('div');
        div_message.className = 'message';
        if (data.type === 'info'){
          div_message.id = 'info-message';
        }

        else {

          if (data.username === localStorage.getItem('USERNAME')){
            div_message.id = 'sent-message';

          }

          else{
            div_message.id = 'received-message';
            audio.play();
          }

          const div_username = document.createElement('div');
          div_username.className = 'username';
          div_username.innerHTML = data.username;
          div_message.appendChild(div_username);
        }




        const div_time = document.createElement('div');
        div_time.className = 'time';
        div_time.innerHTML = get_time();

        const div_text = document.createElement('div');
        div_text.className = 'text';
        div_text.innerHTML = data.text;


        div_message.appendChild(div_time);
        div_message.appendChild(div_text);

        document.querySelector('#messages').append(div_message);

        scroll_bottom();


    });

    // When back button clicked:
    document.querySelector('#back').onclick = () => {
      send_message(document.title, localStorage.getItem('USERNAME') + ' left the room', 'info')
      document.querySelector('#back').style.display = 'none';
      location.replace(location.protocol + '//' + document.domain + ':' + location.port + '/rooms');
    }






});
