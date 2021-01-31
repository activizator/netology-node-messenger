const serverURL = "//127.0.0.1:3000/";
const apiURL = serverURL + "api/";

const socket = io.connect(serverURL, {query: `roomName='actmess'`});

function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };  
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

function scrollToBottom() {
    var objDiv = document.getElementById("app-body");
    objDiv.scrollTop = objDiv.scrollHeight;
}

const Messenger = {
    data() {
      return {
        me: undefined,
        messages: []
      }
    },
    created () {
        if(localStorage.getItem('userName')) {
            this.me = localStorage.getItem('userName');
        }
        if(this.me) {
            this.getMessages();
            socket.on('message-to-room', (msg) => {
                this.messages.push(msg);
            });
        }
    },
    updated() {
        scrollToBottom();
    },
    methods: {
        async sendMessage() {
            this.$refs.errMess.innerText = '';
            if (this.$refs.myLastMsg.value) {
                let response = await fetch(`${apiURL}message/`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json;charset=utf-8'
                    },
                    body: JSON.stringify({ user: this.me, message: escapeHtml(this.$refs.myLastMsg.value) })
                });
                if (response.status === 200) {
                    socket.emit('message-to-room', {
                        user: this.me, message: escapeHtml(this.$refs.myLastMsg.value),
                    });
                    this.$refs.myLastMsg.value = '';
                } else {
                    this.$refs.errMess.innerText = 'Сбой отправки';
                }
            }
        },
        async getMessages() {
            let response = await fetch(`${apiURL}messages/`);
            let messages = await response.json();
            this.messages = messages;
        },
        async setUser() {
            this.$refs.errMess.innerText = '';
            if (this.$refs.myName.value) {
                let response = await fetch(`${apiURL}user/`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json;charset=utf-8'
                    },
                    body: JSON.stringify({ user: escapeHtml(this.$refs.myName.value) })
                });
                  
                let result = await response.json();
                if(!result.error) {
                    this.getMessages();
                    localStorage.setItem('userName', this.$refs.myName.value);
                    this.me = this.$refs.myName.value;
                } else {
                    this.$refs.myName.value = '';
                    this.$refs.errMess.innerText = 'Try another Name';
                }    
            }
        },
        async exitApp() {
            this.$refs.errMess.innerText = '';
            let response = await fetch(`${apiURL}user/${this.me}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify({ user: this.me })
            });
            if (response.status === 200) {
                localStorage.removeItem('userName');
                this.me = undefined;
            } else {
                this.$refs.errMess.innerText = 'Try once again';
            }
        }
    }
  }
  
Vue.createApp(Messenger).mount('#app');  
