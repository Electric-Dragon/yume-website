import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

let supabase,user;
var seriesid = window.location.pathname.split( '/' ).pop();

let statusText = {
  'd': 'Draft',
  'o': 'Ongoing',
  'p': 'Paused'
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
  
        const { data, error } = await supabase
          .from('series')
          .select('title,chapcount,cover,adaptation,novel,status,summary,chaps')
          .eq('id', seriesid)
          .single()
  
        if (error) {
          let Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer)
              toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
          })
                  
          Toast.fire({
            icon: 'error',
            title: error.message
          });
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
  
        }
  
  }});

async function newChap(chapcount) {
  let { data, error } = await supabase.from('chapters').insert([{
    seriesid:seriesid,
    chapternum:chapcount+1,
  }])

  if (error) {
    let Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    })
            
    Toast.fire({
      icon: 'error',
      title: error.message
    });
  } else {
    window.location = `/dashboard/series/${seriesid}/${data[0].id}/write`;
  }

}