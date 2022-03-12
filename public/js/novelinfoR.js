import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import {erroralert, successalert} from '/js/salert.js';

let supabase,user;
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
          .select('title,cover,adaptation,novel,status,summary,creator(username)')
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
          $('#creatorname').attr('href',`/creator/${creator.username}`)

          let adaptationText = adaptation ? 'Yes' : 'No';
          $('#adaptation').text(adaptationText);

          let typeText = novel ? 'Web Novel' : 'Web Comic';
          $('#type').text(typeText);

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
    /* Read more about handling dismissals below */
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