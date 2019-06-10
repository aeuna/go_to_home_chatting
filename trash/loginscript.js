const ipc = require('electron').ipcRenderer;
if(txtUser==usr && txtPwd==pass){
  ipc.sendSync('authorized', 'ping')
}
else{
  $('#lbl').text('username or password is incorrect')
}




class Form {
  constructor(data) {
    this.originalData = data;

    for (let field in data) {
      this[field] = data[field];
    }

    this.hasError = false;
  }

  data() {
    let data = {};

    for (let field in this.originalData) {
      if (field.match(/^password/) && data[field] !== '') {
        data[field] = sha256(`집에가조:${this[field]}`);
      } else {
        data[field] = this[field];
      }
    }

    return data;
  }

  reset() {
    for (let field in this.originalData) {
      this[field] = '';
    }
  }

  submit(url) {
    let data = { user: this.data() };
    axios.post(url, data)
      .then(response => {
        if(response.data['auth_token']) {
          localStorage.setItem('auth_token', response.data['auth_token']);
          location.href = './content.html';
        } else {
          this.hasError = false;
          app.renderNotification('Successfully Signed up');
          app.toggleSignUp();
        }
      })
      .catch(error => {
        this.hasError = true;
        app.renderNotification(error.response.data);
      });
  }
}

const app = new Vue({
  el: '#app',

  data: {
    isSignUp: false,
    showNotification: false,
    form: new Form({
      id: '',
      password: '',
      password_confirmation: ''
    }),
    message: '',
  },

  computed: {
    notificationClass() {
      return {
        notification: true,
        'is-success': !this.form.hasError,
        'is-danger': this.form.hasError
      }
    }
  },

  methods: {
    toggleSignUp() {
      this.isSignUp = !this.isSignUp;
      this.form.reset();
    },

    // submitLogin() {
    //   this.form.submit('http://localhost:2300/api/auth/sign_in');
    // },

    // submitSignUp() {
    //   this.form.submit('http://localhost:2300/api/auth/sign_up');
    // },

    renderNotification(message) {
      this.message = message;
      this.showNotification = true;
    },

    deleteNotification() {
      this.form.hasError = false;
      this.showNotification = false;
    }
  }
});