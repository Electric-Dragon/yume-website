import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js"
import {erroralert, successalert} from '/js/salert.js';

let supabase, user, selectedFile, numberOfDays, selectedSeries, paymentLink, ad_ID;
let dates = {
  start: null,
  end: null
}

let statusText = {
  'd': 'Draft',
  'o': 'Ongoing',
  'p': 'Paused'
}

let generateBtnOG = ` <svg aria-hidden="true" data-prefix="far" data-icon="credit-card" class="w-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M527.9 32H48.1C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48.1 48h479.8c26.6 0 48.1-21.5 48.1-48V80c0-26.5-21.5-48-48.1-48zM54.1 80h467.8c3.3 0 6 2.7 6 6v42H48.1V86c0-3.3 2.7-6 6-6zm467.8 352H54.1c-3.3 0-6-2.7-6-6V256h479.8v170c0 3.3-2.7 6-6 6zM192 332v40c0 6.6-5.4 12-12 12h-72c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h72c6.6 0 12 5.4 12 12zm192 0v40c0 6.6-5.4 12-12 12H236c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h136c6.6 0 12 5.4 12 12z"/></svg>
<span class="ml-2 mt-5px">Generate Payment Link</span>`

let generateBtnLoading = `
<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
</svg>
<span class="ml-2 mt-5px">Generating...</span>`

$('#selectedSeriesHolder').hide();

let socket = io(window.location.origin);

socket.on('advertisement', function (data) {
  console.log(data);

  let {success, error, adID} = data;

  if (adID === ad_ID) {
    if (error) {
      $('#btnGenerateLink').prop('disabled', false);
      $('#generateBtn').html(generateBtnOG);
      erroralert(error);
    } else {
      if (success) {
        successalert('Advertisement created successfully', function() {
          window.location.href = '/advertisement/list';
        });
      }
    }
  }

});


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

    $('#btnGenerateLink').prop('disabled', true);
    $('#btnGenerateLink').html(generateBtnLoading);

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
      $('#btnGenerateLink').prop('disabled', false);
      $('#btnGenerateLink').html(generateBtnOG);
      return;
    }

    const { publicURL, error:error_ } = supabase
      .storage
      .from('advertisements')
      .getPublicUrl(path);

    if (error_) {
      $('#btnGenerateLink').prop('disabled', false);
      $('#btnGenerateLink').html(generateBtnOG);
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
        $('#btnGenerateLink').prop('disabled', false);
        $('#btnGenerateLink').html(generateBtnOG);
        erroralert(data.error);
      } else {

        let {link, adID} = data;

        ad_ID = adID;
        paymentLink = link;

        let paymentPopup = window.open(link);

        try {
          paymentPopup.focus();
        } catch (error) {
          $('#btnGenerateLink').prop('disabled', false);
          $('#btnGenerateLink').html(generateBtnOG);
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