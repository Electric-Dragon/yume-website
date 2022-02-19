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