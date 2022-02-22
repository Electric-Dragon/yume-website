import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

let supabase;

$.ajax({
  url: "/keys",
  success: function( result ) {

      result = JSON.parse(result);

      supabase = createClient(result.link, result.anon_key);

      $('#btnSignUp').on('click', signUp);
}});

async function signUp() {
    let email = $('#email').val();
    let password = $('#password').val();
    let passwordConfirm = $('#passwordConfirm').val();
    let username = $('#username').val();

    if (!(email && password && passwordConfirm && username)) {
        alert('Please fill in all fields');
    } else {

    if (password===passwordConfirm) {
        const { user, session, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        },
        {
          data: { 
            username: username, 
            premium: false,
            credits: 0,
            revenue: 0,
            creator: false
          }
        }).then(function() {

          const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer)
              toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
          })
          
          Toast.fire({
            icon: 'success',
            title: 'Signed up successfully. Check your email for a verification link'
          }).then(function(){
            window.location = "/";
          })
        }).catch(function(error) {
          alert(error);
        });
    }

    }

}