document.addEventListener('DOMContentLoaded', init)

function init(){
    
    loadChannels();
    addchannel();
    configMessage();
}

function loadChannels(){
    const request = new XMLHttpRequest();
    request.open('GET', '/channels');
    request.onload = () => {
        const data = JSON.parse(request.responseText);
        channels = data.channels;
        for (channel_name of channels){
            setupChannels(channel_name);
        }
    }
    request.send();
}
function addchannel(){
    let ch_control = document.querySelector('#channel-control')
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    socket.on('connect', () => {

        ch_control.onsubmit = () => {
            // Get ui elements
            const name = document.querySelector('#channel');
            let links = document.querySelectorAll('a');
    
            for (let link of links){
                if (link.innerHTML == name.value){
                    name.value='';
                    return false;
                }
            }
            socket.emit('channel-create', {'channel':name.value });
            name.value = '';
            return false;
        }
    });

    socket.on('channel-added', data => {
        console.log('I\'ve Received.')
        setupChannels(data.channel);
    });
    
}

function configMessage(){
    
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    socket.on('connect', () => {
        let msg_control = document.querySelector('#message-control')
        
        msg_control.onsubmit = () => {

        if (localStorage.getItem('current_ch') == null){
            return false;
        }
        let msg_input = document.querySelector('#msg-input');
        socket.emit('send-msg',{ 'channel':localStorage.getItem('current_ch'),'msg': msg_input.value , 'timestamp': new Date().toLocaleTimeString()});
        msg_input.value = '';
        return false;
    }; });

    socket.on('receive-msg' ,data => {
        if (data.channel == localStorage.getItem('current_ch')){
            setupMessages(data.sender, data.content, data.timestamp);
        }
    })
}

function loadMessages(channel){
    const request = new XMLHttpRequest();
    request.open('POST','/messages');
    request.onload = () => {
        const data = JSON.parse(request.responseText);
        let messages = data.messages;
        for (msg of messages){
            setupMessages(msg.sender, msg.content, msg.timestamp);
        }
    };
    const data = new FormData();
    data.append('channel', channel);
    request.send(data);
}
function setupMessages(sender, content, timestamp){

    let chatting_area = document.querySelector('#chatting-area');
    const msg_div = document.createElement('div');
    msg_div.classList.add('msg-content');
    const msg_name = document.createElement('label');
    msg_name.classList.add('name-label');
    const msg_timestamp = document.createElement('label');
    msg_timestamp.classList.add('time-stamp');
    const msg_content = document.createElement('p');
    msg_content.classList.add('content-text');

    msg_name.innerHTML = sender;
    msg_content.innerHTML = content;
    msg_timestamp.innerHTML = timestamp;

    msg_div.append(msg_name);
    msg_div.append(msg_content);
    msg_div.append(msg_timestamp);

    chatting_area.append(msg_div);
    chatting_area.scrollTop = chatting_area.scrollHeight;
}

function setupChannels(name){
    const channel_list = document.querySelector('ul');
    const new_channel = document.createElement('li');
    const link = document.createElement('a');

    //Setup elements at front-end
    link.innerHTML = name;
    link.href = '#';
    link.onclick= () => {
        localStorage.setItem('current_ch', link.innerHTML);
        document.querySelector('#msg-input').disabled = false;
        let default_content = document.querySelector('#default-content');
        if (default_content != null){
            default_content.parentNode.removeChild(default_content);
        }
        document.querySelector('#chatting-area').innerHTML = '';
        loadMessages(name);
    };
    new_channel.append(link);
    channel_list.append(new_channel);
}