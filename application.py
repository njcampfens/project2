import os
import requests

from flask import Flask, jsonify, render_template, request, session
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_session import Session

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# Configure session to use filesystem
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)



rooms = {}


@app.route('/')
def index():
    if 'USERNAME' in session:
        if 'LAST_ROOM' in session:
            room = session.get('LAST_ROOM')
            return render_template('chat.html', username=session.get('USERNAME'), messages=rooms[room]['messages'], room=room)
        else:
            return render_template('index.html', message='Welcome back, '+session.get('USERNAME') +'!')
    else:
        return render_template("index.html", message='Please login to access!')


@app.route('/rooms', methods=['GET', 'POST'])
def rooms_page():

    if request.method == 'POST':
        session['USERNAME'] = request.form['username']

    if 'USERNAME' not in session:
        return render_template("login.html", message='Please enter a username')
    else:
        if 'LAST_ROOM' in session:
            session.pop('LAST_ROOM')
        return render_template('rooms.html', rooms=rooms.keys(), username=session.get('USERNAME'))





@app.route("/chat", methods=['POST'])
def chat():

    if request.method == 'POST':
        room = request.form['room']
        if room in rooms.keys():
            if 'enter_room' in request.form:
                session['LAST_ROOM'] = room
                return render_template("chat.html", username=session.get('USERNAME'), messages=rooms[room]['messages'], room=room)
            elif 'create_room' in request.form:
                return 'Room name already in use, please use a different name'

        else:
            if 'create_room' in request.form:
                session['LAST_ROOM'] = room
                print(session['LAST_ROOM'])
                rooms[room]  = {'messages':[{ 'text':'Room created by '+ session.get('USERNAME'), 'type':'info'}]}
                return render_template("chat.html", username=session.get('USERNAME'), messages=rooms[room]['messages'], room=room)
            else:
                return render_template("login.html", message='Please enter a username')

    else:
        return render_template("login.html", message='Please enter a username')





@app.route('/login_logout')
def login_logout():
    if 'USERNAME' in session:
        session.pop('USERNAME')
        if 'LAST_ROOM' in session:
            session.pop('LAST_ROOM')
        return render_template('login.html', message="Logged-out, enter a username to re-enter")

    else:
        return render_template('login.html', message='Please enter a username')



@socketio.on('join')
def join(data):
    join_room(data['room'])
    emit("announce message", {'time':data['time'], "text": data['username'] + ' joined the room', 'type':'info'}, room=data['room'])


@socketio.on("send message")
def send(data):
    global rooms
    room = data['room']
    if data['type'] == 'message':
        rooms[room]['messages'].append(data) # append new message to list
    # Only keep last 100 messages
    if len(rooms[room]['messages']) > 100:
        rooms[room]['messages'] = rooms[room]['messages'][-100:]
    emit("announce message", {'username': data['username'], 'time':data['time'], "text": data["text"], 'type':data['type']}, room=room)

if __name__ == '__main__':
    app.run()
