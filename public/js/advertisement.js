import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import {erroralert, successalert} from '/js/salert.js';

let supabase, user, selectedSeries, selectedFile;
let dates = {
  start: null,
  end: null
}

let statusText = {
  'd': 'Draft',
  'o': 'Ongoing',
  'p': 'Paused'
}

$('#selectedSeriesHolder').hide();

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
    .select('id,title,novel,cover')
    .eq('creator', user.id)
    .textSearch('fts', query)

    if (error) {
      erroralert(error.message);
    } else {

      if (data.length === 0) {
        $('#seriesHolder').empty();
        $('#seriesHolder').append(`<p class="text-center text-gray-500 text-lg">No results found</p>`);
        return;
      }

      $('#seriesHolder').empty();

      data.forEach(appendElement)

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

function appendElement(val,index) {
    let {id, title, novel, cover} = val;
    
    let type = novel ? 'Novel' : 'Comic';
  
              let element = `<div onclick="selectSeries('${id}')" class="flex items-center bg-gray-200 border-2  cursor-pointer rounded-md p-2 hover:border-light-blue-1">
                                <img class="aspect-square object-cover w-1/5" src="${cover}" alt="">
                                <div class="flex flex-col">
                                    <p class="text-md pl-7 font-poppins font-bold">${title}</p>
                                    <p class="text-md pl-7 font-poppins">Web ${type}</p>
                                </div>
                            </div>`
  
    $('#seriesHolder').append(element);
}

window.selectSeries = async function(id) {
  selectedSeries = id;
  $('#seriesHolder').empty();
  $('#selectedSeriesHolder').show();
  $('#searchBar').val('');

  const { data:series, error:seriesError } = await supabase
    .from('series')
    .select('title,novel,cover,adaptation,genre1,genre2,status,summary')
    .eq('id', id)
    .single();

  if (seriesError) {
    erroralert(seriesError.message);
  } else {
    console.log(series);

    let {title, novel, cover, adaptation, genre1, genre2, status, summary} = series;

    $('#cover').attr('src', cover);

    $('#title').text(title);
    $('#type').text('Web' + novel ? 'Novel' : 'Comic');
    $('#status').text(statusText[status]);
    $('#summary').text(summary);
    
    $('#genre1').text(genre1);
    $('#genre1').attr('href', `/genre/${genre1}`);
    $('#genre2').text(genre2);
    $('#genre2').attr('href', `/genre/${genre2}`);

    let adaptationText = adaptation ? 'Yes' : 'No';
    $('#adaptation').text(adaptationText);

  }

}

window.setFile = function setFile (e) {

  e.preventDefault();

  let bannerImg = $('#myfile').prop('files')[0];
  if (bannerImg.size > 1000000) {
    erroralert("Advertisement banner must be under 1 MB");
    return;
  }

  selectedFile = e.target.files[0];

}

window.setDate = function setDate (e) {

  e.preventDefault();

  let {name, value} = e.target;

  let date = e.target.value;
  let now = new Date();

  if ((name === 'start' && value === dates.end) || name === 'end' && value === dates.start) {
    erroralert("There should be at least one day between start and end date");
    return;
  } else if ((name === 'start' && value === now.toISOString().slice(0,10)) || (name === 'start' && value <= now.toISOString().slice(0,10)) || name === 'end' && value === now.toISOString().slice(0,10) || (name === 'end' && value <= now.toISOString().slice(0,10))) {
    erroralert("Start date should be at least one day after today");
    return;
  }

  dates[e.target.name] = e.target.value;

}