
  let element = `
  <div class="max-w-lg bg-white border-2 border-gray-300 p-5 rounded-md tracking-wide shadow-lg">
    <div id="header" class="grid grid-flow-col"> 
    <div class="group relative dark:text-white">
    <div class="object-cover aspect-square bg-gray-200 aspect-w-1 aspect-h-1 rounded-md overflow-hidden group-hover:opacity-75">
        <img class="aspect-square object-cover h-full" src="${cover}" class=" object-center object-cover">
    </div>
    <div class="mt-4 flex justify-between">
        <div>
            <h3 class="text-sm">
            <a href="/series/" class="text-gray-700 font-bold dark:text-gray-100">
                <span aria-hidden="true" class="absolute inset-0"></span>
            </a>
            <br>
            <a href="/series/">
            <span aria-hidden="true" class="text-xs absolute inset-0 text-gray-300"></span>
            <p class="text-xs text-gray-500 dark:text-gray-500">by</p>
            </a>
            </h3>
        </div>
    </div>
</div>                    
          <div id="body" class="flex flex-col ml-5">
          <a href="/series/${id}"> <h4 id="name" class="text-xl font-semibold mb-2">${title}</h4></a>
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
  </div>`