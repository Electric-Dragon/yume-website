import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import {erroralert, successalert} from '/js/salert.js';

let supabase,user;
var seriesid = window.location.pathname.split( '/' ).pop();

let statusText = {
  'd': 'Draft',
  'o': 'Ongoing',
  'p': 'Paused'
}

var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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
          .from('series')
          .select('title,chapcount,cover,adaptation,novel,status,summary')
          .eq('id', seriesid)
          .single()
  
        if (error) {
          erroralert(error.message);
        } else {
  
          let { title, chapcount, cover, adaptation, novel, status, summary} = data;

          $('#seriesTitle').text(title);
          $('#title').text(title);
          // $('#creatorname').text(`Created by:`)
          $('#summary').text(summary);
          $('#status').text(statusText[status]);
          $('#cover').attr('src', cover);

          let adaptationText = adaptation ? 'Yes' : 'No';
          $('#adaptation').text(adaptationText);

          let typeText = novel ? 'Web Novel' : 'Web Comic';
          $('#type').text(typeText);

          $('#btnCreateNewChapter').on('click', function() {
            newChap(chapcount);
          });

          const {chapters, error} = await supabase
            .from('chapters')
            .select('id,chapternum,title,createdat,is_published')
            .eq('seriesid', seriesid)
            .order('chapternum', { ascending: true })

          if (error) {
            erroralert(error.message);
          } else {
            
            console.log(seriesid);

            console.log(chapters);

            chapters.forEach(val=> {
              let {id, chapternum, title, createdat, is_published} = val;

              let chapStatusText = is_published ? 'Published' : 'Draft';
              let date = new Date(createdat);

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
                                  <p class="font-semibold">${title}</p>
                                  <p class="text-xs text-gray-600 dark:text-gray-400">
                                    ${chapStatusText}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td class="px-4 py-3">
                              <div class="flex items-center text-sm">
                                <div>
                                  <p class="font-semibold text-center">50</p>
                                </div>
                              </div>
                            </td>
                            <a href="/dashboard/series/${seriesid}/${id}/write">
                              <td class="px-4 py-3 flex flex-row gap-4 text-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor"
                                  class="text-green-600 text-center w-7 h-7" viewBox="0 0 20 20">
                                  <path
                                    d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                  <path fill-rule="evenodd"
                                    d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
                                </svg>
                              </td>
                            </a>
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
                          </tr>`;

              $('chapterHolder').append(element);

            });

          }
  
        }
  
  }});

async function newChap(chapcount) {
  let { data, error } = await supabase.from('chapters').insert([{
    seriesid:seriesid,
    chapternum:chapcount+1,
  }])

  if (error) {
    erroralert(error.message);
  } else {
    window.location = `/dashboard/series/${seriesid}/${data[0].id}/write`;
  }

}