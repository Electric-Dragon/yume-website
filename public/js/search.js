import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import {erroralert, successalert} from '/js/salert.js';

let supabase,user;

let filter = '';

$.ajax({
    url: "/keys",
    success: async function( result ) {
  
        result = JSON.parse(result);
  
        supabase = createClient(result.link, result.anon_key);
  
        user = supabase.auth.user();
  
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
        .select('id,title,summary,cover,creator(username),novel,genre1,genre2')
        .neq('status', 'd')
        .textSearch('fts', query));
      } else if (filter === 'novel') {
        ({ data, error } = await supabase
        .from('series')
        .select('id,title,summary,cover,creator(username),novel,genre1,genre2')
        .neq('status', 'd')
        .eq('novel', true)
        .textSearch('fts', query));
      } else {
        ({ data, error } = await supabase
        .from('series')
        .select('id,title,summary,cover,creator(username),novel,genre1,genre2')
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
    //   getAllSeries();
    }
  
});

function showElement(series) {

  let { id, title, summary, cover, creator, novel, genre1, genre2 } = series;

  var words = summary.split(" ");

  if (words.length > 30) {
    summary = "";
    for (let i = 0; i < 30; i++) {
      summary += words[i] + " ";
    }
    summary += "...";
  }

  let typeText = novel ? 'Web Novel' : 'Web Comic';

  let element = `<a href="/series/${id}">
  <div class="max-w-2xl bg-white border-2 border-gray-300 p-5 rounded-md tracking-wide shadow-lg">
    <div id="header" class="grid grid-flow-col"> 
        <div class=" aspect-square bg-gray-200 aspect-w-1 aspect-h-1 rounded-md overflow-hidden group-hover:opacity-75">
            <img class="aspect-square object-cover w-full object-center" src="${cover}" >
          </div>                       
          <div id="body" class="flex flex-col ml-5">
          <h4 id="name" class="text-xl font-semibold mb-2">${title}</h4>
          <p id="description" class="text-gray-800 mt-2">${summary}</p>
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
  </div>
  </a>`

  $('#searchResults').append(element);

}
