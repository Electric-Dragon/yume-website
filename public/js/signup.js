import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import {erroralert, successalert} from '/js/salert.js';

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
      .from('public_profile')
      .select('username')
      .eq('username', username)

      if (error) {
        erroralert(error.message);
      } else if (data.length>0) {
        erroralert('Username already taken');
      } else {


      $.ajax({
        type:"POST",
        url:'/signup',
        data:{email: email,
          password: password,
          username: username},        
        success: function(data, status) {
          if (data.error) {
            erroralert(data.error);
          } else {
            successalert('Sign up successful', function() {
              window.location = data.link + '/signin';
            });
          }
      }});

    }

    }

    }

}