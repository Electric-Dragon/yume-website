import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import {erroralert, successalert} from '/js/salert.js';

let supabase, userPfp;

$('#seriesSearchBar').on('focus', function() {
  window.location = '/search';
})

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

        } else {
          $('#pfp').hide();
          $('#signedInElements').hide();
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