import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import {erroralert, successalert} from '/js/salert.js';

let supabase, publicData, user;


if (window.location.href.split('?')[1]) {
  window.location = "/account"
}

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'bg-green-500 p-2 px-4 text-white font-sans rounded-md',
    cancelButton: 'btn btn-danger'
  },
  buttonsStyling: false
})
const { value: url } = await swalWithBootstrapButtons.fire({
  input: 'url',
  inputLabel: 'URL address',
  inputPlaceholder: 'Enter the URL'
}).then((result) => {
  if (result.isConfirmed) {
    swalWithBootstrapButtons.fire(
      'Connected!',
      'Your instagram account has been connected.',
      'success'
    )
  } else if (
    /* Read more about handling dismissals below */
    result.dismiss === Swal.DismissReason.cancel
  ) {
    swalWithBootstrapButtons.fire(
      'Cancelled',
      'Your imaginary file is safe :)',
      'error'
    )
  }}

,$.ajax({
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
        .select()
        .eq('id',user.id)
        .single();

     if (error || error_) {
         erroralert("Something went wrong");
     } else {

       let { pfp, username, description, instagram, reddit, youtube } = public_user;
       publicData = public_user;

       if (private_user) {

            let { fName, lName, dob, pNumber, creator } = private_user[0];

            $('#fName').val(fName);
            $('#lName').val(lName);
            $('#dob').val(dob);
            $('#pNumber').val(pNumber);
            $('#toggle').prop('checked',creator);

            if (creator) {
              $('#toggle').attr('readonly',"true");
            }

       }

        $('#username').val(username);
        $('#description').val(description);
        $('#pfp').attr('src',pfp);
     }

}}));

window.saveDetails = async function saveDetails () {

  let fNameNew = $('#fName').val();
  let lNameNew = $('#lName').val();
  let dobNew = $('#dob').val();
  let pNumberNew = $('#pNumber').val();
  let descriptionNew = $('#description').val();

  if (!(fNameNew && lNameNew && dobNew && pNumberNew && descriptionNew)) {
    erroralert("Please fill in all fields");
  } else {

    let userData = {id:user.id,fName:fNameNew, lName:lNameNew, dob:dobNew, pNumber:pNumberNew};

    const { data, error } = await supabase
    .from('private_user')
    .upsert(userData)

    if (error) {
      erroralert(error.message);
    } else {

      if (publicData.description != descriptionNew) {

        const { data, error } = await supabase
          .from('public_profile')
          .update({ description: descriptionNew })
          .match({ id: user.id })

        if (error) {
          erroralert(error.message);
        } else {
          successalert("Profile updated");
        }

      }
    }

  }

}

window.connectInstagram = async function connectInstagram () {

  

}