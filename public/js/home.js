import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import {erroralert, successalert} from '/js/salert.js';
import "https://unpkg.com/flowbite@1.4.5/dist/flowbite.js";

let saveInfo = JSON.parse(localStorage.getItem('saveInfo'));

const Toast = Swal.mixin({
  toast: true,
  position: 'bottom-end',
  showConfirmButton: true,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
});

if (saveInfo) {

  Toast.fire({
    icon: 'info',
    title: saveInfo.title,
    html:`click to continue reading </br> <b>ch. ${saveInfo.chapternum}</b>`,
    confirmButtonText: 'Continue Reading'
  }).then((result) => {
    if (result.isConfirmed) {
      window.location=`/read/${saveInfo.path}/${saveInfo.seriesid}/${saveInfo.chapterid}`;
    }
  });
}

let supabase,user;

let creatorType = {
  'a': 'Artist',
  'w': 'Writer'
}

let adSeries = [];
let carouselSlides = [];
let carouselButtons = [];

$.ajax({
    url: "/keys",
    success: async function( result ) {
  
        result = JSON.parse(result);
  
        supabase = createClient(result.link, result.anon_key);
  
        user = supabase.auth.user();

        let now = new Date();

        let dateQuery = `${now.getFullYear()},${now.getMonth()+1},${now.getDate()}`;

        console.log(dateQuery);
        
        const { data:ads, error:adsError } = await supabase
          .from('advertisements')
          .select('target_series,bannerURL')
          .filter('startDate','lte', 'now')
          .filter('endDate','gte', 'now')
          .eq('payment_fulfilled', true)

        if (adsError) {
          console.log(adsError);
          erroralert(adsError.message)
        } else {
          console.log(ads);

          ads.forEach((ad,index) => {

            let {target_series,bannerURL} = ad;

            adSeries.push(target_series);

            let attribute = (index === 0) ? 'data-carousel-item="active"' : 'data-carousel-item';

            let slide = `<div class="hidden duration-700 ease-in-out" ${attribute}>
                              <img onclick="adRedirect(${index})" src="${bannerURL}" class="block absolute top-1/2 left-1/2 w-full -translate-x-1/2 -translate-y-1/2">
                          </div>`

            let button = `
                          <button type="button" class="w-3 h-3 rounded-full" aria-current="true" aria-label="Slide ${index+1}" data-carousel-slide-to="${index}"></button>
                        `

            // $('#adsContainer').append(element);
            carouselSlides.push(slide);
            carouselButtons.push(button);

          });

          let carousel = `
            <div id="indicators-carousel" class="relative" data-carousel="Slide">
                  <div id="adsContainer" class="overflow-hidden relative h-48 rounded-lg sm:h-64 xl:h-96 2xl:h-96">
                      ${carouselSlides.join('')}
                  </div>
                  <div class="flex absolute bottom-5 left-1/2 z-50 space-x-3 -translate-x-1/2">
                      ${carouselButtons.join('')}
                  </div>
                  <button type="button" class="flex absolute top-0 left-0 z-30 justify-center items-center px-4 h-full cursor-pointer group focus:outline-none" data-carousel-prev>
                      <span class="inline-flex justify-center items-center w-8 h-8 rounded-full sm:w-10 sm:h-10 bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
                          <svg class="w-5 h-5 text-black dark:text-white sm:w-6 sm:h-6 " fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                          <span class="hidden">Previous</span>
                      </span>
                  </button>
                  <button type="button" class="flex absolute top-0 right-0 z-30 justify-center items-center px-4 h-full cursor-pointer group focus:outline-none" data-carousel-next>
                      <span class="inline-flex justify-center items-center w-8 h-8 rounded-full sm:w-10 sm:h-10 bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
                          <svg class="w-5 h-5 text-black dark:text-white sm:w-6 sm:h-6 " fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                          <span class="hidden">Next</span>
                      </span>
                  </button>
              </div>
          `

          $('#carouselContainer').append(carousel);

        }

        
        const { data, error } = await supabase
          .from('series')
          .select('id,title,cover,creator(username)')
          .neq('status', 'd')
          .order('updatedat', { ascending: false })
          .limit(10)
  
        if (error) {
          erroralert(error.message);
        } else {
  
          data.forEach(val=> {
  
            let {id, title, cover, creator:{username}} = val;
  
            let element = `<div class="group relative dark:text-white">
                                <div class="object-cover aspect-square bg-gray-200 aspect-w-1 aspect-h-1 rounded-md overflow-hidden group-hover:opacity-75">
                                    <img class="aspect-square object-cover h-full" src="${cover}" class=" object-center object-cover">
                                </div>
                                <div class="mt-4 flex justify-between">
                                    <div>
                                        <h3 class="text-sm">
                                        <a href="/series/${id}" class="text-gray-700 font-bold dark:text-gray-100">
                                            <span aria-hidden="true" class="absolute inset-0"></span>
                                            ${title}
                                        </a>
                                        <br>
                                        <a href="/series/${id}">
                                        <span aria-hidden="true" class="text-xs absolute inset-0 text-gray-300"></span>
                                        <p class="text-xs text-gray-500 dark:text-gray-500">by ${username}</p>
                                        </a>
                                        </h3>
                                    </div>
                                </div>
                           </div>`
  
            $('#recentlyPub').append(element);
  
          });
  
        }

        const { data:creators, error:creatorsError } = await supabase
            .from('series_popularity')
            .select('series!inner(creator(username,pfp,creator_type))')
            .order('popularity_score', { ascending: false })
            .limit(5)

        if (creatorsError) {
            erroralert(creatorsError.message);
        } else {

          let uniqueCreators = [];

          creators.forEach((creator)=> {

            let {series:{creator:{username,pfp,creator_type}}} = creator;

            if (!uniqueCreators.includes(username)) {
              uniqueCreators.push(username);

              let types = '';

              if (creator_type) {
                creator_type.forEach((type,index)=> {
                  types+=creatorType[type];
                  if (index === 0 && creator_type.length > 1) {
                    types+=' & ';
                  }
                })
              }
              
              let element = `
                <div class="group relative dark:text-white">
                      <div class="shadow-lg object-cover aspect-square rounded-full bg-gray-200 aspect-w-1 aspect-h-1 overflow-hidden group-hover:opacity-75">
                          <img class=" aspect-square object-cover h-full" src="${pfp}" class=" object-center object-cover">
                      </div>
                      <div class="mt-4 flex justify-between">
                          <div>
                              <h3 class="text-sm">
                              <a href="/user/${username}" class="text-gray-700 font-bold dark:text-gray-100">
                                  <span aria-hidden="true" class="absolute inset-0"></span>
                                  ${username}
                              </a>
                              <br>
                              <a href="/user/${username}">
                                <span aria-hidden="true" class="text-xs absolute inset-0 text-gray-300"></span>
                              </a>
                              <p class="text-xs text-gray-500 dark:text-gray-500">${types}</p>
                              </h3>
                          </div>
                      </div>
                </div>`

              $("#popularCreatorsDiv").append(element);

            }

          });

        }
  
  }});

window.adRedirect = function adRedirect(index) {
  window.location = `/series/${adSeries[index]}`;
}