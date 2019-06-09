const ipc = require('electron').ipcRenderer;

// if(txtUser==usr && txtPwd==pass){
//   ipc.sendSync('entry-accepted', 'ping')
// }
// else{
//   $('#lbl').text('username or password is incorrect')
// }
$(document).ready(function() {
  $('#signin').click(function(e) {
    e.preventDefault();

    // if($(input).val().trim() == ''){
    //   console.log('empty value')
    //   return false;
    // }

    $.ajax({
      type: 'post',
      url: 'http://localhost:3000/login',
      data: {
        name: $('[name=username]').val(),
        pwd: $('[name=pass]').val(),
      },
      success: function(result) {
        if (result.authorized) {
          console.log('login success')
          setTimeout(function() {ipc.sendSync('user-authorized', 'ping')}, 3000);
        }
        else {
          console.log('login fail')
          showValidate('input');
        }
      }
    })
  })

  $('#signup').click(function(e) {
    e.preventDefault()

    $.ajax({
      type: 'post',
      url: 'http://localhost:3000/register',
      data: {
        name: $('[name=username]').val(),
        pwd: $('[name=pass]').val(),
      },
      success: function(result) {
        if (result.authorized) {
          console.log('register success')
          $('[name=username]').val('')
          $('[name=pwd]').val('')
        }
        else {
          console.log('register fail')
          showValidate('input')
        }
      }
    })
  })

  $('.validate-form .input100').each(function(){
    $(this).focus(function(){
       hideValidate(this);
    });
  });
})

// function validate (input) {
//     if($(input).attr('type') == 'email' || $(input).attr('name') == 'email') {
//         if($(input).val().trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
//             return false;
//         }
//     }
//     else {
//         if($(input).val().trim() == ''){
//             return false;
//         }
//     }
// }

function showValidate(input) {
    var thisAlert = $(input).parent();
    $(thisAlert).addClass('alert-validate');
}

function hideValidate(input) {
    var thisAlert = $(input).parent();
    $(thisAlert).removeClass('alert-validate');
}
