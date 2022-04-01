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
          $('#searchResults').empty();
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

  let { id, title, summary, cover, creator, novel, genre1, genre2 } = series;

  let typeText = novel ? 'Web Novel' : 'Web Comic';

  let element = `<div class="max-w-2xl bg-white border-2 border-gray-300 p-5 rounded-md tracking-wide shadow-lg">
                  <div id="header" class="grid grid-flow-col"> 
                      <div class="object-cover aspect-square bg-gray-200 aspect-w-1 aspect-h-1 rounded-md overflow-hidden group-hover:opacity-75">
                          <img class="aspect-square object-cover" src="${cover}" class=" object-center object-cover">
                        </div>                       
                        <div id="body" class="flex flex-col ml-5">
                        <h4 id="name" class="text-xl font-semibold mb-2">${title}</h4>
                        <p id="description" class="text-gray-800 mt-2">Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                        <div class="flex mt-5">
                          <p>Author:</p>
                          <a href="/user/${creator.username}" class="ml-3 hover:underline text-blue-600">${creator.username}</a>
                        </div>
                        <div class="flex mt-1">
                          <p>Type:</p>
                          <p class="ml-3 text-green-800">${typeText}</p>
                      </div>
                        <div class="flex mt-1">
                          <p>Genre:</p>
                          <a href="/genres/${genre1}" class="ml-3 hover:underline text-blue-600">${genre1}</a> <span class="ml-1">,</span>
                          <a href="/genres/${genre2}" class="ml-2 hover:underline text-blue-600">${genre2}</a>
                      </div>
                    </div>
                  </div>
                </div>`

  $('#searchResults').append(element);

}