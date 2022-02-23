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

$('#btnCreateNewSeries').on('click', function(){
    // const { value: formValues } = await Swal.fire({
    //     title: 'Multiple inputs',
    //     html:
    //       '<input id="swal-input1" class="swal2-input">' +
    //       '<input id="swal-input2" class="swal2-input">',
    //     focusConfirm: false,
    //     preConfirm: () => {
    //       return [
    //         document.getElementById('swal-input1').value,
    //         document.getElementById('swal-input2').value
    //       ]
    //     }
    //   })
      
    //   if (formValues) {
    //     Swal.fire(JSON.stringify(formValues))
    //   }
});


const inputOptions = new Promise((resolve) => {
  setTimeout(() => {
    resolve({
      '#ff0000': 'Web comic',
      '#00ff00': 'Web Novel',
    })
  }, 0)
})

const { value: color } = await Swal.fire({
  title: 'What do you plan to create?!',
  input: 'radio',
  inputOptions: inputOptions,
  inputValidator: (value) => {
    if (!value) {
      return 'You need to choose something!'
    }
  }
})

if (color) {
  Swal.fire({ html: `You selected: ${color}` })
}