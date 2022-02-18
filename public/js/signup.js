import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

let supabase;

$.ajax({
  url: "/keys",
  success: function( result ) {

      result = JSON.parse(result);

      supabase = createClient(result.link, result.anon_key);

      $('#btnSignUp').on('click', signUp);
}});

// const supabase = createClient('https://zduoakccvlarenfacitl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkdW9ha2NjdmxhcmVuZmFjaXRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDQ5NDU5MTIsImV4cCI6MTk2MDUyMTkxMn0.L0L9_rg1NCok9PJWLS17-xGyWgEyRFj83a0o-D127f4');

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
            premium: false
          }
        }).then(function() {
          // alert('Sign up successful. Check your email for a verification link.');
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