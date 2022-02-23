import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

let supabase;

$.ajax({
  url: "/keys",
  success: function( result ) {

      result = JSON.parse(result);

      supabase = createClient(result.link, result.anon_key);

      const user = supabase.auth.user();

      if (!user) {
        window.location = "/signin";
      }

}});

$('#btnCreateNewSeries').on('click', async function(){

  const inputOptions = new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        'comic': 'Web comic',
        'novel': 'Web Novel',
      })
    }, 0)
  })
  
  const { value: choice } = await Swal.fire({
    title: 'What do you plan to create?!',
    input: 'radio',
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