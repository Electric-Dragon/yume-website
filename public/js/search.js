import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import {erroralert, successalert} from '/js/salert.js';

let supabase,user;

$.ajax({
    url: "/keys",
    success: async function( result ) {
  
        result = JSON.parse(result);
  
        supabase = createClient(result.link, result.anon_key);
  
        user = supabase.auth.user();
  
}});

$('#searchBar').on('input', async function() {

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
      .select('id,title,summary,cover,creator(username),novel,genre1,genre2')
      .neq('status', 'd')
      .textSearch('fts', query)
  
      if (error) {
        erroralert(error.message);
      } else {
        console.log(data);
  
        if (data.length === 0) {
          $('#searchResults').empty();
          $('#searchResults').append(`<p class="text-center text-gray-500 text-xl">No results found</p>`);
          return;
        } else {
          data.forEach(series => {
            showElement(series)
          });
        }
  
      }
  
    } else {
    //   getAllSeries();
    }
  
});

function showElement(series) {

}