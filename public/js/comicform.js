import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import {erroralert, successalert} from '/js/salert.js';

let supabase, user;

let saveButtonAnimation = `
                              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Saving...`;

$.ajax({
  url: "/keys",
  success: async function( result ) {

      result = JSON.parse(result);

      supabase = createClient(result.link, result.anon_key);

      user = supabase.auth.user();

      if (!user) {
        window.location = "/signin";
      }

      const { data, error } = await supabase
      .from('genres')
      .select()

      if (error) {
        erroralert(error.message);
      } else {
          data.forEach(g => {
            g = g.id
            $('#s1').append(new Option(g,g));
            $('#s2').append(new Option(g,g));            
          });

          document.getElementById('btnCreate').addEventListener('click', function(e){
            create(e);
          });

      }

}});

window.previewCover = function(e) {

    if(e.target.files.length > 0){
      var src = URL.createObjectURL(e.target.files[0]);
      var preview = document.getElementById("coverPreview");
      preview.src = src;
      preview.style.display = "block";
    }

}

async function create(e) {
    e.preventDefault();

    let title = $('#title').val();
    let summary = $('#summary').val();
    let adaptation = $('#adaptation').val();
    let cover = $('#files').prop('files')[0];
    let mature = $('#mature').prop('checked');

    let genre1 = $('#s1').val();
    let genre2 = $('#s2').val();

    if (!(title && summary && genre1 && genre2 && cover)) {
        erroralert('Please fill in all fields');
    } else if (cover.size > 500000) {
        erroralert('Cover image is too large');
    } else if (genre1 === genre2) {
        erroralert('Please select two different genres');
    } else {

        $('#btnCreate').prop('disabled', true);

        if (adaptation === "") {
            adaptation = null;
        }

        let series = {
            title: title,
            summary: summary,
            adaptation: adaptation,
            creator: user.id,
            novel: false,
            mature: mature,
            genre1: genre1,
            genre2: genre2
        }

        $('#btnCreate').html(saveButtonAnimation);

        const { data, error } = await supabase
        .from('series')
        .insert([series])

        if (error) {
            erroralert(error.message);
            $('#btnCreate').prop('disabled', false);
            $('#btnCreate').text('Save');
        } else {
            let seriesId = data[0].id;

            const { data_, error } = await supabase.storage
            .from('users')
            .upload(`${user.id}/series/${seriesId}/cover.jpg`, cover)

            if (error) {
                erroralert(error.message);
                $('#btnCreate').text('Save');
                $('#btnCreate').prop('disabled', false);
            } else {
                const {publicURL, error} = await supabase
                    .storage
                    .from('users')
                    .getPublicUrl(`${user.id}/series/${seriesId}/cover.jpg`)

                if (error) {
                    erroralert(error.message);
                    $('#btnCreate').prop('disabled', false);
                    $('#btnCreate').text('Save');
                } else {

                    const { data, error } = await supabase
                        .from('series')
                        .update({ cover: publicURL })
                        .match({ id: seriesId })
                    
                    if (error) {
                        erroralert(error.message);
                        $('#btnCreate').text('Save');
                        $('#btnCreate').prop('disabled', false);
                    } else {

                      $.ajax({
                        type:"POST",
                        url:'/dashboard/create/series',
                        data:{id: seriesId,
                          genre1: genre1,
                          genre2: genre2},
                        success: function(data,status) {

                          if (data.error) {
                            erroralert(data.error);
                            $('#btnCreate').text('Save');
                            $('#btnCreate').prop('disabled', false);
                          } else {

                            successalert('Successfully created a new series', function() {
                              window.location = `/dashboard/series/${seriesId}`;
                            });

                          }

                        }})

              
                    }

                }

            }
        }

    }


}