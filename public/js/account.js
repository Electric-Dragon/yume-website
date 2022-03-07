import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import {erroralert, successalert} from '/js/salert.js';

let supabase, privData, user;

$.ajax({
  url: "/keys",
  success: async function( result ) {

      result = JSON.parse(result);

      supabase = createClient(result.link, result.anon_key);

      user = supabase.auth.user();

      if (!user) {
        window.location = "/signin";
      }

      console.log(user);

      $('#email').val(user.email);

      const { data:private_user, error } = await supabase
        .from('private_user')
        .select()
        .eq('id',user.id)

      const { data:public_user, error_ } = await supabase
        .from('public_profile')
        .select('pfp,username')
        .eq('id',user.id)
        .single();

     if (error || error_) {
         erroralert("Something went wrong");
     } else {

       let { pfp, username } = public_user;

       if (private_user) {

            let { fName, lName, dob, pNumber } = private_user[0];
            privData = private_user;

            $('#fName').val(fName);
            $('#lName').val(lName);
            $('#dob').val(dob);
            $('#pNumber').val(pNumber);

       }

        $('#username').val(username);
        $('#pfp').attr('src',pfp);
     }

}});

window.saveDetails = async function saveDetails () {

  let fNameNew = $('#fName').val();
  let lNameNew = $('#lName').val();
  let dobNew = $('#dob').val();
  let pNumberNew = $('#pNumber').val();

  if (!(fNameNew && lNameNew && dobNew && pNumberNew)) {
    erroralert("Please fill in all fields");
  } else {

    let userData = {id:user.id,fName:fNameNew, lName:lNameNew, dob:dobNew, pNumber:pNumberNew};

    const { data, error } = await supabase
    .from('private_user')
    .upsert(userData)

    if (error) {
      erroralert(error.message);
    } else {
      successalert("Details updated");
    }

  }

}