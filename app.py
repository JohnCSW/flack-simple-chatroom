import os

from flask import Flask, render_template, redirect, url_for, session, request, jsonify
from flask_socketio import SocketIO, emit
from werkzeug.security import generate_password_hash, check_password_hash
from flask_session import Session

app = Flask(__name__)
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = False
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

socketio = SocketIO(app)


class User:
    def __init__(self, name, password):
        self.name = name
        self.password = generate_password_hash(password)
    def pwIsCorrect(self, password):
        return check_password_hash(self.password, password)
class Message:
    def __init__(self, sender, content, timestamp):
        self.sender = sender
        self.content = content
        self.timestamp = timestamp

users = {}
channel_list = {}

@app.route("/")
def index():
    if not'USER_EMAIL' in session:
        return redirect(url_for('login'))
    return redirect(url_for('chatroom'))
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template('index.html', isLogIn=True)
    email = request.form.get('email')
    if not email in users:
        return 'THIS ACCOUNT DOESN\'T EXIST'
    user = users[email]
    password = request.form.get('password')

    if not user.pwIsCorrect(password):
        return 'INVALID PASSWORD'
    
    session['USER_EMAIL'] = email

    return redirect(url_for('chatroom'))
    
    
    
    
@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'GET':
        return render_template('index.html', isLogIn=False)

    name = request.form.get('name')
    email = request.form.get('email')
    password = request.form.get('password')

    if email in users:
        return 'THIS ACCOUNT HAS BEEN USED'
    
    users[email] = User(name, password)
    session['USER_EMAIL'] = email

    return redirect(url_for('chatroom'))
@app.route('/logout')
def logout():
    session.pop('USER_EMAIL', None)
    return redirect(url_for('index'))

@app.route('/chatroom')
def chatroom():
    email = session['USER_EMAIL']
    if not email in users:
        return redirect(url_for('login'))
    name = users[email].name
    return render_template('chatroom.html', name=name, email=email)
    
@socketio.on('channel-create')
def channel_create(data):
    ch_name = data['channel']
    channel_list[ch_name] = []
    emit('channel-added', {'channel': data["channel"] }, broadcast=True)
    
@socketio.on('send-msg')
def send_msg(data):
    user = users[session['USER_EMAIL']]
    msg = Message(sender=user.name, content=data['msg'], timestamp=data['timestamp'])
    channel_list[data['channel']].append(msg)
    emit('receive-msg', {
        'channel': data['channel'],
        'sender': user.name,
        'content': data['msg'],
        'timestamp': data['timestamp']
    }, broadcast=True)

@app.route('/channels')
def channels():
    ch_list = []
    for key in channel_list:
        ch_list.append(key)
    return jsonify({'channels': ch_list})

@app.route('/messages', methods=['POST'])
def messages():
    ch_name = request.form.get('channel')
    messages = channel_list[ch_name]
    msgs = [];
    for msg in messages:
        content = {
            'sender':msg.sender,
            'content': msg.content,
            'timestamp': msg.timestamp
            }
        msgs.append(content)
    return jsonify({'messages': msgs})

if __name__ == '__main__':
    socketio.run(app)