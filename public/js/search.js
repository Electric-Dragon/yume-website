import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import {erroralert, successalert} from '/js/salert.js';

let supabase,user;

let filter = '';

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

        const { data, error } = await supabase
          .from('series_popularity')
          .select('seriesid(creator(banner))')
          .order('popularity_score', 'desc')
          .limit(1)
          .single();

        if (error) {
          erroralert(error.message);
        } else {
          console.log(data);

          $("#popularDiv").css({"background-image": `url('${data.seriesid.creator.banner}')`});

        }
  
}});

$('#filterAll').click(function() {
  filter = '';
  $('#filterNovels').removeClass('filterActive');
  $('#filterComics').removeClass('filterActive');
  $('#filterAll').addClass('filterActive');
});

$('#filterNovels').click(function() {
  filter = 'novel';
  $('#filterNovels').addClass('filterActive');
  $('#filterComics').removeClass('filterActive');
  $('#filterAll').removeClass('filterActive');
});

$('#filterComics').click(function() {
  filter = 'comic';
  $('#filterNovels').removeClass('filterActive');
  $('#filterComics').addClass('filterActive');
  $('#filterAll').removeClass('filterActive');
});

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

      let data, error;

      if (filter === '') {
        ({ data, error } = await supabase
        .from('series')
        .select('id,title,summary,cover,creator(username),genre1,genre2,status')
        .neq('status', 'd')
        .textSearch('fts', query));
      } else if (filter === 'novel') {
        ({ data, error } = await supabase
        .from('series')
        .select('id,title,summary,cover,creator(username),genre1,genre2,status')
        .neq('status', 'd')
        .eq('novel', true)
        .textSearch('fts', query));
      } else {
        ({ data, error } = await supabase
        .from('series')
        .select('id,title,summary,cover,creator(username),genre1,genre2,status')
        .neq('status', 'd')
        .eq('novel', false)
        .textSearch('fts', query));
      }
  
      if (error) {
        erroralert(error.message);
      } else {
  
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
      $('#searchResults').empty();
    }
  
});

function showElement(series) {

  let { id, title, summary, cover, creator, genre1, genre2, status } = series;

  var words = summary.split(" ");

  if (words.length > 30) {
    summary = "";
    for (let i = 0; i < 30; i++) {
      summary += words[i] + " ";
    }
    summary += "...";
  }
  
  let element = `
  <a href="/series/${id}">
  <div class="max-w-2xl bg-white border-2 border-gray-300 p-5 rounded-md tracking-wide shadow-lg">
  <div id="header" class="grid grid-flow-col grid-cols-3"> 
          <div class="group relative">
              <div class="object-cover aspect-square bg-gray-200 aspect-w-1 aspect-h-1 rounded-md overflow-hidden group-hover:opacity-75">
                <img class="aspect-square object-cover h-full" src="${cover}" class=" object-center object-cover">
              </div>
              <div class="mt-4 flex justify-between">
            </div>
          </div>                         
        <div id="body" class="flex flex-col ml-5 col-span-2">
        <h4 id="name" class="text-xl font-semibold mb-2">${title}</h4>
        <p id="description" class="text-gray-800 mt-2">${summary}</p>
        <div class="flex mt-5">
           <p>Author:</p>
           <p class="ml-3 hover:underline text-blue-600">${creator.username}</p>
        </div>
        <div class="flex mt-1">
          <p>Status:</p>
          <p class="ml-3 text-green-800">${statusText[status]}</p>
       </div>
        <div class="flex mt-1">
          <p>Genre:</p>
          <p class="ml-3 hover:underline text-blue-600">${genre1}</p> <span class="ml-1">,</span>
          <p class="ml-2 hover:underline text-blue-600">${genre2}</p>
       </div>
     </div>
  </div>
</div> 
</a>`

  $('#searchResults').append(element);

}
