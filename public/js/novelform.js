import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

let supabase, user;

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
      .from('genres')
      .select()

      if (error) {
        let Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer)
              toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
          })
                  
          Toast.fire({
            icon: 'error',
            title: error.message
          });
      } else {
          data.forEach(g => {
            g = g.id
            $('#s1').append(new Option(g,g));
            $('#s2').append(new Option(g,g));            
          });

          document.getElementById('btnCreate').addEventListener('click', function(e){
            create(e);
          });

      }

}});

async function create(e) {
    e.preventDefault();

    let title = $('#title').val();
    let summary = $('#summary').val();
    let adaptation = $('#adaptation').val();
    let cover = $('#files').prop('files')[0];
    let mature = $('#mature').prop('checked');

    let genre1 = $('#s1').val();
    let genre2 = $('#s2').val();

    if (!(title && summary && genre1 && genre2 && cover)) {
        alert('Please fill in all fields');
    } else if (cover.size > 500000) {
        alert('Cover image is too large');
    } else if (genre1 === genre2) {
        alert('Please select two different genres');
    } else {

        if (adaptation === "") {
            adaptation = null;
        }

        let series = {
            title: title,
            summary: summary,
            adaptation: adaptation,
            creator: user.id,
            novel: true,
            mature: mature
        }

        const { data, error } = await supabase
        .from('series')
        .insert([series])

        if (error) {
            let Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                didOpen: (toast) => {
                  toast.addEventListener('mouseenter', Swal.stopTimer)
                  toast.addEventListener('mouseleave', Swal.resumeTimer)
                }
              })
                      
              Toast.fire({
                icon: 'error',
                title: error.message
              });
        } else {
            let seriesId = data[0].id;

            const { data_, error } = await supabase.storage
            .from('users')
            .upload(`${user.id}/series/${seriesId}/cover.jpg`, cover)

            if (error) {
                let Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                    didOpen: (toast) => {
                      toast.addEventListener('mouseenter', Swal.stopTimer)
                      toast.addEventListener('mouseleave', Swal.resumeTimer)
                    }
                  })
                          
                  Toast.fire({
                    icon: 'error',
                    title: error.message
                  });
            } else {
                const {publicURL, error} = await supabase
                    .storage
                    .from('users')
                    .getPublicUrl(`${user.id}/series/${seriesId}/cover.jpg`)

                if (error) {
                    let Toast = Swal.mixin({
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true,
                        didOpen: (toast) => {
                          toast.addEventListener('mouseenter', Swal.stopTimer)
                          toast.addEventListener('mouseleave', Swal.resumeTimer)
                        }
                      })
                              
                      Toast.fire({
                        icon: 'error',
                        title: error.message
                      });
                } else {

                    const { data, error } = await supabase
                        .from('series')
                        .update({ cover: publicURL })
                        .match({ id: seriesId })
                    
                    if (error) {
                        let Toast = Swal.mixin({
                            toast: true,
                            position: 'top-end',
                            showConfirmButton: false,
                            timer: 3000,
                            timerProgressBar: true,
                            didOpen: (toast) => {
                              toast.addEventListener('mouseenter', Swal.stopTimer)
                              toast.addEventListener('mouseleave', Swal.resumeTimer)
                            }
                          })
                                  
                          Toast.fire({
                            icon: 'error',
                            title: error.message
                          });
                    } else {
                        let Toast = Swal.mixin({
                            toast: true,
                            position: 'top-end',
                            showConfirmButton: false,
                            timer: 2000,
                            timerProgressBar: true,
                            didOpen: (toast) => {
                              toast.addEventListener('mouseenter', Swal.stopTimer)
                              toast.addEventListener('mouseleave', Swal.resumeTimer)
                            }
                          })
                                  
                          Toast.fire({
                            icon: 'success',
                            title: 'Successfully created a new series'
                          }).then(function() {
                            window.location = `/dashboard/series/${seriesId}`;
                          })
                    }

                }

            }
        }

    }


}