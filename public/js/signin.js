import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import {erroralert, successalert} from '/js/salert.js';

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
              erroralert(res.error.message);
            } else {

              successalert('Signed in successfully', function() {
                window.location = "/";
                });

            }

        });
          
    }

}