import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import {erroralert, successalert} from '/js/salert.js';

let supabase,user,follows,creatorInfo;
var seriesid = window.location.pathname.split( '/' ).pop();
let chapids = [];

let statusText = {
  'd': 'Draft',
  'o': 'Ongoing',
  'p': 'Paused'
}

var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

$('#btnMakeAdaptation').hide();
$('#btnReadOriginal').hide();
$('#adaptationBadge').hide();

$.ajax({
    url: "/keys",
    success: async function( result ) {
  
        result = JSON.parse(result);
  
        supabase = createClient(result.link, result.anon_key);
  
        user = supabase.auth.user();

        if (user) {
          const { data, error } = await supabase
            .from('public_profile')
            .select('is_creator')
            .eq('id', user.id)
            .single()
          
          if (data && data.is_creator) {
            $('#btnMakeAdaptation').show();
          }
        }
  
        const { data, error } = await supabase
          .from('series')
          .select('title,cover,adaptation,novel,status,summary,creator:public_profile!series_creator_fkey(id,username),genre1,genre2,mature')
          .eq('id', seriesid)
          .single()
  
        if (error) {
          erroralert(error.message);
        } else {
  
          let { title, cover, adaptation, novel, status, summary, creator, genre1, genre2,mature} = data;

          $('#seriesTitle').text(title);
          $('#title').text(title);
          $('#summary').text(summary);
          $('#status').text(statusText[status]);
          $('#cover').attr('src', cover);

          $('#genre1').text(genre1);
          $('#genre2').text(genre2);
          $('#genre1').attr('href', '/genre/' + genre1);
          $('#genre2').attr('href', '/genre/' + genre2);

          $('#creatorname').text(creator.username)
          $('#creatorname').attr('href',`/user/${creator.username}`)

          if (adaptation) {
            $('#adaptation').attr('href', `/series/${adaptation}`);
            $('#btnMakeAdaptation').hide();
            $('#btnReadOriginal').show();
            $("#adaptationBadge").show();
            $('#btnReadOriginal').attr('href', `/series/${adaptation}`);
          }

          let typeText = novel ? 'Web Novel' : 'Web Comic';
          $('#type').text(typeText);

          creatorInfo = creator;

          let readRoute = novel ? 'novel' : 'comic';

          try {
            const { data:hasRequest, error__ } = await supabase
              .from('adaptation_notifications')
              .select('status')
              .eq('from', user.id)
              .eq('to', creatorInfo.id)
              .eq('target_series', seriesid)

              if (hasRequest.length > 0) {
                if (hasRequest[0].status === 'p') {
                  $('#btnMakeAdaptation').text('Request Pending');
                } else if (hasRequest[0].status === 'a') {
                  $('#btnMakeAdaptation').text('Request Accepted');
                } else if (hasRequest[0].status === 'd') {
                  $('#btnMakeAdaptation').text('Request Declined');
                }
              } else {
                $('#btnMakeAdaptation').click(createAdaptation);
              }

          } catch (error) {
            console.log(error);
          }

          const {data:chapters, error} = await supabase
            .from('chapters')
            .select('id,chapternum,title,createdat')
            .eq('seriesid', seriesid)
            .eq('is_published', true)
            .order('chapternum', { ascending: false })

          if (error) {
            erroralert(error.message);
          } else {

            let x = 0;

            chapters.forEach(val=> {
              let {id, chapternum, title, createdat} = val;

              let date = new Date(createdat);
              chapids.push(id);

              let element =  `
                            <tr class="text-gray-700 dark:text-gray-400">
                              <td class="px-4 py-3">
                                  <div class="flex items-center text-sm">
                                    <div>
                                      <p class="font-semibold">${chapternum}</p>
                                    </div>
                                  </div>
                                </td>
                            <td class="px-4 py-3">
                              <div class="flex items-center text-sm">
                                <div>
                                  <a href="/read/${readRoute}/${seriesid}/${id}" class="font-semibold">${title}</a>
                                </div>
                              </div>
                            </td>
                            <td class="px-4 py-3 text-sm">
                            ${days[date.getDay()]}, ${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}
                            </td>
                          </tr>`;

              $('#chapterHolder').append(element);

              x++;

            });

          }

          const { data:series_follows, error_ } = await supabase
            .from('series_follows')
            .select('id')
            .match({target_series: seriesid, user: user.id})
          
          if (error_) {
            erroralert(error_.message);
          } else {
            follows = (series_follows) ? true : false;
            let text = follows ? 'Unfollow Series' : 'Follow Series';
            $('#followButton').text(text);
          }

          if (mature) {
            Swal.fire(
              'Mature content!',
              'This series is intended for mature audiences only. Read with caution. We will not be responsible for any damages caused by viewing/reading this series.',
              'info'
            )
          }
  
        }
  
  }});

window.followSeries = async function followSeries() {

  if (!user) {
    erroralert('You must be logged in to follow a series.');
  } else {
    $.ajax({
      type:"POST",
      url:'/followSeries',
      data:{id: seriesid,
      access_token: supabase.auth.session().access_token,
      follows: follows},        
      success: function(data, status) {
        if (data.error) {
          erroralert(data.error);
        } else {
          follows = !follows;
          $('#followButton').text(follows ? 'Unfollow Series' : 'Follow Series');
        }
    }});
  }

}

async function createAdaptation() {

  Swal.fire({
    title: 'Are you sure?',
    icon: 'info',
    html:
      'A request will be sent to the original creator. <br>' +
      'They can accept or decline the request. <br>' +
      'Check your dashboard regularly for updates',
    showCancelButton: true,
    confirmButtonText: 'Yes',
    cancelButtonText:'Cancel',
  }).then( async (result) => {

    if (result.isConfirmed) {
        
      const { data, error } = await supabase
        .from('adaptation_notifications')
        .insert([
          { from_id: user.id, to_id: creatorInfo.id, target_series: seriesid, status: 'p'}
        ])

      if (error) {
        erroralert(error.message);
      } else {
        successalert('Request Sent', function() {
          window.location.reload();
        });
      }

    }

  })

}