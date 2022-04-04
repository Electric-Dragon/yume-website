import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import {erroralert, successalert} from '/js/salert.js';

$('#btnCloseNotifications').trigger('click');

let supabase,user;

let statusText = {
  'd': `<td class="px-4 py-3 text-xs">
  <span
    class="px-2 py-1 font-semibold leading-tight text-orange-700 bg-orange-100 rounded-full dark:text-white dark:bg-orange-600">
    Draft
  </span>
  </td>`,
  'o': `<td class="px-4 py-3 text-xs">
  <span
    class="px-2 py-1 font-semibold leading-tight text-green-700 bg-green-100 rounded-full dark:bg-green-700 dark:text-green-100">
    Ongoing
  </span>
  </td>`,
  'p': `<td class="px-4 py-3 text-xs">
  <span
    class="px-2 py-1 font-semibold leading-tight text-red-700 bg-red-100 rounded-full dark:text-red-100 dark:bg-red-700">
    Paused
  </span>
  </td>`
}




let adaptationText = {
  'a': 'has been <span class="text-green-700 uppercase font-bold">accepted</span>',
  'r': 'has been <span class="text-red-500 uppercase font-bold">rejected</span>',
  'p': 'is pending'
}

var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

$('#searchBar').on('focus', function() {
  window.location = '/dashboard/series';
})

dayjs.extend(window.dayjs_plugin_relativeTime)

$.ajax({
  url: "/keys",
  success: async function( result ) {

      result = JSON.parse(result);

      supabase = createClient(result.link, result.anon_key);

      user = supabase.auth.user();

      if (!user) {
        window.location = "/signin";
      }

      const { data, error } = await supabase
        .from('series')
        .select('id,title,chapcount,status,updatedat,comment_count')
        .eq('creator', user.id)
        .order('updatedat', { ascending: false })
        .limit(6)

      if (error) {
        erroralert(error.message);
      } else {

        data.forEach(async val=> {

          let {id, title, chapcount, status, updatedat, comment_count} = val;
          let date = new Date(updatedat);

          const { data:seriesFollows, error:seriesFollowsError } = await supabase
            .rpc('get_series_follows', { seriesid: id });

          if (seriesFollowsError) {
            erroralert(seriesFollowsError.message);
          }


          let element = `<tr class="text-gray-700 dark:text-gray-400">
                          <td class="px-4 py-3">
                            <div class="flex items-center text-sm">
                              <div>
                                <p class="font-semibold">${title}</p>
                                <p class="text-xs text-gray-600 dark:text-gray-400">
                                  ${chapcount} Episodes
                                </p>
                              </div>
                            </div>
                          </td>
                          <td class="px-4 py-3 flex flex-row gap-4 text-xl">
                              <a href="/dashboard/series/${id}">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor"
                                class="text-green-600 text-center w-7 h-7" viewBox="0 0 20 20">
                                <path
                                  d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                <path fill-rule="evenodd"
                                  d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
                                </svg>
                              </a>
                          </td>
                          <td class="px-4 py-3">
                          <div class="flex items-center text-sm">
                            <div>
                              <p class="font-semibold">${seriesFollows}</p>
                              <p class="text-xs text-gray-600 dark:text-gray-400">
                               ${comment_count} comments
                              </p>
                            </div>
                          </div>
                        </td>
                          ${statusText[status]}
                          <td class="px-4 py-3 text-sm">
                            ${days[date.getDay()]}, ${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}
                          </td>
                          <td class="px-4 py-3 text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                              class="text-red-600 w-6 h-6" viewBox="0 0 16 16">
                              <path
                                d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
                            </svg>
                          </td>
                        </tr>`

          $('#tbLatestUpdates').append(element);

        })

      }

      const {data: notifications, error: error_} = await supabase
        .from('adaptation_notifications')
        .select('id,from(id,username),to(id,username),series!adaptation_notifications_series_fkey[series](id,title,novel),status,when')
        .or(`from.eq.${user.id},to.eq.${user.id}`)
        .order('when', { ascending: false })

      if (error_) {
        erroralert(error_.message);
        console.error(error_.hint);
        console.error(error_.details);
      } else {

        notifications.forEach(val => {
          let {id, from, to, series, status, when} = val;

          console.log(val);

          let type = series.novel ? 'Web Comic' : 'Web Novel';

          let date = new Date(when);
          if (to.id === user.id && status === 'p') {

            let element = `
              <div class="w-full p-3 mt-4 bg-white rounded shadow flex flex-shrink-0">
                    <div tabindex="0" aria-label="group icon" role="img" class="focus:outline-none w-8 h-8 border rounded-full border-gray-200 flex flex-shrink-0 items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M1.33325 14.6667C1.33325 13.2522 1.89516 11.8956 2.89535 10.8954C3.89554 9.89523 5.2521 9.33333 6.66659 9.33333C8.08107 9.33333 9.43763 9.89523 10.4378 10.8954C11.438 11.8956 11.9999 13.2522 11.9999 14.6667H1.33325ZM6.66659 8.66666C4.45659 8.66666 2.66659 6.87666 2.66659 4.66666C2.66659 2.45666 4.45659 0.666664 6.66659 0.666664C8.87659 0.666664 10.6666 2.45666 10.6666 4.66666C10.6666 6.87666 8.87659 8.66666 6.66659 8.66666ZM11.5753 10.1553C12.595 10.4174 13.5061 10.9946 14.1788 11.8046C14.8515 12.6145 15.2515 13.6161 15.3219 14.6667H13.3333C13.3333 12.9267 12.6666 11.3427 11.5753 10.1553ZM10.2266 8.638C10.7852 8.13831 11.232 7.52622 11.5376 6.84183C11.8432 6.15743 12.0008 5.41619 11.9999 4.66666C12.0013 3.75564 11.7683 2.85958 11.3233 2.06466C12.0783 2.21639 12.7576 2.62491 13.2456 3.2208C13.7335 3.81668 14.0001 4.56315 13.9999 5.33333C14.0001 5.80831 13.8987 6.27784 13.7027 6.71045C13.5066 7.14306 13.2203 7.52876 12.863 7.84169C12.5056 8.15463 12.0856 8.38757 11.6309 8.52491C11.1762 8.66224 10.6974 8.7008 10.2266 8.638Z"
                                fill="#047857"
                            />
                        </svg>
                    </div>
                    <div class="pl-3 w-full">
                        <div class="flex items-center justify-between w-full h-sm">
                        <p tabindex="0" class="focus:outline-none text-sm "><a href="/creator/${from.username}"><span class="text-indigo-700">${from.username}</span></a> requested to create a ${type} adaptation of <br> <a href="/series/${series.id}"><span class="text-cyan-500 font-bold hover:underline">${series.title}</span></a></p>
                        </div>
                        <div class="flex mr-6 pr-4 items-center justify-center mb-3 gap-2 flex-row ">
                          <div>
                            <button type="button" onclick="acceptRequest(${id})" class=" px-3 py-1 border-2 border-green-500 text-green-500 font-medium text-xs leading-tight uppercase rounded-md  hover:bg-black hover:bg-opacity-5 focus:outline-none focus:ring-0 transition duration-150 ease-in-out">accept</button>
                            <button type="button" onclick="rejectRequest(${id})" class="md:ml-4 px-3 py-1 border-2 border-red-600 text-red-600 font-medium text-xs leading-tight uppercase     rounded-md  hover:bg-black hover:bg-opacity-5 focus:outline-none focus:ring-0 transition duration-150 ease-in-out">reject</button>
                          </div>
                        </div>
                        <p tabindex="0" class="focus:outline-none text-xs leading-3 pt-1 text-gray-500">${dayjs(date).fromNow()}</p>
                    </div>
                </div>`

              $('#notificationHolder').append(element);
            
          } else {

            // let clickHere = (status === 'a') ? `<a onclick="createAdaptation('${series.id}')"` + series.id + '"><span class="text-indigo-700"> Click Here to create the adaptation</span></a>' : '';
            let clickHere = (status === 'a') ? `
                                                <div class="flex items-center justify-center mt-5 mb-3 gap-2 flex-row ">
                                                  <div>
                                                    <button type="button" onclick="createAdaptation('${series.id}')" class=" px-2 py-1 border-2 border-green-500 text-black font-medium text-xs leading-tight uppercase rounded-md  hover:text-white hover:bg-green-500  focus:outline-none focus:ring-0 transition duration-150 ease-in-out">Start working</button>
                                                  </div>
                                                </div>` : '';

            let element = `
              <div class="max-w-lg p-3 mt-4 bg-white rounded  shadow-md flex flex-shrink-0 font-sans ">
                    <div tabindex="0" aria-label="group icon" role="img" class="focus:outline-none w-8 h-8 border rounded-full border-gray-200 flex flex-shrink-0 items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M1.33325 14.6667C1.33325 13.2522 1.89516 11.8956 2.89535 10.8954C3.89554 9.89523 5.2521 9.33333 6.66659 9.33333C8.08107 9.33333 9.43763 9.89523 10.4378 10.8954C11.438 11.8956 11.9999 13.2522 11.9999 14.6667H1.33325ZM6.66659 8.66666C4.45659 8.66666 2.66659 6.87666 2.66659 4.66666C2.66659 2.45666 4.45659 0.666664 6.66659 0.666664C8.87659 0.666664 10.6666 2.45666 10.6666 4.66666C10.6666 6.87666 8.87659 8.66666 6.66659 8.66666ZM11.5753 10.1553C12.595 10.4174 13.5061 10.9946 14.1788 11.8046C14.8515 12.6145 15.2515 13.6161 15.3219 14.6667H13.3333C13.3333 12.9267 12.6666 11.3427 11.5753 10.1553ZM10.2266 8.638C10.7852 8.13831 11.232 7.52622 11.5376 6.84183C11.8432 6.15743 12.0008 5.41619 11.9999 4.66666C12.0013 3.75564 11.7683 2.85958 11.3233 2.06466C12.0783 2.21639 12.7576 2.62491 13.2456 3.2208C13.7335 3.81668 14.0001 4.56315 13.9999 5.33333C14.0001 5.80831 13.8987 6.27784 13.7027 6.71045C13.5066 7.14306 13.2203 7.52876 12.863 7.84169C12.5056 8.15463 12.0856 8.38757 11.6309 8.52491C11.1762 8.66224 10.6974 8.7008 10.2266 8.638Z"
                                fill="#047857"
                            />
                        </svg>
                    </div>
                    <div class="pl-3 w-full">
                        <div class="flex items-center justify-between w-full">
                        <p tabindex="0" class="focus:outline-none text-sm ">Your request to create a ${type} adaptation of <br>   
                        <a href="/series/${series.id}"><span class="text-cyan-500 font-bold hover:underline">${series.title}</span></a> ${adaptationText[status]}</p>
                        </div>
                        <div class="flex items-center justify-between w-full">
                        ${clickHere}
                        </div>
                        <div class="flex mr-6 pr-4 items-center justify-center mt-2 mb-3 gap-2 flex-row ">
                        <p tabindex="0" class="focus:outline-none text-xs leading-3 pt-1 text-gray-500">${dayjs(date).fromNow()}</p>
                    </div>
                </div>`

              $('#notificationHolder').append(element);
            
          }

        });

        $('#notificationHolder').append(`<div class="flex items-center justiyf-between">
        <hr class="w-full">
        <p tabindex="0" class="focus:outline-none text-sm flex flex-shrink-0 leading-normal px-3 py-16 text-gray-500">Thats it for now :)</p>
        <hr class="w-full">
      </div>`)
        
      }

}});

$('#btnCreateNewSeries').on('click', async function(){
  const inputOptions = new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        'comic': 'Web Comic',
        'novel': 'Web Novel',
      })
    }, 0)
  })
  
  const { value: choice } = await Swal.fire({
    title: 'What do you plan to create?!',
    input: 'radio',
    confirmButtonText: 'Continue!',
    inputOptions: inputOptions,
    inputValidator: (value) => {
      if (!value) {
        return 'You need to choose something!'
      }
    }
  })
  
  if (choice) {
    window.location = '/dashboard/create/' + choice;
  }
  
});

window.acceptRequest = async function acceptRequest(id) {

  Swal.fire({
    title: 'Are you sure?',
    icon: 'info',
    html:
      'This cannot be undone',
    showCancelButton: true,
    confirmButtonText: 'Yes',
    cancelButtonText:'Cancel',
  }).then( async (result) => {

    if (result.isConfirmed) {
        
      const { data, error } = await supabase
        .from('adaptation_notifications')
        .update({ status: 'a'})
        .match({ id: id })

      if (error) {
        erroralert(error.message);
      } else {
        successalert('Adaptation request accepted', function() {
          window.location.reload();
        });
      }

    }

  })

}

window.rejectRequest = async function rejectRequest(id) {

  Swal.fire({
    title: 'Are you sure?',
    icon: 'info',
    html:
      'This cannot be undone',
    showCancelButton: true,
    confirmButtonText: 'Yes',
    cancelButtonText:'Cancel',
  }).then( async (result) => {

    if (result.isConfirmed) {
        
      const { data, error } = await supabase
        .from('adaptation_notifications')
        .update({ status: 'r'})
        .match({ id: id })

      if (error) {
        erroralert(error.message);
      } else {
        successalert('Adaptation request rejected', function() {
          window.location.reload();
        });
      }

    }

  })

}

window.createAdaptation = async function createAdaptation(id) {

  Swal.fire({
    title: 'Are you sure?',
    icon: 'info',
    html:
      'Are you sure you want to create an adaptation of this series?',
    showCancelButton: true,
    confirmButtonText: 'Yes',
    cancelButtonText:'Cancel',
  }).then( async (result) => {

    if (result.isConfirmed) {
        
      $.ajax({
        type:"POST",
        url:'/createAdaptation',
        data:{id: id,
        access_token: supabase.auth.session().access_token},        
        success: function(data, status) {
          if (data.error) {
            erroralert(data.error);
          } else {
            successalert('Adaptation created successfully', function() {
              window.location = `/dashboard/series/${data.success}`;
            });
          }
      }});

    }

  })
  
}