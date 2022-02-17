import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
// const { createClient } = _supabase;

const supabase = createClient('https://zduoakccvlarenfacitl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkdW9ha2NjdmxhcmVuZmFjaXRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDQ5NDU5MTIsImV4cCI6MTk2MDUyMTkxMn0.L0L9_rg1NCok9PJWLS17-xGyWgEyRFj83a0o-D127f4');

$('#btnSignIn').on('click', signIn);

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