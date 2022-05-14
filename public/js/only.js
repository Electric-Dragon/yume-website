import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import {erroralert, successalert} from '/js/salert.js';

let supabase, publicData, user, instagramAcc, redditAcc, youtubeAcc;
let size = 0;
let panels, publicURLS = [];

$('#instaConnected').hide();
$('#redditConnected').hide();
$('#youtubeConnected').hide();
$('#sideBarDashboard').hide();
$('#sideBarSeries').hide();
$('#sideBarOnlyCreators').hide();
$('#sideBarAdvertisement').hide();
$('#artistSamplesSection').hide();

$('#toggleDarkMode').prop('checked',localStorage.getItem('dark') === 'true');

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'bg-green-500 p-2 px-4 text-white font-sans rounded-md',
    cancelButton: 'btn btn-danger'
  },
  buttonsStyling: false
});

let creatorType = {
  "a": "isArtist",
  "w": "isWriter",
}

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

       if (creator_type && creator_type[0] === "a") {
          $('#artistSamplesSection').show();
       }

       $(`#${creatorType[creator_type]}`).prop('checked',true);

       if (is_creator) {
         $('#sideBarDashboard').show();
         $('#sideBarSeries').show();
          $('#sideBarOnlyCreators').show();
          $('#sideBarAdvertisement').show();
       } else {
           window.location = "/account"
       }

        $('#description').val(description);

        sample_arts.forEach(image => {
          let element = `
                      <div class="w-full p-4 lg:w-50 lg:h-full">
                          <div class=" bg-white border rounded shadow-sm ">
                              <div class="relative">
                                  <img class="h-60 object-scale-down w-98 object-center " src="${image}">
                              </div>                          
                          </div>
                      </div>`

          $('#panelPreviewContainer').append(element);
      })

     }

}});

window.saveDetails = async function saveDetails (e) {

  e.preventDefault();

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

  if (size > 10) {
    erroralert('Total size of uploaded files is greater than 10 MB');
    return;
  }
  if (panels.length < 6) {
      erroralert('Upload 6 samples');
      return;
  }

  $('#btnSaveDetails').prop('disabled', true);

  panels = panels.slice(0,6)

  for (const file of panels) {

      let route = `${user.id}/profile/samples/${file.name}`;

      getBase64(file).then(async (base64String) => {

      const { data, error } = await supabase
      .storage
      .from('users')
      .upload(route, file, {
          cacheControl: '3600',
          upsert: true
      });

      if (error) {
          erroralert(error.message);
          $('#btnSaveDetails').prop('disabled', false);
      } else {
          const { publicURL, error:error_ } = supabase
              .storage
              .from('users')
              .getPublicUrl(route);
          
          if (error_) {
              erroralert(error_.message);
              $('#btnSaveDetails').prop('disabled', false);
          } else {
              publicURLS.push(publicURL);
          }
          
      }

      }).catch(error => {
        erroralert(error);
      })   
  }

  const {data:data_, error:error_} = await supabase.from('public_profile')
          .update({ sample_arts: publicURLS })
          .match({ id: user.id });

  if (error_) {
      erroralert(error.message);
      $('#btnSaveDetails').prop('disabled', false);
  } else {
      successalert(`Changes made successfully`, function() {
          window.location = "/dashboard/creator"
      });
  }

}

window.updateCreatorType = async function updateCreatorType(e) {

  const { data, error } = await supabase
    .from('public_profile')
    .update({ creator_type: [`${e.target.value}`] })
    .match({ id: user.id });

  if (error) {
    erroralert(error.message);
  } else {
    successalert("Creator type updated!");

    if (e.target.value === "a") {
      $('#artistSamplesSection').show();
    } else {
      $('#artistSamplesSection').hide();
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

window.previewPanels = function (e) {

  if (e.target.files.length > 0) {

      panels = [...e.target.files];

      panels.sort(function(a, b) {
          a = Number(a.name.split('.')[0]);
          b = Number(b.name.split('.')[0]);
          return a - b
      });

      panels.forEach((file,index) => {

          let link = URL.createObjectURL(file);

          size+=(file.size/1000000);

          let element = `
                          <div class="w-full p-4 lg:w-50 lg:h-full">
                              <div class=" bg-white border rounded shadow-sm ">
                                  <div class="relative">
                                      <div style="z-index:4" onclick="deleteOne(${file.name.split('.')[0]})" class=" top-0 right-0 p-0 m-0 absolute">
                                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"  fill="currentColor" class="text-red-500  " viewBox="0 0 0.1 9">
                                              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
                                          </svg>
                                      </div>
                                  </div>
                                  <div class="relative">
                                      <img class="h-60 object-cover " src="${link}" alt="${file.name}">
                                      <p class="text-gray-600">${file.name}</p>
                                  </div>                          
                              </div>
                          </div>`

          $('#panelPreviewContainer').append(element);

      });

      $('#totalSize').text(`${size.toFixed(2)} MB / 10 MB`);

  }

}

window.deleteAll = function() {
  $('#panelPreviewContainer').empty();
  $('#totalSize').text('0 MB / 20 MB');
  size = 0;
  panels = [];
  $('#panels').prop('files', []);
}

window.deleteOne = function(num) {
  let index = panels.findIndex(panel => panel.name === `${num}.jpg`);
  panels.splice(index,1);
  $('#panelPreviewContainer').children().eq(index).remove();
}

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      let encoded = reader.result.toString().replace(/^data:(.*,)?/, '');
      if ((encoded.length % 4) > 0) {
        encoded += '='.repeat(4 - (encoded.length % 4));
      }
      resolve(encoded);
    };
    reader.onerror = error => reject(error);
  });
}