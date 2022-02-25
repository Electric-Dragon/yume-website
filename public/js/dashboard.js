import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

let supabase,user;
let statusText = {
  'd': 'Draft',
  'o': 'Ongoing',
  'p': 'Paused'
}
let statusTextColour = {
  'd': 'Draft',
  'o': 'Ongoing',
  'p': 'Paused'
}
let statusTextBg = {
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
        .select('id,title,chapcount,status,updatedat')
        .eq('creator', user.id)
        .order('updatedat', { ascending: false })
        .limit(3)

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

        data.forEach(val=> {

          console.log(val);

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