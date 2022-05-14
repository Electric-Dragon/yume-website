import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import {erroralert, successalert} from '/js/salert.js';

let supabase, userPfp;

$('#seriesSearchBar').on('focus', function() {
  window.location = '/search';
})

localStorage.getItem('dark') === 'true' ? $('html').addClass('dark') : $('html').removeClass('dark');

$.ajax({
  url: "/keys",
  success: async function( result ) {

      result = JSON.parse(result);

      supabase = createClient(result.link, result.anon_key);

      let user = supabase.auth.user();

      try {
        if (user) {

          $('#authButtons').hide();

          const { data, error } = await supabase
            .from('public_profile')
            .select('pfp')
            .eq('id',user.id)
            .single();

          userPfp = data.pfp;

          $('#pfp').attr('src', userPfp);

          $.ajax({
            type:"POST",
            url:'/getRecommendations',
            data:{access_token: supabase.auth.session().access_token},        
            success: async function(data, status) {
              if (data.error) {
                erroralert(data.error);
              } else {

                let {seriesIds} = data;

                if (seriesIds.length === 0) {
                  $('#recommendationDiv').hide();
                }

                else {

                  const { data:recommendedSeries, error } = await supabase
                  .from('series')
                  .select('id,title,cover,creator:public_profile!series_creator_fkey(username)')
                  .neq('status', 'd')
                  .in('id', seriesIds)
                  .order('updatedat', { ascending: false })
                  .limit(5)
                  
                  recommendedSeries.forEach((series) => {

                    let {id, title, cover, creator:{username}} = series;
  
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
          
                    $('#recommendations').append(element);

                  });

                }
                
              }
          }});

        } else {
          $('#pfp').hide();
          $('#signedInElements').hide();
          $('#recommendationDiv').hide();
        }
  
        document.getElementById('signOut').addEventListener('click', async function(){
  
        const { error } = await supabase.auth.signOut();

        if (error) {
          erroralert(error.message);
        } else {
          successalert('Signed out successfully',() => {window.location.reload()});
          $('#authButtons').show();
          $('#signedInElements').hide();
          $('#pfp').hide();
        }
  
        });
      } catch (error) {
        console.log(error);
      }

}});

window.data = function data() {
    function getThemeFromLocalStorage() {
      // if user already changed the theme, use it
      if (window.localStorage.getItem('dark')) {
        return JSON.parse(window.localStorage.getItem('dark'))
      }
  
      // else return their preferences
      return (
        !!window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      )
    }
  
    function setThemeToLocalStorage(value) {
      window.localStorage.setItem('dark', value)
    }
  
    return {
      dark: getThemeFromLocalStorage(),
      toggleTheme() {
        this.dark = !this.dark
        setThemeToLocalStorage(this.dark)
      },
      isSideMenuOpen: false,
      toggleSideMenu() {
        this.isSideMenuOpen = !this.isSideMenuOpen
      },
      closeSideMenu() {
        this.isSideMenuOpen = false
      },
      isNotificationsMenuOpen: false,
      toggleNotificationsMenu() {
        this.isNotificationsMenuOpen = !this.isNotificationsMenuOpen
      },
      closeNotificationsMenu() {
        this.isNotificationsMenuOpen = false
      },
      isProfileMenuOpen: false,
      toggleProfileMenu() {
        this.isProfileMenuOpen = !this.isProfileMenuOpen
      },
      closeProfileMenu() {
        this.isProfileMenuOpen = false
      },
      isPagesMenuOpen: false,
      togglePagesMenu() {
        this.isPagesMenuOpen = !this.isPagesMenuOpen
      },
      // Modal
      isModalOpen: false,
      trapCleanup: null,
      openModal() {
        this.isModalOpen = true
        this.trapCleanup = focusTrap(document.querySelector('#modal'))
      },
      closeModal() {
        this.isModalOpen = false
        this.trapCleanup()
      },
    }
}
  
let isDark = $('html').hasClass('dark');

toggleDark();

$('#darkOn').click(function () {
    $('html').addClass('dark');
    toggleDark();
});

$('#darkOff').click(function () {
    $('html').removeClass('dark');
    toggleDark();
});

function toggleDark() {
  isDark = $('html').hasClass('dark');
  if (isDark) {
      $('#darkOn').hide();
      $('#darkOff').show();
  } else {
      $('#darkOff').hide();
      $('#darkOn').show();
  }
}