import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import {erroralert, successalert} from '/js/salert.js';

let supabase,user, isNovel;
var seriesid = window.location.pathname.split( '/' ).pop();
let chapids = [];

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
          $('#summary').text(summary);
          // $('#status').text(statusText[status]);

            $.each(statusText, function(val, text) {

              let defaultSelected = false;
              let nowSeleted = (status === val) ? true : false;

              let check = (status !== 'd' && val === 'd') ? true : false;

              if (!check) {
                $('#statusSelect').append(new Option(text,val,defaultSelected,nowSeleted));
              }

          });


          $('#cover').attr('src', cover);

          let adaptationText = adaptation ? 'Yes' : 'No';
          $('#adaptation').text(adaptationText);

          let typeText = novel ? 'Web Novel' : 'Web Comic';
          $('#type').text(typeText);
          isNovel = novel;

          $('#btnCreateNewChapter').on('click', function() {
            newChap(chapcount);
          });

          const {data:chapters, error} = await supabase
            .from('chapters')
            .select('id,chapternum,title,createdat,is_published,likes')
            .eq('seriesid', seriesid)
            .order('chapternum', { ascending: false })

          if (error) {
            erroralert(error.message);
          } else {

            let x = 0;

            chapters.forEach(val=> {
              let {id, chapternum, title, createdat, is_published, likes} = val;

              let chapStatusText = is_published ? 'Published' : 'Draft';
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
                                  <p class="font-semibold text-center">${likes}</p>
                                </div>
                              </div>
                            </td>
                            
                            <td class="px-4 py-3 flex flex-row gap-4 text-xl">
                              <a href="/dashboard/series/${seriesid}/${id}/write">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor"
                                  class="text-green-600 text-center w-7 h-7" viewBox="0 0 20 20">
                                  <path
                                    d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                  <path fill-rule="evenodd"
                                    d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
                                </svg>
                              </a>
                            </td>
                            <td class="px-4 py-3 text-sm">
                            ${days[date.getDay()]}, ${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}
                            </td>
                            <td class="px-4 py-3 text-sm hover:text-blue-600">
                              <a href="/read/novel/${seriesid}/${id}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" 
                                  class="bi bi-eye-fill" viewBox="0 0 16 16 class="text-blue-600 w-6 h-6" viewBox="0 0 20 20" >
                                    <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                                    <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                                </svg>
                              </a>
                             </td>
                            <td class="px-4 py-3 text-sm">
                              <button onclick="deleteChap(${x})">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                  class="text-red-600 w-6 h-6" viewBox="0 0 16 16">
                                  <path
                                    d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
                                </svg>
                              </button>
                            </td>
                          </tr>`;

              $('#chapterHolder').append(element);

              x++;

            });

          }
  
        }
  
}});

$('#statusSelect').on('change',async function() {
  console.log($(this).val());

  const { data, error } = await supabase
  .from('series')
  .update({ status: $(this).val() })
  .match({ id: seriesid})

  if (error) {
    erroralert(error.message);
  } else {
    successalert('Series status updated');
  }

})

async function newChap(chapcount) {
  let { data, error } = await supabase.from('chapters').insert([{
    seriesid:seriesid,
    chapternum:chapcount+1,
  }])

  if (error) {
    erroralert(error.message);
  } else {

    if (isNovel) {
      window.location = `/dashboard/series/${seriesid}/${data[0].id}/write`;
    } else {
      window.location = `/dashboard/series/${seriesid}/${data[0].id}/upload`;
    }
  }

}

window.deleteChap = async function deleteChap(x) {

  console.debug(typeof supabase == 'undefined')

  let chapid = chapids[x];

 const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-success',
    cancelButton: 'btn btn-danger'
  },
  buttonsStyling: true
})

swalWithBootstrapButtons.fire({
  title: 'Are you sure?',
  text: "You won't be able to revert this!",
  icon: 'warning',
  showCancelButton: true,
  confirmButtonText: 'Yes, delete it!',
  cancelButtonText: 'No, cancel!',
  reverseButtons: true
}).then((result) => {
  if (result.isConfirmed) {
    swalWithBootstrapButtons.fire(
      'Deleted!',
      'Your file has been deleted.',
      'success'
    )
  } else if (
    result.dismiss === Swal.DismissReason.cancel
  ) {
    swalWithBootstrapButtons.fire(
      'Cancelled',
      'Your imaginary file is safe :)',
      'error'
    )
  }
}).then(async (result) => {
    if (result.isConfirmed) {

      const { data, error } = await supabase.from('chapters').eq('id', chapid).delete();
      
      if (error) {
        erroralert(error.message);
      } else {
        successalert(`Chapter deleted successfully.`);
        window.location = `/dashboard/series/${seriesid}`;
      }

      // supabase.from('chapters').eq('id', chapid).delete().then(({data, error}) => {

      //   if (error) {
      //     erroralert(error.message);
      //   } else {
      //     successalert(`Chapter ${chapternum} - ${title} deleted successfully.`);
      //     window.location = `/dashboard/series/${seriesid}`;
      //   }

      // })
    }
  })

}