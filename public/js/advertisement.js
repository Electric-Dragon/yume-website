import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import {io} from "https://cdn.socket.io/4.5.0/socket.io.min.js";
import {erroralert, successalert} from '/js/salert.js';

let supabase, user, selectedFile, numberOfDays, selectedSeries, paymentLink;
let dates = {
  start: null,
  end: null
}

let statusText = {
  'd': 'Draft',
  'o': 'Ongoing',
  'p': 'Paused'
}

let socket = io();

$('#selectedSeriesHolder').hide();

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

function appendElement(val) {
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

    $('#seriesCover').attr('src', cover);
    $('#seriesTitle').text(title);
    $('#pfpAnchor').attr('href', `/series/${id}`);

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

  let valueDate = new Date(value);
  let now = new Date();

  if ((name === 'start' && value === dates.end) || name === 'end' && value === dates.start) {
    erroralert("There should be at least one day between start and end date");
    return;
  } else if ((name === 'start' && value === now.toISOString().slice(0,10)) || (name === 'start' && value <= now.toISOString().slice(0,10)) || name === 'end' && value === now.toISOString().slice(0,10) || (name === 'end' && value <= now.toISOString().slice(0,10))) {
    erroralert("Start date should be at least one day after today");
    return;
  } else if ((name === 'start' && value > dates.end) || (name === 'end' && value < dates.start)) {
    erroralert("Start date should be before end date");
    return;
  }

  dates[name] = value;

  $(`#${name}Date`).text(`${valueDate.getDate()}/${valueDate.getMonth()+1}/${valueDate.getFullYear()}`);

  if (dates.start && dates.end) {
    numberOfDays = datediff(new Date(dates.start), new Date(dates.end));
    $('#totalPrice').text(`Rs. ${numberOfDays * 10}`);
  }

}

window.generateLink = async function generateLink(e) {
  e.preventDefault();

  if (!selectedSeries || !dates.start || !dates.end || !selectedFile) {
    erroralert("Please fill all the fields");
    return;
  } else if (paymentLink) {

    let paymentPopup = window.open(paymentLink);

    try {
      paymentPopup.focus();
    } catch (error) {
      alert('Please allow popups for this website');
    }
    
  } else {

    let rand = Math.random();
    let path = `${user.id}/temporary/${rand}/bannerIMG.jpg`;

    const { data, error } = await supabase
      .storage
      .from('advertisements')
      .upload(path, selectedFile, {
        cacheControl: '3600',
        upsert: true
    });

    if (error) {
      erroralert(error.message);
      return;
    }

    const { publicURL, error:error_ } = supabase
      .storage
      .from('advertisements')
      .getPublicUrl(path);

    if (error_) {
      erroralert(error_.message);
      return;
    }

    $.ajax({
      type:"POST",
      url:'/createAdvertisement',
      data:{id: selectedSeries,
      access_token: supabase.auth.session().access_token,
      startDate: new Date(dates.start),
      endDate: new Date(dates.end),
      numberOfDays: numberOfDays,
      path: path
    },
    success: function(data) {
      if (data.error) {
        erroralert(data.error);
      } else {
        let {link} = data;

        paymentLink = link;

        let paymentPopup = window.open(link);

        try {
          paymentPopup.focus();
        } catch (error) {
          alert('Please allow popups for this website');
        }

      }
    }
    });
  }

}

function datediff(first, second) {
  return Math.round((second-first)/(1000*60*60*24));
}