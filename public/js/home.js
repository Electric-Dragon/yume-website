import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import {erroralert, successalert} from '/js/salert.js';

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

$.ajax({
    url: "/keys",
    success: async function( result ) {
  
        result = JSON.parse(result);
  
        supabase = createClient(result.link, result.anon_key);
  
        user = supabase.auth.user();
  
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
            .select('series!inner(creator(id,username,pfp,creator_type))')
            .order('popularity_score', { ascending: false })
            .limit(5)

        if (creatorsError) {
            erroralert(creatorsError.message);
        } else {

          let uniqueCreators = [];

          creators.forEach((creator)=> {

            let {series:{creator:{id,username,pfp,creator_type}}} = creator;

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