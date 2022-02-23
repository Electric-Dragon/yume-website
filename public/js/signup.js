import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

let supabase;

$.ajax({
  url: "/keys",
  success: function( result ) {

      result = JSON.parse(result);

      supabase = createClient(result.link, result.anon_key);

      document.getElementById('btnSignUp').addEventListener('click', function(e){
        signUp(e);
      });
}});

async function signUp(e) {
    e.preventDefault();
    let email = $('#email').val();
    let password = $('#password').val();
    let passwordConfirm = $('#passwordConfirm').val();
    let username = $('#username').val();

    if (!(email && password && passwordConfirm && username)) {
        alert('Please fill in all fields');
    } else {

    if (password===passwordConfirm) {

      let { data, error } = await supabase
      .from('usernames')
      .select('id')
      .eq('id', username)

      if (error) {
        let Toast = Swal.mixin({
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
          icon: 'error',
          title: error
        });
      } else if (data.length>0) {
        let Toast = Swal.mixin({
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
          icon: 'error',
          title: 'Username already exists'
        });
      } else {


      $.ajax({
        type:"POST",
        url:'/signup',
        data:{email: email,
          password: password,
          username: username},        
        success: function(data, status) {
          if (data.error) {

            let Toast = Swal.mixin({
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
              icon: 'error',
              title: data.error
            });

          } else {
            let Toast = Swal.mixin({
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 2000,
              timerProgressBar: true,
              didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
              }
            })
                    
            Toast.fire({
              icon: 'success',
              title: 'Signed up successfully'
            }).then(function() {
              window.location = `${data.link}/signin`;
            })
          }
      }});

    }

    }

    }

}