import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import {erroralert, successalert} from '/js/salert.js';

let supabase, publicData, isCreator, user, instagramAcc, redditAcc, youtubeAcc;

$('#instaConnected').hide();
$('#redditConnected').hide();
$('#youtubeConnected').hide();
$('#sideBarDashboard').hide();
$('#sideBarSeries').hide();
$('#sideBarOnlyCreators').hide();
$('#sideBarAdvertisement').hide();

$('#toggleDarkMode').prop('checked',localStorage.getItem('dark') === 'true');

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

      const { data:public_user, error } = await supabase
        .from('public_profile')
        .select('description, instagram, reddit, youtube, is_creator, creator_type, sample_arts')
        .eq('id',user.id)
        .single();

     if (error) {
         erroralert(error.message);
     } else {

       let { description, instagram, reddit, youtube, is_creator, creator_type, sample_arts } = public_user;
       publicData = public_user;

       instagramAcc = instagram;
       redditAcc = reddit;
       youtubeAcc = youtube;

       if (instagram) {
         $('#instaConnected').show();
       }
       if (reddit) {
          $('#redditConnected').show();
       }
       if (youtube) {
          $('#youtubeConnected').show();
       }

       $('#toggle').prop('checked',is_creator);
       isCreator = is_creator;

       if (is_creator) {
         $('#sideBarDashboard').show();
         $('#sideBarSeries').show();
          $('#sideBarOnlyCreators').show();
          $('#sideBarAdvertisement').show();
       } else {
           window.location = "/account"
       }

        $('#description').val(description);

     }

}});

window.saveDetails = async function saveDetails () {

  let descriptionNew = $('#description').val();

  if (!(descriptionNew)) {
    erroralert("Please fill in the description");
  } else {

      if (publicData.description != descriptionNew) {

        const { data, error } = await supabase
          .from('public_profile')
          .update({ description: descriptionNew })
          .match({ id: user.id })

        if (error) {
          erroralert(error.message);
        } else {
          successalert("Description updated!");
        }

      }

  }

}

window.enableCreator = async function enableCreator() {

  if (isCreator) {
    erroralert('You are already a creator!');
    $('#toggle').prop('checked',true);
  } else {

    Swal.fire({
      title: 'Are you sure?',
      icon: 'info',
      html:
        'You cannot <b>undo</b> this action. <br> Make sure to read our ' +
        '<a href="/tos" target="_blank" rel="noopener" style="color:blue">Terms of Service</a> ' +
        'as this is a legal agreement between us.',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText:'Cancel',
    }).then( async (result) => {

      if (!result.isConfirmed) {
        $('#toggle').prop('checked',false);
      } else {
          
          const { data, error } = await supabase
          .from('public_profile')
          .update({ is_creator: true })
          .match({ id: user.id })
  
          if (error) {
            erroralert(error.message);
          } else {
            successalert("You are now a creator!",function(){
              window.location.reload()
            });
          }
  
      }

    })

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
    inputLabel: 'Discord username',
    inputPlaceholder: 'username#1234',
    inputValue:redditAcc
  }).then(async (result) => {
    if (result.isConfirmed) {

      result.value = result.value.trim();

      if (result.value === '') {
        result.value = null        
      }

      const { data, error } = await supabase
        .from('public_profile')
        .update({ reddit: result.value })
        .match({ id: user.id })

      if (error) {
        erroralert(error.message);
      } else {

        let text = result.value ? `Your Discord account has been connected.` : `Your Discord account has been disconnected.`;

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