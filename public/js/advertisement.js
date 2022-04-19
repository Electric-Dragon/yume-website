import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import {erroralert, successalert} from '/js/salert.js';

let supabase,user;

document.getElementById('searchBar').addEventListener('input', function(e) {
    console.log(e.target.value);
});

$('#searchBar').on('input', async function() {

    console.log('searching');

  let search = $('#searchBar').val();
  let query = '';

  if (search.length > 0) {
    let splitSearch = search.split(' ');

    splitSearch.forEach(word => {

      if (word!=='') {
        if(query === '') {
          query = `'${word}'`;
        } else {
          query = `${query} | '${word}'`;
        }
      }

    });

    const { data, error } = await supabase
    .from('series')
    .select('id,title,chapcount,cover')
    .eq('creator', user.id)
    .textSearch('fts', query)

    if (error) {
      erroralert(error.message);
    } else {
      console.log(data);

      if (data.length === 0) {
        $('#seriesHolder').empty();
        $('#seriesHolder').append(`<p class="text-center text-gray-500 text-xl">No results found</p>`);
        return;
      }

      $('#seriesHolder').empty();

      data.forEach(series => {
        appendElement(series);
      })

    }

  }

})

$.ajax({
    url: "/keys",
    success: async function( result ) {
  
        result = JSON.parse(result);
  
        supabase = createClient(result.link, result.anon_key);
  
        user = supabase.auth.user();
  
        if (!user) {
          window.location = "/signin";
        }
  
}});

function appendElement(val) {
    let {id, title, chapcount, cover} = val;
  
              let element = `<a href="/dashboard/series/${id}" class="block ">
                    
                                  <img
                                  alt="Series Cover Illustration"
                                  src="${cover}"
                                  class="object-cover aspect-square w-full  md:h-96 -mt-3 transition-shadow ease-in-out duration-300 shadow-none hover:shadow-xl hover:shadow-green-500"
                                  />
                          
                                  <p class="mt-1 text-lg text-black font-bold dark:text-white">
                                      ${title}
                                  </p>
                          
                                  <div class="flex items-center justify-between font-bold text-gray-700 dark:text-gray-400">
                                  <p class="text-sm">
                                      ${chapcount} eps
                                  </p>
                                  </div>
                              </a>`
  
    $('#seriesHolder').append(element);
  }