import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

let supabase;

$.ajax({
  url: "/keys",
  success: function( result ) {

      result = JSON.parse(result);

      supabase = createClient(result.link, result.anon_key);

      const user = supabase.auth.user();
      console.log(user);

      $('#btnSignIn').on('click', signIn);
}});


async function signIn() {

    let email = $('#email').val();
    let password = $('#password').val();

    if (!(email && password)) {
        alert('Please fill in all fields');
    } else {

        const { user, session, error } = await supabase.auth.signIn({
            email: email,
            password: password,
            
        }).then(function(){
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
                title: 'Signed in successfully'
              }).then(function(){
                window.location = "/";
              })
        });
          
    }

}