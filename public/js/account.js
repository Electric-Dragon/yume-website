import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import {erroralert, successalert} from '/js/salert.js';

let supabase, publicData, user, instagramAcc, redditAcc, youtubeAcc;

$('#instaConnected').hide();
$('#redditConnected').hide();
$('#youtubeConnected').hide();


const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'bg-green-500 p-2 px-4 text-white font-sans rounded-md',
    cancelButton: 'btn btn-danger'
  },
  buttonsStyling: false
})

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
        .select()
        .eq('id',user.id)
        .single();

     if (error || error_) {
         erroralert("Something went wrong");
     } else {

       let { pfp, username, description, instagram, reddit, youtube } = public_user;
       publicData = public_user;

       instagramAcc = instagram;
       redditAcc = reddit;
       youtubeAcc = youtube;

       if (instagram) {
         $('#instaConnected').show();
         $('#instaConnected').text(`connected`);
       }
       if (reddit) {
          $('#redditConnected').show();
         $('#redditConnected').text(`connected`);
       }
       if (youtube) {
          $('#youtubeConnected').show();
         $('#youtubeConnected').text(`connected`);
       }

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

}});

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

  const { value: handle } = await swalWithBootstrapButtons.fire({
    input: 'text',
    inputLabel: 'Instagram Handle',
    inputPlaceholder: '@username',
    inputValue:instagramAcc
  }).then(async (result) => {
    if (result.isConfirmed) {

      result.value = result.value.trim();

      if (result.value === '') {
        result.value = null        
      } else if (result.value.startsWith('@')) {
        result.value = result.value.slice(1);
      }

      const { data, error } = await supabase
        .from('public_profile')
        .update({ instagram: result.value })
        .match({ id: user.id })

      if (error) {
        erroralert(error.message);
      } else {

        let text = result.value ? `Your Instagram account has been connected.` : `Your Instagram account has been disconnected.`;

        swalWithBootstrapButtons.fire(
          'Success!',
          text,
          'success'
        ).then(() => {
          window.location.reload();
        })
      
      }
    }});

}

window.connectReddit = async function connectReddit () {

  const { value: handle } = await swalWithBootstrapButtons.fire({
    input: 'text',
    inputLabel: 'Reddit username',
    inputPlaceholder: 'u/username',
    inputValue:redditAcc
  }).then(async (result) => {
    if (result.isConfirmed) {

      result.value = result.value.trim();

      if (result.value === '') {
        result.value = null        
      } else if (result.value.startsWith('u/')) {
        result.value = result.value.slice(2);
      }

      const { data, error } = await supabase
        .from('public_profile')
        .update({ reddit: result.value })
        .match({ id: user.id })

      if (error) {
        erroralert(error.message);
      } else {

        let text = result.value ? `Your Reddit account has been connected.` : `Your Reddit account has been disconnected.`;

        swalWithBootstrapButtons.fire(
          'Success!',
          text,
          'success'
        ).then(() => {
          window.location.reload();
        })
      
      }
    }});

}

window.connectYoutube = async function connectYoutube () {

  const { value: handle } = await swalWithBootstrapButtons.fire({
    input: 'text',
    inputLabel: 'Youtube username',
    inputPlaceholder: 'c/username',
    inputValue:youtubeAcc
  }).then(async (result) => {
    if (result.isConfirmed) {

      result.value = result.value.trim();

      if (result.value === '') {
        result.value = null        
      } else if (result.value.startsWith('c/')) {
        result.value = result.value.slice(2);
      }

      const { data, error } = await supabase
        .from('public_profile')
        .update({ youtube: result.value })
        .match({ id: user.id })

      if (error) {
        erroralert(error.message);
      } else {

        let text = result.value ? `Your YouTube channel has been connected.` : `Your YouTube channel has been disconnected.`;

        swalWithBootstrapButtons.fire(
          'Success!',
          text,
          'success'
        ).then(() => {
          window.location.reload();
        })
      
      }
    }});

}