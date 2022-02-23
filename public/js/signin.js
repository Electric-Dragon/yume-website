import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

let supabase;

$.ajax({
  url: "/keys",
  success: function( result ) {

      result = JSON.parse(result);

      supabase = createClient(result.link, result.anon_key);

      document.getElementById('btnSignIn').addEventListener('click', function(e){
        signIn(e);
      });
}});


async function signIn(e) {
    e.preventDefault();
    let email = $('#email').val();
    let password = $('#password').val();

    if (!(email && password)) {
        alert('Please fill in all fields');
    } else {

        supabase.auth.signIn({
          email: email,
          password: password
        }).then(function(res) {

            if (res.error) {

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
                title: res.error.message
              });

            } else {

              // const user = supabase.auth.user();
              // let data = user.user_metadata
              // data.id = user.id

              // supabase.from('users').upsert(data,{ignoreDuplicates: true});

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
                title: 'Signed in successfully'
              }).then(function() {
                window.location = "/";
              })

            }

        });
          
    }

}