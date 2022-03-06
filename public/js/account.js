import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import {erroralert, successalert} from '/js/salert.js';

let supabase;

$.ajax({
  url: "/keys",
  success: async function( result ) {

      result = JSON.parse(result);

      supabase = createClient(result.link, result.anon_key);

      let user = supabase.auth.user();

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

            let { fName, lName, dob, pNumber } = private_user;

            $('#fName').val(fName);
            $('#lName').val(lName);
            $('#dob').val(dob);
            $('#pNumber').val(pNumber);

       }

        $('#username').val(username);
        $('#pfp').attr('src',pfp);
     }

}});