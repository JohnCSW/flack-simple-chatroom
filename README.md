
# Simple Online Chatroom

## A Short Introduction:
A simple online chatroom like slack, has the minimal functionality
that supports online communications among people.
## Tech Stacks:
### Backend:
* Python
* Flask
### Front-end:
* Simple Html, CSS, Javascript, Jinja
### Some Python packages:

```
Package                       Version
----------------------------- -------
Flask                         1.0.2  
Flask-Session                 0.3.1  
Jinja2                        2.10   
pip                           19.3.1 
psycopg2                      2.7.7  
Werkzeug                      0.14.1 
```

## Configuration:
1. `git clone https://github.com/JohnCSW/simple-chatroom.git`
2. Use python3 and have download [virtualenv](https://virtualenv.pypa.io/en/latest/).
3. `source ./env/bin/activate` to enable virtual enviroment.
4. Install all dependecies listed above.
5. `python app.js` ** Important **

## Features:
* Sign up / Log In interested user.
<img src='./readme-src/Chat_User.gif'>

* Real-time communication on channels created by users.
<img src='./readme-src/Chat_Message.gif'>

* Chat with the group online.
<img src='./readme-src/Chat_Group.gif'>

## Note:

1. This website I made months ago hasn't been tested yet.Bugs may happen.
2. The structure of code hasn't been refatored.It may seem to be a little messy.
3. It can only be run locally, which means it's still need some efforts to put it online.
4. It's a beginner project, so if you see something weird...you know. :(

## License:

The MIT License (MIT)
