import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import {erroralert, successalert} from '/js/salert.js';

$('#btnCloseNotifications').trigger('click');

let supabase,user;
let seriesIds = [];

let statusText = {
  'd': `<td class="px-4 py-3 text-xs">
  <span
    class="px-2 py-1 font-semibold leading-tight text-orange-700 bg-orange-100 rounded-full dark:text-white dark:bg-orange-600">
    Draft
  </span>
  </td>`,
  'o': `<td class="px-4 py-3 text-xs">
  <span
    class="px-2 py-1 font-semibold leading-tight text-green-700 bg-green-100 rounded-full dark:bg-green-700 dark:text-green-100">
    Ongoing
  </span>
  </td>`,
  'p': `<td class="px-4 py-3 text-xs">
  <span
    class="px-2 py-1 font-semibold leading-tight text-red-700 bg-red-100 rounded-full dark:text-red-100 dark:bg-red-700">
    Paused
  </span>
  </td>`
}

let adaptationText = {
  'a': 'has been <span class="text-green-700 uppercase font-bold">accepted</span>',
  'r': 'has been <span class="text-red-500 uppercase font-bold">rejected</span>',
  'p': 'is pending'
}

var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

$('#searchBar').on('focus', function() {
  window.location = '/dashboard/series';
})

dayjs.extend(window.dayjs_plugin_relativeTime)

$.ajax({
  url: "/keys",
  success: async function( result ) {

      result = JSON.parse(result);

      supabase = createClient(result.link, result.anon_key);

      user = supabase.auth.user();

      if (!user) {
        window.location = "/signin";
      }

      const {data:creatorRank, error:creatorRankError} = await supabase
        .from('creator_ranks')
        .select('creator_rank')
        .eq('creator_id', user.id)
        .maybeSingle();

      if (creatorRankError) {
        console.log(creatorRankError);
      } else if (creatorRank) {
        $('#creatorRank').text(creatorRank.creator_rank);
      }

      const {data:creatorTotalLikeCount, error:creatorTotalLikeCountError} = await supabase
          .from('creator_total_likes')
          .select('total_likes')
          .eq('creator_id', user.id)
          .maybeSingle();
      
      if (creatorTotalLikeCountError) {
          erroralert(creatorTotalLikeCountError.message);
      } else if (creatorTotalLikeCount) {
          $('#creatorTotalLikeCount').text(creatorTotalLikeCount.total_likes);
      }

      const { data:seriesCountForCreator, error:seriesCountForCreatorError } = await supabase
          .rpc('get_series_count_for_user', { userid: user.id })

      if (seriesCountForCreatorError) {
          erroralert(seriesCountForCreatorError.message);
      } else {
          $('#creatorTotalSeriesCount').text(seriesCountForCreator);
      }

      const { data:creatorTotalReadCount, error:creatorTotalReadCountError } = await supabase
          .rpc('get_creator_total_reads', { creator_id: user.id })

      if (creatorTotalReadCountError) {
        erroralert(creatorTotalReadCountError.message);
      } else {
        $('#creatorTotalReadCount').text(creatorTotalReadCount);
      }

      const { data, error } = await supabase
        .from('series')
        .select('id,title,chapcount,status,updatedat')
        .eq('creator', user.id)
        .order('updatedat', { ascending: false })
        .limit(6)

      if (error) {
        erroralert(error.message);
      } else {

        data.forEach(async val=> {

          let {id, title, chapcount, status, updatedat, comment_count} = val;
          let date = new Date(updatedat);

          seriesIds.push(id);

          let element = `<tr class="text-gray-700 dark:text-gray-400">
                          <td class="px-4 py-3">
                            <div class="flex items-center text-sm">
                              <div>
                                <p class="font-semibold">${title}</p>
                                <p class="text-xs text-gray-600 dark:text-gray-400">
                                  ${chapcount} Episodes
                                </p>
                              </div>
                            </div>
                          </td>
                          <td class="px-4 py-3 flex flex-row gap-4 text-xl">
                              <a href="/dashboard/series/${id}">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor"
                                class="text-green-600 text-center w-7 h-7" viewBox="0 0 20 20">
                                <path
                                  d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                <path fill-rule="evenodd"
                                  d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
                                </svg>
                              </a>
                          </td>
                          <td class="px-4 py-3">
                          <div class="flex items-center text-sm">
                            <div>
                              <p class="font-semibold" id="${id}LikeCount"></p>
                              <p class="text-xs text-gray-600 dark:text-gray-400" id="${id}Follows">
                              </p>
                            </div>
                          </div>
                        </td>
                          ${statusText[status]}
                          <td class="px-4 py-3 text-sm">
                            ${days[date.getDay()]}, ${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}
                          </td>
                          <td class="px-4 py-3 text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                              class="text-red-600 w-6 h-6" viewBox="0 0 16 16">
                              <path
                                d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
                            </svg>
                          </td>
                        </tr>`

          $('#tbLatestUpdates').append(element);

        });

        seriesIds.forEach(async id=> {

          const { data:seriesFollows, error:seriesFollowsError } = await supabase
            .rpc('get_series_follows', { seriesid: id });

          const { data:seriesLikes, error:seriesLikesError } = await supabase
            .from('series_total_likes')
            .select('count')
            .match({ seriesid: id })
            .maybeSingle();

          let totalLikeCount = 0;

          if (seriesLikes) {
            totalLikeCount = seriesLikes.count;
          }

          if (seriesFollowsError) {
            erroralert(seriesFollowsError.message);
          }

          if (seriesLikesError) {
            erroralert(seriesLikesError.message);
          }

          $(`#${id}LikeCount`).text(totalLikeCount);
          $(`#${id}Follows`).text(`${seriesFollows} Followers`);

        })

      }

}});

$('#btnCreateNewSeries').on('click', async function(){
  const inputOptions = new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        'comic': 'Web Comic',
        'novel': 'Web Novel',
      })
    }, 0)
  })
  
  const { value: choice } = await Swal.fire({
    title: 'What do you plan to create?!',
    input: 'radio',
    confirmButtonText: 'Continue!',
    inputOptions: inputOptions,
    inputValidator: (value) => {
      if (!value) {
        return 'You need to choose something!'
      }
    }
  })
  
  if (choice) {
    window.location = '/dashboard/create/' + choice;
  }
  
});