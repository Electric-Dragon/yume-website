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

$.ajax({
    url: "/keys",
    success: async function( result ) {
  
        result = JSON.parse(result);
  
        supabase = createClient(result.link, result.anon_key);
  
        user = supabase.auth.user();

        if (user) {
          const { data, error } = await supabase
            .from('private_user')
            .select('creator')
            .eq('id', user.id)
            .single()
          
          if (data.creator) {
            $('#btnMakeAdaptation').show();
          }
        }
  
        const { data, error } = await supabase
          .from('series')
          .select('title,cover,adaptation,novel,status,summary,creator(id,username)')
          .eq('id', seriesid)
          .single()
  
        if (error) {
          erroralert(error.message);
        } else {
  
          let { title, cover, adaptation, novel, status, summary, creator} = data;

          $('#seriesTitle').text(title);
          $('#title').text(title);
          $('#summary').text(summary);
          $('#status').text(statusText[status]);
          $('#cover').attr('src', cover);

          $('#creatorname').text(creator.username)
          $('#creatorname').attr('href',`/user/${creator.username}`)

          let adaptationText = adaptation ? 'Yes' : 'No';
          $('#adaptation').text(adaptationText);

          let typeText = novel ? 'Web Novel' : 'Web Comic';
          $('#type').text(typeText);

          creatorInfo = creator;

          const { data:hasRequest, error__ } = await supabase
              .from('adaptation_notifications')
              .select('status')
              .eq('from', user.id)
              .eq('to', creatorInfo.id)
              .eq('series', seriesid)

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

          const {data:chapters, error} = await supabase
            .from('chapters')
            .select('id,chapternum,title,createdat,is_published,likes')
            .eq('seriesid', seriesid)
            .eq('is_published', true)
            .order('chapternum', { ascending: false })

          if (error) {
            erroralert(error.message);
          } else {

            let x = 0;

            chapters.forEach(val=> {
              let {id, chapternum, title, createdat, is_published, likes} = val;

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
                                  <a href="/read/novel/${seriesid}/${id}" class="font-semibold">${title}</a>
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
            .match({series: seriesid, user: user.id})
          
          if (error_) {
            erroralert(error_.message);
          } else {
            follows = (series_follows.length > 0) ? true : false;
            let text = follows ? 'Unfollow Series' : 'Follow Series';
            $('#followButton').text(text);
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
          let text = follows ? 'Unfollowed Successfully' : 'Followed Successfully';
          successalert(text, function() {
            window.location.reload();
          });
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
          { from: user.id, to: creatorInfo.id, series: seriesid, status: 'p'}
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